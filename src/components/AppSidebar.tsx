
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
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/UserMenu";
import { getChatbotIcon } from '@/utils/chatbotIcons';

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
  markOnboardingAsSeen: () => void;
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
  onDeleteChatbot,
  markOnboardingAsSeen
}: AppSidebarProps) {
  const { open } = useSidebar();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

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
            <Sparkles className="w-5 h-5 text-[rgb(var(--fg))]" />
          </div>
          <span className="font-semibold text-[rgb(var(--fg))]">Shape Shift</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Individual Channels */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[rgb(var(--fg))] text-xs uppercase font-semibold px-2 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            Individual Channels
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ul className="space-y-1">
              {chatbots.map((chatbot) => (
                <li key={chatbot.id} className="flex justify-between items-center group">
                  <Button
                    variant="ghost"
                    onClick={() => onSelectSingleChatbot(chatbot)}
                    className={`flex-grow justify-start text-left px-2 py-1 rounded hover:bg-[var(--color-sidebar-item-hover)] ${
                      selectedChatbots.length === 1 && isChatbotSelected(chatbot) 
                        ? 'bg-purple-700 text-[rgb(var(--fg))]' 
                        : 'text-[rgb(var(--fg))]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 ${getChatbotIcon(chatbot.id).color} rounded-full flex items-center justify-center`}>
                        <div className="w-4 h-4 text-[rgb(var(--fg))]" aria-hidden="true">
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
                    aria-label={`Delete ${chatbot.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
              
              <li className="mt-2">
                <SidebarMenuButton 
                  onClick={onAddShape}
                  className="w-full justify-start text-left px-2 py-1 rounded hover:bg-[var(--color-sidebar-item-hover)] text-[rgb(var(--fg))]"
                  aria-label="Add a new Shape to the list"
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <Plus className="w-4 h-4 text-[rgb(var(--fg))]" />
                  </div>
                  <span>Add New Shape</span>
                </SidebarMenuButton>
              </li>
            </ul>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Group Chat Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[rgb(var(--fg))] text-xs uppercase font-semibold px-2 mb-2 flex items-center gap-1">
            <Users className="w-3 h-3" aria-hidden="true" />
            Group Chat (Max 3)
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ul className="space-y-1">
              {chatbots.map((chatbot) => (
                <li key={`group-${chatbot.id}`}>
                  <div className="flex items-center gap-2 px-2 py-1 hover:bg-[var(--color-sidebar-item-hover)] rounded">
                    <Checkbox
                      checked={isChatbotSelected(chatbot)}
                      onCheckedChange={() => handleChatbotToggle(chatbot)}
                      disabled={!isChatbotSelected(chatbot) && selectedChatbots.length >= 3}
                      aria-label={`Select ${chatbot.name}`}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-6 h-6 ${getChatbotIcon(chatbot.id).color} rounded-full flex items-center justify-center`}>
                        <div className="w-4 h-4 text-[rgb(var(--fg))]" aria-hidden="true">
                          {getChatbotIcon(chatbot.id).shape}
                        </div>
                      </div>
                      <span className={`truncate ${
                        isChatbotSelected(chatbot) && isGroupChatMode ? 'text-purple-300' : 'text-[rgb(var(--fg))]'
                      }`}>
                        {chatbot.name}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[rgb(var(--fg))] text-xs uppercase font-semibold px-2 mb-2 flex items-center gap-1">
            <Bookmark className="w-3 h-3" />
            Saved Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ul className="space-y-1">
              {savedChats.length === 0 ? (
                <p className="text-[rgb(var(--fg))] text-sm px-2 py-1">No saved chats yet. Start a conversation and click 'Save Chat'!</p>
              ) : (
                savedChats.map((chat) => (
                  <li key={chat.id} className="flex justify-between items-center group">
                    <Button
                      variant="ghost"
                      onClick={() => onLoadChat(chat)}
                      className="flex-grow justify-start text-left px-2 py-1 rounded hover:bg-[var(--color-sidebar-item-hover)] text-[rgb(var(--fg))]"
                    >
                      <span className="truncate">{chat.title}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteChat(chat.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/20 p-1 h-auto"
                      aria-label={`Delete ${chat.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))
              )}
            </ul>
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
                    <div className={`w-3 h-3 ${getChatbotIcon(chatbot.id).color} rounded-full flex items-center justify-center`} aria-hidden="true">
                      <div className="w-2 h-2 text-[rgb(var(--fg))]" >
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
        <div className="flex gap-2 justify-center">
          {(['light', 'dark', 'oled'] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-3 py-1 rounded text-sm capitalize border
                ${theme === t
                  ? 'bg-blue-500 text-[rgb(var(--fg))] border-blue-500'
                  : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--card))]'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <SidebarMenuButton 
            onClick={onOpenApiConfig}
            className="flex-grow justify-start text-left px-2 py-2 rounded hover:bg-blue-700 text-[rgb(var(--fg))]"
          >
            <Settings className="w-4 h-4 mr-3" aria-hidden="true" />
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
