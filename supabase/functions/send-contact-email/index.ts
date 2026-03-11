import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

interface ResendEmailResponse {
  id?: string;
  error?: { message: string };
}

function log(level: "INFO" | "WARN" | "ERROR", message: string, data?: Record<string, unknown>) {
  const logEntry = { timestamp: new Date().toISOString(), level, message, ...data };
  if (level === "ERROR") {
    console.error(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

// Convert URLs in text to clickable HTML links
function linkifyUrls(text: string): string {
  // Match URLs with http(s):// or starting with www.
  const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+)/gi;
  return text.replace(urlPattern, (match) => {
    const href = match.startsWith('http') ? match : `https://${match}`;
    return `<a href="${href}" style="color:#2563eb;text-decoration:underline;">${match}</a>`;
  });
}

// Escape HTML special characters to prevent XSS
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Convert plain text message to safe HTML with clickable links
function formatMessageAsHtml(message: string): string {
  // First escape HTML, then convert newlines, then linkify URLs
  const escaped = escapeHtml(message);
  const withBreaks = escaped.replace(/\n/g, '<br>');
  return linkifyUrls(withBreaks);
}

async function sendEmail(payload: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<ResendEmailResponse> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      reply_to: payload.replyTo,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    return { error: { message: data.message || "Failed to send email" } };
  }
  
  return { id: data.id };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactEmailRequest = await req.json();

    // Validate input
    if (!name || !email || !message) {
      log("WARN", "Missing required fields", { name: !!name, email: !!email, message: !!message });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("INFO", "Processing contact form submission", { from: email, name });

    // Get recipient email from settings table
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "contact_email")
      .single();

    const recipientEmail = setting?.value || "support@calorievision.online";

    log("INFO", "Sending email via Resend", { to: recipientEmail });

    // Send notification email to support - using simple, compatible HTML
    const formattedMessage = formatMessageAsHtml(message);
    
    const emailResponse = await sendEmail({
      from: `${name} (${email}) via CalorieVision <support@calorievision.online>`,
      to: [recipientEmail],
      replyTo: email,
      subject: name,
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau message de contact</title>
</head>
<body style="margin:0;padding:20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#333333;background-color:#f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <tr>
      <td style="padding:20px 30px;background-color:#10b981;color:#ffffff;">
        <h1 style="margin:0;font-size:20px;font-weight:bold;">📩 Nouveau message de contact</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:30px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding-bottom:20px;">
              <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;">Nom</strong><br>
              <span style="font-size:16px;">${escapeHtml(name)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:20px;">
              <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;">Email</strong><br>
              <a href="mailto:${escapeHtml(email)}" style="color:#2563eb;text-decoration:underline;font-size:16px;">${escapeHtml(email)}</a>
            </td>
          </tr>
          <tr>
            <td>
              <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;">Message</strong><br>
              <div style="margin-top:8px;padding:15px;background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;font-size:14px;line-height:1.6;">
                ${formattedMessage}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:15px 30px;background-color:#f9fafb;text-align:center;font-size:12px;color:#9ca3af;">
        Envoyé depuis le formulaire de contact CalorieVision
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    if (emailResponse.error) {
      log("ERROR", "Resend API error", { error: emailResponse.error });
      throw new Error(emailResponse.error.message);
    }

    log("INFO", "Email sent successfully", { id: emailResponse.id });

    // Send confirmation email to the user - using simple, compatible HTML
    const confirmationResponse = await sendEmail({
      from: "CalorieVision <support@calorievision.online>",
      to: [email],
      subject: "Nous avons bien reçu votre message – CalorieVision",
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message reçu</title>
</head>
<body style="margin:0;padding:20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#333333;background-color:#f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <tr>
      <td style="padding:30px;background-color:#10b981;color:#ffffff;text-align:center;">
        <h1 style="margin:0;font-size:24px;font-weight:bold;">✅ Message reçu</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:30px;">
        <p style="margin:0 0 15px 0;">Bonjour ${escapeHtml(name)},</p>
        <p style="margin:0 0 15px 0;">Nous avons bien reçu votre message et vous remercions de nous avoir contactés.</p>
        <p style="margin:0 0 15px 0;">Notre équipe vous répondra dans un délai de <strong>24 à 72 heures ouvrées</strong>.</p>
        <p style="margin:0;">Cordialement,<br><strong>L'équipe CalorieVision</strong></p>
      </td>
    </tr>
    <tr>
      <td style="padding:15px 30px;background-color:#f9fafb;text-align:center;font-size:12px;color:#9ca3af;">
        Cet email a été envoyé automatiquement depuis <a href="https://calorievision.online" style="color:#10b981;text-decoration:underline;">calorievision.online</a>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    if (confirmationResponse.error) {
      log("WARN", "Failed to send confirmation email", { error: confirmationResponse.error });
    } else {
      log("INFO", "Confirmation email sent", { id: confirmationResponse.id });
    }

    return new Response(
      JSON.stringify({ success: true, id: emailResponse.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log("ERROR", "Failed to send contact email", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
