import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Brain,
  Laptop,
  Globe,
  Cpu,
  Zap,
  Wrench,
  Building2,
  ArrowRight,
  Search,
} from 'lucide-react'
import { DEPARTMENTS_CATALOG } from '../../data/mockData'
import { AppLayout } from '../../components/layout/AppLayout'
import { StepBreadcrumbs } from '../../components/layout/StepBreadcrumbs'

const iconMap: Record<string, React.ReactNode> = {
  Brain: <Brain className="size-6 text-white" />,
  Laptop: <Laptop className="size-6 text-white" />,
  Globe: <Globe className="size-6 text-white" />,
  Cpu: <Cpu className="size-6 text-white" />,
  Zap: <Zap className="size-6 text-white" />,
  Wrench: <Wrench className="size-6 text-white" />,
  Building2: <Building2 className="size-6 text-white" />,
}

export function Step1DepartmentPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filteredDepts = DEPARTMENTS_CATALOG.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.shortName.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelectDept = (deptCode: string) => {
    navigate(`/create/${deptCode}`)
  }

  return (
    <AppLayout role="faculty" pageTitle="Step 1: Select Department">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Step Indicator */}
        <StepBreadcrumbs currentStep={1} />

        {/* Hero Header */}
        <div className="border-b border-slate-200 pb-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-indigo-600">Step 1 of 6</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Select a department
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose the branch for this question paper.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search department (e.g. ADS, CSE, IT, ECE, Mechanical)..."
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>

        {/* Department Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDepts.map((dept) => (
            <div
              key={dept.code}
              onClick={() => handleSelectDept(dept.code)}
              className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-colors hover:border-indigo-400 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`size-11 rounded-lg bg-gradient-to-tr ${dept.color} flex shrink-0 items-center justify-center`}>
                  {iconMap[dept.icon] || <Laptop className="size-6 text-white" />}
                </div>
                <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  {dept.code}
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {dept.totalCourses} Curricular Subjects &bull; {dept.activeFaculty} Faculty Members
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-indigo-600">
                <span>Continue</span>
                <div className="flex size-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ArrowRight className="size-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  )
}
