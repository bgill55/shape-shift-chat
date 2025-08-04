import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { selectedChatbot, chatHistory, currentUserDisplayName } = await req.json();
    const SUPABASE_API_KEY = Deno.env.get('SHAPESINC_API_KEY');

    if (!SUPABASE_API_KEY) {
      console.error('[Edge Function] SHAPESINC_API_KEY is not set in Supabase environment variables.');
      return new Response(JSON.stringify({ error: 'Server configuration error: Shapes API key missing.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Robust check for selectedChatbot and its properties
    if (!selectedChatbot || typeof selectedChatbot.url === 'undefined' || typeof selectedChatbot.name === 'undefined') {
      console.error('[Edge Function] Invalid selectedChatbot received:', selectedChatbot);
      return new Response(JSON.stringify({ error: 'Invalid chatbot information provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const model = `shapesinc/${selectedChatbot.url.split('/').pop() || selectedChatbot.name.toLowerCase().replace(/\s+/g, '-')}`;
    const userDisplayNameForPrompt = currentUserDisplayName || 'user';
    const suggestionPrompt = `Based on the previous conversation with ${selectedChatbot.name}, generate three *completely distinct*, *unique*, and *varied* short replies that ${userDisplayNameForPrompt} could send next. Each suggestion must be on a new line, be less than 15 words, and should not repeat any words or phrases from the immediate chat history or from any of the other generated suggestions. Ensure relevance to the conversation. Do not respond as ${selectedChatbot.name}.`;

    const apiMessages = Array.isArray(chatHistory) ? chatHistory.map((msg: { sender: string; content: string }) => ({
      role: msg.sender === 'bot' ? 'assistant' : 'user',
      content: msg.content,
    })) : [];

    apiMessages.push({
      role: 'user',
      content: suggestionPrompt
    });

    const response = await fetch('https://api.shapes.inc/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: apiMessages,
        max_tokens: 75,
        n: 5,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Edge Function] API Response not OK. Status:', response.status, 'Body:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    interface Choice { message?: { content?: string; }; }
    const rawSuggestions = data.choices?.map((choice: Choice) => choice.message?.content).filter(Boolean);

    return new Response(JSON.stringify({ rawSuggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[Edge Function] Error in try-catch block:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
