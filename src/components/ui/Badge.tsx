import { KNOWLEDGE_LEVEL_MAP } from '../../types/models'
import type { KnowledgeLevel, Difficulty, PaperStatus } from '../../types/models'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan' | 'neutral'
  className?: string
  size?: 'sm' | 'md'
}

const variantStyles: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  neutral: 'bg-slate-800 text-slate-100 border-slate-700',
}

export function Badge({ children, variant = 'default', className = '', size = 'sm' }: BadgeProps) {
  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${sizeStyle} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export function KnowledgeBadge({ level, showLabel = true }: { level: KnowledgeLevel | string; showLabel?: boolean }) {
  const key = (level in KNOWLEDGE_LEVEL_MAP ? level : 'K1') as KnowledgeLevel
  const info = KNOWLEDGE_LEVEL_MAP[key]
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md px-2 py-0.5 text-xs border ${info.badgeClass}`}
      title={`${info.kLabel} - ${info.label}: ${info.verb}`}
    >
      <span className="font-mono font-bold">{info.kLabel}</span>
      {showLabel && <span className="font-normal opacity-90">({info.label})</span>}
    </span>
  )
}

export const BloomBadge = KnowledgeBadge

export function StatusBadge({ status }: { status: PaperStatus }) {
  const styleMap: Record<PaperStatus, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple'; dot: string }> = {
    Draft: { variant: 'default', dot: 'bg-slate-400' },
    Submitted: { variant: 'primary', dot: 'bg-indigo-500 animate-pulse' },
    'Under Review': { variant: 'purple', dot: 'bg-purple-500' },
    'Revision Requested': { variant: 'warning', dot: 'bg-amber-500' },
    Approved: { variant: 'success', dot: 'bg-emerald-500' },
    Rejected: { variant: 'danger', dot: 'bg-rose-500' },
  }

  const current = styleMap[status] || styleMap.Draft

  return (
    <Badge variant={current.variant} className="gap-1.5 font-medium">
      <span className={`size-1.5 rounded-full ${current.dot}`} />
      {status}
    </Badge>
  )
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const map: Record<Difficulty, 'success' | 'warning' | 'danger'> = {
    Easy: 'success',
    Medium: 'warning',
    Hard: 'danger',
  }
  return <Badge variant={map[difficulty]}>{difficulty}</Badge>
}
