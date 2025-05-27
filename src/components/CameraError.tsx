
import React from 'react';
import { Button } from '@/components/ui/button';

interface CameraErrorProps {
  error: string;
  onRetry: () => void;
  onRequestPermission?: () => void;
}

const CameraError = ({ error, onRetry, onRequestPermission }: CameraErrorProps) => {
  const isPermissionError = error.toLowerCase().includes('denied') || error.toLowerCase().includes('permission');
  
  return (
    <div className="w-full h-full bg-red-900/20 border border-red-500 rounded-lg flex items-center justify-center p-4">
      <div className="text-center text-red-300 max-w-sm">
        <div className="w-12 h-12 mx-auto mb-3 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-sm mb-3 leading-relaxed">{error}</p>
        
        {isPermissionError && (
          <div className="text-xs text-red-200 mb-3 bg-red-500/10 p-2 rounded border border-red-500/30">
            <p className="mb-1">📱 <strong>Mobile:</strong> Look for camera icon in address bar</p>
            <p>💻 <strong>Desktop:</strong> Check browser settings for camera permissions</p>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          {isPermissionError && onRequestPermission && (
            <Button 
              onClick={onRequestPermission} 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
            >
              Grant Permission
            </Button>
          )}
          <Button 
            onClick={onRetry} 
            size="sm" 
            className="bg-red-600 hover:bg-red-700"
          >
            {isPermissionError ? 'Try Again' : 'Retry Camera'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraError;
