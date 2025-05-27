
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { SwitchCamera } from 'lucide-react';

interface WebcamCaptureProps {
  enabled: boolean;
  onImageCapture?: (imageData: string) => void;
}

const WebcamCapture = forwardRef<any, WebcamCaptureProps>(({ enabled, onImageCapture }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useImperativeHandle(ref, () => ({
    captureImage: () => {
      if (!videoRef.current || !canvasRef.current || !isReady) {
        console.log('Video not ready for capture');
        return null;
      }
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return null;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Image captured successfully');
      onImageCapture?.(imageData);
      return imageData;
    }
  }));

  useEffect(() => {
    if (enabled) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, facingMode]);

  const startCamera = async () => {
    try {
      setError('');
      setIsLoading(true);
      setIsReady(false);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a timeout to prevent infinite loading
      timeoutRef.current = setTimeout(() => {
        console.log('Camera loading timeout');
        setIsLoading(false);
        setError('Camera loading timeout. Please try again.');
      }, 10000); // 10 second timeout
      
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Check browser support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      console.log('Starting camera with facing mode:', facingMode);
      
      // Try with basic constraints first
      const basicConstraints = {
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false
      };

      // Try with facing mode if supported
      const constraints = facingMode === 'user' ? basicConstraints : {
        video: { 
          ...basicConstraints.video,
          facingMode: { ideal: facingMode }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained successfully');
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        
        // Handle video ready event
        const handleCanPlay = () => {
          console.log('Video can play, attempting to start');
          video.play()
            .then(() => {
              console.log('Video playing successfully');
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              setIsLoading(false);
              setIsReady(true);
            })
            .catch(err => {
              console.error('Error playing video:', err);
              setError('Failed to start video playback');
              setIsLoading(false);
            });
        };

        const handleError = (err: any) => {
          console.error('Video error:', err);
          setError('Video playback error');
          setIsLoading(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };

        // Use canplay event instead of loadedmetadata for better compatibility
        video.addEventListener('canplay', handleCanPlay, { once: true });
        video.addEventListener('error', handleError);
        
        // Cleanup function
        return () => {
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('error', handleError);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setIsLoading(false);
      setIsReady(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions and refresh.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera.');
        } else if (err.name === 'NotSupportedError') {
          setError('Camera not supported by this browser.');
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError('Unable to access camera');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    setIsReady(false);
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!enabled) {
    return (
      <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p>Camera Disabled</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-red-900/20 border border-red-500 rounded-lg flex items-center justify-center p-4">
        <div className="text-center text-red-300">
          <p className="text-sm mb-2">{error}</p>
          <Button 
            onClick={startCamera} 
            size="sm" 
            className="bg-red-600 hover:bg-red-700"
          >
            Retry Camera
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-8 h-8 mx-auto mb-2 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Loading camera...</p>
          <p className="text-xs mt-1 opacity-75">This should only take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Camera toggle button */}
      <div className="absolute top-3 right-3 z-10">
        <Button
          onClick={toggleCamera}
          size="sm"
          variant="outline"
          className="bg-black/50 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/20 backdrop-blur-sm"
        >
          <SwitchCamera className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Overlay effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400"></div>
      </div>
      
      {/* Camera mode indicator */}
      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
        <span className="text-xs text-cyan-400">
          {facingMode === 'user' ? 'Front' : 'Back'} Camera
        </span>
      </div>

      {/* Ready indicator */}
      {isReady && (
        <div className="absolute top-3 left-3 bg-green-500/20 border border-green-500 rounded px-2 py-1">
          <span className="text-xs text-green-400">Ready</span>
        </div>
      )}
    </div>
  );
});

WebcamCapture.displayName = 'WebcamCapture';

export default WebcamCapture;
