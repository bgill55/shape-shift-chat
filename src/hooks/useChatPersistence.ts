import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/message';
import { Chatbot } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface SavedChat {
  id: string;
  chatbot_id: string;
  chatbot_name: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useChatPersistence() {
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Define memoized functions first

  const loadSavedChats = useCallback(async (): Promise<SavedChat[]> => {
    if (!user) {
      setSavedChats([]); // Clear state if no user
      setCurrentChatId(null);
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSavedChats(data || []);
      return data || []; // Return fetched data
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: "Error Loading Chats",
        description: "Could not load saved chats from database.",
        variant: "destructive"
      });
      return []; // Return empty array on error
    }
  }, [user, toast, setSavedChats, setCurrentChatId]); // Added setSavedChats, setCurrentChatId as they are used in the !user path

  const saveChat = useCallback(async (chatbot: Chatbot, messages: Message[], title?: string, showToast: boolean = true) => {
    if (messages.length === 0 || !user) return null;

    setIsLoading(true);
    try {
      // Generate a title from the first user message if not provided
      const chatTitle = title || messages.find(m => m.sender === 'user')?.content.slice(0, 50) + '...' || 'New Chat';
      
      let chatId = currentChatId;

      // Create or update chat
      if (!chatId) {
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .insert({
            chatbot_id: chatbot.id,
            chatbot_name: chatbot.name,
            title: chatTitle,
            user_id: user.id
          })
          .select()
          .single();

        if (chatError) throw chatError;
        chatId = chatData.id;
        setCurrentChatId(chatId);
      } else {
        const { error: updateError } = await supabase
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId);

        if (updateError) throw updateError;
      }

      // Clear existing messages for this chat
      await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId);

      // Insert all messages
      const messagesToInsert = messages.map(msg => ({
        chat_id: chatId!,
        content: msg.content,
        sender: msg.sender,
        image_url: msg.imageUrl || null
      }));

      const { error: messagesError } = await supabase
        .from('messages')
        .insert(messagesToInsert);

      if (messagesError) throw messagesError;

      await loadSavedChats();
      
      // Only show toast for manual saves
      if (showToast) {
        toast({
          title: "Chat Saved",
          description: "Your conversation has been saved successfully.",
        });
      }

      return chatId;
    } catch (error) {
      console.error('Error saving chat:', error);
      // Always show error toasts
      toast({
        title: "Save Error",
        description: "Could not save chat to database.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, currentChatId, toast, loadSavedChats]); // setIsLoading, setCurrentChatId are stable

  const loadChat = useCallback(async (chatId: string): Promise<Message[]> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender as 'user' | 'bot',
        timestamp: new Date(msg.created_at),
        imageUrl: msg.image_url || undefined
      }));
    } catch (error) {
      console.error('Error loading chat:', error);
      toast({
        title: "Load Error",
        description: "Could not load chat from database.",
        variant: "destructive"
      });
      return [];
    }
  }, [toast]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      // Delete messages first
      await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId);

      // Then delete the chat
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      await loadSavedChats();
      
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }

      toast({
        title: "Chat Deleted",
        description: "Chat has been removed from your saved chats.",
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Delete Error",
        description: "Could not delete chat from database.",
        variant: "destructive"
      });
    }
  }, [currentChatId, toast, loadSavedChats, setCurrentChatId]); // Added setCurrentChatId

  const startNewChat = useCallback(() => {
    setCurrentChatId(null);
  }, [setCurrentChatId]); // Added setCurrentChatId

  const autoSaveChat = useCallback(async (chatbot: Chatbot, messages: Message[]) => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'bot') {
      await saveChat(chatbot, messages, undefined, false);
    }
  }, [saveChat]);

  // useEffect hooks AFTER function definitions
  // Load saved chats on mount and when user changes
  useEffect(() => {
    if (user) {
      loadSavedChats(); // Now this is safe, loadSavedChats is defined above
    } else {
      // If user becomes null (logout), clear local state.
      // loadSavedChats will also do this if called when user is null, but this is more direct for logout.
      setSavedChats([]);
      setCurrentChatId(null);
    }
  }, [user, loadSavedChats]); // loadSavedChats is stable due to useCallback

  return {
    savedChats,
    currentChatId,
    isLoading,
    saveChat,
    loadChat,
    deleteChat,
    startNewChat,
    loadSavedChats,
    setCurrentChatId,
    autoSaveChat
  };
}
