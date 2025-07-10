
import { useState, useRef } from 'react';
import { Send, Lightbulb, Wand2, Save, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/types/message';
import { Chatbot } from '@/pages/Index';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useSuggestedResponses } from '../../hooks/useSuggestedResponses';
import { CommandToolbar } from './CommandToolbar';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageInputProps {
  selectedChatbots: Chatbot[];
  apiKey: string;
  isLoading: boolean;
  isSaving: boolean;
  onSendMessage: (userMessage: Message, imageFile: File | null, textInput: string) => void;
  onSaveChat: () => void;
  chatHistory: Message[];
}

export function MessageInput({
  selectedChatbots,
  apiKey,
  isLoading,
  isSaving,
  onSendMessage,
  onSaveChat,
  chatHistory,
}: MessageInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
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

  const handleCommand = (command: string) => {
    if (command === '!imagine') {
      setInputValue('!imagine ');
    } else {
      setInputValue(command);
    }
    setShowCommands(false);
    inputRef.current?.focus();
  };

  const getPlaceholderText = () => {
    if (selectedChatbots.length === 0) return 'Select a shape to start chatting...';
    if (selectedChatbots.length === 1) {
      return `Message ${selectedChatbots[0].name}...`;
    }
    if (selectedChatbots.length > 1) {
      return `Message ${selectedChatbots.map(bot => bot.name).join(', ')}...`;
    }
  };

  return (
    <div className="p-4 bg-[var(--color-background)] border-t border-[var(--color-border)]">
      {!apiKey ? (
        <div className="bg-[var(--color-toast-warning-bg)] text-[var(--color-toast-warning-text)] px-4 py-2 rounded mb-2 text-sm">
          Please configure your API key to start chatting
        </div>
      ) : null}

      {showCommands && <CommandToolbar onCommand={handleCommand} />}

      {showSuggestions && (
        <div
          className="mb-2 p-3 border border-[var(--color-border)] rounded text-sm bg-[var(--color-secondary)] text-[var(--color-text)]"
          style={{ minHeight: '60px' }}
        >
          {suggestionsLoading ? (
            <p className="w-full text-center py-2">Loading suggestions...</p>
          ) : suggestionsError ? (
            <p className="w-full text-center py-2 text-[var(--color-destructive)]">Error: {suggestionsError.message}</p>
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
                  className="truncate bg-[var(--color-button-bg-secondary)] hover:bg-[var(--color-button-hover-secondary)] text-[var(--color-button-text-secondary)] border-[var(--color-button-border-secondary)]"
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

      <div className={`flex ${isMobile ? 'flex-wrap' : 'space-x-2'} items-center`}>
        <div className={`flex ${isMobile ? 'w-full space-x-2 mb-2' : ''}`}>
          <Button
            variant="outline"
            onClick={() => setShowCommands(!showCommands)}
            disabled={!apiKey || isLoading || selectedChatbots.length === 0}
            className="p-2 bg-[var(--color-button-bg-secondary)] text-[var(--color-button-text-secondary)] border-[var(--color-button-border-secondary)] hover:bg-[var(--color-button-hover-secondary)] hover:text-[var(--color-button-hover-text-secondary)]"
            aria-label="Toggle command toolbar"
          >
            <Wand2 className="w-5 h-5" />
          </Button>
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
            className="p-2 bg-[var(--color-button-bg-secondary)] text-[var(--color-button-text-secondary)] border-[var(--color-button-border-secondary)] hover:bg-[var(--color-button-hover-secondary)] hover:text-[var(--color-button-hover-text-secondary)]"
            aria-label="Toggle suggested responses"
          >
            <Lightbulb className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            onClick={handleImageUploadButtonClick}
            disabled={!apiKey || isLoading || selectedChatbots.length === 0}
            className="p-2 bg-[var(--color-button-bg-secondary)] text-[var(--color-button-text-secondary)] border-[var(--color-button-border-secondary)] hover:bg-[var(--color-button-hover-secondary)] hover:text-[var(--color-button-hover-text-secondary)]"
            aria-label="Attach image"
          >
            {isMobile ? <Paperclip className="w-5 h-5" /> : '📎 Image'}
          </Button>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelected}
          className="hidden"
          data-testid="hidden-file-input"
        />
        <div className={`flex-grow flex ${isMobile ? 'w-full' : ''} space-x-2`}>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholderText()}
            className="flex-1 bg-[var(--color-input-bg)] border-[var(--color-button-border-secondary)] text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)]"
            disabled={!apiKey || isLoading || selectedChatbots.length === 0}
          />
          <Button
            onClick={sendMessage}
            disabled={(!inputValue.trim() && !selectedImageFile) || !apiKey || isLoading || selectedChatbots.length === 0}
            className="bg-[var(--color-button-bg-primary)] hover:bg-[var(--color-button-bg-primary)] text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button
            onClick={onSaveChat}
            disabled={isSaving || selectedChatbots.length === 0}
            className="bg-[var(--color-button-bg-primary)] hover:bg-[var(--color-button-bg-primary)] text-white"
          >
            <Save className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {imagePreviewUrl && selectedImageFile && (
        <div className="mt-2 flex items-center space-x-2">
          <img
            src={imagePreviewUrl}
            alt="Selected preview"
            className="w-20 h-20 object-cover rounded border border-[var(--color-border)]"
          />
          <div className="text-xs text-[var(--color-placeholder-text)] truncate">{selectedImageFile.name}</div>
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
