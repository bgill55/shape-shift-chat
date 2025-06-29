
import { useState, useRef } from 'react';
import { Send, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/types/message';
import { Chatbot } from '@/pages/Index';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useSuggestedResponses } from '../../hooks/useSuggestedResponses';

interface MessageInputProps {
  selectedChatbots: Chatbot[];
  apiKey: string;
  isLoading: boolean;
  onSendMessage: (userMessage: Message, imageFile: File | null, textInput: string) => void;
  chatHistory: Message[]; 
}

export function MessageInput({
  selectedChatbots,
  apiKey,
  isLoading,
  onSendMessage,
  chatHistory 
}: MessageInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    selectedImageFile,
    imagePreviewUrl,
    fileInputRef,
    handleImageUploadButtonClick,
    handleFileSelected,
    handleRemoveSelectedImage,
  } = useImageUpload();
  const { suggestions, isLoading: suggestionsLoading, error: suggestionsError, fetchSuggestions } = useSuggestedResponses();

  const sendMessage = async () => {
    if ((!inputValue.trim() && !selectedImageFile) || selectedChatbots.length === 0 || !apiKey) return;

    const currentInput = inputValue;
    const currentImageFile = selectedImageFile;
    const currentImagePreviewUrl = imagePreviewUrl;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: currentInput,
      sender: 'user',
      timestamp: new Date(),
      imageUrl: currentImageFile ? currentImagePreviewUrl : undefined,
    };
    
    setInputValue('');
    handleRemoveSelectedImage();

    onSendMessage(userMessage, currentImageFile, currentInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPlaceholderText = () => {
    if (selectedChatbots.length === 0) return "Select a shape to start chatting...";
    if (selectedChatbots.length === 1) {
      return `Message ${selectedChatbots[0].name}...`;
    }
    return `Use @mentions: ${selectedChatbots.map(bot => `@${bot.name.toLowerCase().replace(/\s+/g, '')}`).join(', ')}`;
  };

  return (
    <div className="p-4 bg-[#36393f] border-t border-[#202225]">
      {!apiKey ? (
        <div className="bg-[#faa61a] text-black px-4 py-2 rounded mb-2 text-sm">
          Please configure your API key to start chatting
        </div>
      ) : null}

      {showSuggestions && (
        <div
          className="mb-2 p-3 border border-neutral-600 rounded text-sm bg-[#40444b] text-neutral-300"
          style={{ minHeight: '60px' }}
        >
          {suggestionsLoading ? (
            <p className="w-full text-center py-2">Loading suggestions...</p>
          ) : suggestionsError ? (
            <p className="w-full text-center py-2 text-red-500">Error: {suggestionsError.message}</p>
          ) : suggestions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion.id}
                  variant="outline"
                  size="sm"
                  title={suggestion.text}
                  onClick={() => {
                    setInputValue(suggestion.text);
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  className="truncate bg-neutral-700 hover:bg-neutral-600 text-neutral-200 border-neutral-600"
                >
                  {suggestion.text}
                </Button>
              ))}
            </div>
          ) : (
            <p className="w-full text-center py-2">No suggestions available.</p>
          )}
        </div>
      )}
      
      <div className="flex space-x-2 items-center">
        <Button
          variant="outline"
          onClick={() => {
            const newShowSuggestions = !showSuggestions;
            setShowSuggestions(newShowSuggestions);
            if (newShowSuggestions) {
              const primaryChatbot = selectedChatbots && selectedChatbots.length > 0 ? selectedChatbots[0] : undefined;
              const channelId = primaryChatbot?.id;
              const modelShapeName = primaryChatbot?.name;
              fetchSuggestions(chatHistory, channelId, modelShapeName);
            }
          }}
          disabled={!apiKey || isLoading || selectedChatbots.length === 0 || !chatHistory}
          className="p-2 bg-[#40444b] text-[#96989d] border-[#202225] hover:bg-[#202225] hover:text-white"
          aria-label="Toggle suggested responses"
        >
          <Lightbulb className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          onClick={handleImageUploadButtonClick}
          disabled={!apiKey || isLoading || selectedChatbots.length === 0}
          className="p-2 bg-[#40444b] text-[#96989d] border-[#202225] hover:bg-[#202225] hover:text-white"
          aria-label="Attach image"
        >
          📎 Image
        </Button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelected}
          className="hidden"
          data-testid="hidden-file-input"
        />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholderText()}
          className="flex-1 bg-[#40444b] border-[#202225] text-white placeholder-[#96989d]"
          disabled={!apiKey || isLoading || selectedChatbots.length === 0}
        />
        <Button
          onClick={sendMessage}
          disabled={(!inputValue.trim() && !selectedImageFile) || !apiKey || isLoading || selectedChatbots.length === 0}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      {imagePreviewUrl && selectedImageFile && (
        <div className="mt-2 flex items-center space-x-2">
          <img 
            src={imagePreviewUrl} 
            alt="Selected preview" 
            className="w-20 h-20 object-cover rounded border border-[#202225]" 
          />
          <div className="text-xs text-[#96989d] truncate">
            {selectedImageFile.name}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemoveSelectedImage}
            className="text-red-500 hover:text-red-700 p-1"
            aria-label="Remove selected image"
          >
            X
          </Button>
        </div>
      )}
    </div>
  );
}
