import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
}

interface User {
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

const createConfirmationEmailHTML = (token: string, confirmUrl: string, userName?: string) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirma tu cuenta - Subastas GAP</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 24px;">⚖️</span>
            </div>
            <div>
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                Subastas GAP
              </h1>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
                Premium Auctions
              </p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 40px 20px;">
          <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: bold;">
            ${userName ? `¡Hola ${userName}!` : '¡Hola!'}
          </h2>
          
          <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Gracias por unirte a <strong>Subastas GAP</strong>, la plataforma premium de subastas en línea. 
            Para completar tu registro y comenzar a participar en nuestras exclusivas subastas, 
            necesitas confirmar tu dirección de email.
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${confirmUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; 
                      font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              Confirmar mi cuenta
            </a>
          </div>

          <!-- Alternative Link -->
          <p style="margin: 24px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:
          </p>
          <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f3f4f6; border-radius: 6px; 
                    word-break: break-all; font-size: 12px; color: #374151;">
            ${confirmUrl}
          </p>

          <!-- Token Code -->
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">
              Código de confirmación:
            </p>
            <code style="display: block; background-color: #f3f4f6; padding: 12px; border-radius: 6px; 
                         font-family: 'Monaco', 'Consolas', monospace; font-size: 16px; color: #1f2937; 
                         letter-spacing: 2px; text-align: center; font-weight: bold;">
              ${token}
            </code>
          </div>

          <!-- Features -->
          <div style="margin: 32px 0; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 8px;">
            <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: bold;">
              ¿Qué puedes hacer en Subastas GAP?
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.6;">
              <li style="margin-bottom: 8px;">🎯 Participar en subastas exclusivas de productos premium</li>
              <li style="margin-bottom: 8px;">💰 Recargar tu billetera de forma segura</li>
              <li style="margin-bottom: 8px;">📱 Seguir tus pujas en tiempo real</li>
              <li style="margin-bottom: 8px;">🏆 Ganar productos únicos a precios increíbles</li>
            </ul>
          </div>

          <!-- Security Note -->
          <div style="margin: 24px 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Nota de seguridad:</strong> Este enlace expirará en 24 horas por tu seguridad. 
              Si no creaste esta cuenta, puedes ignorar este email.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
            © 2024 Subastas GAP - Premium Auctions Platform
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            Este email fue enviado porque solicitaste crear una cuenta en nuestro sitio.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const wh = new Webhook(hookSecret);
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type, site_url },
    } = wh.verify(payload, headers) as {
      user: User;
      email_data: EmailData;
    };

    console.log("Processing confirmation email for:", user.email);

    // Only send custom emails for confirmation
    if (email_action_type !== "signup") {
      console.log("Not a signup email, skipping custom template");
      return new Response(JSON.stringify({ message: "Not a signup email" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Build confirmation URL
    const confirmUrl = `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;
    
    // Get user name from metadata
    const userName = user.user_metadata?.full_name;

    // Create HTML email
    const htmlContent = createConfirmationEmailHTML(token, confirmUrl, userName);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Subastas GAP <noreply@subastasgap.com.mx>",
      to: [user.email],
      subject: "Confirma tu cuenta en Subastas GAP - Premium Auctions",
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          details: error.stack,
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);