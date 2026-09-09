import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  email: string
}

interface OtpResponse {
  success: boolean
  message: string
  otp?: string
}

// Generate a 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send email via Resend
async function sendEmailViaResend(
  email: string,
  otp: string,
  resendApiKey: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Faculty Forge <noreply@resend.dev>',
        to: email,
        subject: 'Your Faculty Forge OTP Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
              <h2 style="color: #333; margin-bottom: 20px;">Faculty Forge - Email Verification</h2>
              
              <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
                Welcome to Faculty Forge! To complete your account setup, please use the verification code below:
              </p>
              
              <div style="background-color: #fff; border: 2px solid #007bff; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Your verification code is:</p>
                <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</p>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
                This code will expire in 5 minutes.
              </p>
              
              <p style="color: #999; font-size: 12px; margin-bottom: 20px;">
                If you did not request this code, please ignore this email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                Faculty Forge - Question Paper Generation System<br>
                © 2024 All rights reserved.
              </p>
            </div>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.message || 'Failed to send email',
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Handle CORS preflight
if (Deno.env.get('DENO_REGION')) {
  // Production
} else {
  // Dev environment
}

export async function POST(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = (await req.json()) as RequestBody

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Valid email is required',
        } as OtpResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email service is not configured',
        } as OtpResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Generate OTP
    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Database is not configured',
        } as OtpResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Store OTP in database
    const { error: dbError } = await supabase.from('otp_codes').insert({
      email: normalizedEmail,
      code: otp,
      expires_at: expiresAt,
    })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to generate OTP',
        } as OtpResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Send email via Resend
    const emailResult = await sendEmailViaResend(normalizedEmail, otp, resendApiKey)

    if (!emailResult.success) {
      // Delete the OTP from database since email failed
      await supabase
        .from('otp_codes')
        .delete()
        .eq('email', normalizedEmail)
        .eq('code', otp)

      return new Response(
        JSON.stringify({
          success: false,
          message: emailResult.error || 'Failed to send email',
        } as OtpResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP sent successfully to your email',
      } as OtpResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      } as OtpResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}

Deno.serve(POST)
