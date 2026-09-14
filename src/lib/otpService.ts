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
      let message = error.message || 'Failed to send OTP'
      const context = 'context' in error ? error.context : undefined
      if (context instanceof Response) {
        try {
          const body = await context.clone().json() as { message?: string; error?: string }
          message = body.message || body.error || message
        } catch {
          // Keep the Supabase error when the function did not return JSON.
        }
      }
      throw new Error(message)
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
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: {
        email: email.trim().toLowerCase(),
        code: code.trim(),
      },
    })

    if (error) {
      let message = error.message || 'Failed to verify OTP'
      const context = 'context' in error ? error.context : undefined
      if (context instanceof Response) {
        try {
          const body = await context.clone().json() as { message?: string; error?: string }
          message = body.message || body.error || message
        } catch {
          // Keep the Supabase error when the function did not return JSON.
        }
      }
      throw new Error(message)
    }

    return Boolean((data as { success?: boolean } | null)?.success)
  } catch (error) {
    console.warn('OTP verification request failed:', error)
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
