"use client";

import { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  onAudioSave: (audioData: string) => void;
  label: string;
  placeholder?: string;
  className?: string;
}

export default function VoiceRecorder({ 
  onAudioSave, 
  label, 
  placeholder = "Click record to start speaking...",
  className = "" 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if browser supports audio recording
  const isSupported = typeof window !== 'undefined' && 
    'MediaRecorder' in window && 
    'getUserMedia' in navigator;

  useEffect(() => {
    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Convert to base64 for storage
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onAudioSave(base64Audio);
        };
        reader.readAsDataURL(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const clearRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    onAudioSave('');
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  if (!isSupported) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-red-600 p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900 dark:border-red-700 dark:text-red-200">
          <p className="font-medium">Voice recording not supported</p>
          <p className="text-sm">Your browser does not support audio recording. Please use a modern browser.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-lg font-medium text-gray-700 dark:text-white mb-3">
          {label}
        </label>
        
        {/* Recording Status */}
        {isRecording && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900 dark:border-red-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
                <span className="text-red-700 dark:text-red-200 font-medium">Recording...</span>
              </div>
              <span className="text-red-600 dark:text-red-300 font-mono text-lg">
                {formatTime(recordingTime)}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900 dark:border-red-700">
            <p className="text-red-700 dark:text-red-200 text-base">{error}</p>
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex flex-wrap gap-3 mb-4">
          {!isRecording && !audioBlob && (
            <button
              type="button"
              onClick={startRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors text-base font-medium"
            >
              🎤 Start Recording
            </button>
          )}
          
          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-base font-medium"
            >
              ⏹️ Stop Recording
            </button>
          )}
          
          {audioBlob && (
            <>
              <button
                type="button"
                onClick={isPlaying ? pauseRecording : playRecording}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-base font-medium"
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play Recording'}
              </button>
              
              <button
                type="button"
                onClick={clearRecording}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-base font-medium"
              >
                🗑️ Clear
              </button>
            </>
          )}
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="mb-4">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              controls
              className="w-full"
            />
          </div>
        )}

        {/* Instructions */}
        <div className="text-base text-gray-600 dark:text-gray-300">
          <p className="mb-2">
            <strong>Instructions:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Click "Start Recording" and speak clearly</li>
            <li>Click "Stop Recording" when finished</li>
            <li>Use "Play Recording" to review your audio</li>
            <li>Use "Clear" to record again if needed</li>
          </ul>
        </div>

        {/* Placeholder when no recording */}
        {!audioBlob && !isRecording && (
          <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-center text-base">
              {placeholder}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 