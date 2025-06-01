
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import HighlightedText from './HighlightedText'; // Adjust path if necessary

interface Message {
  id: string;
  text: string; // Will be used as fallback or for non-translatable messages
  type: 'user' | 'assistant';
  timestamp: number;
  hasImage?: boolean;
  translationKey?: string;
  isTranslatable?: boolean;
  spokenCharIndex?: number; // Ensure this is present
}

interface ChatDisplayProps {
  messages: Message[];
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages }) => {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-cyan-600 text-white ml-4'
                  : 'bg-gray-700 text-gray-100 mr-4'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                    AI
                  </div>
                )}
                
                <div className="flex-1">
                  {message.type === 'assistant' ? (
                    isMobile && message.isTranslatable && message.translationKey ? (
                      <>
                        <div className="text-sm leading-relaxed font-semibold">
                          EN: <HighlightedText text={i18n.t(message.translationKey, { lng: 'en' })} spokenCharIndex={message.spokenCharIndex || 0} />
                        </div>
                        <div className="text-sm leading-relaxed mt-1">
                          ES: {i18n.t(message.translationKey, { lng: 'es' })} {/* Spanish shown plain */}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm leading-relaxed">
                        <HighlightedText text={message.text} spokenCharIndex={message.spokenCharIndex || 0} />
                      </div>
                    )
                  ) : (
                    // User message
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                    <span>{formatTime(message.timestamp)}</span>
                    {message.hasImage && (
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        {t('vision_used_indicator')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatDisplay;
