import { useState } from 'react'
import {
  Bell,
  CheckCircle2,
  LogOut,
  Menu,
  RotateCcw,
  UserCheck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'

type TopBarProps = {
  pageTitle?: string
  onToggleMobileMenu?: () => void
}

export function TopBar({ pageTitle, onToggleMobileMenu }: TopBarProps) {
  const { user, role, switchRole, logout } = useAuth()
  const { papers, resetDataToDefault } = useData()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Derive notifications from recent paper status changes
  const notifications = [
    ...papers
      .filter((p) => p.status === 'Submitted')
      .map((p) => ({
        id: `notif-sub-${p.id}`,
        title: 'New Paper Submitted',
        desc: `${p.courseCode} submitted by ${p.facultyName}`,
        time: 'Just now',
        type: 'info',
        to: ROUTES.ADMIN_REVIEWS,
      })),
    ...papers
      .filter((p) => p.status === 'Revision Requested')
      .map((p) => ({
        id: `notif-rev-${p.id}`,
        title: 'Revision Requested',
        desc: `${p.courseCode} feedback from Exam Cell`,
        time: '1 hour ago',
        type: 'warning',
        to: ROUTES.FACULTY_PAPERS,
      })),
    ...papers
      .filter((p) => p.status === 'Approved')
      .map((p) => ({
        id: `notif-app-${p.id}`,
        title: 'Paper Approved',
        desc: `${p.courseCode} approved for printing`,
        time: 'Today',
        type: 'success',
        to: ROUTES.FACULTY_PAPERS,
      })),
  ].slice(0, 5)

  const handleRoleToggle = (targetRole: 'faculty' | 'admin') => {
    switchRole(targetRole)
    showToast(
      'info',
      `Switched to ${targetRole === 'admin' ? 'Admin / Exam Cell' : 'Faculty'} Portal`,
      `You are now viewing as ${targetRole === 'admin' ? 'Prof. Robert Vance' : 'Dr. Sarah Jenkins'}`,
    )
    if (targetRole === 'admin') {
      navigate(ROUTES.ADMIN)
    } else {
      navigate(ROUTES.FACULTY)
    }
  }

  const handleResetData = () => {
    resetDataToDefault()
    showToast('success', 'Demo data reset', 'Reset all mock question papers, banks, and exams.')
  }

  const handleLogout = () => {
    logout()
    showToast('info', 'Logged out', 'You have been signed out successfully.')
    navigate(ROUTES.LOGIN)
  }

  const portalTheme = role === 'admin'
    ? 'border-slate-700 bg-slate-950/95 text-white'
    : 'border-slate-200/80 bg-white/95 text-slate-900'

  const portalBadgeClass = role === 'admin'
    ? 'text-indigo-200 bg-indigo-500/10 border border-indigo-400/20'
    : 'text-slate-400 bg-slate-100 border border-slate-200'

  return (
    <header className={`sticky top-0 z-30 flex h-16 items-center justify-between border-b px-3 backdrop-blur-md sm:px-6 ${portalTheme}`}>
      {/* Left section: Mobile menu & Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className={`rounded-lg p-2 sm:hidden ${role === 'admin' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
          aria-label="Open sidebar menu"
        >
          <Menu className="size-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className={`hidden text-xs font-bold uppercase tracking-wider sm:inline ${portalBadgeClass}`}>
              {role === 'admin' ? 'Controller of Examinations' : 'Faculty Forge'}
            </span>
            <h1 className={`truncate text-base font-extrabold sm:text-lg ${role === 'admin' ? 'text-white' : 'text-slate-900'}`}>
              {pageTitle || 'Dashboard'}
            </h1>
          </div>
        </div>
      </div>

      {/* Right section: Controls, Notifications, User Menu */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Reset Demo Data Button */}
        <button
          onClick={handleResetData}
          title="Reset all sample data"
          className="hidden md:flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw className="size-3.5 text-slate-400" />
          <span>Reset Data</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-rose-500"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Notifications ({notifications.length})
                </p>
                <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="mt-2 space-y-1 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">No new alerts</p>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      to={n.to}
                      onClick={() => setShowNotifications(false)}
                      className="flex items-start gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="mt-0.5 size-2 rounded-full bg-indigo-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900">{n.title}</p>
                        <p className="truncate text-[11px] text-slate-500">{n.desc}</p>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-indigo-100 transition-all"
          >
            <div className="size-8.5 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {user?.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('') || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50">
              <div className="border-b border-slate-100 p-2">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
                <span className="mt-1.5 inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  {role === 'admin' ? 'Administrator' : 'Faculty Member'}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to={role === 'admin' ? ROUTES.ADMIN_PROFILE : ROUTES.FACULTY_PROFILE}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <UserCheck className="size-4 text-slate-400" />
                  Account Settings
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    handleRoleToggle(role === 'admin' ? 'faculty' : 'admin')
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  <CheckCircle2 className="size-4" />
                  Switch to {role === 'admin' ? 'Faculty' : 'Admin'} Mode
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
