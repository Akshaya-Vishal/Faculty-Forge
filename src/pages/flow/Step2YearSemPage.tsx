import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DEPARTMENTS_CATALOG } from '../../data/mockData'
import { AppLayout } from '../../components/layout/AppLayout'
import { StepBreadcrumbs } from '../../components/layout/StepBreadcrumbs'

interface YearSemOption {
  year: number
  yearLabel: string
  semesters: {
    semNumber: number
    label: string
    short: string
    type: 'Odd' | 'Even'
  }[]
}

const YEAR_SEM_STRUCTURE: YearSemOption[] = [
  {
    year: 1,
    yearLabel: '1st Year (Freshman)',
    semesters: [
      { semNumber: 1, label: 'Semester 1 (Odd)', short: 'Sem 1', type: 'Odd' },
      { semNumber: 2, label: 'Semester 2 (Even)', short: 'Sem 2', type: 'Even' },
    ],
  },
  {
    year: 2,
    yearLabel: '2nd Year (Sophomore)',
    semesters: [
      { semNumber: 3, label: 'Semester 3 (Odd)', short: 'Sem 3', type: 'Odd' },
      { semNumber: 4, label: 'Semester 4 (Even)', short: 'Sem 4', type: 'Even' },
    ],
  },
  {
    year: 3,
    yearLabel: '3rd Year (Junior)',
    semesters: [
      { semNumber: 5, label: 'Semester 5 (Odd)', short: 'Sem 5', type: 'Odd' },
      { semNumber: 6, label: 'Semester 6 (Even)', short: 'Sem 6', type: 'Even' },
    ],
  },
  {
    year: 4,
    yearLabel: '4th Year (Senior)',
    semesters: [
      { semNumber: 7, label: 'Semester 7 (Odd)', short: 'Sem 7', type: 'Odd' },
      { semNumber: 8, label: 'Semester 8 (Even)', short: 'Sem 8', type: 'Even' },
    ],
  },
]

export function Step2YearSemPage() {
  const { dept } = useParams<{ dept: string }>()
  const navigate = useNavigate()
  const [selectedYear, setSelectedYear] = useState(1)

  const selectedDept =
    DEPARTMENTS_CATALOG.find((d) => d.code === dept) || DEPARTMENTS_CATALOG[1]

  const handleSelectSemester = (semNumber: number) => {
    navigate(`/create/${selectedDept.code}/${semNumber}`)
  }

  return (
    <AppLayout role="faculty" pageTitle="Step 2: Year & Semester">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Step Indicator */}
        <StepBreadcrumbs currentStep={2} deptCode={selectedDept.code} />

        <div className="border-b border-slate-200 pb-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-indigo-600">Step 2 of 6</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Choose a year
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Select the academic year for {selectedDept.code}.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {YEAR_SEM_STRUCTURE.map((yearGroup) => (
            <button
              key={yearGroup.year}
              type="button"
              onClick={() => setSelectedYear(yearGroup.year)}
              className={`rounded-xl border px-4 py-4 text-left transition-colors ${
                selectedYear === yearGroup.year
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
              }`}
            >
              <span className="block text-xs font-bold uppercase tracking-wider opacity-70">Year {yearGroup.year}</span>
              <span className="mt-1 block text-sm font-bold">{yearGroup.yearLabel.split(' (')[0]}</span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-bold text-slate-900">Select a semester</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {YEAR_SEM_STRUCTURE.find((yearGroup) => yearGroup.year === selectedYear)?.semesters.map((sem) => (
              <button
                key={sem.semNumber}
                type="button"
                onClick={() => handleSelectSemester(sem.semNumber)}
                className="group flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:border-indigo-500 hover:bg-indigo-50"
              >
                <span>
                  <span className="block text-sm font-bold text-slate-900">{sem.label}</span>
                  <span className="text-xs text-slate-500">{sem.type} semester</span>
                </span>
                <ArrowRight className="size-4 text-slate-400 group-hover:text-indigo-600" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
