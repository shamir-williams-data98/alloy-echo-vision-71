
import React from 'react';
import { Button } from '@/components/ui/button';

interface CameraErrorProps {
  error: string;
  onRetry: () => void;
}

const CameraError = ({ error, onRetry }: CameraErrorProps) => {
  return (
    <div className="w-full h-full bg-red-900/20 border border-red-500 rounded-lg flex items-center justify-center p-4">
      <div className="text-center text-red-300">
        <p className="text-sm mb-2">{error}</p>
        <Button 
          onClick={onRetry} 
          size="sm" 
          className="bg-red-600 hover:bg-red-700"
        >
          Retry Camera
        </Button>
      </div>
    </div>
  );
};

export default CameraError;
