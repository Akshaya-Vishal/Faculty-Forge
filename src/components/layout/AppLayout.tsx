import { useState, type ReactNode } from 'react'
import type { UserRole } from '../../types'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

type AppLayoutProps = {
  role: UserRole
  pageTitle?: string
  children: ReactNode
}

export function AppLayout({ role, pageTitle, children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Sidebar
        role={role}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          pageTitle={pageTitle}
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-24 sm:px-6 sm:py-6 md:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
