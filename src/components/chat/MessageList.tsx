
import { useRef, useEffect, useState } from 'react';
import { Message } from '@/types/message';
import { Chatbot } from '@/pages/Index';
import { isAudioUrl, isImageUrl } from '@/utils/messageUtils';
import { AudioPlayer } from '../AudioPlayer';
import { ImagePreview } from '../ui/ImagePreview';
import { MessageText } from './MessageText';
import { MessageActions } from './MessageActions';
import { EditableMessage } from './EditableMessage';
import { ScrollArea } from '../ui/scroll-area';
import { Bot } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onRegenerateMessage: (messageId: string) => void;
  selectedChatbots: Chatbot[];
}

export function MessageList({ 
  messages, 
  isLoading, 
  onEditMessage, 
  onDeleteMessage, 
  onRegenerateMessage,
  selectedChatbots
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEdit = (messageId: string) => {
    setEditingMessageId(messageId);
  };

  const handleSaveEdit = (messageId: string, newContent: string) => {
    onEditMessage(messageId, newContent);
    setEditingMessageId(null);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };

  const renderMessageContent = (message: Message) => {
    // If this message is being edited, show the editable version
    if (editingMessageId === message.id) {
      return (
        <EditableMessage
          content={message.content}
          onSave={(newContent) => handleSaveEdit(message.id, newContent)}
          onCancel={handleCancelEdit}
        />
      );
    }

    // User-sent images with local preview
    if (message.sender === 'user' && message.imageUrl) {
      return (
        <div className="space-y-1">
          {message.content && <MessageText content={message.content} />}
          <img 
            src={message.imageUrl} 
            alt="User upload preview" 
            className="max-w-[200px] h-auto rounded mt-1 border border-blue-400"
          />
        </div>
      );
    }

    // Bot messages with image URL (rendered via ImagePreview component)
    const botImageUrl = isImageUrl(message.content);
    if (botImageUrl && message.sender === 'bot') {
      const textContent = message.content.replace(botImageUrl, '').trim();
      return (
        <div className="space-y-2">
          {textContent && <MessageText content={textContent} />}
          <ImagePreview src={botImageUrl} alt="Bot image content" />
        </div>
      );
    }
    
    // Bot messages with audio URL
    const audioUrl = isAudioUrl(message.content);
    if (audioUrl && message.sender === 'bot') {
      const textContent = message.content.replace(audioUrl, '').trim();
      return (
        <div className="space-y-2">
          {textContent && <MessageText content={textContent} />}
          <AudioPlayer src={audioUrl} />
        </div>
      );
    }
    
    // Default: plain text message (for user or bot without special content)
    return <MessageText content={message.content} />;
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex group ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative break-words overflow-wrap-anywhere ${
                  message.sender === 'user'
                    ? 'bg-[#5865f2] text-white'
                    : 'bg-[#2f3136] text-white border border-[#202225]'
                }`}
              >
                <div className="absolute top-2 right-2">
                  <MessageActions
                    messageId={message.id}
                    isBot={message.sender === 'bot'}
                    onEdit={handleEdit}
                    onDelete={onDeleteMessage}
                    onRegenerate={message.sender === 'bot' ? onRegenerateMessage : undefined}
                  />
                </div>
                <div className="pr-8 overflow-hidden">
                  {/* Show bot indicator for multi-bot chats */}
                  {message.sender === 'bot' && selectedChatbots.length > 1 && (
                    <div className="flex items-center gap-1 mb-1 text-xs text-[#96989d]">
                      <Bot className="w-3 h-3" />
                      <span>Bot Response</span>
                    </div>
                  )}
                  {renderMessageContent(message)}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#2f3136] text-white border border-[#202225] px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#96989d] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#96989d] rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-[#96989d] rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
