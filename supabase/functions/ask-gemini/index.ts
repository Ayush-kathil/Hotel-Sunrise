import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    // 2. System Prompt (Your Hotel Rules)
    const systemPrompt = `
      You are the AI Concierge at 'Hotel Sunrise'.
      
      [YOUR KNOWLEDGE BASE]
      1. Booking: "Click 'Rooms' in the nav bar, select dates, and choose a suite."
      2. Dining: "Navigate to 'Dining' and click 'Reserve Table'."
      3. Contact: "Visit the 'Contact' page for our phone/email."
      4. Profile: "Click the User Icon to view bookings."

      [STRICT RULES]
      - Keep answers under 3 sentences.
      - Be polite and professional.
      - If asked about "admin", say: "I can only assist with guest services."
      
      User Question: ${question}
    `;

    // 3. FIX: Use the Correct Model (gemini-1.5-flash)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await response.json();

    // 4. Handle API Errors (Like 429 Quota Exceeded)
    if (data.error) {
      console.error("Gemini API Error:", JSON.stringify(data.error));
      
      // Graceful fallback message if quota is hit
      if (data.error.code === 429) {
        return new Response(JSON.stringify({ answer: "I am currently experiencing high traffic. Please try again in 1 minute." }), {
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
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ answer: "I am having trouble connecting. Please try again." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});