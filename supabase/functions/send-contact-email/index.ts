import { serve } from "std/http/server.ts";
import nodemailer from "nodemailer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const escapeHtml = (str: unknown): string => {
  if (typeof str !== 'string') {
    return String(str || '');
  }
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const { email } = body;
    // Sanitize inputs
    const name = escapeHtml(body.name);
    const subject = escapeHtml(body.subject);
    const message = escapeHtml(body.message);
    
    // Get Admin Email from Secrets (reuse your existing ones)
    const adminEmail = Deno.env.get('SMTP_EMAIL');
    const adminPass = Deno.env.get('SMTP_PASSWORD');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: adminEmail, pass: adminPass },
    });

    // Premium "Inquiry" Template
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #d4af37;">New Inquiry: ${subject}</h2>
        <p><strong>From:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 16px; color: #333; white-space: pre-wrap;">${message}</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #888;">Reply directly to this email to contact the user.</p>
      </div>
    `;

    // Send to YOU (The Admin)
    await transporter.sendMail({
      from: `"Sunrise Website" <${adminEmail}>`,
      to: adminEmail, // Send to yourself
      replyTo: email, // Hitting "Reply" replies to the User
      subject: `[Sunrise Query] ${subject}`,
      html: htmlContent,
    });

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});