import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendVerificationEmail(
  email: string,
  token: string,
  baseUrl: string
): Promise<void> {
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

  await resend.emails.send({
    from: "CaseForge AI <onboarding@resend.dev>",
    to: email,
    subject: "Verify your CaseForge AI email",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111;">
          <div style="margin-bottom:24px;">
            <span style="font-weight:700;font-size:18px;">CaseForge AI</span>
          </div>
          <h2 style="font-size:20px;font-weight:600;margin-bottom:8px;">Verify your email</h2>
          <p style="color:#555;line-height:1.6;margin-bottom:24px;">
            Click the button below to verify your email address and activate your account.
            This link expires in 24 hours.
          </p>
          <a href="${verifyUrl}"
             style="display:inline-block;background:#1a7a4a;color:#fff;text-decoration:none;
                    padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
            Verify email
          </a>
          <p style="color:#888;font-size:12px;margin-top:32px;">
            If you didn't create a CaseForge AI account, you can safely ignore this email.
          </p>
        </body>
      </html>
    `,
  })
}
