
import React from 'react';
import { Button } from '@/components/ui/button';
import { SwitchCamera } from 'lucide-react';

interface CameraControlsProps {
  facingMode: 'user' | 'environment';
  onToggleCamera: () => void;
}

const CameraControls = ({ facingMode, onToggleCamera }: CameraControlsProps) => {
  return (
    <div className="absolute top-3 right-3 z-10">
      <Button
        onClick={onToggleCamera}
        size="sm"
        variant="outline"
        className="bg-black/50 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/20 backdrop-blur-sm"
      >
        <SwitchCamera className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default CameraControls;
