
import { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { ChatArea } from '@/components/ChatArea';
import { AddShapeModal } from '@/components/AddShapeModal';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { MobileHeader } from '@/components/MobileHeader';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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

  useEffect(() => {
    const savedApiKey = localStorage.getItem('shapes-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const addChatbot = (url: string) => {
    const name = url.split('/').pop() || 'Unknown Bot';
    const newChatbot: Chatbot = {
       id: crypto.randomUUID(),
       name: name.replace(/-/g, ' '),
      url
    };
    setChatbots([...chatbots, newChatbot]);
    
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
    // Select only this chatbot (individual channel)
    setSelectedChatbots([chatbot]);
    toast({
      title: "Channel Selected",
      description: `Now chatting with ${chatbot.name}`,
    });
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('shapes-api-key', key);
  };

  return (
    <div className="min-h-screen bg-[#36393f] text-white">
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
          />
          
          {/* Main content area with responsive margins */}
          <div className={`flex-1 ${isMobile ? 'pt-16' : 'md:ml-64'}`}>
            <ChatArea 
              selectedChatbots={selectedChatbots}
              apiKey={apiKey}
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
    </div>
  );
};

export default Index;
