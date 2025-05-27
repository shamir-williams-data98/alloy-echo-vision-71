
import React from 'react';

const CameraDisabled = () => {
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
};

export default CameraDisabled;
