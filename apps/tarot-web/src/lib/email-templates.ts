/**
 * Email templates for Guia da Roda.
 */

interface MagicLinkEmailParams {
  magicLink: string;
}

export function magicLinkEmailHtml({
  magicLink,
}: MagicLinkEmailParams): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Link Mágico - Tarot</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#0d0a1a; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0d0a1a;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <!-- Main container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%;">
          <!-- Glow border top -->
          <tr>
            <td style="height:3px; background: linear-gradient(90deg, transparent, #a855f7, #d946ef, #a855f7, transparent); border-radius:3px;"></td>
          </tr>
          
          <!-- Card body -->
          <tr>
            <td style="background: linear-gradient(180deg, #1a1033 0%, #0f0a1f 100%); border-left:1px solid rgba(168,85,247,0.2); border-right:1px solid rgba(168,85,247,0.2); border-bottom:1px solid rgba(168,85,247,0.2); border-radius:0 0 16px 16px; padding:0;">
              
              <!-- Header with stars decoration -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:48px 40px 24px;">
                    <!-- Stars -->
                    <p style="margin:0 0 16px; font-size:24px; letter-spacing:12px; color:#a855f7;">✦ ✦ ✦</p>
                    
                    <!-- Moon icon -->
                    <div style="width:72px; height:72px; margin:0 auto 24px; background: radial-gradient(circle at 30% 30%, #f5d061, #d4a017); border-radius:50%; box-shadow: 0 0 40px rgba(245,208,97,0.3), 0 0 80px rgba(245,208,97,0.15);">
                      <div style="width:60px; height:60px; margin:6px 0 0 12px; background:#1a1033; border-radius:50%; opacity:0.85;"></div>
                    </div>
                    
                    <h1 style="margin:0 0 8px; font-size:28px; font-weight:700; color:#f5f0ff; letter-spacing:0.5px;">
                      Link Mágico
                    </h1>
                    <p style="margin:0; font-size:16px; color:#a78bfa; letter-spacing:2px; text-transform:uppercase;">
                      Tarot
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:0 40px;">
                    <div style="height:1px; background: linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent);"></div>
                  </td>
                </tr>
              </table>
              
              <!-- Content -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:32px 40px 16px;">
                    <p style="margin:0 0 16px; font-size:17px; color:#c4b5fd; line-height:1.6;">
                      As cartas revelaram seu caminho.
                    </p>
                    <p style="margin:0; font-size:15px; color:#8b7ebd; line-height:1.6;">
                      Clique no botão abaixo para acessar sua conta<br />e descobrir o que os astros reservam para você.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:32px 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:12px; background: linear-gradient(135deg, #7c3aed, #a855f7, #d946ef); box-shadow: 0 4px 24px rgba(168,85,247,0.4);">
                          <a href="${magicLink}" target="_blank" style="display:inline-block; padding:16px 48px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; letter-spacing:0.5px;">
                            ✨ Entrar Agora
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:16px 0 0; font-size:13px; color:#6b5f8a;">
                      Este link expira em 15 minutos.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:0 40px;">
                    <div style="height:1px; background: linear-gradient(90deg, transparent, rgba(168,85,247,0.2), transparent);"></div>
                  </td>
                </tr>
              </table>
              
              <!-- Tarot cards decoration -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:32px 40px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:0 6px;">
                          <div style="width:36px; height:52px; background: linear-gradient(180deg, #2d1b4e, #1a1033); border:1px solid rgba(168,85,247,0.3); border-radius:4px; transform:rotate(-8deg); text-align:center; line-height:52px; font-size:18px;">☽</div>
                        </td>
                        <td style="padding:0 6px;">
                          <div style="width:36px; height:52px; background: linear-gradient(180deg, #2d1b4e, #1a1033); border:1px solid rgba(217,70,239,0.3); border-radius:4px; text-align:center; line-height:52px; font-size:18px;">★</div>
                        </td>
                        <td style="padding:0 6px;">
                          <div style="width:36px; height:52px; background: linear-gradient(180deg, #2d1b4e, #1a1033); border:1px solid rgba(168,85,247,0.3); border-radius:4px; transform:rotate(8deg); text-align:center; line-height:52px; font-size:18px;">☀</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:16px 40px 40px;">
                    <p style="margin:0 0 8px; font-size:13px; color:#4a3f6b;">
                      Se você não solicitou este acesso, pode ignorar este e-mail com segurança.
                    </p>
                    <p style="margin:0; font-size:12px; color:#3d3459;">
                      © Guia da Roda · Webdrops
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Glow border bottom -->
          <tr>
            <td style="height:3px; background: linear-gradient(90deg, transparent, #a855f7, #d946ef, #a855f7, transparent); border-radius:3px;"></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function magicLinkEmailText({
  magicLink,
}: MagicLinkEmailParams): string {
  return `
Link Mágico - Tarot
━━━━━━━━━━━━━━━━━━

As cartas revelaram seu caminho.

Clique no link abaixo para acessar sua conta e descobrir o que os astros reservam para você.

${magicLink}

Este link expira em 15 minutos.

Se você não solicitou este acesso, pode ignorar este e-mail com segurança.

© Guia da Roda · Webdrops
`.trim();
}
