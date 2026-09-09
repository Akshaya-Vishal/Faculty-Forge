-- Faculty Forge - OTP Setup Script
-- Run this in the Supabase SQL Editor to add OTP functionality

-- Create OTP codes table
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster OTP lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_expires 
  ON public.otp_codes(email, expires_at);

-- Enable RLS on OTP codes table
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage OTP codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'otp_codes' AND policyname = 'Service role can manage OTP codes'
  ) THEN
    CREATE POLICY "Service role can manage OTP codes"
      ON public.otp_codes
      FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Policy: Authenticated users can check their own OTP
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'otp_codes' AND policyname = 'Authenticated users can check their own OTP'
  ) THEN
    CREATE POLICY "Authenticated users can check their own OTP"
      ON public.otp_codes
      FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;
