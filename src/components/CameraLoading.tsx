
import React from 'react';

const CameraLoading = () => {
  return (
    <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="w-8 h-8 mx-auto mb-2 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm">Loading camera...</p>
        <p className="text-xs mt-1 opacity-75">This may take a few moments, especially on the first use or slower connections.</p>
      </div>
    </div>
  );
};

export default CameraLoading;
