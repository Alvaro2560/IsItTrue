'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { HistoryItem } from './HistoryDisplay';
import HistoryDisplay from './HistoryDisplay';
import imageCompression from 'browser-image-compression';
import './AIImageDetector.css';

export default function AIImageDetector() {
  const [image, setImage] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(localStorage.getItem('imageHistory') !== null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('imageHistory');
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory)
      setHistory(parsedHistory)
    }
  }, []);

  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error comprimiendo la imagen:', error);
      return file;
    }
  };

  const analyzeImage = async (file: File): Promise<number | null> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
  
      const response = await fetch('/api/proxy', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
  
      if (!response.ok) {
        throw new Error('Could not analyze the image. Please try again.');
      }
  
      const data = await response.json();
      return data.percentage;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const renderPercentage = async (file: File | undefined) => {
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const newImage = e.target?.result as string;
        setImage(newImage);
  
        const compressedFile = await compressImage(file);
        const newPercentage = await analyzeImage(compressedFile);

        if (newPercentage === null) {
          alert('Could not analyze the image. Please try again.');
          setIsLoading(false);
          return;
        }

        setPercentage(newPercentage);
        setIsLoading(false);
        setIsHistoryVisible(true);

        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          image: newImage,
          percentage: newPercentage,
          timestamp: new Date().toISOString(),
        };
        const updatedHistory = [newHistoryItem, ...history].slice(0, 10);
        setHistory(updatedHistory);
        localStorage.setItem('imageHistory', JSON.stringify(updatedHistory));
      };
      reader.readAsDataURL(file);
    }
  };  

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    renderPercentage(file);
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    renderPercentage(file);
  }

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  }

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setImage(item.image);
    setPercentage(item.percentage);
  }

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('imageHistory');
    setIsHistoryVisible(false);
  }

  return (
    <Card className="ai-image-detector">
      <CardHeader>
        <CardTitle>AI Image Detector</CardTitle>
        <CardDescription>
          Upload an image to determine if it's AI-generated.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`upload-area ${isLoading ? 'loading' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={!isLoading ? handleAreaClick : undefined}
        >
          {isLoading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Analyzing image...</p>
            </div>
          )}
          {!isLoading && !image && (
            <div className="upload-content">
              <Upload className="upload-icon" />
              <p className="upload-text">
                <span className="upload-text-bold">Click to upload</span> or drag and drop an image
              </p>
            </div>
          )}
          {!isLoading && image && (
            <div className="uploaded-image-container">
              <img
                src={image}
                alt="Uploaded image"
                className="uploaded-image"
              />
            </div>
          )}
          <Input
            ref={fileInputRef}
            id="image-upload"
            type="file"
            className="hidden"
            onChange={handleImageUpload}
            accept="image/*"
            aria-label="Upload an image"
          />
        </div>
        {!isLoading && percentage !== null && (
          <div className="results-display">
            <h3 className="results-title">AI Detection Result</h3>
            <div className="results-bar">
              <div
                className={`results-progress ${
                  //* Se puede ajustar el porcentaje según el resultado del modelo
                  percentage < 33 ? 'low' : percentage < 66 ? 'medium' : 'high'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <p className="results-text">
              This image is {percentage}% likely to be real (not AI-generated).
            </p>
          </div>
        )}
        {!isLoading && isHistoryVisible &&  (
          <HistoryDisplay
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
          />
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="footer-button"
          onClick={handleAreaClick}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : image ? "Analyze Another Image" : "Upload an Image"}
        </Button>
      </CardFooter>
    </Card>
  );  
}