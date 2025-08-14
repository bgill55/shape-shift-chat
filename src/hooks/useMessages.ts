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

  const performApiCall = useCallback(async (apiKey: string, selectedChatbot: Chatbot, messageContent: string, currentChatHistory: Message[], imageFile: File | null = null) => {
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
      
      let messagesForApi: any[] = [
        { role: "system", content: `You are a helpful assistant. Respond to the user's message in a conversational manner. Keep your response concise and relevant. Do not simply echo the user's input; generate a new and distinct reply.` },
        ...currentChatHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      ];

      if (imageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        await new Promise<void>((resolve, reject) => {
          reader.onload = () => {
            const base64DataUri = reader.result as string;
            const userMessageContent: any[] = [];
            if (messageContent) {
              userMessageContent.push({ type: "text", text: messageContent });
            }
            userMessageContent.push({ type: "image_url", image_url: { url: base64DataUri } });
            messagesForApi.push({ role: "user", content: userMessageContent });
            resolve();
          };
          reader.onerror = (error) => {
            console.error("Error reading image file:", error);
            toast({
              title: "Image Upload Error",
              description: "Failed to read the selected image file.",
              variant: "destructive"
            });
            reject(error);
          };
        });
      } else {
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
      const botMessageContent = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
      
      let cleanedContent = botMessageContent;
      const debugMarker1 = '\n\n*Debug Information*';
      const debugMarker2 = '* - ID:';
      let debugIndex = cleanedContent.indexOf(debugMarker1);
      if (debugIndex === -1) {
        debugIndex = cleanedContent.indexOf(debugMarker2);
      }

      if (debugIndex !== -1) {
        cleanedContent = cleanedContent.substring(0, debugIndex).trim();
      }

      const botMessage: Message = {
        id: (Date.now() + Math.random()).toString(),
        content: cleanedContent,
        sender: 'bot',
        timestamp: new Date(),
        botName: selectedChatbot.name,
        chatbotId: selectedChatbot.id // Add chatbotId here
      };
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
          
          const botResponse = await performApiCall(apiKey, chatbot, textInput, currentChatHistory, imageFile);
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
        const botResponse = await performApiCall(apiKey, chatbot, textInput, currentChatHistory, null);
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

    const messageToRegenerate = messages[messageIndex];
    if (messageToRegenerate.sender !== 'bot') return; // Only regenerate bot messages

    const userMessageIndex = messages.slice(0, messageIndex).reverse().findIndex(msg => msg.sender === 'user');
    if (userMessageIndex === -1) return; // No preceding user message found

    const lastUserMessage = messages[messageIndex - (userMessageIndex + 1)];
    
    // Remove the bot's message that is being regenerated
    setMessages(prev => prev.filter(msg => msg.id !== messageId));

    // Get chat history up to the user's message
    const chatHistoryForRegeneration = messages.slice(0, messageIndex - userMessageIndex - 1);
    
    const botResponse = await performApiCall(
      apiKey,
      selectedChatbot,
      lastUserMessage.content,
      chatHistoryForRegeneration,
      lastUserMessage.imageUrl ? { name: 'image', type: 'image/png', size: 0 } as File : null
    );

    if (botResponse) {
      setMessages(prev => [...prev, botResponse]);
    }
    
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
