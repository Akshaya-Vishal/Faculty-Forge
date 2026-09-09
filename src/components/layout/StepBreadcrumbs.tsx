import { Link } from 'react-router-dom'
import { ChevronRight, Building2, Calendar, BookOpen, FileCheck, FileEdit, FolderCheck } from 'lucide-react'

interface StepBreadcrumbsProps {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6
  deptCode?: string
  semNumber?: number
  courseId?: string
  courseCode?: string
  examType?: string
}

export function StepBreadcrumbs({
  currentStep,
  deptCode,
  semNumber,
  courseId,
  courseCode,
  examType,
}: StepBreadcrumbsProps) {
  const steps = [
    {
      step: 1,
      name: 'Department',
      short: 'Dept',
      icon: <Building2 className="size-3.5" />,
      to: '/create',
      value: deptCode,
    },
    {
      step: 2,
      name: 'Year & Sem',
      short: 'Sem',
      icon: <Calendar className="size-3.5" />,
      to: deptCode ? `/create/${deptCode}` : undefined,
      value: semNumber ? `Sem ${semNumber}` : undefined,
    },
    {
      step: 3,
      name: 'Subject',
      short: 'Subject',
      icon: <BookOpen className="size-3.5" />,
      to: deptCode && semNumber ? `/create/${deptCode}/${semNumber}` : undefined,
      value: courseCode,
    },
    {
      step: 4,
      name: 'Exam Type',
      short: 'Exam',
      icon: <FileCheck className="size-3.5" />,
      to: deptCode && semNumber && courseId ? `/create/${deptCode}/${semNumber}/${courseId}` : undefined,
      value: examType,
    },
    {
      step: 5,
      name: 'Q/P Builder',
      short: 'Builder',
      icon: <FileEdit className="size-3.5" />,
      to: undefined,
      value: undefined,
    },
    {
      step: 6,
      name: 'Paper Hub',
      short: 'Hub',
      icon: <FolderCheck className="size-3.5" />,
      to: '/hub',
      value: undefined,
    },
  ]

  return (
    <div className="w-full overflow-x-auto pb-2 pt-1 scrollbar-none">
      <nav aria-label="Step progress" className="flex items-center gap-1.5 min-w-max text-xs">
        {steps.map((s, idx) => {
          const isActive = currentStep === s.step
          const isCompleted = currentStep > s.step
          const isAccessible = s.to !== undefined && (isCompleted || isActive)

          const label = s.value ? `${s.short}: ${s.value}` : s.name

          const badgeClasses = isActive
            ? 'bg-indigo-600 text-white font-bold'
            : isCompleted
            ? 'text-indigo-700 hover:bg-indigo-50 font-semibold'
            : 'text-slate-400 font-medium'

          return (
            <div key={s.step} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="size-3.5 text-slate-300 shrink-0" />}

              {isAccessible && s.to ? (
                <Link
                  to={s.to}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors text-xs ${badgeClasses}`}
                >
                  <span className="flex size-4 items-center justify-center rounded-full text-[10px] font-bold shrink-0">
                    {isCompleted ? '✓' : s.step}
                  </span>
                  <span>{label}</span>
                </Link>
              ) : (
                <div
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${badgeClasses}`}
                >
                  <span className="flex size-4 items-center justify-center rounded-full text-[10px] font-bold shrink-0">
                    {isCompleted ? '✓' : s.step}
                  </span>
                  <span>{label}</span>
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
