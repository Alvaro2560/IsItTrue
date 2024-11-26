'use client';

import { useState, useEffect } from 'react';
import AIImageDetector from './components/AIImageDetector';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import './App.css';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  }

  return (
    <div className="app-container">
      <Button
        className="dark-mode-toggle"
        onClick={toggleDarkMode}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <Sun className="dark-mode-icon" /> : <Moon className="dark-mode-icon" />}
      </Button>
      <AIImageDetector />
    </div>
  )
}