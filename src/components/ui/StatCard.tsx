import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: {
    value: string
    isPositive?: boolean
  }
  colorVariant?: 'indigo' | 'emerald' | 'amber' | 'purple' | 'cyan' | 'rose'
}

const colorStyles = {
  indigo: {
    bg: 'bg-indigo-50/70',
    iconText: 'text-indigo-600',
    border: 'hover:border-indigo-200',
  },
  emerald: {
    bg: 'bg-emerald-50/70',
    iconText: 'text-emerald-600',
    border: 'hover:border-emerald-200',
  },
  amber: {
    bg: 'bg-amber-50/70',
    iconText: 'text-amber-600',
    border: 'hover:border-amber-200',
  },
  purple: {
    bg: 'bg-purple-50/70',
    iconText: 'text-purple-600',
    border: 'hover:border-purple-200',
  },
  cyan: {
    bg: 'bg-cyan-50/70',
    iconText: 'text-cyan-600',
    border: 'hover:border-cyan-200',
  },
  rose: {
    bg: 'bg-rose-50/70',
    iconText: 'text-rose-600',
    border: 'hover:border-rose-200',
  },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorVariant = 'indigo',
}: StatCardProps) {
  const styles = colorStyles[colorVariant]

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md ${styles.border}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <div className={`flex size-10 items-center justify-center rounded-xl ${styles.bg} ${styles.iconText}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  )
}
