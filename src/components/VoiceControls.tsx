
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, Square } from 'lucide-react';

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  onUserMessage: (message: string) => void;
  onListeningChange: (listening: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  isSpeaking,
  onUserMessage,
  onListeningChange,
  onSpeakingChange
}) => {
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        onListeningChange(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onUserMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        onListeningChange(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        onListeningChange(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onListeningChange, onUserMessage]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      // Stop any current speech
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        onSpeakingChange(false);
      }
      
      recognitionRef.current.start();
    }
  }, [isRecording, onSpeakingChange]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  }, [isRecording]);

  const stopSpeaking = useCallback(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      onSpeakingChange(false);
    }
  }, [onSpeakingChange]);

  const handleTextSubmit = useCallback(() => {
    if (textInput.trim()) {
      onUserMessage(textInput.trim());
      setTextInput('');
    }
  }, [textInput, onUserMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    }
  }, [handleTextSubmit]);

  const isMicSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <div className="space-y-4">
      {/* Voice Controls */}
      <div className="flex items-center gap-4">
        {isMicSupported ? (
          <Button
            onClick={isRecording ? stopListening : startListening}
            className={`relative overflow-hidden transition-all duration-300 ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 border-red-500 shadow-lg shadow-red-500/25' 
                : 'bg-cyan-600 hover:bg-cyan-700 border-cyan-500 shadow-lg shadow-cyan-500/25'
            }`}
            size="lg"
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5 mr-2" />
                Stop
                <div className="absolute inset-0 bg-red-400/20 animate-pulse"></div>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                Speak
              </>
            )}
          </Button>
        ) : (
          <div className="text-sm text-gray-400">Microphone not supported</div>
        )}

        {isSpeaking && (
          <Button
            onClick={stopSpeaking}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Speaking
          </Button>
        )}
      </div>

      {/* Text Input */}
      <div className="flex gap-2">
        <Input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
        />
        <Button
          onClick={handleTextSubmit}
          disabled={!textInput.trim()}
          className="bg-cyan-600 hover:bg-cyan-700 border-cyan-500"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default VoiceControls;
