import React, { useEffect, useMemo, useRef } from 'react';
import { Chatbot } from '@/pages/Index';
import { GroupChatHeader } from './chat/GroupChatHeader';
import { MessageList } from './chat/MessageList';
import { MessageInput } from './chat/MessageInput';
import { useMessages } from '@/hooks/useMessages';
import { useChatPersistence, SavedChat } from '@/hooks/useChatPersistence';
import { Message } from '@/types/message';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Save, FileText, Trash2 } from 'lucide-react';
import { parseMentions, getUniqueMentionedChatbots } from '@/utils/mentionUtils';
import { useAuth } from '@/contexts/AuthContext';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface ChatAreaProps {
  selectedChatbots: Chatbot[];
  apiKey: string;
}

export function ChatArea({ selectedChatbots, apiKey }: ChatAreaProps) {
  const { user } = useAuth();
  const {
    messages,
    isLoading: messagesLoading,
    addMessage,
    updateMessage,
    performApiCall,
    editMessage,
    deleteMessage,
    regenerateMessage,
    loadMessages,
    clearMessages
  } = useMessages();

  const {
    currentChatId,
    isLoading: persistenceIsLoading,
    saveChat,
    startNewChat,
    loadSavedChats,
    loadChat,
    deleteChat,
    setCurrentChatId
  } = useChatPersistence();

  const { toast } = useToast();

  const prevUserRef = useRef<SupabaseUser | null>();
  const prevSelectedBotIdsKeyRef = useRef<string>();

  const selectedBotIdsKey = useMemo(() => {
    return selectedChatbots.map(bot => bot.id).join(',');
  }, [selectedChatbots]);

  // Auto-save chat (moved outside the main data loading useEffect)
  useEffect(() => {
    if (messages.length > 0 && selectedChatbots.length > 0 && user && currentChatId) { // Ensure user and chatId for saving
      const timeoutId = setTimeout(() => {
        saveChat(selectedChatbots[0], messages, undefined, false); // false for no toast on auto-save
      }, 300000); // 5 minutes

      return () => clearTimeout(timeoutId);
    }
  }, [messages, selectedChatbots, user, currentChatId, saveChat]);


  useEffect(() => {
    console.log('[ChatArea useEffect] TRIGGERED.');

    if (prevUserRef.current !== user) {
      console.log('[ChatArea useEffect] Dependency changed: user. Prev ID:', prevUserRef.current?.id, 'New ID:', user?.id);
    }
    // Note: For selectedBotIdsKey, also log if selectedChatbots array ref itself changed if values are same
    if (prevSelectedBotIdsKeyRef.current !== selectedBotIdsKey) {
      console.log('[ChatArea useEffect] Dependency changed: selectedBotIdsKey. Prev:', prevSelectedBotIdsKeyRef.current, 'New:', selectedBotIdsKey);
    }

    prevUserRef.current = user;
    prevSelectedBotIdsKeyRef.current = selectedBotIdsKey;

    console.log(
      '[ChatArea useEffect] Current state for execution. User ID:', user?.id,
      'SelectedBot IDs Key:', selectedBotIdsKey
    );

    const loadInitialChat = async () => {
      console.log('[ChatArea] loadInitialChat EXECUTING.');
      if (!user || selectedChatbots.length === 0) {
        console.log('[ChatArea] loadInitialChat: Aborting - no user or no selected chatbots. Clearing messages.');
        clearMessages(); // Clear messages if context is not valid for loading
        setCurrentChatId(null);
        return;
      }

      console.log('[ChatArea] loadInitialChat: About to call clearMessages() due to user/bot change.');
      clearMessages();
      setCurrentChatId(null);

      const primarySelectedBot = selectedChatbots[0];
      console.log('[ChatArea] loadInitialChat: Primary selected bot ID:', primarySelectedBot.id);
      console.log('[ChatArea] loadInitialChat: Attempting to load saved chats for user:', user.id);
      const allUserSavedChats: SavedChat[] = await loadSavedChats();
      console.log('[ChatArea] loadInitialChat: Loaded allUserSavedChats:', allUserSavedChats);

      if (allUserSavedChats && allUserSavedChats.length > 0) {
        const mostRecentChatForSelectedBot = allUserSavedChats
          .filter(chat => chat.chatbot_id === primarySelectedBot.id)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

        if (mostRecentChatForSelectedBot) {
          console.log('[ChatArea] loadInitialChat: Found most recent chat for bot:', mostRecentChatForSelectedBot.id);
          const loadedMsgs = await loadChat(mostRecentChatForSelectedBot.id); // Renamed to avoid conflict
          console.log('[ChatArea] loadInitialChat: Loaded messages for chat ID', mostRecentChatForSelectedBot.id, 'Messages:', loadedMsgs);
          if (loadedMsgs && loadedMsgs.length > 0) {
            loadMessages(loadedMsgs);
            setCurrentChatId(mostRecentChatForSelectedBot.id);
            console.log('[ChatArea] loadInitialChat: Setting messages and currentChatId:', mostRecentChatForSelectedBot.id);
          } else {
            console.log('[ChatArea] loadInitialChat: No messages found for chat ID', mostRecentChatForSelectedBot.id, 'Starting new chat implicitly.');
          }
        } else {
          console.log('[ChatArea] loadInitialChat: No saved chats found for bot', primarySelectedBot.id, '. Starting new chat implicitly.');
        }
      } else {
        console.log('[ChatArea] loadInitialChat: No saved chats found for the user. Starting new chat implicitly.');
      }
    };

    loadInitialChat();
  }, [user, selectedBotIdsKey, loadSavedChats, loadChat, loadMessages, clearMessages, setCurrentChatId]); // Key dependencies

  const handleSendMessage = async (userMessageText: string, imageFile: File | null) => { // Updated signature
    if (!user) return; // Should not happen if UI is guarded

    const newMessage: Message = {
        id: crypto.randomUUID(),
        content: userMessageText,
        sender: 'user',
        timestamp: new Date(),
        // imageUrl will be handled if imageFile is present
    };

    if (!imageFile) {
        addMessage(newMessage);
    }

    if (selectedChatbots.length === 1) {
      const chatbot = selectedChatbots[0];
      await performApiCall(apiKey, chatbot, userMessageText, imageFile, newMessage.id, addMessage, updateMessage);
    } else {
      const mentions = parseMentions(userMessageText, selectedChatbots);
      const mentionedChatbots = getUniqueMentionedChatbots(mentions);
      const chatbotsToRespond = mentionedChatbots.length > 0 ? mentionedChatbots : [];

      if (chatbotsToRespond.length === 0 && selectedChatbots.length > 1) {
        if (imageFile) {
            addMessage({ ...newMessage, content: `${userMessageText} [Image will be sent if you @mention a bot]` });
        }
        const helperMessage: Message = {
          id: crypto.randomUUID(),
          content: `💡 Tip: Use @mentions to talk to specific shapes! Available: ${selectedChatbots.map(bot => `@${bot.name.toLowerCase().replace(/\s+/g, '')}`).join(', ')}`,
          sender: 'bot',
          timestamp: new Date()
        };
        addMessage(helperMessage);
        return;
      }
      if (imageFile && chatbotsToRespond.length > 0) {
        addMessage({ ...newMessage, content: `${userMessageText} [Image uploading...]` });
      } else if (imageFile && chatbotsToRespond.length === 0) {
        // Handled above
      } else if (!imageFile) {
        // Already added if no imageFile
      }

      for (const chatbot of chatbotsToRespond) {
        await performApiCall(apiKey, chatbot, userMessageText, imageFile, newMessage.id, addMessage, updateMessage);
      }
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    editMessage(messageId, newContent);
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  const handleRegenerateMessage = async (messageId: string) => {
    if (selectedChatbots.length === 0 || !user) return;
    await regenerateMessage(messageId, apiKey, selectedChatbots[0]);
  };

  const handleSaveChat = async () => {
    if (selectedChatbots.length === 0 || messages.length === 0 || !user) return;
    await saveChat(selectedChatbots[0], messages);
  };

  const handleNewChat = () => {
    startNewChat();
    toast({
      title: "New Chat Started",
      description: "You can now start a fresh conversation.",
    });
  };

  const handleDeleteChat = async () => {
    if (!currentChatId || !user) return;
    await deleteChat(currentChatId);
    toast({
      title: "Chat Deleted",
      description: "The current chat has been deleted.",
    });
  };

  if (selectedChatbots.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-foreground pt-16 md:pt-0 border-2 border-red-500">
        <div className="text-center text-muted-foreground px-4">
          <h2 className="text-2xl font-semibold mb-2 text-foreground">Welcome to Shapes Chat</h2>
          <p className="mb-4">Select a shape from the sidebar to start an individual conversation</p>
          <p className="text-sm mb-2">
            💬 Individual channels: Click on any shape for one-on-one chat
          </p>
          <p className="text-sm">
            👥 Group chat: Use checkboxes to select up to 3 shapes and use @mentions
          </p>
          <p className="text-sm mt-2">
            On mobile, tap the menu button in the top left to open the sidebar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground pt-16 md:pt-0 h-screen md:h-auto border-2 border-red-500">
      <GroupChatHeader selectedChatbots={selectedChatbots} />

      <div className="px-4 py-2 bg-card border-b border-border flex gap-2 flex-shrink-0 border-2 border-yellow-500">
        <Button
          size="sm"
          variant="outline"
          onClick={handleNewChat}
          className="bg-secondary text-secondary-foreground hover:bg-muted"
        >
          <FileText className="w-4 h-4 mr-1" />
          New Chat
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleSaveChat}
          disabled={messages.length === 0 || persistenceIsLoading}
          className="bg-secondary text-secondary-foreground hover:bg-muted"
        >
          <Save className="w-4 h-4 mr-1" />
          {persistenceIsLoading ? 'Saving...' : 'Save Chat'}
        </Button>

        {currentChatId && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDeleteChat}
            className="hover:bg-destructive/90"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Chat
          </Button>
        )}

        {currentChatId && (
          <span className="text-xs text-muted-foreground self-center ml-2">
            Chat ID: {currentChatId.substring(0,8)}... Auto-saved
          </span>
        )}
      </div>

      {/* MessageList Wrapper */}
      <div className="flex-1 flex flex-col min-h-0 border-2 border-green-500">
        <MessageList
          messages={messages}
          isLoading={messagesLoading}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onRegenerateMessage={handleRegenerateMessage}
          selectedChatbots={selectedChatbots}
        />
      </div>

      {/* MessageInput Wrapper */}
      <div className="flex-shrink-0 border-2 border-blue-500">
        <MessageInput
          selectedChatbots={selectedChatbots}
          apiKey={apiKey}
          isLoading={messagesLoading} // Pass messagesLoading here
          onSendMessage={handleSendMessage}
          chatHistory={messages} // Pass current messages as chatHistory
        />
      </div>
    </div>
  );
}
