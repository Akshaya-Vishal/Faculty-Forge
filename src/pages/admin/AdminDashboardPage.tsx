import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Printer,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useData } from '../../context/DataContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { StatCard } from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PaperPreviewModal } from '../../components/common/PaperPreviewModal'
import type { QuestionPaper } from '../../types/models'

export function AdminDashboardPage() {
  const { papers, departments, examCycles } = useData()

  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null)

  const submittedPapers = papers.filter((p) => p.status === 'Submitted' || p.status === 'Under Review')
  const approvedPapers = papers.filter((p) => p.status === 'Approved')
  const revisionPapers = papers.filter((p) => p.status === 'Revision Requested')
  const totalRequired = 48

  const activeExam = examCycles.find((e) => e.status === 'Active') || examCycles[0]

  return (
    <AppLayout role="admin" pageTitle="Examination Cell Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-0.5 text-xs font-bold text-indigo-300">
                Office of Controller of Examinations (CoE)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Institutional Examination Dashboard
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Monitor university question paper submissions, conduct blueprint compliance reviews, and generate confidential examination sets.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              to={ROUTES.ADMIN_PAPER_GENERATOR}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
            >
              <Sparkles className="size-4" />
              Auto Set Generator
            </Button>
            <Button
              variant="primary"
              to={ROUTES.ADMIN_REVIEWS}
              className="bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shadow-md"
            >
              <FileCheck className="size-4" />
              Review Workbench ({submittedPapers.length})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Papers Required"
            value={totalRequired}
            subtitle="Across 5 Engineering Departments"
            icon={<FileText className="size-5" />}
            colorVariant="indigo"
          />
          <StatCard
            title="Pending Review"
            value={submittedPapers.length}
            subtitle="Action required by CoE"
            icon={<Clock className="size-5" />}
            colorVariant="amber"
          />
          <StatCard
            title="Revisions Requested"
            value={revisionPapers.length}
            subtitle="Sent back to course faculty"
            icon={<AlertTriangle className="size-5" />}
            colorVariant="rose"
          />
          <StatCard
            title="Approved & Certified"
            value={approvedPapers.length}
            subtitle="Ready for print & dispatch"
            icon={<CheckCircle2 className="size-5" />}
            colorVariant="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Papers Awaiting CoE Review</h3>
                <p className="text-xs text-slate-500 mt-0.5">Scrutinize question papers against syllabus blueprint</p>
              </div>
              <Link
                to={ROUTES.ADMIN_REVIEWS}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                Open Workbench ({submittedPapers.length}) <ArrowRight className="size-3" />
              </Link>
            </div>

            {submittedPapers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
                <CheckCircle2 className="size-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">All submissions up to date!</p>
                <p className="text-xs text-slate-500">No question papers currently pending review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submittedPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="rounded-2xl border border-slate-200/90 p-4 transition-all hover:border-indigo-200 hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {paper.courseCode}
                        </span>
                        <StatusBadge status={paper.status} />
                        <span className="text-[11px] font-semibold text-slate-500">
                          {paper.setLabel || 'Set A'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {paper.title}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span>Faculty: <b>{paper.facultyName}</b></span>
                        <span>&bull;</span>
                        <span>Dept: {paper.facultyDept}</span>
                        <span>&bull;</span>
                        <span>Submitted: {new Date(paper.submittedAt || paper.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        variant="outline"
                        onClick={() => setPreviewPaper(paper)}
                        className="text-xs px-3 py-1.5 h-auto bg-slate-50"
                      >
                        <Printer className="size-3.5" />
                        Preview
                      </Button>

                      <Button
                        to={ROUTES.ADMIN_REVIEWS}
                        variant="primary"
                        className="text-xs px-3.5 py-1.5 h-auto bg-indigo-600"
                      >
                        <FileCheck className="size-3.5" />
                        Review Paper
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Department Compliance</h3>
              <Link
                to={ROUTES.ADMIN_REPORTS}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                Full Audit <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {departments.map((dept) => {
                const completionPct = Math.round((dept.approvedPapers / dept.totalCourses) * 100)
                return (
                  <div key={dept.department} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate max-w-[180px]">
                        {dept.department}
                      </span>
                      <span className="font-bold text-indigo-600">
                        {dept.approvedPapers}/{dept.totalCourses} ({completionPct}%)
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="rounded-xl bg-slate-50 p-3 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Exam Cycle:</span>
                <span className="font-bold text-slate-900">{activeExam?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaperPreviewModal
        paper={previewPaper}
        isOpen={previewPaper !== null}
        onClose={() => setPreviewPaper(null)}
      />
    </AppLayout>
  )
}
