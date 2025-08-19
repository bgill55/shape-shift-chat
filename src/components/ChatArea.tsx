
import { useMemo, useEffect, useState } from 'react';
import { Chatbot } from '@/pages/Index';
import { GroupChatHeader } from './chat/GroupChatHeader';
import { MessageList } from './chat/MessageList';
import { MessageInput } from './chat/MessageInput';
import { useMessages } from '@/hooks/useMessages';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { Message } from '@/types/message';
import { useToast } from '@/hooks/use-toast';
import { handleCommand } from '@/lib/commandHandler';


export function ChatArea({ selectedChatbots, apiKey, currentChatId: propCurrentChatId }: ChatAreaProps) {
  const { 
    messages, 
    isLoading,
    addMessage, 
    updateMessage, 
    performApiCall,
    editMessage,
    deleteMessage,
    regenerateMessage,
    loadMessages,
    clearMessages,
    handleGroupChatResponse,
    typingUsers, // New prop from useMessages
  } = useMessages();
  
  const {
    isLoading: isSaving,
    saveChat,
    startNewChat,
    loadChat,
    deleteChat,
    setCurrentChatId,
    autoSaveChat
  } = useChatPersistence();

  const { toast } = useToast();
  const [replyingToMessageId, setReplyingToMessageId] = useState<string | null>(null); // New state for threading

  useEffect(() => {
    if (propCurrentChatId) {
      setCurrentChatId(propCurrentChatId);
      loadChat(propCurrentChatId).then((loadedMessages) => {
        loadMessages(loadedMessages || []);
      });
    } else {
      clearMessages();
    }
  }, [propCurrentChatId, loadChat, loadMessages, clearMessages, setCurrentChatId]);

  useEffect(() => {
    if (selectedChatbots.length > 0) {
      autoSaveChat(selectedChatbots[0], messages);
    }
  }, [messages, selectedChatbots, autoSaveChat]);

  const handleReply = (messageId: string) => {
    setReplyingToMessageId(messageId);
  };

  const handleCancelReply = () => {
    setReplyingToMessageId(null);
  };

const handleSendMessage = async (userMessage: Message, imageFile: File | null, textInput: string) => {
    const updatedMessages = [...messages, userMessage];
    addMessage(userMessage);
    if (selectedChatbots.length === 1) {
      const botMessage = await performApiCall(apiKey, selectedChatbots[0], textInput, updatedMessages, imageFile);
      if (botMessage) {
        addMessage(botMessage);
      }
    } else {
      await handleGroupChatResponse(apiKey, selectedChatbots, userMessage, imageFile, textInput, updatedMessages);
    }
  };

  if (selectedChatbots.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-start bg-[rgb(var(--bg))] pt-8 md:pt-0 text-center text-[rgb(var(--fg))] px-4 h-full overflow-y-auto">
        <img src="/assets/X_large_image.png" alt="Welcome to Shape Shift" className="max-w-[50%] h-auto mb-4 object-contain flex-shrink-0" /> 
        <h2 className="text-3xl font-bold mb-3 text-[rgb(var(--fg))]">Welcome to Shape Shift!</h2>
        <p className="text-lg mb-2 text-[rgb(var(--fg))]">A Shift in the way you interact with your Shape.</p>
        <p className="text-sm mb-6 max-w-md text-[rgb(var(--fg))]">
          Select a shape from the sidebar to start an individual conversation, or choose multiple shapes for a group chat.
        </p>
        <div className="text-center text-sm text-[rgb(var(--fg))] space-y-2">
          <p>💬 Individual channels: Click on any shape for one-on-one chat.</p>
          <p>👥 Group chat: Use checkboxes to select up to 3 shapes.</p>
          <p>💡 Tip: On mobile, tap the menu button in the top left to open the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[rgb(var(--bg))]">
      <GroupChatHeader selectedChatbots={selectedChatbots} />
      
      <div className="flex-1 relative">
        <div className="absolute inset-0 overflow-y-auto">
          <MessageList 
            messages={messages} 
            isLoading={isLoading}
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
            onRegenerateMessage={regenerateMessage}
            selectedChatbots={selectedChatbots}
            apiKey={apiKey}
            onReply={handleReply}
          />
        </div>
      </div>

      <div className="flex-shrink-0 p-2 border-t border-border">
        <MessageInput 
            key={propCurrentChatId || selectedChatbots.map(c => c.id).join('-')}
            selectedChatbots={selectedChatbots}
            apiKey={apiKey}
            isSaving={isSaving}
            onSendMessage={handleSendMessage}
            onSaveChat={() => saveChat(selectedChatbots[0], messages)}
            chatHistory={messages}
            replyingToMessageId={replyingToMessageId}
            onCancelReply={handleCancelReply}
          />
      </div>
    </div>
  );
}

interface ChatAreaProps {
  selectedChatbots: Chatbot[];
  apiKey: string;
  currentChatId: string | null;
}