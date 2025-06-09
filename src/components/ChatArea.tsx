import { useEffect } from 'react';
import { Chatbot } from '@/pages/Index';
import { GroupChatHeader } from './chat/GroupChatHeader';
import { MessageList } from './chat/MessageList';
import { MessageInput } from './chat/MessageInput';
import { useMessages } from '@/hooks/useMessages';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { Message } from '@/types/message';
import { useToast } from '@/hooks/use-toast';
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

  // Clear chat when chatbot selection changes
  useEffect(() => {
    if (selectedChatbots.length > 0) {
      clearMessages();
      setCurrentChatId(null);
      
      // For now, we'll load the most recent chat from the first selected chatbot
      // This could be enhanced later to handle group chat persistence
      loadSavedChats().then(() => {
        const mostRecentChat = savedChats
          .filter(chat => chat.chatbot_id === selectedChatbots[0].id)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

        if (mostRecentChat) {
          loadChat(mostRecentChat.id).then((loadedMessages) => {
            if (loadedMessages.length > 0) {
              loadMessages(loadedMessages);
              setCurrentChatId(mostRecentChat.id);
            }
          });
        }
      });
    }
  }, [selectedChatbots.map(bot => bot.id).join(',')]); // Only trigger when the chatbot IDs change

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
      <div className="flex-1 flex items-center justify-center bg-[#36393f] pt-16 md:pt-0">
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
    <div className="flex-1 flex flex-col bg-[#36393f] pt-16 md:pt-0 h-screen md:h-auto">
      <GroupChatHeader selectedChatbots={selectedChatbots} />
      
      {/* Chat Controls */}
      <div className="px-4 py-2 bg-[#2f3136] border-b border-[#202225] flex gap-2 flex-shrink-0">
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
      <div className="flex-1 overflow-hidden flex flex-col">
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
      <div className="flex-shrink-0">
        <MessageInput 
          selectedChatbots={selectedChatbots}
          apiKey={apiKey}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
