import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/message'; // Import Message type

// 1. Define Types/Interfaces (Suggestion interface can remain the same)
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
    channelId: string | undefined,
    modelShapeName: string | undefined
  ) => Promise<void>;
}

// 2. Create the Hook `useSuggestedResponses`
export function useSuggestedResponses(): UseSuggestedResponsesReturn {
  const { user: currentUser, displayName: currentUserDisplayName } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSuggestions = useCallback(async (
    chatHistory: Message[],
    channelId: string | undefined,
    modelShapeName: string | undefined
  ) => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]); 

    const apiKey = import.meta.env.VITE_SHAPESINC_API_KEY;

    console.log('[useSuggestedResponses] Checking apiKey:', apiKey);
    if (!apiKey) {
      setError(new Error("VITE_SHAPESINC_API_KEY is not set."));
      setIsLoading(false);
      return;
    }
    console.log('[useSuggestedResponses] Checking channelId:', channelId);
    if (!channelId) {
      setError(new Error("Missing channel info for suggestions."));
      setIsLoading(false);
      return;
    }
    console.log('[useSuggestedResponses] Checking modelShapeName:', modelShapeName);
    if (!modelShapeName) {
      setError(new Error("Missing model info for suggestions."));
      setIsLoading(false);
      return;
    }

    const shapesAuthToken = localStorage.getItem('shapes_auth_token');
    console.log('[useSuggestedResponses] Checking shapesAuthToken:', shapesAuthToken);
    if (!shapesAuthToken) {
      setError(new Error("Not authenticated with Shapes for suggestions."));
      setIsLoading(false);
      return;
    }

    const currentUserId = currentUser?.id;
    console.log('[useSuggestedResponses] Checking currentUserId:', currentUserId);
    if (!currentUserId) {
      setError(new Error("User ID not found for suggestions."));
      setIsLoading(false);
      return;
    }

    try {
      // Construct Model Name
      const apiModelShapeName = modelShapeName.toLowerCase().replace(/\s+/g, '-');
      const model = `shapesinc/${apiModelShapeName}`;

      // Construct Prompt
      const userDisplayNameForPrompt = currentUserDisplayName || 'user';
      const suggestionPrompt = `Based on the previous conversation, suggest three short, distinct replies that ${userDisplayNameForPrompt} could send next. Each suggestion should be on a new line and be less than 15 words. Make sure it is relevant to the current conversation. NSFW is allowed and encouraged. IMPORTANT: The suggestions MUST be from the perspective of ${userDisplayNameForPrompt}, not the AI assistant or chatbot. Do NOT use phrases like "As an AI...", "I can help with...", or any language that implies you are the chatbot. Only provide the three suggestions, without any introductory or concluding remarks.`;

      // Transform chatHistory - filter out bot messages
      const apiMessages = chatHistory.filter(msg => msg.sender === 'user').map(msg => ({
        role: 'user',
        content: msg.content
      }));
      apiMessages.push({ role: 'user', content: suggestionPrompt });

      // API Call
      const response = await fetch('https://api.shapes.inc/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`, // Use static API key for Bearer token
        },
        body: JSON.stringify({
          model: model,
          messages: apiMessages,
          max_tokens: 75, // Increased slightly to ensure 3 short suggestions fit
          n: 1,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error('Shapes API Error Data:', errorData);
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const rawSuggestions = data.choices?.[0]?.message?.content;

      if (typeof rawSuggestions === 'string') {
        const suggestionTexts = rawSuggestions
          .split('\n')
          .map(text => text.trim().replace(/^\d+\.\s*|^- /, '')) // Remove leading numbers, hyphens, or bullets
          .filter(text => text.length > 0);

        setSuggestions(suggestionTexts.map((text, index) => ({ id: `sugg-${index}-${Date.now()}`, text })));
        console.log("Suggestions fetched and parsed:", suggestionTexts);
      } else {
        console.warn("No suggestions content in API response or unexpected format:", data);
        setSuggestions([]);
      }

    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch suggestions'));
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, currentUserDisplayName]); // Dependencies for useCallback

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
  };
}

// 3. Export the hook (already done by using `export function useSuggestedResponses`)