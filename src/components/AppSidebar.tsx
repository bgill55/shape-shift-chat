
import { Plus, Settings, Sparkles, Users, Bookmark, Trash2 } from 'lucide-react';
import React, { useRef } from 'react';
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

  // Define a set of shapes and colors
  const SHAPES = [
    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>, // Circle
    <svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16"/></svg>, // Square
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20z"/></svg>, // Triangle
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>, // Star
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 6v12l9 5 9-5V6z"/></svg>, // Hexagon
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>, // Hollow Circle
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm0 16H5V5h14v14z"/></svg>, // Hollow Square
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5L2 21h20L12 4.5zm0 3.33L17.5 18H6.5L12 7.83z"/></svg>, // Hollow Triangle
  ];

  const COLORS = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500",
    "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-cyan-500",
  ];

  const chatbotIconMap = useRef(new Map());

  const getChatbotIcon = (chatbotId: string) => {
    if (!chatbotIconMap.current.has(chatbotId)) {
      const assignedCount = chatbotIconMap.current.size;
      const shapeIndex = assignedCount % SHAPES.length;
      const colorIndex = assignedCount % COLORS.length;
      chatbotIconMap.current.set(chatbotId, {
        shape: SHAPES[shapeIndex],
        color: COLORS[colorIndex],
      });
    }
    return chatbotIconMap.current.get(chatbotId);
  };

  const isChatbotSelected = (chatbot: Chatbot) => {
    return selectedChatbots.some(selected => selected.id === chatbot.id);
  };

  const handleChatbotToggle = (chatbot: Chatbot) => {
    const isCurrentlySelected = isChatbotSelected(chatbot);
    onSelectChatbot(chatbot, !isCurrentlySelected);
  };

  const isGroupChatMode = selectedChatbots.length > 1;

  return (
    <Sidebar className={`bg-[var(--color-sidebar-bg)] border-r border-[var(--color-sidebar-border)] h-screen flex-shrink-0 transition-transform duration-300 ${open ? 'w-64 translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:w-64`}>
      <SidebarHeader className="p-4 border-b border-[var(--color-sidebar-border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-purple-300">Shapes Shift</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Individual Channels */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-purple-400 text-xs uppercase font-semibold px-2 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
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
                        ? 'bg-purple-700 text-white' 
                        : 'text-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 ${getChatbotIcon(chatbot.id).color} rounded-full flex items-center justify-center`}>
                        <div className="w-4 h-4 text-white">
                          {getChatbotIcon(chatbot.id).shape}
                        </div>
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
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
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
          <SidebarGroupLabel className="text-purple-400 text-xs uppercase font-semibold px-2 mb-2 flex items-center gap-1">
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
                      <div className={`w-6 h-6 ${getChatbotIcon(chatbot.id).color} rounded-full flex items-center justify-center`}>
                        <div className="w-4 h-4 text-white">
                          {getChatbotIcon(chatbot.id).shape}
                        </div>
                      </div>
                      <span className={`truncate ${
                        isChatbotSelected(chatbot) && isGroupChatMode ? 'text-purple-300' : 'text-purple-200'
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
          <SidebarGroupLabel className="text-purple-400 text-xs uppercase font-semibold px-2 mb-2 flex items-center gap-1">
            <Bookmark className="w-3 h-3" />
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
                    <div className={`w-3 h-3 ${getChatbotIcon(chatbot.id).color} rounded-full flex items-center justify-center`}>
                      <div className="w-2 h-2 text-white">
                        {getChatbotIcon(chatbot.id).shape}
                      </div>
                    </div>
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
            className="flex-grow justify-start text-left px-2 py-2 rounded hover:bg-blue-700 text-blue-300"
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
