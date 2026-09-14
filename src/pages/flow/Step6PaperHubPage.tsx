import { useState } from 'react'
import {
  Search,
  Download,
  Eye,
  Plus,
  FileCheck,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { DEPARTMENTS_CATALOG } from '../../data/mockData'
import { AppLayout } from '../../components/layout/AppLayout'
import { StepBreadcrumbs } from '../../components/layout/StepBreadcrumbs'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PaperPreviewModal } from '../../components/common/PaperPreviewModal'
import type { QuestionPaper } from '../../types/models'

export function Step6PaperHubPage() {
  const { papers } = useData()
  const { role } = useAuth()

  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [selectedExam, setSelectedExam] = useState<string>('all')
  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null)

  const filteredPapers = papers.filter((p) => {
    if (selectedDept !== 'all' && p.departmentCode !== selectedDept) return false
    if (selectedExam !== 'all' && p.internalType !== selectedExam) return false

    if (search.trim()) {
      const q = search.toLowerCase()
      const match =
        p.title.toLowerCase().includes(q) ||
        p.courseCode.toLowerCase().includes(q) ||
        p.courseName.toLowerCase().includes(q) ||
        p.facultyName.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  return (
    <AppLayout role={role} pageTitle="Question Paper Hub (Open to All)">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Step Indicator */}
        <StepBreadcrumbs currentStep={6} />

        {/* Hero Banner */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
                Institutional Paper Hub &bull; Open Access
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Question Paper Hub & Repository
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              All submitted and approved autonomous question papers across departments are published here. View and download official PDF formats anytime.
            </p>
          </div>

          {role === 'faculty' && (
            <Button
              to="/create"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs gap-2 py-3 px-5 shadow-lg shadow-indigo-600/30 shrink-0 self-start sm:self-auto"
            >
              <Plus className="size-4" />
              Create New Question Paper
            </Button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Course Code, Title, Faculty Name..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-9.5 pr-4 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS_CATALOG.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code} - {d.shortName}
                </option>
              ))}
            </select>

            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Assessments</option>
              <option value="Internal 1">Internal Assessment 1</option>
              <option value="Internal 2">Internal Assessment 2</option>
              <option value="Model Exam">Model Examination</option>
            </select>
          </div>
        </div>

        {/* Papers Grid */}
        {filteredPapers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <FileCheck className="size-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">No question papers found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No submitted question papers match your filter criteria. Be the first to create one!
            </p>
            <Button to="/create" className="text-xs bg-indigo-600 font-bold">
              Start Question Paper
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPapers.map((paper) => {
              const totalQ = paper.sections.reduce((acc, s) => acc + s.questions.length, 0)
              return (
                <div
                  key={paper.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-indigo-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                          {paper.courseCode}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {paper.internalType || 'Internal 1'}
                        </span>
                      </div>
                      <StatusBadge status={paper.status} />
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                        {paper.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {paper.courseName} &bull; {paper.semester} &bull; {totalQ} Questions
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium text-slate-600">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Marks & Time:</span>
                        <span className="font-bold text-slate-900">{paper.maxMarks} Marks ({paper.durationMinutes} mins)</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Faculty Coordinator:</span>
                        <span className="font-bold text-slate-900">{paper.facultyName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons on every card */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPreviewPaper(paper)}
                      className="text-xs gap-1.5 font-bold flex-1"
                    >
                      <Eye className="size-3.5" />
                      View Paper
                    </Button>

                    <Button
                      variant="primary"
                      onClick={() => setPreviewPaper(paper)}
                      className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-500 font-bold flex-1 shadow-xs"
                    >
                      <Download className="size-3.5" />
                      Download Word
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Printable Preview Modal */}
      <PaperPreviewModal
        paper={previewPaper}
        isOpen={previewPaper !== null}
        onClose={() => setPreviewPaper(null)}
      />
    </AppLayout>
  )
}
