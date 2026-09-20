import {
  BookOpen,
  CheckSquare,
  Database,
  FolderCheck,
  GraduationCap,
  PlusCircle,
  UserCheck,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import type { UserRole } from '../../types'

type SidebarProps = {
  role: UserRole
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

type NavItem = {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | string
  highlight?: boolean
}

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function Sidebar({ role, mobileOpen, onCloseMobile }: SidebarProps) {
  const { papers, questions } = useData()
  const { user } = useAuth()

  const pendingReviewCount = papers.filter((p) => p.status === 'Submitted' || p.status === 'Under Review').length

  const facultyNav: NavItem[] = [
    {
      label: 'Create Question Paper',
      to: ROUTES.STEP1_DEPT,
      icon: PlusCircle,
      highlight: true,
    },
    {
      label: 'Question Paper Hub',
      to: ROUTES.STEP6_HUB,
      icon: FolderCheck,
      badge: papers.length,
    },
    {
      label: 'Question Bank',
      to: ROUTES.FACULTY_QUESTION_BANK,
      icon: Database,
      badge: questions.length,
    },
    { label: 'Assigned Syllabus', to: ROUTES.FACULTY_SYLLABUS, icon: BookOpen },
    { label: 'Faculty Profile', to: ROUTES.FACULTY_PROFILE, icon: UserCheck },
  ]

  const adminNav: NavItem[] = [
    {
      label: 'Review Workbench',
      to: ROUTES.ADMIN_REVIEWS,
      icon: CheckSquare,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
      highlight: pendingReviewCount > 0,
    },
    {
      label: 'All Question Papers',
      to: ROUTES.ADMIN_PAPERS,
      icon: FolderCheck,
      badge: papers.length,
    },
  ]

  const navItems = role === 'admin' ? adminNav : facultyNav
  const roleLabel = role === 'admin' ? 'CoE / Admin Portal' : 'Faculty Portal'

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs sm:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[82vw] max-w-60 flex-col border-r border-slate-200 bg-white transition-transform duration-300 sm:static sm:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0',
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                Faculty Forge
              </span>
            </div>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              {roleLabel}
            </p>
          </div>
        </div>

        {/* User Card Mini */}
        <div className="mx-3 mt-3 border-b border-slate-100 px-1 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200 shrink-0">
              {user?.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('') || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">{user?.name}</p>
              <p className="truncate text-[11px] text-slate-500">{user?.designation}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Sidebar Navigation">
          {navItems.map(({ label, to, icon: Icon, badge, highlight }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : highlight
                    ? 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'size-4.5 shrink-0',
                        isActive ? 'text-white' : highlight ? 'text-indigo-600' : 'text-slate-400',
                      )}
                    />
                    <span>{label}</span>
                  </div>
                  {badge !== undefined && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-bold',
                        isActive
                          ? 'bg-white/20 text-white'
                          : highlight
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200/80 text-slate-700',
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Meta */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">KCET Autonomous</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
              v3.0 Hub
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
