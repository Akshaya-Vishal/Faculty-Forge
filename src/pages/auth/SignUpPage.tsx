import { useState } from 'react'
import { Eye, EyeOff, GraduationCap, Lock, Mail, ShieldCheck, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import type { UserRole } from '../../types/models'
import { Button } from '../../components/ui/Button'

export function SignUpPage() {
  const { signUp, sendOtp, verifyOtp } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [department, setDepartment] = useState('Computer Science & Engineering')
  const [role, setRole] = useState<UserRole>('faculty')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const handleSendOtp = async () => {
    if (!email.trim()) {
      showToast('error', 'Email required', 'Please enter your institutional email first.')
      return
    }

    try {
      await sendOtp(email)
      setOtpSent(true)
      showToast('success', 'OTP sent to your email', 'Check your email for the 6-digit verification code. The code will expire in 5 minutes.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send OTP.'
      showToast('error', 'OTP failed', message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      showToast('error', 'Missing details', 'Please complete all required fields.')
      return
    }

    if (password !== confirmPassword) {
      showToast('error', 'Password mismatch', 'The passwords do not match.')
      return
    }

    if (!otpSent) {
      showToast('error', 'OTP required', 'Please send and verify the OTP before creating the account.')
      return
    }

    const isOtpValid = await verifyOtp(email, otp)
    if (!isOtpValid) {
      showToast('error', 'Invalid OTP', 'The OTP is incorrect or has expired. Please request a new code.')
      return
    }

    setIsLoading(true)

    try {
      const result = await signUp({
        name: fullName.trim(),
        email: email.trim(),
        password,
        role,
        department,
        designation: role === 'admin' ? 'Controller of Examinations' : 'Assistant Professor',
        employeeId: `${role === 'admin' ? 'COE' : 'FAC'}-${Date.now().toString().slice(-6)}`,
        college: 'Faculty Forge University',
      })

      if (result.requiresEmailConfirmation) {
        showToast(
          'info',
          'Account created',
          'Your account is ready, but email confirmation is required before you can sign in. Please check your inbox and confirm the email first.',
        )
      } else {
        showToast(
          'success',
          'Account created',
          'Your account has been created. You can now sign in with your email and password.',
        )
      }
      navigate(ROUTES.LOGIN)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create your account right now.'
      showToast('error', 'Sign up failed', message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-900 px-4 py-12 selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-3 hover:scale-105 transition-transform">
            <GraduationCap className="size-7" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white">Create your account</h1>
          <p className="mt-1 text-xs text-slate-400">
            Register as a faculty member or exam administrator
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-900 p-1.5 border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('faculty')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
              role === 'faculty' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="size-4" />
            Faculty
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
              role === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="size-4" />
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Asha Nair"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div>
            <label htmlFor="department" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Department
            </label>
            <input
              id="department"
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Computer Science & Engineering"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Institutional email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-slate-500" />
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-slate-500" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="signup-confirm-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-slate-500" />
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="signup-otp" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              OTP verification
            </label>
            <div className="flex gap-2">
              <input
                id="signup-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSendOtp}
                className="text-[10px] px-3 py-2.5 border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 whitespace-nowrap"
              >
                {otpSent ? 'Resend' : 'Send OTP'}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
          <span>Already have an account?</span>
          <Link to={ROUTES.LOGIN} className="font-semibold text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
