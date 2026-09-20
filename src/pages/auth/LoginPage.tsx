import { useState } from 'react'
import { Eye, EyeOff, GraduationCap, Lock, Mail, Shield, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import type { UserRole } from '../../types/models'
import { Button } from '../../components/ui/Button'

export function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [role, setRole] = useState<UserRole>('faculty')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole)
    setEmail('')
    setPassword('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(role, email, password)
      showToast(
        'success',
        `Welcome back!`,
        `Logged in as ${role === 'admin' ? 'Administrator' : 'Faculty Member'}`,
      )
      if (role === 'admin') {
        navigate(ROUTES.ADMIN)
      } else {
        navigate(ROUTES.FACULTY_PAPER_NEW)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Incorrect email or password.'
      const normalized = message.toLowerCase()

      if (normalized.includes('email not confirmed') || normalized.includes('confirm your email')) {
        showToast(
          'error',
          'Email confirmation required',
          'Your account was created successfully, but you must confirm your email before logging in. Please check your inbox and try again.',
        )
      } else {
        showToast('error', 'Login failed', message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-900 px-4 py-12 selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-3 hover:scale-105 transition-transform">
            <GraduationCap className="size-7" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white">Faculty Forge</h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to access your examination management portal
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-900 p-1.5 border border-slate-800">
          <button
            type="button"
            onClick={() => handleRoleChange('faculty')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
              role === 'faculty'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="size-4" />
            Faculty Portal
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="size-4" />
            CoE / Admin Portal
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-xs text-indigo-300">
          <span className="font-bold block text-white">Sign in with your registered account</span>
          <span className="mt-1 block text-[11px] opacity-80">Create an account first if you are a new faculty member.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@college.edu"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-slate-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <Button
            type="submit"
            className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
          >
            {isLoading ? 'Authenticating...' : `Sign in as ${role === 'admin' ? 'Administrator' : 'Faculty'}`}
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center justify-center gap-2 border-t border-slate-900 pt-4 text-sm text-slate-400">
          <span className="text-xs text-slate-500">
            New to Faculty Forge?{' '}
            <Link
              to={ROUTES.SIGNUP}
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Create an account
            </Link>
          </span>
          <Link
            to={ROUTES.HOME}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            &larr; Back to Faculty Forge Home
          </Link>
        </div>
      </div>
    </div>
  )
}
