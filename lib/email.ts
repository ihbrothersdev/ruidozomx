import 'server-only'
import nodemailer from 'nodemailer'

/**
 * Plain SMTP sender for internal notification emails (e.g. the portfolio quote
 * form). Provider-agnostic — point the SMTP_* env vars at whichever free
 * mailbox you use.
 *
 * Gmail / Outlook note: both disabled plain-password SMTP for personal
 * accounts. You must generate an **app password** (Gmail: requires 2FA, then
 * myaccount.google.com → App passwords) and use that as SMTP_PASS.
 *
 * Common settings:
 *   Gmail    → host smtp.gmail.com,     port 465 (secure) or 587
 *   Outlook  → host smtp-mail.outlook.com, port 587
 *   Yahoo    → host smtp.mail.yahoo.com, port 465
 *
 * Never import this from a client component — it is server-only.
 */

interface SendMailInput {
  to: string
  subject: string
  text: string
  /** Set so replies go to the person who submitted the form. */
  replyTo?: string
  /**
   * Display name shown before the From address, e.g. `"Los Aguas (vía
   * Ruidozo)" <hola@ruidozo.mx>`.
   *
   * The *address* always stays the authenticated mailbox (SMTP_FROM/SMTP_USER).
   * Providers reject or rewrite a From address you don't own — spoofing the
   * sender's real address would fail SPF/DKIM and land in spam. Pair this with
   * `replyTo` so replies still reach the actual person.
   */
  fromName?: string
}

export async function sendMail(input: SendMailInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const port = Number(process.env.SMTP_PORT ?? 587)
  const fromAddress = process.env.SMTP_FROM || user

  if (!host || !user || !pass || !fromAddress) {
    // Name the missing vars (never the values) so a prod misconfig is obvious
    // from the logs instead of surfacing as a generic failure.
    const missing = [
      !host && 'SMTP_HOST',
      !user && 'SMTP_USER',
      !pass && 'SMTP_PASS',
      !fromAddress && 'SMTP_FROM'
    ].filter(Boolean)
    console.error(`[email] SMTP env vars missing: ${missing.join(', ')}`)
    return { ok: false, error: 'missing_smtp_config' }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      // 465 is implicit TLS; 587 upgrades via STARTTLS.
      secure: port === 465,
      auth: { user, pass },
      // Serverless functions have a hard execution limit; without explicit
      // timeouts a stalled SMTP connection hangs until the platform kills the
      // function, which surfaces as a generic failure with nothing in the logs.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000
    })

    await transporter.sendMail({
      // Address stays the authenticated mailbox; only the display name varies.
      from: input.fromName ? { name: input.fromName, address: fromAddress } : fromAddress,
      to: input.to,
      subject: input.subject,
      text: input.text,
      replyTo: input.replyTo
    })

    return { ok: true }
  } catch (err) {
    console.error('[email] send failed', err)
    return { ok: false, error: 'send_failed' }
  }
}
