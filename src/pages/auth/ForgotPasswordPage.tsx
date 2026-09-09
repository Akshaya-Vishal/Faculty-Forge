import { useState } from 'react'
import { ArrowLeft, CheckCircle2, GraduationCap, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { Button } from '../../components/ui/Button'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-900 px-4 py-12 selection:bg-indigo-500 selection:text-white">
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-3 hover:scale-105 transition-transform">
            <GraduationCap className="size-7" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
          <p className="mt-1 text-xs text-slate-400">
            Recover access to your academic account
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-4">
            <CheckCircle2 className="size-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Reset Link Dispatched</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We have sent password reset instructions to <b className="text-white">{email}</b>.
              Please check your institutional inbox.
            </p>
            <div className="pt-2">
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300"
              >
                <ArrowLeft className="size-3.5" /> Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Registered Institutional Email
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

            <Button
              type="submit"
              className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
            >
              Send Password Reset Instructions
            </Button>

            <div className="mt-6 text-center border-t border-slate-900 pt-4">
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="size-3.5" /> Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
