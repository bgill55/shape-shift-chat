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
    setSuggestions([]); // Clear previous suggestions

    // Access Environment Variable for Static API Key
    const apiKey = import.meta.env.VITE_SHAPESINC_API_KEY;

    // Early Exit checks
    if (!apiKey) {
      setError(new Error("VITE_SHAPESINC_API_KEY is not set."));
      setIsLoading(false);
      return;
    }
    if (!channelId) {
      setError(new Error("Missing channel info for suggestions."));
      setIsLoading(false);
      return;
    }
    if (!modelShapeName) {
      setError(new Error("Missing model info for suggestions."));
      setIsLoading(false);
      return;
    }

    const shapesAuthToken = localStorage.getItem('shapes_auth_token');
    if (!shapesAuthToken) {
      setError(new Error("Not authenticated with Shapes for suggestions."));
      setIsLoading(false);
      return;
    }

    const currentUserId = currentUser?.id;
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
      const userDisplayNameForPrompt = currentUserDisplayName || 'me';
      const suggestionPrompt = `Based on the conversation so far, act like ${userDisplayNameForPrompt} suggest three short, distinct replies I could send next, each on a new line, and each suggestion should be less than 15 words.`;

      // Transform chatHistory
      const apiMessages = chatHistory.map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.content
      }));
      apiMessages.push({ role: 'user', content: suggestionPrompt });

      console.log("Fetching suggestions with model:", model, "and prompt for user:", userDisplayNameForPrompt);
      console.log("API Messages being sent:", JSON.stringify(apiMessages, null, 2));


      // API Call
      const response = await fetch('https://api.shapes.inc/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`, // Use static API key for Bearer token
          'X-User-Id': currentUserId,
          'X-Channel-Id': channelId,
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
          .map(text => text.trim().replace(/^- /, '')) // Remove leading hyphens/bullets if any
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
