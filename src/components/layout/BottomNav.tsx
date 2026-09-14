import { Link, useLocation } from 'react-router-dom'
import { Plus, Home, FolderCheck, Database, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function BottomNav() {
  const location = useLocation()
  const { role } = useAuth()
  const path = location.pathname

  const isHome = path === '/' || path === '/faculty'
  const isCreate = path.startsWith('/create') || path.startsWith('/builder')
  const isHub = path === '/hub' || path === '/faculty/papers'
  const isBank = path === '/faculty/question-bank' || path === '/admin/question-bank'
  const isProfile = path === '/faculty/profile' || path === '/admin/profile'

  if (role === 'admin') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 py-1.5 md:hidden shadow-lg safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link
            to="/admin/reviews"
            className={`flex flex-col items-center justify-center py-1 px-5 rounded-xl transition-all ${
              path === '/admin/reviews' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderCheck className="size-5" />
            <span className="text-[10px] mt-0.5">Review</span>
          </Link>
          <Link
            to="/hub"
            className={`flex flex-col items-center justify-center py-1 px-5 rounded-xl transition-all ${
              isHub ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderCheck className="size-5" />
            <span className="text-[10px] mt-0.5">Papers</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 py-1.5 md:hidden shadow-lg safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isHome ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="size-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        <Link
          to="/hub"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isHub ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderCheck className="size-5" />
          <span className="text-[10px] mt-0.5">Paper Hub</span>
        </Link>

        {/* Elevated Center Primary Action Button */}
        <Link
          to="/create"
          className="flex flex-col items-center justify-center -mt-5"
          aria-label="Create Question Paper"
        >
          <div
            className={`size-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              isCreate
                ? 'bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white ring-4 ring-indigo-100 shadow-indigo-500/40'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <Plus className="size-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-indigo-700 mt-1">Create Q/P</span>
        </Link>

        <Link
          to="/faculty/question-bank"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isBank ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="size-5" />
          <span className="text-[10px] mt-0.5">Bank</span>
        </Link>

        <Link
          to="/faculty/profile"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isProfile ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="size-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </Link>
      </div>
    </div>
  )
}
