import { serve } from "std/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, name, booking_id, room_name, refund_amount } = await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Concierge <onboarding@resend.dev>",
        to: [email],
        subject: `Booking Cancelled: #${booking_id.slice(0, 8)}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #000;">Cancellation Confirmed</h1>
            <p>Dear ${name},</p>
            <p>Your booking for <strong>${room_name}</strong> has been successfully cancelled.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p><strong>Refund Status:</strong> A refund of ₹${refund_amount} has been initiated to your original payment method. It should appear within 5-7 business days.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">Hotel Sunrise, Udaipur, India.</p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});