import { useState, useRef, useEffect } from 'react';
import { Send, Lightbulb, Wand2, Save, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/types/message';
import { Chatbot } from '@/pages/Index';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useSuggestedResponses } from '../../hooks/useSuggestedResponses';
import { CommandToolbar } from './CommandToolbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateUUID } from '@/lib/utils';
import { handleCommand } from '@/lib/commandHandler';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';


interface MessageInputProps {
  selectedChatbots: Chatbot[];
  apiKey: string;
  isSaving: boolean;
  onSendMessage: (userMessage: Message, imageFile: File | null, textInput: string) => void;
  onSaveChat: () => void;
  chatHistory: Message[];
}

export function MessageInput({
  selectedChatbots,
  apiKey,
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
  const { user, displayName } = useAuth();

  const { suggestions, isLoading: suggestionsLoading, error: suggestionsError, fetchSuggestions } = useSuggestedResponses();
  const { selectedImageFile, imagePreviewUrl, fileInputRef, handleImageUploadButtonClick, handleFileSelected, handleRemoveSelectedImage } = useImageUpload();

  const sendMessage = async () => {
    if ((!inputValue.trim() && !selectedImageFile) || selectedChatbots.length === 0 || !apiKey) return;

    const currentInput = inputValue;
    const currentImageFile = selectedImageFile;

    const userMessage: Message = {
      id: generateUUID(),
      content: currentInput,
      sender: 'user',
      timestamp: new Date(),
      imageUrl: imagePreviewUrl,
    };

    setInputValue('');
    handleRemoveSelectedImage();

    if (currentInput.startsWith('!info') || currentInput.startsWith('!web')) {
      const [command, ...args] = currentInput.split(' ');
      const commandArgs = args.join(' ');
      onSendMessage(userMessage, null, currentInput); // Display user's command immediately
      
      const botMessage = await handleCommand(command, commandArgs);
      onSendMessage(botMessage, null, botMessage.content); // Display bot's response when ready
    } else {
      onSendMessage(userMessage, currentImageFile, currentInput);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleToolbarCommand = (command: string) => {
    if (command === '!imagine') {
      setInputValue('!imagine ');
    } else if (command === '!web') {
      setInputValue('!web ');
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
    <div className="p-4 bg-[rgb(var(--card))] border-t border-[#202225]">
      {!apiKey ? (
        <div className="bg-[#faa61a] text-black px-4 py-2 rounded mb-2 text-sm">
          Please configure your API key to start chatting
        </div>
      ) : null}

      {showCommands && <CommandToolbar onCommand={handleToolbarCommand} />}

      {showSuggestions && (
        <div
          className="mb-2 p-3 border border-[rgb(var(--primary))] rounded text-sm bg-[rgb(var(--card))] text-[rgb(var(--fg))] w-full"
          style={{ minHeight: '60px' }}
        >
          {suggestionsLoading ? (
            <p className="w-full text-center py-2">Loading suggestions...</p>
          ) : suggestionsError ? (
            <p className="w-full text-center py-2 text-red-500">Error: {suggestionsError.message}</p>
          ) : suggestions.length > 0 ? (
            <div className="flex flex-wrap">
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
                  className="bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))] text-[rgb(var(--fg))] border-[rgb(var(--primary))] text-wrap flex-shrink min-w-0 max-w-full m-1"
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
            disabled={!apiKey || selectedChatbots.length === 0}
            className="p-2 bg-[rgb(var(--card))] text-[rgb(var(--fg))] border-[#202225] hover:bg-[#202225] hover:text-[rgb(var(--fg))]"
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
                fetchSuggestions(chatHistory, primaryChatbot?.id, primaryChatbot?.name);
              }
            }}
            disabled={!apiKey || selectedChatbots.length === 0 || !chatHistory}
            className="p-2 bg-[rgb(var(--card))] text-[rgb(var(--fg))] border-[#202225] hover:bg-[#202225] hover:text-[rgb(var(--fg))]"
            aria-label="Toggle suggested responses"
          >
            <Lightbulb className="w-5 h-5" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            onClick={handleImageUploadButtonClick}
            disabled={!apiKey || selectedChatbots.length === 0}
            className="p-2 bg-[rgb(var(--card))] text-[rgb(var(--fg))] border-[#202225] hover:bg-[#202225] hover:text-[rgb(var(--fg))]"
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
            aria-label="Chat message input"
            className="flex-1 bg-[rgb(var(--card))] border-[#202225] text-[rgb(var(--fg))] placeholder-[#96989d]"
            disabled={!apiKey || selectedChatbots.length === 0}
          />
          <Button
            onClick={sendMessage}
            disabled={(!inputValue.trim() && !selectedImageFile) || !apiKey || selectedChatbots.length === 0}
            className="bg-[#5865f2] hover:bg-[#4752c4] text-[rgb(var(--fg))]"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </Button>
          <Button
            onClick={onSaveChat}
            disabled={isSaving || selectedChatbots.length === 0}
            className="bg-[#43b581] hover:bg-[#3aa873] text-[rgb(var(--fg))]"
            aria-label="Save chat"
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
            className="w-20 h-20 object-cover rounded border border-[#202225]"
          />
          <div className="text-xs text-[#96989d] truncate">{selectedImageFile.name}</div>
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