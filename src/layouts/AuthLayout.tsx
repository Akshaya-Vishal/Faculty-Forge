import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-600">
            Faculty Forge
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Faculty Question Paper Management System
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
