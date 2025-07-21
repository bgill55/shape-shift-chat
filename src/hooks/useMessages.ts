import { useState, useCallback } from 'react';
import { Message } from '@/types/message';
import { Chatbot } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';
import { getUniqueMentionedChatbots, parseMentions } from '@/utils/mentionUtils';

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

  const performApiCall = useCallback(async (apiKey: string, selectedChatbot: Chatbot, messageContent: any, currentChatHistory: Message[]) => {
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
      
      const messagesForApi = currentChatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

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
        botName: selectedChatbot.name 
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
        botName: selectedChatbot.name
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
    console.log("handleGroupChatResponse called");
    let currentChatHistory = [...chatHistory];
    const maxTurns = 3;
    let turn = 0;
    let lastBotMessage: Message | null = null;

    // Determine initial recipient(s) based on user message
    const initialMentions = parseMentions(userMessage.content, selectedChatbots);
    const initialMentionedChatbots = getUniqueMentionedChatbots(initialMentions);

    let botsToInitiateConversation: Chatbot[] = [];

    if (initialMentionedChatbots.length > 0) {
      // If user mentioned specific bots, only those bots initiate
      botsToInitiateConversation = initialMentionedChatbots;
    } else {
      // If no specific bots mentioned, all selected bots initiate
      botsToInitiateConversation = selectedChatbots;
    }

    // Initial response from determined recipient(s)
    for (const chatbot of botsToInitiateConversation) {
      console.log(`Processing initial response for ${chatbot.name}`);
      let apiMessageContent: any = textInput;
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
        reader.onerror = (error) => {
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

    // Bot-to-bot interaction loop
    while (lastBotMessage && turn < maxTurns) {
      turn++;
      console.log(`Turn ${turn}: Last bot message: ${lastBotMessage.content}`);
      const mentions = parseMentions(lastBotMessage.content, selectedChatbots);
      const mentionedChatbots = getUniqueMentionedChatbots(mentions);
      console.log(`Turn ${turn}: Mentioned chatbots:`, mentionedChatbots.map(b => b.name));

      if (mentionedChatbots.length === 0) {
        // If no bots are mentioned, find the next bot in sequence
        const lastBotIndex = selectedChatbots.findIndex(bot => bot.name === lastBotMessage?.botName);
        const nextBotIndex = (lastBotIndex + 1) % selectedChatbots.length;
        const nextChatbot = selectedChatbots[nextBotIndex];
        
        console.log(`Turn ${turn}: No bots mentioned. Next chatbot in sequence: ${nextChatbot.name}`);

        // Ensure the next bot is not the same as the last one if there are multiple bots
        if (selectedChatbots.length > 1 && nextChatbot.name === lastBotMessage.botName) {
          console.log(`Turn ${turn}: Next chatbot is the same as last. Breaking loop.`);
          break; // Prevent a single bot from talking to itself indefinitely in a two-bot chat
        }

        const botResponse = await performApiCall(apiKey, nextChatbot, lastBotMessage.content, currentChatHistory);
        if (botResponse) {
          currentChatHistory = [...currentChatHistory, botResponse];
          lastBotMessage = botResponse;
        } else {
          console.log(`Turn ${turn}: performApiCall failed for ${nextChatbot.name}. Breaking loop.`);
          break;
        }
      } else {
        // If bots are mentioned, only the first mentioned bot responds
        const mentionedChatbot = mentionedChatbots[0];
        console.log(`Turn ${turn}: Bots mentioned. Responding with ${mentionedChatbot.name}`);
        const botResponse = await performApiCall(apiKey, mentionedChatbot, lastBotMessage.content, currentChatHistory);
        if (botResponse) {
          currentChatHistory = [...currentChatHistory, botResponse];
          lastBotMessage = botResponse;
        } else {
          console.log(`Turn ${turn}: performApiCall failed for ${mentionedChatbot.name}. Breaking loop.`);
          break;
        }
      }
    }
    console.log("handleGroupChatResponse finished");
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