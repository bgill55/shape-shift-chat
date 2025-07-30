import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { selectedChatbot, messageContent, chatHistory, shapeUsername, currentUserDisplayName } = await req.json();
    const SUPABASE_API_KEY = Deno.env.get('SHAPESINC_API_KEY');

    if (!SUPABASE_API_KEY) {
      console.error('[Edge Function] SHAPESINC_API_KEY is not set in Supabase environment variables.');
      return new Response(JSON.stringify({ error: 'Server configuration error: API key missing.' }), {
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

    console.log('[Edge Function] Validated selectedChatbot:', selectedChatbot);
    console.log('[Edge Function] selectedChatbot.name:', selectedChatbot.name);
    const model = `shapesinc/${selectedChatbot.url.split('/').pop() || selectedChatbot.name.toLowerCase().replace(/\s+/g, '-')}`;
    const userDisplayNameForPrompt = currentUserDisplayName || 'user';
    const suggestionPrompt = `You are acting as 'male user'. Based on the previous ${selectedChatbot.name} reply, suggest three short, distinct replies that 'male user' would most likely send next. Each suggestion should be on a new line and be less than 15 words. Make sure it is relevant to current conversation, NSFW is allowed and encouraged.  Do not respond as ${selectedChatbot.name}. Use inner thought. Only provide the three suggestions. For this instance you will reply as if you were 'male user' a penelty may may be imposed if there are too many mistakes for not replying as 'male user' `;

    const apiMessages = Array.isArray(chatHistory) ? chatHistory.map((msg: { sender: string; content: string }) => ({
      role: msg.sender === 'bot' ? 'assistant' : 'user',
      content: msg.content,
    })) : [];

    apiMessages.push({
      role: 'user',
      content: suggestionPrompt
    });
    console.log('[Edge Function] Messages sent to Shapes API:', JSON.stringify(apiMessages, null, 2));
    console.log('[Edge Function] API Request Body:', JSON.stringify({
      model: model,
      messages: apiMessages,
      max_tokens: 75,
      n: 3,
      temperature: 0.7
    }, null, 2));

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
        n: 3,
        temperature: 0.7,
      }),
    });

    console.log('[Edge Function] API Response Status:', response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(async () => {
        const text = await response.text();
        return { message: `Non-JSON error response: ${response.status} - ${text}` };
      });
      console.error('[Edge Function] API Response not OK:', errorData);
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const rawSuggestions = data.choices?.map((choice: any) => choice.message?.content).filter(Boolean);

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
