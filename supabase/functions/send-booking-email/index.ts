import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle Browser Security (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get Data from React
    const { email, name, room_name, room_number, dates, price, booking_id } = await req.json();

    // 2. Setup Gmail Transporter (Using Secrets)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: Deno.env.get('SMTP_EMAIL'),
        pass: Deno.env.get('SMTP_PASSWORD'),
      },
    });

    // 3. Premium HTML Email Template
    const htmlContent = `
      <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #000; padding: 30px; text-align: center;">
          <h1 style="color: #d4af37; margin: 0; font-family: 'Georgia', serif; text-transform: uppercase; letter-spacing: 4px;">Sunrise</h1>
          <p style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Luxury Stays</p>
        </div>
        
        <div style="padding: 40px; background-color: #fff;">
          <h2 style="color: #111; margin-top: 0;">Booking Confirmed</h2>
          <p style="color: #555;">Dear <strong>${name}</strong>,</p>
          <p style="color: #555;">Your reservation has been successfully secured.</p>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #d4af37;">
            <p style="margin: 8px 0;"><strong>Room:</strong> <span style="font-size: 18px;">#${room_number}</span> (${room_name})</p>
            <p style="margin: 8px 0;"><strong>Dates:</strong> ${dates}</p>
            <p style="margin: 8px 0;"><strong>Total Paid:</strong> ₹${price}</p>
            <p style="margin: 8px 0;"><strong>Ref ID:</strong> <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 4px;">${booking_id.slice(0, 8)}</code></p>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center;">Please show this email at the reception desk.</p>
        </div>
        
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #888; font-size: 11px;">
          &copy; ${new Date().getFullYear()} Hotel Sunrise. All rights reserved.
        </div>
      </div>
    `;

    // 4. Send the Email
    await transporter.sendMail({
      from: '"Hotel Sunrise" <your_email@gmail.com>', // Sender Name
      to: email, // Receiver (The Guest)
      subject: `Booking Confirmed: Room #${room_number}`,
      html: htmlContent,
    });

    console.log(`Email sent to ${email}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});