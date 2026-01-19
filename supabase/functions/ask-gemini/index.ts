import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    const systemPrompt = `
      You are the AI Concierge at Hotel Sunrise.
      - Polite, brief, and helpful.
      - We have a Pool, Spa, and 24/7 Dining.
      - Room types: Garden Twin, Deluxe King, Family Studio.
      - If you don't know the answer, ask them to email support@sunrise.com.
      User Question: ${question}
    `;

    // UPDATED: Using 'gemini-2.5-flash' (Stable, Faster, Smart)
    // If you want version 3, use 'gemini-3-flash-preview'
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini API Error:", JSON.stringify(data.error));
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