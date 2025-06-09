
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
    const { code, app_id } = await req.json()

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
    const shapesResponse = await fetch('https://api.shapes.inc/auth/nonce', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        app_id: app_id,
        code: code 
      }),
    })

    if (!shapesResponse.ok) {
      const errorData = await shapesResponse.text()
      console.error('Shapes API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to exchange code with Shapes', details: errorData }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const shapesData = await shapesResponse.json()
    
    // Return the auth token and any user data
    return new Response(
      JSON.stringify({
        auth_token: shapesData.auth_token,
        user: shapesData.user || { id: shapesData.user_id }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

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
