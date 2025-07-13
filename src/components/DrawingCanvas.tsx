"use client";

import { useRef, useEffect, useState } from 'react';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onSave?: (imageData: string) => void;
  className?: string;
  responsive?: boolean;
}

export default function DrawingCanvas({ 
  width = 400, 
  height = 300, 
  onSave,
  className = "",
  responsive = false
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });

  useEffect(() => {
    const updateCanvasSize = () => {
      if (responsive) {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 320) {
          // Very small screens (320px and below)
          setCanvasSize({
            width: 250,
            height: 188
          });
        } else if (screenWidth < 768) {
          // Small screens (321px to 767px)
          setCanvasSize({
            width: 300,
            height: 225
          });
        } else {
          // Larger screens
          setCanvasSize({ width, height });
        }
      } else {
        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [width, height, responsive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    
    // Set the canvas size accounting for device pixel ratio
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    
    // Scale the context to match the device pixel ratio
    ctx.scale(dpr, dpr);
    
    // Set the CSS size - use fixed pixel values to avoid responsive scaling
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    canvas.style.maxWidth = 'none'; // Prevent max-width constraints
    canvas.style.maxHeight = 'none'; // Prevent max-height constraints

    // Set drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setContext(ctx);
  }, [canvasSize]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    if (!context) return;

    const { x, y } = getCoordinates(e);
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !context) return;

    const { x, y } = getCoordinates(e);
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (context) {
      context.closePath();
    }
  };

  const clearCanvas = () => {
    if (!context) return;
    context.clearRect(0, 0, canvasSize.width, canvasSize.height);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSave) return;

    const imageData = canvas.toDataURL('image/png');
    onSave(imageData);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white" style={{ width: `${canvasSize.width}px`, maxWidth: 'none' }}>
        <canvas
          ref={canvasRef}
          className="cursor-crosshair touch-none block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
            maxWidth: 'none',
            maxHeight: 'none',
            minWidth: `${canvasSize.width}px`,
            minHeight: `${canvasSize.height}px`
          }}
        />
      </div>
      
      <div className="flex gap-2">
        <button
          type="button"
          onClick={clearCanvas}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={saveDrawing}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Drawing
        </button>
      </div>
    </div>
  );
} 