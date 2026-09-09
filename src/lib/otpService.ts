import { supabase } from './supabase'

/**
 * Call Supabase Edge Function to send OTP via email
 */
export async function sendOtpEmail(email: string): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  try {
    // Call the send-otp edge function
    const { data, error } = await supabase.functions.invoke('send-otp', {
      body: { email },
    })

    if (error) {
      throw new Error(error.message || 'Failed to send OTP')
    }

    return data as { success: boolean; message: string }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(message, { cause: error })
  }
}

/**
 * Verify OTP code against the database
 */
export async function verifyOtpCode(email: string, code: string): Promise<boolean> {
  if (!supabase) {
    return false
  }

  try {
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      return false
    }

    // Delete the used OTP
    await supabase
      .from('otp_codes')
      .delete()
      .eq('id', data.id)

    return true
  } catch (error) {
    console.error('OTP verification error:', error)
    return false
  }
}

/**
 * Clean up expired OTP codes (optional maintenance function)
 */
export async function cleanupExpiredOtps(): Promise<void> {
  if (!supabase) {
    return
  }

  try {
    await supabase
      .from('otp_codes')
      .delete()
      .lt('expires_at', new Date().toISOString())
  } catch (error) {
    console.warn('Failed to cleanup expired OTPs:', error)
  }
}
