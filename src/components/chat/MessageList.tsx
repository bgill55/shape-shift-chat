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
import { Skeleton } from '../ui/skeleton';
import { Bot, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getChatbotIcon } from '@/utils/chatbotIcons';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onRegenerateMessage: (messageId: string, apiKey: string, selectedChatbot: Chatbot) => void;
  selectedChatbots: Chatbot[];
  apiKey: string;
  onReply: (messageId: string) => void; // New prop for threading
}

export function MessageList({
  messages,
  isLoading,
  onEditMessage,
  onDeleteMessage,
  onRegenerateMessage,
  selectedChatbots,
  apiKey,
  onReply // New prop
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingToMessageId, setReplyingToMessageId] = useState<string | null>(null); // New state for threading
  const { user, displayName } = useAuth();
  const { typingUsers } = useMessages();
  console.log('[MessageList] Rendered with typingUsers:', typingUsers);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
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

  const handleReply = (messageId: string) => {
    setReplyingToMessageId(messageId);
    onReply(messageId);
  };

  const renderMessageContent = (message: Message) => {
    if (editingMessageId === message.id) {
      return (
        <EditableMessage
          content={message.content}
          onSave={(newContent) => handleSaveEdit(message.id, newContent)}
          onCancel={handleCancelEdit}
        />
      );
    }

    if (message.sender === 'user' && message.imageUrl) {
      return (
        <div className="space-y-1">
          {message.content && <MessageText content={message.content} />}
          <ImagePreview
            src={message.imageUrl}
            alt="User upload preview"
          />
        </div>
      );
    }

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

    return <MessageText content={message.content} />;
  };

  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-4">
        <ul aria-live="polite" aria-atomic="false">
          {messages.map((message) => {
            const isReply = !!message.parent_message_id;
            const findMessageById = (id: string) => messages.find(msg => msg.id === id);
            const parentMessage = isReply ? findMessageById(message.parent_message_id!) : undefined;

            return (
              <li
                key={message.id}
                className={`flex group mb-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${isReply ? 'ml-8' : ''}`}
              >
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 mr-2">
                    {message.chatbotId && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getChatbotIcon(message.chatbotId).color}`}>
                        <div className="w-5 h-5 text-[rgb(var(--fg))]" aria-hidden="true">
                          {getChatbotIcon(message.chatbotId).shape}
                        </div>
                      </div>
                    )}
                    {!message.chatbotId && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-500">
                        <Bot className="w-5 h-5 text-[rgb(var(--fg))]" />
                      </div>
                    )}
                  </div>
                )}
                {message.sender === 'user' && user && (
                  <div className="flex-shrink-0 ml-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{displayName ? displayName[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : ''}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-3 rounded-xl relative break-words overflow-wrap-anywhere ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-card-foreground border border-border rounded-bl-none'
                  }`}
                >
                  <div className="absolute top-2 right-2 z-10">
                    {(() => {
                      const currentChatbot = message.chatbotId
                        ? selectedChatbots.find(bot => bot.id === message.chatbotId)
                        : (selectedChatbots.length > 0 ? selectedChatbots[0] : undefined);
                      return (
                        <MessageActions
                          messageId={message.id}
                          isBot={message.sender === 'bot'}
                          onEdit={handleEdit}
                          onDelete={onDeleteMessage}
                          onRegenerate={message.sender === 'bot' ? onRegenerateMessage : undefined}
                          onShareToReddit={() => {
                            const subreddit = 'ShapesInc';
                            const title = 'A cool message from Shape Shift';
                            const text = message.content;
                            const url = `https://www.reddit.com/r/${subreddit}/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
                            console.log('Generated Reddit URL:', url);
                            window.open(url, '_blank');
                          }}
                          apiKey={apiKey}
                          chatbot={currentChatbot}
                          onReply={handleReply} // Pass the new prop here
                        />
                      );
                    })()}
                  </div>
                  <div className="pr-8 overflow-hidden">
                    {isReply && parentMessage && (
                      <div className="text-xs text-muted-foreground mb-1 border-l-2 border-border pl-2">
                        Replying to: "{parentMessage.content.substring(0, 50)}..."
                      </div>
                    )}
                    {message.sender === 'bot' && selectedChatbots.length > 1 && (
                      <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground">
                        <Bot className="w-3 h-3" aria-hidden="true" />
                        <span>{message.botName || 'Shape Response'}</span>
                      </div>
                    )}
                    {renderMessageContent(message)}
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}

          {isLoading && (
            <li className="flex justify-start">
              <div className="flex-shrink-0 mr-2">
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
              <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-xl bg-card text-card-foreground border border-border rounded-bl-none">
                <Skeleton className="h-4 w-32" />
              </div>
            </li>
          )}

          <div ref={messagesEndRef} />
        </ul>

          

      </div>
    </ScrollArea>
  );
}
