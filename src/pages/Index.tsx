
import { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { ChatArea } from '@/components/ChatArea';
import { AddShapeModal } from '@/components/AddShapeModal';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { MobileHeader } from '@/components/MobileHeader';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChatPersistence, SavedChat } from '@/hooks/useChatPersistence';
import { useOnboarding } from '@/hooks/useOnboarding';
import { AppFooter } from '@/components/AppFooter';

export interface Chatbot {
  id: string;
  name: string;
  url: string;
}

const Index = () => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedChatbots, setSelectedChatbots] = useState<Chatbot[]>([]);
  const [isAddShapeModalOpen, setIsAddShapeModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { savedChats, loadSavedChats, loadChat, setCurrentChatId, currentChatId, deleteChat } = useChatPersistence();
  const { hasSeenOnboarding, markOnboardingAsSeen } = useOnboarding();

  useEffect(() => {
    loadSavedChats();
  }, [loadSavedChats]);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('shapes-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  useEffect(() => {
    const savedChatbots = localStorage.getItem('chatbots');
    if (savedChatbots) {
      setChatbots(JSON.parse(savedChatbots));
    }
  }, []);

  const addChatbot = (url: string) => {
    const name = url.split('/').pop() || 'Unknown Bot';
    const newChatbot: Chatbot = {
      id: url,
      name: name.replace(/-/g, ' '),
      url
    };
    const newChatbots = [...chatbots, newChatbot];
    setChatbots(newChatbots);
    localStorage.setItem('chatbots', JSON.stringify(newChatbots));
    
    // Select only the newly added chatbot (individual channel)
    setSelectedChatbots([newChatbot]);
    
    // Show success toast
    toast({
      title: "Shape Added Successfully!",
      description: `${newChatbot.name} now has its own dedicated channel.`,
    });
  };

  const handleChatbotSelection = (chatbot: Chatbot, isSelected: boolean) => {
    if (isSelected) {
      // Add chatbot if we have less than 3 selected
      if (selectedChatbots.length < 3) {
        setSelectedChatbots(prev => [...prev, chatbot]);
      } else {
        toast({
          title: "Maximum Reached",
          description: "You can select up to 3 shapes for a group chat.",
          variant: "destructive"
        });
      }
    } else {
      // Remove chatbot from selection
      setSelectedChatbots(prev => prev.filter(bot => bot.id !== chatbot.id));
    }
  };

  const handleSelectSingleChatbot = (chatbot: Chatbot) => {
    // If the selected chatbot is already the only one selected, do nothing
    if (selectedChatbots.length === 1 && selectedChatbots[0].id === chatbot.id) {
      return;
    }
    // Select only this chatbot (individual channel)
    setSelectedChatbots([chatbot]);
    // Clear current chat ID to start a new conversation with this chatbot
    setCurrentChatId(null);
    toast({
      title: "Channel Selected",
      description: `Now chatting with ${chatbot.name}`,
    });
  };

  const handleLoadChat = async (chat: SavedChat) => {
    const chatbot = chatbots.find(cb => cb.id === chat.chatbot_id);
    if (chatbot) {
      setSelectedChatbots([chatbot]);
      setCurrentChatId(chat.id);
    } else {
      toast({
        title: "Error",
        description: "Could not find the associated chatbot for this chat.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSavedChat = async (chatId: string) => {
    await deleteChat(chatId);
    loadSavedChats(); // Reload saved chats after deletion
    toast({
      title: "Chat Deleted",
      description: "Saved chat has been successfully deleted.",
    });
  };

  const handleDeleteChatbot = (chatbotId: string) => {
    const updatedChatbots = chatbots.filter(bot => bot.id !== chatbotId);
    setChatbots(updatedChatbots);
    localStorage.setItem('chatbots', JSON.stringify(updatedChatbots));

    // Also remove from selectedChatbots if it was selected
    setSelectedChatbots(prev => prev.filter(bot => bot.id !== chatbotId));

    toast({
      title: "Shape Deleted",
      description: "Chatbot has been successfully removed.",
    });
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('shapes-api-key', key);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full relative">
          {/* Mobile Header */}
          <MobileHeader 
            onAddShape={() => setIsAddShapeModalOpen(true)}
            onOpenApiConfig={() => setIsApiKeyModalOpen(true)}
          />
          
          <AppSidebar 
            chatbots={chatbots}
            selectedChatbots={selectedChatbots}
            onSelectChatbot={handleChatbotSelection}
            onSelectSingleChatbot={handleSelectSingleChatbot}
            onAddShape={() => setIsAddShapeModalOpen(true)}
            onOpenApiConfig={() => setIsApiKeyModalOpen(true)}
            savedChats={savedChats}
            onLoadChat={handleLoadChat}
            onDeleteChat={handleDeleteSavedChat}
            onDeleteChatbot={handleDeleteChatbot}
            markOnboardingAsSeen={markOnboardingAsSeen}
          />
          
          {/* Main content area with responsive margins */}
          <div className={`flex-1 ${isMobile ? 'pt-16' : 'md:ml-64'}`}>
            <ChatArea 
              selectedChatbots={selectedChatbots}
              apiKey={apiKey}
              currentChatId={currentChatId}
            />
          </div>
        </div>
      </SidebarProvider>

      <AddShapeModal 
        isOpen={isAddShapeModalOpen}
        onClose={() => setIsAddShapeModalOpen(false)}
        onAddShape={addChatbot}
      />

      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveApiKey={saveApiKey}
        currentApiKey={apiKey}
      />
      <AppFooter />
    </div>
  );
};

export default Index;
