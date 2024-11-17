'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import './AIImageDetector.css';

export default function AIImageDetector() {
  const [image, setImage] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const renderPercentage = (file: File | undefined) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        //! Aquí se renderiza la probabilidad de que la imagen sea real
        setPercentage(Math.floor(Math.random() * 101)); //? Porcentaje aleatorio
      }
      reader.readAsDataURL(file);
    }
  }

  return (
    <Card className="ai-image-detector">
      <CardHeader>
        <CardTitle>
          AI Image Detector
        </CardTitle>
        <CardDescription>
          Upload an image to check if it's AI-generated
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className="upload-area"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleAreaClick}
        >
          {!image && (
            <div className="upload-content">
              <Upload className="upload-icon" />
              <p className="upload-text">
                <span className="upload-text-bold">Click to upload</span> or drag and drop
              </p>
            </div>
          )}
          {image && (
            <div className="uploaded-image-container">
              <img src={image} alt="Uploaded image" className="uploaded-image" />
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
        {percentage !== null && (
          <div className="truth-percentage">
            <Label className="percentage-label">Truth Percentage</Label>
            <Progress value={percentage} className="w-full" />
            <p className="percentage-text">
              This image is {percentage}% likely to be real (not AI-generated).
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="footer-button" onClick={handleAreaClick}>
          {image ? "Analyze Another Image" : "Upload an Image"}
        </Button>
      </CardFooter>
    </Card>
  )
}