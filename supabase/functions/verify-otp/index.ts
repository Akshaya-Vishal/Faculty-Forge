import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function response(body: { success: boolean; message: string }, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export async function POST(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code } = await req.json() as { email?: string; code?: string }
    const normalizedEmail = email?.trim().toLowerCase()
    const normalizedCode = code?.trim()

    if (!normalizedEmail || !normalizedCode) {
      return response({ success: false, message: 'Email and OTP are required.' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      return response({ success: false, message: 'Database is not configured.' }, 500)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { data, error } = await adminClient
      .from('otp_codes')
      .select('id')
      .eq('email', normalizedEmail)
      .eq('code', normalizedCode)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('OTP lookup failed:', error)
      return response({ success: false, message: 'Unable to verify OTP.' }, 500)
    }

    if (!data) {
      return response({ success: false, message: 'Invalid or expired OTP.' }, 400)
    }

    const { error: deleteError } = await adminClient.from('otp_codes').delete().eq('id', data.id)
    if (deleteError) {
      console.error('OTP cleanup failed:', deleteError)
      return response({ success: false, message: 'OTP verification could not be completed.' }, 500)
    }

    return response({ success: true, message: 'OTP verified successfully.' })
  } catch (error) {
    console.error('OTP verification error:', error)
    return response({
      success: false,
      message: error instanceof Error ? error.message : 'Unable to verify OTP.',
    }, 500)
  }
}

Deno.serve(POST)
