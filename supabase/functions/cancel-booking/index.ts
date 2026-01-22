import { serve } from "std/http/server.ts";
import nodemailer from "nodemailer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, name, booking_id, room_name, refund_amount } = await req.json();

    // 1. Setup Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: Deno.env.get('SMTP_EMAIL'),
        pass: Deno.env.get('SMTP_PASSWORD'),
      },
    });

    const adminEmail = "kathilshiva@gmail.com";

    // 2. Email to Guest
    await transporter.sendMail({
      from: '"Hotel Sunrise" <kathilshiva@gmail.com>',
      to: email, // Guest Email
      subject: `Booking Cancelled: #${booking_id.slice(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000;">Cancellation Confirmed</h1>
          <p>Dear ${name},</p>
          <p>Your booking for <strong>${room_name}</strong> has been successfully cancelled.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Hotel Sunrise, Udaipur, India.</p>
        </div>
      `,
    });

    // 3. Email to Admin
    await transporter.sendMail({
      from: '"Sunrise Bot" <kathilshiva@gmail.com>',
      to: adminEmail, // Admin Email
      subject: `[ALERT] Booking Cancelled: ${room_name}`,
      html: `
        <h2>Cancellation Alert</h2>
        <p><strong>Guest:</strong> ${name}</p>
        <p><strong>Room:</strong> ${room_name}</p>
        <p><strong>Booking ID:</strong> ${booking_id}</p>
        <p><strong>Refund Amount:</strong> ₹${refund_amount}</p>
        <p style="color: red;">Please ensure refund is processed.</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Cancel Email Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});