import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. Handle Browser Security (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Get the Question
    const { question } = await req.json();
    
    // 3. Get the Key
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY in Supabase Secrets");
    }

    // 4. The Prompt
    const systemPrompt = `
      You are the AI Concierge at Hotel Sunrise.
      - Polite, brief, and helpful.
      - We have a Pool, Spa, and 24/7 Dining.
      - Room types: Garden Twin, Deluxe King, Family Studio.
      - If you don't know the answer, ask them to email support@sunrise.com.
      User Question: ${question}
    `;

    // 5. Ask Google (UPDATED MODEL NAME HERE)
    // We switched to 'gemini-1.5-flash-latest' to fix the "Not Found" error
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await response.json();
    
    // Check for Google Errors
    if (data.error) {
      console.error("Google API Error:", data.error); // Log the exact error to Supabase
      throw new Error(data.error.message);
    }
    
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "I am thinking...";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ answer: "I am having trouble connecting. Please try again." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});