
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Camera, CameraOff, Volume2, VolumeX } from 'lucide-react';
import WebcamCapture from '@/components/WebcamCapture';
import VoiceControls from '@/components/VoiceControls';
import ChatDisplay from '@/components/ChatDisplay';
import AIProcessor from '@/components/AIProcessor';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  timestamp: number;
  hasImage?: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m NEXUS AI, your advanced assistant. I can see through your camera and respond with voice. Ask me anything!',
      type: 'assistant',
      timestamp: Date.now()
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const webcamRef = useRef<any>(null);

  useEffect(() => {
    const handleSpeakingStart = () => setIsSpeaking(true);
    const handleSpeakingEnd = () => setIsSpeaking(false);

    window.addEventListener('ai-speaking-start', handleSpeakingStart);
    window.addEventListener('ai-speaking-end', handleSpeakingEnd);

    return () => {
      window.removeEventListener('ai-speaking-start', handleSpeakingStart);
      window.removeEventListener('ai-speaking-end', handleSpeakingEnd);
    };
  }, []);

  const addMessage = useCallback((text: string, type: 'user' | 'assistant', hasImage?: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: Date.now(),
      hasImage
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleUserMessage = useCallback(async (userText: string) => {
    addMessage(userText, 'user');
    
    // Capture image if camera is enabled
    let imageData = null;
    if (cameraEnabled && webcamRef.current) {
      imageData = webcamRef.current.captureImage();
      setCurrentImage(imageData);
    }

    // Process with AI
    const aiProcessor = new AIProcessor();
    const response = await aiProcessor.processMessage(userText, imageData);
    
    addMessage(response, 'assistant', !!imageData);
  }, [addMessage, cameraEnabled]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            NEXUS AI
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Advanced AI Assistant with Voice & Vision Capabilities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Webcam Panel */}
          <div className="lg:col-span-1">
            <Card className="h-full bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-cyan-400">Vision Input</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCameraEnabled(!cameraEnabled)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {cameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex-1">
                  <WebcamCapture 
                    ref={webcamRef}
                    enabled={cameraEnabled}
                    onImageCapture={setCurrentImage}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2">
            <Card className="h-full bg-gray-900/50 border-gray-700 backdrop-blur-sm flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-cyan-400">Conversation</h3>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <ChatDisplay messages={messages} />
              </div>

              <div className="p-4 border-t border-gray-700">
                <VoiceControls
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  onUserMessage={handleUserMessage}
                  onListeningChange={setIsListening}
                  onSpeakingChange={setIsSpeaking}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="fixed bottom-4 right-4 flex flex-col gap-2">
          {isListening && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg px-3 py-2 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-sm text-red-300">Listening...</span>
              </div>
            </div>
          )}
          
          {isSpeaking && (
            <div className="bg-blue-500/20 border border-blue-500 rounded-lg px-3 py-2 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-sm text-blue-300">Speaking...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
