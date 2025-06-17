
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, app_id } = await req.json();
    console.log('[shapes-auth-exchange] Received code:', code, 'app_id:', app_id);

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'One-time code is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!app_id) {
      return new Response(
        JSON.stringify({ error: 'App ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Exchange the one-time code for a user auth token with Shapes
    // Using the correct endpoint /auth/nonce
    console.log('[shapes-auth-exchange] Attempting to fetch token from Shapes API...');
    const shapesResponse = await fetch('https://api.shapes.inc/auth/nonce', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        app_id: app_id,
        code: code 
      }),
    });

    console.log('[shapes-auth-exchange] Shapes API response status:', shapesResponse.status, shapesResponse.statusText);
    const responseText = await shapesResponse.text();
    console.log('[shapes-auth-exchange] Shapes API raw response text:', responseText);

    if (!shapesResponse.ok) {
      console.error('[shapes-auth-exchange] Shapes API error. Raw response:', responseText);
      return new Response(
        JSON.stringify({ error: 'Failed to exchange code with Shapes', details: responseText }),
        { 
          status: shapesResponse.status, // Use actual status from Shapes API
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let shapesData;
    try {
      shapesData = JSON.parse(responseText);
      console.log('[shapes-auth-exchange] Shapes API parsed JSON response:', shapesData);
    } catch (jsonParseError) {
      console.error('[shapes-auth-exchange] Error parsing Shapes API response as JSON:', jsonParseError.message);
      console.error('[shapes-auth-exchange] Raw response text that failed to parse:', responseText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse response from Shapes API', details: responseText }),
        {
          status: 500, // Internal server error type because we couldn't parse a supposedly OK response
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log specific fields from shapesData
    console.log('[shapes-auth-exchange] shapesData.auth_token:', shapesData?.auth_token);
    console.log('[shapes-auth-exchange] shapesData.user object:', shapesData?.user);
    console.log('[shapes-auth-exchange] shapesData.user_id (if exists directly):', shapesData?.user_id);
    if (shapesData?.user) {
      console.log('[shapes-auth-exchange] shapesData.user.id (from user object):', shapesData.user.id);
    }
    
    // Return the auth token and any user data
    return new Response(
      JSON.stringify({
        auth_token: shapesData.auth_token,
        // Ensure user object is consistent, preferring shapesData.user if it exists
        user: shapesData.user || (shapesData.user_id ? { id: shapesData.user_id } : undefined)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in shapes-auth-exchange:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
