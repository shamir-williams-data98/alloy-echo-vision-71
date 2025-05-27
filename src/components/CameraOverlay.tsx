
import React from 'react';

interface CameraOverlayProps {
  facingMode: 'user' | 'environment';
  isReady: boolean;
}

const CameraOverlay = ({ facingMode, isReady }: CameraOverlayProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Corner overlay effects */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400"></div>
      
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
};

export default CameraOverlay;
