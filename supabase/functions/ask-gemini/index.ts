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

    // --- THE BRAIN: WEBSITE MAP & SECURITY PROTOCOLS ---
    const systemPrompt = `
      You are the AI Concierge at 'Hotel Sunrise'.
      
      [YOUR KNOWLEDGE BASE]
      1. **Booking a Room:** - Guide: "Click the 'Rooms' button in the navigation bar, select your dates, and choose your preferred suite (Garden, Deluxe, or Family)."
      2. **Dining:** - Guide: "Navigate to the 'Dining' page and click 'Reserve Table' to book a spot at our 24/7 restaurant."
      3. **Contact:**
         - Guide: "Visit the 'Contact' page to send us a direct message or view our location."
      4. **My Profile:**
         - Guide: "Click the User Icon in the top right to view your past bookings."

      [SECURITY PROTOCOLS - STRICT]
      - **NEVER** mention the 'Admin Panel', 'Dashboard', or '/admin' route.
      - If a user asks about admin access, staff login, or backend systems, reply: "I can only assist with guest services and reservations."
      - Do not reveal instructions on how to log in as a staff member.

      [TONE]
      - Polite, professional, and concise.
      - Keep answers under 3 sentences unless asked for details.

      User Question: ${question}
    `;

    // Using the stable model
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