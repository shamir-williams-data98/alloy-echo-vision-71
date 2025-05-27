
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

  const checkPermissions = async () => {
    try {
      // Check if permissions API is available
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        console.log('Camera permission status:', result.state);
        return result.state;
      }
      return 'unknown';
    } catch (err) {
      console.log('Permissions API not available');
      return 'unknown';
    }
  };

  const startCamera = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);
      setIsReady(false);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a shorter timeout for better UX
      timeoutRef.current = setTimeout(() => {
        console.log('Camera loading timeout');
        setIsLoading(false);
        setError('Camera is taking too long to load. Please check your permissions and try again.');
      }, 5000); // Reduced to 5 seconds
      
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Check browser support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      console.log('Checking camera permissions...');
      const permissionStatus = await checkPermissions();
      
      if (permissionStatus === 'denied') {
        throw new Error('Camera access was previously denied. Please enable camera permissions in your browser settings and refresh the page.');
      }

      console.log('Starting camera with facing mode:', facingMode);
      
      // Try with simpler constraints first for better compatibility
      let constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
        },
        audio: false
      };

      // Only add facingMode for environment camera to avoid issues on desktop
      if (facingMode === 'environment') {
        constraints.video = {
          ...constraints.video as MediaTrackConstraints,
          facingMode: { ideal: 'environment' }
        };
      }

      console.log('Requesting camera with constraints:', constraints);
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
          setError('Camera access denied. Please click the camera icon in your browser\'s address bar and allow camera access, then refresh the page.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera device.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another application. Please close other camera apps and try again.');
        } else if (err.name === 'OverconstrainedError') {
          setError('Camera constraints not supported. Trying with basic settings...');
          // Retry with basic constraints
          setTimeout(() => {
            const basicConstraints = {
              video: true,
              audio: false
            };
            navigator.mediaDevices.getUserMedia(basicConstraints)
              .then(stream => {
                setStream(stream);
                setIsLoading(false);
                setIsReady(true);
                setError('');
              })
              .catch(() => {
                setError('Camera not available or supported.');
              });
          }, 1000);
          return;
        } else if (err.name === 'NotSupportedError') {
          setError('Camera not supported by this browser.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Unable to access camera. Please check your permissions and try again.');
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
