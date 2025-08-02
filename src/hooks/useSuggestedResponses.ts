import { useState, useCallback } from 'react';
import { Chatbot } from '@/pages/Index';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/message';
import { supabase } from '@/integrations/supabase/client';

export interface Suggestion {
  id: string;
  text: string;
}

export interface UseSuggestedResponsesReturn {
  suggestions: Suggestion[];
  isLoading: boolean;
  error: Error | null;
  fetchSuggestions: (
    chatHistory: Message[],
    selectedChatbot: Chatbot | undefined
  ) => Promise<void>;
}

export function useSuggestedResponses(): UseSuggestedResponsesReturn {
  const { user: currentUser, displayName: currentUserDisplayName } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSuggestions = useCallback(async (
    chatHistory: Message[],
    selectedChatbot: Chatbot | undefined
  ) => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      if (!selectedChatbot) {
        setError(new Error("No chatbot selected for suggestions."));
        setIsLoading(false);
        return;
      }

      const MAX_CHAT_HISTORY_PAYLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
      const limitedChatHistory: Message[] = [];
      let currentPayloadSize = 0;

      // Iterate from the end of the chat history to get the most recent messages
      for (let i = chatHistory.length - 1; i >= 0; i--) {
        const message = chatHistory[i];
        // Estimate size of the message when stringified
        const messageSize = JSON.stringify(message).length;

        if (currentPayloadSize + messageSize < MAX_CHAT_HISTORY_PAYLOAD_BYTES) {
          limitedChatHistory.unshift(message); // Add to the beginning to maintain chronological order
          currentPayloadSize += messageSize;
        } else {
          break; // Stop if adding this message would exceed the limit
        }
      }

      console.log('[useSuggestedResponses] currentUserDisplayName before Supabase invoke:', currentUserDisplayName);
      const { data, error: functionError } = await supabase.functions.invoke('get-suggestions', {
        body: { chatHistory: limitedChatHistory, selectedChatbot, currentUserDisplayName },
      });

      console.log('[useSuggestedResponses] Raw data from Supabase function:', data);

      if (functionError) {
        throw functionError;
      }

      const { rawSuggestions } = data;
      console.log('[useSuggestedResponses] rawSuggestions:', rawSuggestions, 'Type:', typeof rawSuggestions);

      if (typeof rawSuggestions === 'string') {
        const suggestionTexts = rawSuggestions
          .split('\n')
          .map(text => text.trim().replace(/^\d+\.\s*|^- /, ''))
          .filter(text => text.length > 0);
        
        setSuggestions(suggestionTexts.map((text, index) => ({ id: `sugg-${index}-${Date.now()}`, text })));
      } else if (Array.isArray(rawSuggestions)) {
        // Fallback for cases where it might already be an array
        const suggestionTexts = rawSuggestions
          .map(text => text.trim().replace(/^\d+\.\s*|^- /, ''))
          .filter(text => text.length > 0);

        setSuggestions(suggestionTexts.map((text, index) => ({ id: `sugg-${index}-${Date.now()}`, text })));
      } else {
        setSuggestions([]);
      }

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch suggestions'));
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, currentUserDisplayName]);

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
  };
}