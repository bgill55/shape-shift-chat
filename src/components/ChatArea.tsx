import { useEffect } from 'react';
import { Chatbot } from '@/pages/Index';
import { GroupChatHeader } from './chat/GroupChatHeader';
import { MessageList } from './chat/MessageList';
import { MessageInput } from './chat/MessageInput';
import { useMessages } from '@/hooks/useMessages';
import { useChatPersistence, SavedChat } from '@/hooks/useChatPersistence'; // Import SavedChat
import { Message } from '@/types/message';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext'; // Added useAuth
import { Button } from '@/components/ui/button';
import { Save, FileText, Trash2 } from 'lucide-react';
import { parseMentions, getUniqueMentionedChatbots } from '@/utils/mentionUtils';

interface ChatAreaProps {
  selectedChatbots: Chatbot[];
  apiKey: string;
}

export function ChatArea({ selectedChatbots, apiKey }: ChatAreaProps) {
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
    clearMessages
  } = useMessages();
  
  const {
    currentChatId,
    isLoading: isSaving,
    saveChat,
    startNewChat,
    loadSavedChats,
    loadChat,
    deleteChat,
    savedChats,
    setCurrentChatId
  } = useChatPersistence();

  const { toast } = useToast();
  const { user } = useAuth(); // Added user from useAuth

  // Auto-save chat every 5 minutes (without toast notification)
  useEffect(() => {
    if (messages.length > 0 && selectedChatbots.length > 0) {
      const timeoutId = setTimeout(() => {
        // Use the first chatbot for saving purposes (we might want to enhance this later)
        saveChat(selectedChatbots[0], messages, undefined, false);
      }, 300000); // 5 minutes = 300,000 milliseconds

      return () => clearTimeout(timeoutId);
    }
  }, [messages, selectedChatbots, saveChat]);

  // Effect to load initial or selected chat
  useEffect(() => {
    const loadInitialChat = async () => {
      if (!user || selectedChatbots.length === 0) {
        // Optionally clear messages if user logs out or no bot selected
        // This might be redundant if other effects or direct calls handle it,
        // but good for explicit state reset if needed here.
        // clearMessages();
        // setCurrentChatId(null);
        return;
      }

      // Clear previous state when context (user or selected bot) changes
      console.log('[ChatArea useEffect] Clearing messages and currentChatId due to user/bot change.');
      clearMessages();
      setCurrentChatId(null);

      // loadSavedChats now returns the chats and also sets them in its own state.
      // We can use the returned value directly.
      const allUserSavedChats: SavedChat[] = await loadSavedChats();

      if (allUserSavedChats && allUserSavedChats.length > 0) {
        const primarySelectedBotId = selectedChatbots[0].id;
        console.log(`[ChatArea useEffect] Primary selected bot ID: ${primarySelectedBotId}`);

        const mostRecentChatForSelectedBot = allUserSavedChats
          .filter(chat => chat.chatbot_id === primarySelectedBotId)
          // Already sorted by updated_at desc in loadSavedChats, but if not, sort here.
          // .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          [0]; // Get the first one after filtering (should be most recent)

        if (mostRecentChatForSelectedBot) {
          console.log(`[ChatArea useEffect] Found most recent chat for selected bot: ${mostRecentChatForSelectedBot.id}`);
          const loadedMessages = await loadChat(mostRecentChatForSelectedBot.id);
          if (loadedMessages && loadedMessages.length > 0) {
            console.log(`[ChatArea useEffect] Loading ${loadedMessages.length} messages for chat ${mostRecentChatForSelectedBot.id}`);
            loadMessages(loadedMessages);
            setCurrentChatId(mostRecentChatForSelectedBot.id);
          } else {
            console.log(`[ChatArea useEffect] No messages found for chat ${mostRecentChatForSelectedBot.id}, starting new chat implicitly.`);
          }
        } else {
          console.log(`[ChatArea useEffect] No saved chats found for bot ${primarySelectedBotId}. Starting new chat implicitly.`);
        }
      } else {
        console.log('[ChatArea useEffect] No saved chats found for the user. Starting new chat implicitly.');
      }
    };

    loadInitialChat();
  }, [
    user,
    selectedChatbots.map(bot => bot.id).join(','), // Still use derived key for chatbots
    loadSavedChats,
    loadChat,
    loadMessages,
    clearMessages,
    setCurrentChatId
  ]);

  const handleSendMessage = async (userMessage: Message, imageFile: File | null, textInput: string) => {
    addMessage(userMessage);

    // For single chatbot, always respond. For multiple chatbots, parse mentions
    if (selectedChatbots.length === 1) {
      const chatbot = selectedChatbots[0];
      
      if (imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64DataUri = e.target?.result as string;
          if (!base64DataUri) {
            console.error("Failed to read file as Base64.");
            updateMessage(userMessage.id, {
              content: `${userMessage.content} [Image send failed (read error)]`
            });
            return;
          }

          const apiMessageContent: any[] = [];
          if (textInput.trim()) {
            apiMessageContent.push({ type: "text", text: textInput.trim() });
          }
          apiMessageContent.push({ type: "image_url", image_url: { url: base64DataUri } });
          
          performApiCall(apiKey, chatbot, apiMessageContent);
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
          updateMessage(userMessage.id, {
            content: `${userMessage.content} [Image send failed (read error)]`
          });
          toast({
            title: "File Read Error",
            description: "Could not read the selected image file.",
            variant: "destructive"
          });
        };
        reader.readAsDataURL(imageFile);
      } else {
        await performApiCall(apiKey, chatbot, textInput);
      }
    } else {
      // Group chat mode - parse @ mentions
      const mentions = parseMentions(textInput, selectedChatbots);
      const mentionedChatbots = getUniqueMentionedChatbots(mentions);

      const chatbotsToRespond = mentionedChatbots.length > 0 ? mentionedChatbots : [];

      if (chatbotsToRespond.length === 0 && selectedChatbots.length > 1) {
        // Show helper message for multi-bot setup
        const helperMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `💡 Tip: Use @mentions to talk to specific shapes! Available: ${selectedChatbots.map(bot => `@${bot.name.toLowerCase().replace(/\s+/g, '')}`).join(', ')}`,
          sender: 'bot',
          timestamp: new Date()
        };
        addMessage(helperMessage);
        return;
      }

      // Process each mentioned chatbot
      for (const chatbot of chatbotsToRespond) {
        if (imageFile) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64DataUri = e.target?.result as string;
            if (!base64DataUri) {
              console.error("Failed to read file as Base64.");
              updateMessage(userMessage.id, {
                content: `${userMessage.content} [Image send failed (read error)]`
              });
              return;
            }

            const apiMessageContent: any[] = [];
            if (textInput.trim()) {
              apiMessageContent.push({ type: "text", text: textInput.trim() });
            }
            apiMessageContent.push({ type: "image_url", image_url: { url: base64DataUri } });
            
            performApiCall(apiKey, chatbot, apiMessageContent);
          };
          reader.onerror = (error) => {
            console.error("FileReader error:", error);
            updateMessage(userMessage.id, {
              content: `${userMessage.content} [Image send failed (read error)]`
            });
            toast({
              title: "File Read Error",
              description: "Could not read the selected image file.",
              variant: "destructive"
            });
          };
          reader.readAsDataURL(imageFile);
        } else {
          await performApiCall(apiKey, chatbot, textInput);
        }
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
    if (selectedChatbots.length === 0) return;
    // Use the first chatbot for regeneration (could be enhanced to remember which bot sent the message)
    await regenerateMessage(messageId, apiKey, selectedChatbots[0]);
  };

  const handleSaveChat = async () => {
    if (selectedChatbots.length === 0 || messages.length === 0) return;
    await saveChat(selectedChatbots[0], messages);
  };

  const handleNewChat = () => {
    clearMessages();
    startNewChat();
    toast({
      title: "New Chat Started",
      description: "You can now start a fresh conversation.",
    });
  };

  const handleDeleteChat = async () => {
    if (!currentChatId) return;
    
    await deleteChat(currentChatId);
    clearMessages();
    
    toast({
      title: "Chat Deleted",
      description: "The current chat has been deleted.",
    });
  };

  if (selectedChatbots.length === 0) {
    return (
      // This is also a main container variant, apply border here too for consistency in debugging.
      <div className="flex-1 flex items-center justify-center bg-[#36393f] pt-16 md:pt-0 border-2 border-red-500">
        <div className="text-center text-[#96989d] px-4">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Shapes Chat</h2>
          <p className="mb-4">Select a shape from the sidebar to start an individual conversation</p>
          <p className="text-sm text-[#72767d] mb-2">
            💬 Individual channels: Click on any shape for one-on-one chat
          </p>
          <p className="text-sm text-[#72767d]">
            👥 Group chat: Use checkboxes to select up to 3 shapes and use @mentions
          </p>
          <p className="text-sm text-[#72767d] mt-2">
            On mobile, tap the menu button in the top left to open the sidebar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#36393f] pt-16 md:pt-0 h-screen md:h-auto border-2 border-red-500">
      <GroupChatHeader selectedChatbots={selectedChatbots} />
      
      {/* Chat Controls */}
      <div className="px-4 py-2 bg-[#2f3136] border-b border-[#202225] flex gap-2 flex-shrink-0 border-2 border-yellow-500">
        <Button
          size="sm"
          variant="outline"
          onClick={handleNewChat}
          className="bg-[#40444b] text-[#96989d] border-[#202225] hover:bg-[#202225] hover:text-white"
        >
          <FileText className="w-4 h-4 mr-1" />
          New Chat
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={handleSaveChat}
          disabled={messages.length === 0 || isSaving}
          className="bg-[#40444b] text-[#96989d] border-[#202225] hover:bg-[#202225] hover:text-white"
        >
          <Save className="w-4 h-4 mr-1" />
          {isSaving ? 'Saving...' : 'Save Chat'}
        </Button>
        
        {currentChatId && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDeleteChat}
            className="bg-[#40444b] text-[#96989d] border-[#202225] hover:bg-[#dc2626] hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Chat
          </Button>
        )}
        
        {currentChatId && (
          <span className="text-xs text-[#72767d] self-center ml-2">
            Auto-saved to database
          </span>
        )}
      </div>

      {/* Messages area - fixed height container with flex */}
      <div className="flex-1 flex flex-col min-h-0 border-2 border-green-500"> {/* Changed overflow-hidden to min-h-0 */}
        <MessageList 
          messages={messages} 
          isLoading={isLoading}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onRegenerateMessage={handleRegenerateMessage}
          selectedChatbots={selectedChatbots}
        />
      </div>

      {/* Input area - fixed at bottom */}
      <div className="flex-shrink-0 border-2 border-blue-500">
        <MessageInput 
          selectedChatbots={selectedChatbots}
          apiKey={apiKey}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          chatHistory={messages} // Added chatHistory prop
        />
      </div>
    </div>
  );
}
