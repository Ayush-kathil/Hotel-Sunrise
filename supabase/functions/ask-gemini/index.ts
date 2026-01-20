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

    // SYSTEM PROMPT: STRICT HOTEL SUNRISE PERSONA
    const systemPrompt = `
      You are the AI Concierge for 'Hotel Sunrise', a luxury hotel in Orai, India.
      
      [YOUR MISSION]
      Assist guests with room bookings, dining reservations, and hotel information ONLY.
      
      [STRICT RULES - IMPORTANT]
      1. **DO NOT** answer general knowledge questions (e.g., "Who is the president?", "Solve this math problem").
      2. If a user asks a non-hotel question, politely refuse: "I am designed to assist only with Hotel Sunrise services."
      3. Never break character. You are hotel staff.
      
      [YOUR KNOWLEDGE]
      - **Booking Rooms:** "Click 'Rooms' in the navigation bar to see our Garden, Deluxe, and Family suites."
      - **Dining:** "Visit our 'Dining' page to reserve a table at The Golden Spoon."
      - **Contact:** "Our support team is available on the 'Contact' page."
      - **Location:** "We are located near Kalpi Stand, Orai."

      [TONE]
      Professional, warm, luxury, and concise (max 3 sentences).

      User Question: "${question}"
    `;

    // USE STABLE MODEL (gemini-1.5-flash) to avoid Rate Limits
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Gemini Error:", data.error);
      // Handle Rate Limit Gracefully
      if (data.error.code === 429) {
         return new Response(JSON.stringify({ answer: "The concierge desk is currently very busy. Please try again in 1 minute." }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
         });
      }
      throw new Error(data.error.message);
    }
    
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "I am thinking...";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ answer: "I am having trouble connecting to the hotel network. Please try again." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});