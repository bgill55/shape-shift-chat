import { useState, useCallback } from 'react';
import { Message } from '@/types/message';
import { Chatbot } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';
import { getUniqueMentionedChatbots, parseMentions } from '@/utils/mentionUtils';
import { supabase } from '@/integrations/supabase/client';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    ));
  }, []);

  type ApiMessageContent = string | Array<{ type: string; text?: string; image_url?: { url: string; }; }>;

  const performApiCall = useCallback(async (apiKey: string, selectedChatbot: Chatbot, messageContent: ApiMessageContent, currentChatHistory: Message[]) => {
    setIsLoading(true);
    try {
      const shapeUsername = selectedChatbot.url.split('/').pop() || selectedChatbot.name.toLowerCase().replace(/\s+/g, '-');
      
      const shapesAuthToken = localStorage.getItem('shapes_auth_token');
      const shapesAppId = localStorage.getItem('shapes_app_id');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (shapesAuthToken && shapesAppId) {
        headers['X-App-ID'] = shapesAppId;
        headers['X-User-Auth'] = shapesAuthToken;
      } else {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const messagesForApi = [
        { role: "system", content: `You are a helpful assistant. Respond to the user's message in a conversational manner. Keep your response concise and relevant.` },
        ...currentChatHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      ];

      if (typeof messageContent === 'string') {
        messagesForApi.push({ role: "user", content: messageContent });
      } else if (Array.isArray(messageContent)) {
        messagesForApi.push({ role: "user", content: messageContent });
      }

      const response = await fetch('https://api.shapes.inc/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: `shapesinc/${shapeUsername}`,
          messages: messagesForApi,
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
        botName: selectedChatbot.name,
        chatbotId: selectedChatbot.id // Add chatbotId here
      };
      setMessages(prev => [...prev, botMessage]);
      return botMessage;
    } catch (error) {
      console.error('Error calling Shapes API:', error);
      const errorMessageContent = error instanceof Error ? error.message : "Sorry, I encountered an error while processing your message.";
      const errorBotMessage: Message = {
        id: (Date.now() + Math.random()).toString(),
        content: `Error from ${selectedChatbot.name}: ${errorMessageContent}. Please check your API key and try again.`,
        sender: 'bot',
        timestamp: new Date(),
        botName: selectedChatbot.name,
        chatbotId: selectedChatbot.id // Add chatbotId here
      };
      setMessages(prev => [...prev, errorBotMessage]);
      toast({
        title: "API Error",
        description: `${selectedChatbot.name}: ${errorMessageContent}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleGroupChatResponse = useCallback(async (
    apiKey: string,
    selectedChatbots: Chatbot[],
    userMessage: Message,
    imageFile: File | null,
    textInput: string,
    chatHistory: Message[]
  ) => {
    let currentChatHistory = [...chatHistory];
    const maxTurns = 3;
    let turn = 0;
    let lastBotMessage: Message | null = null;

    const initialMentions = parseMentions(userMessage.content, selectedChatbots);
    const initialMentionedChatbots = getUniqueMentionedChatbots(initialMentions);

    let botsToInitiateConversation: Chatbot[] = [];

    if (initialMentionedChatbots.length > 0) {
      botsToInitiateConversation = initialMentionedChatbots;
    } else {
      botsToInitiateConversation = selectedChatbots;
    }

    for (const chatbot of botsToInitiateConversation) {
      let apiMessageContent: string | { type: string; text?: string; image_url?: { url: string; }; }[] = textInput;
      if (imageFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64DataUri = e.target?.result as string;
          if (!base64DataUri) {
            updateMessage(userMessage.id, {
              content: `${userMessage.content} [Image send failed (read error)]`
            });
            return;
          }
          apiMessageContent = [];
          if (textInput.trim()) {
            apiMessageContent.push({ type: "text", text: textInput.trim() });
          }
          apiMessageContent.push({ type: "image_url", image_url: { url: base64DataUri } });
          
          const botResponse = await performApiCall(apiKey, chatbot, apiMessageContent, currentChatHistory);
          if (botResponse) {
            currentChatHistory = [...currentChatHistory, botResponse];
            lastBotMessage = botResponse;
          }
        };
        reader.onerror = () => {
          toast({
            title: "File Read Error",
            description: "Could not read the selected image file.",
            variant: "destructive"
          });
        };
        reader.readAsDataURL(imageFile);
      } else {
        const botResponse = await performApiCall(apiKey, chatbot, apiMessageContent, currentChatHistory);
        if (botResponse) {
          currentChatHistory = [...currentChatHistory, botResponse];
          lastBotMessage = botResponse;
        }
      }
    }

    while (lastBotMessage && turn < maxTurns) {
      turn++;
      const mentions = parseMentions(lastBotMessage.content, selectedChatbots);
      const mentionedChatbots = getUniqueMentionedChatbots(mentions);

      if (mentionedChatbots.length === 0) {
        const lastBotIndex = selectedChatbots.findIndex(bot => bot.name === lastBotMessage?.botName);
        const nextBotIndex = (lastBotIndex + 1) % selectedChatbots.length;
        const nextChatbot = selectedChatbots[nextBotIndex];
        
        if (selectedChatbots.length > 1 && nextChatbot.name === lastBotMessage.botName) {
          break;
        }

        const botResponse = await performApiCall(apiKey, nextChatbot, lastBotMessage.content, currentChatHistory);
        if (botResponse) {
          currentChatHistory = [...currentChatHistory, botResponse];
          lastBotMessage = botResponse;
        } else {
          break;
        }
      } else {
        const mentionedChatbot = mentionedChatbots[0];
        const botResponse = await performApiCall(apiKey, mentionedChatbot, lastBotMessage.content, currentChatHistory);
        if (botResponse) {
          currentChatHistory = [...currentChatHistory, botResponse];
          lastBotMessage = botResponse;
        } else {
          break;
        }
      }
    }
  }, [performApiCall, updateMessage, toast]);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, content: newContent } : msg
    ));
    toast({
      title: "Message Updated",
      description: "Message has been successfully updated.",
    });
  }, [toast]);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast({
      title: "Message Deleted",
      description: "Message has been removed from the chat.",
    });
  }, [toast]);

  const regenerateMessage = useCallback(async (messageId: string, apiKey: string, selectedChatbot: Chatbot) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const userMessages = messages.slice(0, messageIndex).filter(msg => msg.sender === 'user');
    if (userMessages.length === 0) return;

    const lastUserMessage = userMessages[userMessages.length - 1];
    
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    await performApiCall(apiKey, selectedChatbot, lastUserMessage.content, messages);
    
    toast({
      title: "Message Regenerated",
      description: "A new response has been generated.",
    });
  }, [messages, performApiCall, toast]);

  const loadMessages = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

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
    handleGroupChatResponse,
  };
}
