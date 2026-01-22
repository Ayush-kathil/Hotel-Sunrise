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

    // 2. Email to Guest (PREMIUM STYLE)
    await transporter.sendMail({
      from: '"Hotel Sunrise" <kathilshiva@gmail.com>',
      to: email, 
      subject: `Booking Cancelled: #${booking_id.slice(0, 8)}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
          <div style="background: #000; padding: 30px; text-align: center;">
            <h1 style="color: #d4af37; margin: 0; font-family: 'Georgia', serif; letter-spacing: 2px;">SUNRISE</h1>
            <p style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Cancellation Notice</p>
          </div>
          <div style="padding: 40px;">
            <p style="color: #333; font-size: 16px;">Dear ${name},</p>
            <p style="color: #555; line-height: 1.6;">We have processed your cancellation request for <strong>${room_name}</strong>.</p>
            
            <div style="background: #fafafa; border-left: 4px solid #d4af37; padding: 20px; margin: 30px 0;">
               <p style="margin: 5px 0; color: #555;"><strong>Booking ID:</strong> ${booking_id}</p>
               <p style="margin: 5px 0; color: #555;"><strong>Refund Initiated:</strong> ₹${refund_amount}</p>
            </div>

            <p style="color: #555; font-size: 14px;">We hope to welcome you back to Hotel Sunrise in the future.</p>
          </div>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; color: #888; font-size: 11px;">
             &copy; ${new Date().getFullYear()} Hotel Sunrise.
          </div>
        </div>
      `,
    });

    // 3. Email to Admin (SMART DATA STYLE)
    await transporter.sendMail({
      from: '"Sunrise Bot" <kathilshiva@gmail.com>',
      to: adminEmail, 
      subject: `[CANCEL] ${room_name} - ${name}`,
      html: `
        <div style="font-family: monospace; background: #fff1f0; padding: 20px; border: 1px solid #ffa39e; border-radius: 5px;">
           <h2 style="color: #cf1322; margin-top: 0;">🚫 Cancellation Alert</h2>
           <table style="width: 100%; text-align: left; border-collapse: collapse;">
             <tr><td style="padding: 5px; border-bottom: 1px solid #ffccc7;"><strong>Guest:</strong></td><td style="padding: 5px; border-bottom: 1px solid #ffccc7;">${name}</td></tr>
             <tr><td style="padding: 5px; border-bottom: 1px solid #ffccc7;"><strong>Email:</strong></td><td style="padding: 5px; border-bottom: 1px solid #ffccc7;">${email}</td></tr>
             <tr><td style="padding: 5px; border-bottom: 1px solid #ffccc7;"><strong>Room:</strong></td><td style="padding: 5px; border-bottom: 1px solid #ffccc7;">${room_name}</td></tr>
             <tr><td style="padding: 5px; border-bottom: 1px solid #ffccc7;"><strong>Refund:</strong></td><td style="padding: 5px; border-bottom: 1px solid #ffccc7;">₹${refund_amount}</td></tr>
           </table>
           <p style="margin-top: 15px; font-weight: bold; color: #cf1322;">Action Required: Verify refund in Stripe/Dashboard.</p>
        </div>
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