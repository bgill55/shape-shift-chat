import { useState, useCallback } from 'react'; // Added useCallback
import { Message } from '@/types/message';
import { Chatbot } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Wrapped with useCallback. Assuming `toast` is stable.
  // localStorage access is a side effect within the function, not a dependency from props or state.
  const performApiCall = useCallback(async (apiKey: string, selectedChatbot: Chatbot, messageContent: any) => {
    setIsLoading(true);
    try {
      const shapeUsername = selectedChatbot.url.split('/').pop() || selectedChatbot.name.toLowerCase().replace(/\s+/g, '-');
      
      // Get auth token and app_id for authenticated requests
      const shapesAuthToken = localStorage.getItem('shapes_auth_token');
      const shapesAppId = localStorage.getItem('shapes_app_id');
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authentication headers
      if (shapesAuthToken && shapesAppId) {
        headers['X-App-ID'] = shapesAppId;
        headers['X-User-Auth'] = shapesAuthToken;
      } else {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      // Add special Shapes headers for context management
      const userId = localStorage.getItem('shapes_user_id') || `user-${Date.now()}`;
      if (!localStorage.getItem('shapes_user_id')) {
        localStorage.setItem('shapes_user_id', userId);
      }
      headers['X-User-Id'] = userId; // Use consistent user ID
      headers['X-Channel-Id'] = `channel-${selectedChatbot.id}`; // Use chatbot ID as channel ID
      
      const response = await fetch('https://api.shapes.inc/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: `shapesinc/${shapeUsername}`,
          messages: [{ role: "user", content: messageContent }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const botMessage: Message = {
        id: (Date.now() + Math.random()).toString(),
        content: data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.",
        sender: 'bot',
        timestamp: new Date(),
        botName: selectedChatbot.name // Store which bot sent this message
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling Shapes API:', error);
      const errorMessageContent = error instanceof Error ? error.message : "Sorry, I encountered an error while processing your message.";
      const errorBotMessage: Message = {
        id: (Date.now() + Math.random()).toString(),
        content: `Error from ${selectedChatbot.name}: ${errorMessageContent}. Please check your API key and try again.`,
        sender: 'bot',
        timestamp: new Date(),
        botName: selectedChatbot.name
      };
      setMessages(prev => [...prev, errorBotMessage]);
      toast({
        title: "API Error",
        description: `${selectedChatbot.name}: ${errorMessageContent}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // `setMessages` and `setIsLoading` are stable

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []); // `setMessages` is stable

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    ));
  }, []); // `setMessages` is stable

  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, content: newContent } : msg
    ));
    toast({
      title: "Message Updated",
      description: "Message has been successfully updated.",
    });
  }, [toast]); // `setMessages` and `toast` (assumed stable)

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast({
      title: "Message Deleted",
      description: "Message has been removed from the chat.",
    });
  }, [toast]); // `setMessages` and `toast` (assumed stable)

  // regenerateMessage depends on `messages` state and `performApiCall` (which is now memoized)
  const regenerateMessage = useCallback(async (messageId: string, apiKey: string, selectedChatbot: Chatbot) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const userMessages = messages.slice(0, messageIndex).filter(msg => msg.sender === 'user');
    if (userMessages.length === 0) return;

    const lastUserMessage = userMessages[userMessages.length - 1];
    
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    await performApiCall(apiKey, selectedChatbot, lastUserMessage.content);
    
    toast({
      title: "Message Regenerated",
      description: "A new response has been generated.",
    });
  }, [messages, performApiCall, toast]); // `setMessages` is stable

  const loadMessages = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
  }, []); // `setMessages` is stable

  const clearMessages = useCallback(() => {
    console.log('[useMessages] clearMessages CALLED. Stack:', new Error().stack);
    setMessages([]);
  }, []); // `setMessages` is stable

  return {
    messages,
    isLoading,
    addMessage,
    updateMessage,
    performApiCall,
    editMessage,
    deleteMessage,
    regenerateMessage,
    loadMessages,
    clearMessages,
  };
}
