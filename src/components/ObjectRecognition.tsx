"use client";

import { useState, useEffect } from 'react';

interface ObjectRecognitionProps {
  onAnswerChange: (objectName: string, userAnswer: string) => void;
  objectName: string;
  userAnswer: string;
  label: string;
}

interface ObjectData {
  name: string;
  urduName: string;
  imageUrl: string;
  category: string;
  correctAnswers: string[];
}

export default function ObjectRecognition({ 
  onAnswerChange, 
  objectName, 
  userAnswer, 
  label 
}: ObjectRecognitionProps) {
  const [objectData, setObjectData] = useState<ObjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Pakistani cultural objects with both English and Urdu names
  // Using only custom images provided by the user
  const pakistaniObjects = [
    // Food & Drinks
    { 
      name: "bread", 
      urduName: "روٹی",
      imageUrl: "/images/objects/bread.jpg", 
      category: "food",
      correctAnswers: ["bread", "روٹی", "roti", "chapati", "چپاتی"]
    },
    { 
      name: "apple", 
      urduName: "سیب",
      imageUrl: "/images/objects/apple.jpg", 
      category: "fruit",
      correctAnswers: ["apple", "سیب", "seb", "ایپل"]
    },
    
    // Household Items
    { 
      name: "spoon", 
      urduName: "چمچہ",
      imageUrl: "/images/objects/spoon.jpg", 
      category: "household",
      correctAnswers: ["spoon", "چمچہ", "chamcha", "چمچ"]
    },
    
    // Common Objects
    { 
      name: "key", 
      urduName: "چابی",
      imageUrl: "/images/objects/key.jpg", 
      category: "tools",
      correctAnswers: ["key", "چابی", "chabi", "کنجی"]
    },
    { 
      name: "watch", 
      urduName: "گھڑی",
      imageUrl: "/images/objects/watch.jpg", 
      category: "accessories",
      correctAnswers: ["watch", "گھڑی", "ghari", "clock", "گھڑیال"]
    },
    { 
      name: "mobile", 
      urduName: "فون",
      imageUrl: "/images/objects/mobile.jpg", 
      category: "technology",
      correctAnswers: ["mobile", "فون", "phone", "موبائل"]
    },
    
    // Transport & Buildings
    { 
      name: "car", 
      urduName: "گاڑی",
      imageUrl: "/images/objects/car.jpg", 
      category: "transport",
      correctAnswers: ["car", "گاڑی", "gaari", "کار"]
    },
    
    // Nature & Common Items
    { 
      name: "flower", 
      urduName: "پھول",
      imageUrl: "/images/objects/flower.jpg", 
      category: "nature",
      correctAnswers: ["flower", "پھول", "phool", "گل"]
    }
  ];

  useEffect(() => {
    const loadObject = () => {
      setLoading(true);
      setError(null);
      
      try {
        // Randomly select an object from the Pakistani objects list
        const randomIndex = Math.floor(Math.random() * pakistaniObjects.length);
        const selectedObject = pakistaniObjects[randomIndex];
        
        setObjectData(selectedObject);
        setLoading(false);
      } catch (err) {
        setError('Failed to load object image');
        setLoading(false);
      }
    };

    loadObject();
  }, []);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const answer = e.target.value.trim().toLowerCase();
    onAnswerChange(objectName, answer);
    
    // Check if answer is correct
    if (objectData && answer) {
      const isAnswerCorrect = objectData.correctAnswers.some(
        correctAnswer => correctAnswer.toLowerCase() === answer
      );
      setIsCorrect(isAnswerCorrect);
    } else {
      setIsCorrect(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-600 p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="font-medium">Error loading object</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-lg font-medium text-gray-700 dark:text-white mb-3">
          {label}
        </label>
        
        {/* Object Image */}
        <div className="mb-4">
          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="text-center text-gray-500 dark:text-gray-300 mb-2">
              <p className="text-lg font-medium">What is this object?</p>
              <p className="text-base text-gray-400 dark:text-gray-300">اس چیز کا نام کیا ہے؟</p>
            </div>
            <div className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded overflow-hidden">
              {objectData && (
                <img 
                  src={objectData.imageUrl} 
                  alt={`Object: ${objectData.name}`}
                  className="w-full h-auto max-w-full object-contain"
                  style={{ maxHeight: '200px' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    setError('Failed to load image');
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Answer Input */}
        <div>
          <input
            type="text"
            placeholder="Type the name of this object / اس چیز کا نام لکھیں"
            value={userAnswer}
            onChange={handleAnswerChange}
            className={`w-full px-4 py-3 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 ${
              isCorrect === true ? 'border-green-500 bg-green-50 dark:bg-green-900 dark:border-green-400' : 
              isCorrect === false ? 'border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-400' : 
              'border-gray-300 dark:border-gray-600'
            }`}
          />
        </div>

        {/* Answer Feedback */}
        {isCorrect !== null && userAnswer && (
          <div className={`p-3 rounded text-base ${
            isCorrect 
              ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700' 
              : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
          }`}>
            {isCorrect ? (
              <div className="flex items-center">
                <span className="mr-2 text-xl">✓</span>
                <span>Correct! / درست!</span>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="mr-2 text-xl">✗</span>
                <span>Try again / دوبارہ کوشش کریں</span>
              </div>
            )}
          </div>
        )}

        {/* Hint */}
        <div className="text-base text-gray-500 dark:text-gray-300">
          <p>Hint: You can answer in English or Urdu / آپ انگریزی یا اردو میں جواب دے سکتے ہیں</p>
        </div>
      </div>
    </div>
  );
} 