
import { useState, useRef, useEffect, useCallback } from 'react';

interface UseCameraProps {
  enabled: boolean;
  facingMode: 'user' | 'environment';
}

export const useCamera = ({ enabled, facingMode }: UseCameraProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopCamera = useCallback(() => {
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
  }, [stream]);

  const startCamera = useCallback(async () => {
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
      
      // Clear timeout on success
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsLoading(false);
      setIsReady(true);
      
      return mediaStream;
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
  }, [facingMode, stream]);

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
  }, [enabled, startCamera, stopCamera]);

  return {
    stream,
    error,
    isLoading,
    isReady,
    startCamera,
    stopCamera
  };
};
