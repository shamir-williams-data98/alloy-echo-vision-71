
class AIProcessor {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = 'AIzaSyDRy9DVq-2RO6dcUBnRnc9tu3do6BFURB4';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  private needsVision(text: string): boolean {
    const visionKeywords = [
      'see', 'look', 'what', 'how', 'describe', 'color', 'wearing', 'holding',
      'picture', 'image', 'show', 'visible', 'appearance', 'behind', 'front',
      'left', 'right', 'above', 'below', 'around', 'gesture', 'posture',
      'expression', 'face', 'hand', 'object', 'room', 'background', 'doing'
    ];
    
    const lowerText = text.toLowerCase();
    return visionKeywords.some(keyword => lowerText.includes(keyword));
  }

  async processMessage(userMessage: string, imageData?: string | null): Promise<string> {
    try {
      const useVision = this.needsVision(userMessage) && imageData;
      
      if (useVision && imageData) {
        return await this.processWithVision(userMessage, imageData);
      } else {
        return await this.processTextOnly(userMessage);
      }
    } catch (error) {
      console.error('AI processing error:', error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again.";
    }
  }

  private async processTextOnly(text: string): Promise<string> {
    const url = `${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are NEXUS AI by Sham, an advanced AI assistant with a futuristic personality. You are helpful, intelligent, and slightly witty. Keep responses concise but engaging. User message: ${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
    
    // Speak the response
    this.speakText(aiResponse);
    
    return aiResponse;
  }

  private async processWithVision(text: string, imageData: string): Promise<string> {
    const url = `${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    
    // Convert base64 image to the format Gemini expects
    const base64Data = imageData.split(',')[1];
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `You are NEXUS AI by Sham, an advanced AI assistant with vision capabilities. You can see through the user's camera. Be helpful and observant. Analyze the image and respond to: ${text}`
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't analyze the image.";
    
    // Speak the response
    this.speakText(aiResponse);
    
    return aiResponse;
  }

  private speakText(text: string): void {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Try to use a more natural voice if available
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Alex') ||
        voice.name.includes('Samantha')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        // Trigger speaking state in parent component
        window.dispatchEvent(new CustomEvent('ai-speaking-start'));
      };

      utterance.onend = () => {
        // Trigger speaking end in parent component
        window.dispatchEvent(new CustomEvent('ai-speaking-end'));
      };

      speechSynthesis.speak(utterance);
    }
  }
}

export default AIProcessor;
