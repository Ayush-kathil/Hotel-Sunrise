import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. Handle CORS (Browser Security)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Get Data
    const { question } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error("Server Error: Gemini API Key is missing.");
    }

    // 3. Define the Hotel Persona
    const systemPrompt = `
      You are the AI Concierge for Hotel Sunrise in Udaipur.
      - Tone: Luxury, professional, helpful, brief.
      - Rooms: Garden Twin, Deluxe King, Family Studio, Executive Suite, Royal Sunrise.
      - Amenities: Infinity Pool, Spa, 24/7 Butler.
      - Policies: Check-in 2PM, Check-out 11AM. No pets allowed.
      - If you don't know, ask them to call +91 987 654 3210.
      USER QUESTION: "${question}"
    `;

    // 4. Call Google API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await response.json();

    // 5. Handle Google Errors
    if (!response.ok) {
      console.error("Gemini Error:", data);
      throw new Error(data.error?.message || "AI Service Unavailable");
    }

    const answer = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ answer: "I apologize, I am having trouble connecting to the network. Please call the front desk." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});