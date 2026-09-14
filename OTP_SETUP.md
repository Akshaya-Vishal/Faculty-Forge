# OTP Email Configuration Guide

This guide explains how to set up OTP (One-Time Password) email sending for the Faculty Forge project using Resend and Supabase Edge Functions.

## Overview

The OTP system works as follows:
1. User enters their email on the Sign Up page
2. User clicks "Send OTP" button
3. A request is sent to the Supabase Edge Function `send-otp`
4. The function generates a 6-digit OTP and stores it in the database
5. The function sends the OTP via email using Resend
6. User receives the OTP in their email and enters it on the form

## Prerequisites

- Supabase project with credentials already configured
- Resend account for email sending (free tier available)

## Setup Steps

### 1. Get Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Create a free account or sign in
3. Navigate to "API Keys" in the dashboard
4. Copy your API key

### 2. Configure Environment Variables

Add your Resend API key to your Supabase project:

#### Option A: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Settings → Environment**
3. Add a new environment variable:
   - Name: `RESEND_API_KEY`
   - Value: `re_your_actual_api_key_here`
   - Name: `RESEND_FROM_EMAIL`
     - Value: `no-reply@your-verified-domain.com`
4. Save the changes

#### Option B: Via CLI
If you have Supabase CLI installed:
```bash
supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here
```

### 3. Deploy the Edge Function

#### Option A: Via Supabase Dashboard
1. Go to your Supabase project
2. Navigate to **Edge Functions**
3. Create a new function called `send-otp`
4. Copy the code from `supabase/functions/send-otp/index.ts`
5. Paste it into the editor and deploy

#### Option B: Via Supabase CLI
```bash
supabase functions deploy send-otp --no-verify-jwt
supabase functions deploy verify-otp --no-verify-jwt
```

These functions must allow anonymous requests because signup happens before the
user has authenticated. If deploying from the Supabase Dashboard, disable JWT
verification for both functions.

The repository includes this setting in `supabase/config.toml`. Deploy from the
project root so Supabase applies it.

### 4. Update Database Schema

Run the updated schema in your Supabase SQL editor:

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase/schema.sql`
5. Run the query

This will create:
- `otp_codes` table to store OTP codes with expiration times
- Indexes for faster lookups
- RLS (Row Level Security) policies for access control

### 5. Update Local Environment Variables

1. Create/update `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. The `RESEND_API_KEY` is configured in Supabase (not needed in local .env)

## Testing the OTP Flow

1. Start the development server:
```bash
npm run dev
```

2. Navigate to the Sign Up page (`http://localhost:5173/signup`)

3. Fill in the form and click "Send OTP"

4. You should receive an email with your OTP code

5. Enter the code in the OTP field to complete signup

## Troubleshooting

### OTP not being sent
- **Check Resend API Key**: Verify the key is correct and has the `emails.send` permission
- **Check Edge Function**: Go to Supabase dashboard and check Edge Functions logs
- **Check Email**: The email might be in spam folder; check spam folder first
- With Resend's default `onboarding@resend.dev` sender, the recipient must be the
  email address associated with your Resend account. To send OTPs to any faculty
  email, verify your own domain in Resend and change the `from` address in
  `supabase/functions/send-otp/index.ts`.
- Check **Resend → Emails → Logs** for the delivery status. `delivered`, `bounced`,
  `complained`, and `failed` are different from the API accepting the request.

### "Edge Function not found" error
- Make sure the function is deployed correctly
- Check the function name matches exactly: `send-otp`
- Check the Supabase project URL and credentials are correct

### "Invalid or expired OTP" after entering the email code
- Deploy both `send-otp` and `verify-otp`; signup verification is performed by the `verify-otp` Edge Function before the user is authenticated.
- Do not add a public `SELECT` policy to `otp_codes`. The verification function uses the service role securely on the server.
- Confirm that `RESEND_API_KEY` is configured as a Supabase Edge Function secret.

### "Edge Function returned a non-2xx status code"
- Open **Edge Functions → Logs** and inspect the latest `send-otp` request.
- Confirm `RESEND_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` are available to the function.
- Confirm JWT verification is disabled for both `send-otp` and `verify-otp`.
- Redeploy both functions after changing secrets or function code.

### OTP expired before use
- OTPs expire after 5 minutes
- User needs to request a new OTP if code expires

### Database errors
- Ensure the `otp_codes` table exists (run schema.sql)
- Check RLS policies are configured correctly
- Verify database connection permissions

## Email Template

The OTP is sent with a professional HTML email template that includes:
- Clear subject line
- Well-formatted OTP display
- 5-minute expiration notice
- Sender: Faculty Forge <noreply@resend.dev>

You can customize the email template by editing the HTML in `supabase/functions/send-otp/index.ts`.

## Security Notes

- OTPs are 6-digit random codes
- OTPs expire after 5 minutes
- OTPs are deleted from database after successful verification
- Expired OTPs are cleaned up by the system
- CORS headers allow frontend requests from any origin (can be restricted in production)

## File Structure

```
Faculty Forge/
├── supabase/
│   ├── functions/
│   │   └── send-otp/
│   │       └── index.ts          # Edge Function for sending OTP
│   └── schema.sql                # Database schema with otp_codes table
├── src/
│   ├── lib/
│   │   ├── otpService.ts         # OTP utility functions
│   │   └── supabase.ts           # Supabase client setup
│   ├── context/
│   │   └── AuthContext.tsx       # Updated with OTP email support
│   └── pages/
│       └── auth/
│           └── SignUpPage.tsx    # Updated UI for OTP email flow
├── .env.example                  # Updated with RESEND_API_KEY
└── package.json
```

## Next Steps

- Consider adding rate limiting to prevent abuse
- Add retry logic for failed email sends
- Monitor email delivery rates
- Customize email template with your branding
- Set up email verification logging

## Support

For issues with:
- **Resend**: Visit [https://resend.com/docs](https://resend.com/docs)
- **Supabase**: Visit [https://supabase.com/docs](https://supabase.com/docs)
- **Faculty Forge**: Check the project README
