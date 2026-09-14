import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: { success: boolean; message: string }, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function sendEmail(email: string, otp: string, apiKey: string, fromEmail: string) {
  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: ['Bearer', apiKey].join(' '),
    },
    body: JSON.stringify({
      from: `Faculty Forge <${fromEmail}>`,
      to: email,
      subject: 'Your Faculty Forge OTP Verification Code',
      html: `<p>Your Faculty Forge verification code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    }),
  })

  if (!result.ok) {
    const details = await result.text()
    throw new Error(details || 'Failed to send email')
  }
}

export async function POST(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email } = await req.json() as { email?: string }
    const normalizedEmail = email?.trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return json({ success: false, message: 'Valid email is required.' }, 400)
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!resendApiKey || !fromEmail || !supabaseUrl || !serviceRoleKey) {
      return json({ success: false, message: 'OTP service is not configured.' }, 500)
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { error } = await adminClient.from('otp_codes').insert({
      email: normalizedEmail,
      code: otp,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })
    if (error) throw error

    try {
      await sendEmail(normalizedEmail, otp, resendApiKey, fromEmail)
    } catch (error) {
      await adminClient.from('otp_codes').delete().eq('email', normalizedEmail).eq('code', otp)
      throw error
    }

    return json({ success: true, message: 'OTP sent successfully.' })
  } catch (error) {
    console.error('OTP send error:', error)
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Unable to send OTP.',
    }, 500)
  }
}

Deno.serve(POST)
