
import { Plus, Bot, Settings, MessageCircle, Users, History, Trash2 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/UserMenu";
import { Chatbot, SavedChat } from '@/pages/Index';
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { InstallPWAButton } from '@/components/ui/InstallPWAButton';

interface AppSidebarProps {
  chatbots: Chatbot[];
  selectedChatbots: Chatbot[];
  onSelectChatbot: (chatbot: Chatbot, isSelected: boolean) => void;
  onSelectSingleChatbot: (chatbot: Chatbot) => void;
  onAddShape: () => void;
  onOpenApiConfig: () => void;
  savedChats: SavedChat[];
  onLoadChat: (chat: SavedChat) => void;
  onDeleteChat: (chatId: string) => void;
  onDeleteChatbot: (chatbotId: string) => void;
}

export function AppSidebar({ 
  chatbots, 
  selectedChatbots, 
  onSelectChatbot, 
  onSelectSingleChatbot,
  onAddShape, 
  onOpenApiConfig,
  savedChats,
  onLoadChat,
  onDeleteChat,
  onDeleteChatbot
}: AppSidebarProps) {
  const { open } = useSidebar();
  const { user } = useAuth();
  console.log('AppSidebar: user from useAuth():', user); // Added console log

  const isChatbotSelected = (chatbot: Chatbot) => {
    return selectedChatbots.some(selected => selected.id === chatbot.id);
  };

  const handleChatbotToggle = (chatbot: Chatbot) => {
    const isCurrentlySelected = isChatbotSelected(chatbot);
    onSelectChatbot(chatbot, !isCurrentlySelected);
  };

  const isGroupChatMode = selectedChatbots.length > 1;

  console.log("Sidebar open:", open);

  return (
    <Sidebar className={`bg-[#2f3136] border-r border-[#202225] h-screen flex-shrink-0 transition-transform duration-300 ${open ? 'w-64 translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:w-64`}>
      <SidebarHeader className="p-4 border-b border-[#202225]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-white">Shapes Shift</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Individual Channels */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#96989d] text-xs uppercase font-semibold px-2 mb-2 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            Individual Channels
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatbots.map((chatbot) => (
                <SidebarMenuItem key={chatbot.id} className="flex justify-between items-center group">
                  <Button
                    variant="ghost"
                    onClick={() => onSelectSingleChatbot(chatbot)}
                    className={`flex-grow justify-start text-left px-2 py-1 rounded hover:bg-[#393c43] ${
                      selectedChatbots.length === 1 && isChatbotSelected(chatbot) 
                        ? 'bg-[#393c43] text-white' 
                        : 'text-[#96989d]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#5865f2] rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className="truncate">
                        {chatbot.name}
                      </span>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteChatbot(chatbot.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/20 p-1 h-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onAddShape}
                  className="w-full justify-start text-left px-2 py-1 rounded hover:bg-[#393c43] text-[#96989d]"
                >
                  <div className="w-6 h-6 bg-[#43b581] rounded-full flex items-center justify-center mr-3">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <span>Add New Shape</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Group Chat Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#96989d] text-xs uppercase font-semibold px-2 mb-2 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Group Chat (Max 3)
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatbots.map((chatbot) => (
                <SidebarMenuItem key={`group-${chatbot.id}`}>
                  <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#393c43] rounded">
                    <Checkbox
                      checked={isChatbotSelected(chatbot)}
                      onCheckedChange={() => handleChatbotToggle(chatbot)}
                      disabled={!isChatbotSelected(chatbot) && selectedChatbots.length >= 3}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 bg-[#5865f2] rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className={`truncate ${
                        isChatbotSelected(chatbot) && isGroupChatMode ? 'text-white' : 'text-[#96989d]'
                      }`}>
                        {chatbot.name}
                      </span>
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[#96989d] text-xs uppercase font-semibold px-2 mb-2 flex items-center gap-1">
            <History className="w-3 h-3" />
            Saved Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {savedChats.length === 0 ? (
                <p className="text-[#96989d] text-sm px-2 py-1">No saved chats yet. Start a conversation and click 'Save Chat'!</p>
              ) : (
                savedChats.map((chat) => (
                  <SidebarMenuItem key={chat.id} className="flex justify-between items-center group">
                    <Button
                      variant="ghost"
                      onClick={() => onLoadChat(chat)}
                      className="flex-grow justify-start text-left px-2 py-1 rounded hover:bg-[#393c43] text-[#96989d]"
                    >
                      <span className="truncate">{chat.title}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteChat(chat.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/20 p-1 h-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isGroupChatMode && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[#96989d] text-xs uppercase font-semibold px-2 mb-2">
              Active Group ({selectedChatbots.length}/3)
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 space-y-1">
                {selectedChatbots.map((chatbot) => (
                  <div key={chatbot.id} className="text-sm text-[#43b581] flex items-center gap-2">
                    <Bot className="w-3 h-3" />
                    @{chatbot.name.toLowerCase().replace(/\s+/g, '')}
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-[#202225] space-y-3">
        <InstallPWAButton />
        <div className="flex items-center gap-2">
          <SidebarMenuButton 
            onClick={onOpenApiConfig}
            className="flex-grow justify-start text-left px-2 py-2 rounded hover:bg-[#393c43] text-[#96989d]"
          >
            <Settings className="w-4 h-4 mr-3" />
            <span>API Configuration</span>
          </SidebarMenuButton>
          <ThemeSwitcher />
        </div>

        {user && (
          <>
            <Separator className="bg-[#393c43]" />
            <div className="flex items-center justify-center w-full">
              <UserMenu />
            </div>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
