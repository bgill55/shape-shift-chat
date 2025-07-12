
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
    <Sidebar className={`bg-[var(--color-sidebar-bg)] border-r border-[var(--color-sidebar-border)] h-screen flex-shrink-0 transition-transform duration-300 ${open ? 'w-64 translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:w-64`}>
      <SidebarHeader className="p-4 border-b border-[var(--color-sidebar-border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[var(--color-text)]" />
          </div>
          <span className="font-semibold text-[var(--color-sidebar-text)]">Shapes Shift</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Individual Channels */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[var(--color-sidebar-label)] text-xs uppercase font-semibold px-2 mb-2 flex items-center gap-1">
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
                    className={`flex-grow justify-start text-left px-2 py-1 rounded hover:bg-[var(--color-sidebar-item-hover)] ${
                      selectedChatbots.length === 1 && isChatbotSelected(chatbot) 
                        ? 'bg-[var(--color-sidebar-item-selected)] text-[var(--color-sidebar-text)]' 
                        : 'text-[var(--color-sidebar-label)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-[var(--color-text)]" />
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
                  className="w-full justify-start text-left px-2 py-1 rounded hover:bg-[var(--color-sidebar-item-hover)] text-[var(--color-sidebar-label)]"
                >
                  <div className="w-6 h-6 bg-[var(--color-button-bg-primary)] rounded-full flex items-center justify-center mr-3">
                    <Plus className="w-4 h-4 text-[var(--color-button-text-primary)]" />
                  </div>
                  <span>Add New Shape</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Group Chat Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[var(--color-sidebar-label)] text-xs uppercase font-semibold px-2 mb-2 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Group Chat (Max 3)
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatbots.map((chatbot) => (
                <SidebarMenuItem key={`group-${chatbot.id}`}>
                  <div className="flex items-center gap-2 px-2 py-1 hover:bg-[var(--color-sidebar-item-hover)] rounded">
                    <Checkbox
                      checked={isChatbotSelected(chatbot)}
                      onCheckedChange={() => handleChatbotToggle(chatbot)}
                      disabled={!isChatbotSelected(chatbot) && selectedChatbots.length >= 3}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-[var(--color-text)]" />
                      </div>
                      <span className={`truncate ${
                        isChatbotSelected(chatbot) && isGroupChatMode ? 'text-[var(--color-sidebar-text)]' : 'text-[var(--color-sidebar-label)]'
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
          <SidebarGroupLabel className="text-[var(--color-sidebar-label)] text-xs uppercase font-semibold px-2 mb-2 flex items-center gap-1">
            <History className="w-3 h-3" />
            Saved Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {savedChats.length === 0 ? (
                <p className="text-[var(--color-sidebar-label)] text-sm px-2 py-1">No saved chats yet. Start a conversation and click 'Save Chat'!</p>
              ) : (
                savedChats.map((chat) => (
                  <SidebarMenuItem key={chat.id} className="flex justify-between items-center group">
                    <Button
                      variant="ghost"
                      onClick={() => onLoadChat(chat)}
                      className="flex-grow justify-start text-left px-2 py-1 rounded hover:bg-[var(--color-sidebar-item-hover)] text-[var(--color-sidebar-label)]"
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
            <SidebarGroupLabel className="text-[var(--color-sidebar-label)] text-xs uppercase font-semibold px-2 mb-2">
              Active Group ({selectedChatbots.length}/3)
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 space-y-1">
                {selectedChatbots.map((chatbot) => (
                  <div key={chatbot.id} className="text-sm text-[var(--color-primary)] flex items-center gap-2">
                    <Bot className="w-3 h-3" />
                    @{chatbot.name.toLowerCase().replace(/\s+/g, '')}
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-[var(--color-sidebar-border)] space-y-3">
        
        <div className="flex items-center gap-2">
          <SidebarMenuButton 
            onClick={onOpenApiConfig}
            className="flex-grow justify-start text-left px-2 py-2 rounded hover:bg-[var(--color-sidebar-item-hover)] text-[var(--color-sidebar-label)]"
          >
            <Settings className="w-4 h-4 mr-3" />
            <span>API Configuration</span>
          </SidebarMenuButton>
          
        </div>

        {user && (
          <>
            <Separator className="bg-[var(--color-separator)]" />
            <div className="flex items-center justify-center w-full">
              <UserMenu />
            </div>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
