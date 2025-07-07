import { useEffect, useMemo, useRef } from 'react'; 
import { User as SupabaseUser } from '@supabase/supabase-js'; 
import { Chatbot } from '@/pages/Index';
import { GroupChatHeader } from './chat/GroupChatHeader';
import { MessageList } from './chat/MessageList';
import { MessageInput } from './chat/MessageInput';
import { useMessages } from '@/hooks/useMessages';
import { useChatPersistence, SavedChat } from '@/hooks/useChatPersistence'; 
import { Message } from '@/types/message';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext'; 
import { Button } from '@/components/ui/button';
import { Save, FileText, Trash2 } from 'lucide-react';
import { parseMentions, getUniqueMentionedChatbots } from '@/utils/mentionUtils';

interface ChatAreaProps {
  selectedChatbots: Chatbot[];
  apiKey: string;
  currentChatId: string | null;
}

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
    clearMessages
  } = useMessages();
  
  const {
    isLoading: isSaving,
    saveChat,
    startNewChat,
    loadChat,
    deleteChat,
    setCurrentChatId
  } = useChatPersistence();

  const selectedBotIdsKey = useMemo(() => selectedChatbots.map(bot => bot.id).sort().join(','), [selectedChatbots]);

  useEffect(() => {
    if (propCurrentChatId) {
      setCurrentChatId(propCurrentChatId);
    }
  }, [propCurrentChatId, setCurrentChatId]);

  const { toast } = useToast();
  const { user } = useAuth();

  const prevUserRef = useRef<SupabaseUser | null>();
  const prevSelectedBotIdsKeyRef = useRef<string>();

  useEffect(() => {
    if (propCurrentChatId) {
      clearMessages();
      loadChat(propCurrentChatId).then((loadedMessages) => {
        if (loadedMessages && loadedMessages.length > 0) {
          loadMessages(loadedMessages);
        }
      });
    } else {
      clearMessages();
    }
  }, [propCurrentChatId, selectedBotIdsKey, loadChat, loadMessages, clearMessages]);

  const handleSendMessage = async (userMessage: Message, imageFile: File | null, textInput: string) => {
    addMessage(userMessage);

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
      const chatbotsToRespond = selectedChatbots;

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
    if (!propCurrentChatId) return;
    
    await deleteChat(propCurrentChatId);
    clearMessages();
    
    toast({
      title: "Chat Deleted",
      description: "The current chat has been deleted.",
    });
  };

  if (selectedChatbots.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#36393f] pt-16 md:pt-0 text-center text-[#96989d] px-4">
        <img src="/assets/X_large_image.png" alt="Welcome to Shapes Shift" className="w-64 h-64 mb-6 opacity-70 object-contain" />
        <h2 className="text-3xl font-bold mb-3">Welcome to Shapes Shift!</h2>
        <p className="text-lg mb-2">Your AI-powered chat experience.</p>
        <p className="text-sm mb-6 max-w-md">
          Select a shape from the sidebar to start an individual conversation, or choose multiple shapes for a group chat.
        </p>
        <div className="text-left text-sm text-[#72767d] space-y-2">
          <p>💬 Individual channels: Click on any shape for one-on-one chat.</p>
          <p>👥 Group chat: Use checkboxes to select up to 3 shapes.</p>
          <p>💡 Tip: On mobile, tap the menu button in the top left to open the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#36393f] pt-16 md:pt-0 h-screen md:h-auto border-2 border-cyan-600">
      <GroupChatHeader selectedChatbots={selectedChatbots} />
      
      {/* Chat Controls */}
      <div className="px-4 py-2 bg-[#2f3136] border-b border-[#202225] flex gap-2 flex-shrink-0 border-2 border-cyan-500">
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
        
        {propCurrentChatId && (
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
        
        {propCurrentChatId && (
          <span className="text-xs text-[#72767d] self-center ml-2">
            Auto-saved to database
          </span>
        )}
      </div>

      {/* Messages area - fixed height container with flex */}
      <div className="flex-1 flex flex-col min-h-0 border-2 border-cyan-600"> {/* Changed overflow-hidden to min-h-0 */}
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
      <div className="flex-shrink-0 border-2 border-cyan-500">
        <MessageInput 
          selectedChatbots={selectedChatbots}
          apiKey={apiKey}
          isLoading={isLoading}
          isSaving={isSaving}
          onSendMessage={handleSendMessage}
          onSaveChat={handleSaveChat}
          chatHistory={messages} // Added chatHistory prop
        />
      </div>
    </div>
  );
}
