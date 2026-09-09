import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Database,
  FileEdit,
  Plus,
  Printer,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { StatCard } from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PaperPreviewModal } from '../../components/common/PaperPreviewModal'
import type { QuestionPaper } from '../../types/models'

export function FacultyDashboardPage() {
  const { user } = useAuth()
  const { papers, courses, examCycles, questions } = useData()

  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null)

  const facultyPapers = papers.filter((p) => p.facultyId === user?.id || true)
  const draftCount = facultyPapers.filter((p) => p.status === 'Draft').length
  const submittedCount = facultyPapers.filter((p) => p.status === 'Submitted' || p.status === 'Under Review').length
  const revisionCount = facultyPapers.filter((p) => p.status === 'Revision Requested').length
  const approvedCount = facultyPapers.filter((p) => p.status === 'Approved').length

  const activeExam = examCycles.find((e) => e.status === 'Active') || examCycles[0]

  return (
    <AppLayout role="faculty" pageTitle="Faculty Dashboard">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-0.5 text-xs font-bold text-indigo-200">
                Department of {user?.department || 'Computer Science'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-sm text-indigo-200/90 max-w-xl">
              Manage your assigned course blueprints, author examination papers, and track approvals from the Controller of Examinations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              to={ROUTES.FACULTY_QUESTION_BANK}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
            >
              <Database className="size-4" />
              Question Bank
            </Button>
            <Button
              variant="primary"
              to={ROUTES.FACULTY_PAPER_NEW}
              className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-md"
            >
              <Plus className="size-4 text-indigo-600" />
              Author Question Paper
            </Button>
          </div>
        </div>

        {/* Active Exam Submission Deadline Alert */}
        {activeExam && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Submission Deadline Approaching
                  </span>
                  <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                    {activeExam.name}
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  Question papers must be finalized and submitted to Exam Cell before{' '}
                  <span className="text-amber-900 font-bold underline">
                    {activeExam.submissionDeadline}
                  </span>
                </p>
              </div>
            </div>

            <Button
              to={ROUTES.FACULTY_PAPER_NEW}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs shrink-0 self-start sm:self-auto"
            >
              Submit Draft Paper
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Courses"
            value={courses.length}
            subtitle="Current Semester"
            icon={<BookOpen className="size-5" />}
            colorVariant="indigo"
          />
          <StatCard
            title="Draft Papers"
            value={draftCount}
            subtitle="In progress authoring"
            icon={<FileEdit className="size-5" />}
            colorVariant="amber"
          />
          <StatCard
            title="Under Review"
            value={submittedCount + revisionCount}
            subtitle={revisionCount > 0 ? `${revisionCount} Revision Requested` : 'Awaiting CoE Approval'}
            icon={<Clock className="size-5" />}
            colorVariant="purple"
          />
          <StatCard
            title="Approved Papers"
            value={approvedCount}
            subtitle="Ready for Examination"
            icon={<CheckCircle2 className="size-5" />}
            colorVariant="emerald"
          />
        </div>

        {/* Two-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Assigned Courses</h3>
              <Link
                to={ROUTES.FACULTY_SYLLABUS}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                View Syllabus <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition-all hover:border-slate-200 hover:shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Sem {course.semester} &bull; {course.credits} Credits
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-slate-900 leading-snug">
                    {course.name}
                  </h4>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-xs text-slate-500 font-medium">
                      {course.totalUnits} Units &bull; {course.courseOutcomes.length} COs
                    </span>
                    <Button
                      to={ROUTES.FACULTY_PAPER_NEW}
                      variant="outline"
                      className="text-[11px] py-1 px-2.5 h-auto bg-white"
                    >
                      New Paper
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">My Question Papers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Authoring status and reviews</p>
              </div>
              <Link
                to={ROUTES.FACULTY_PAPERS}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                View All ({papers.length}) <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {facultyPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="rounded-2xl border border-slate-200/90 p-4 transition-all hover:border-indigo-200 hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {paper.courseCode}
                      </span>
                      <StatusBadge status={paper.status} />
                      {paper.setLabel && (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {paper.setLabel}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {paper.title}
                    </h4>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span>{paper.examName}</span>
                      <span>&bull;</span>
                      <span>Max: <b>{paper.maxMarks} Marks</b></span>
                      <span>&bull;</span>
                      <span>{paper.durationMinutes} Mins</span>
                    </div>

                    {paper.status === 'Revision Requested' && paper.reviewComments.length > 0 && (
                      <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-900">
                        <span className="font-bold">Exam Cell Note: </span>
                        {paper.reviewComments[0].comment}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      variant="outline"
                      onClick={() => setPreviewPaper(paper)}
                      className="text-xs px-3 py-1.5 h-auto bg-slate-50"
                      title="Open University Print Preview"
                    >
                      <Printer className="size-3.5" />
                      Preview
                    </Button>

                    <Button
                      to={`/faculty/papers/${paper.id}/edit`}
                      variant="primary"
                      className="text-xs px-3 py-1.5 h-auto"
                    >
                      <FileEdit className="size-3.5" />
                      Edit Paper
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Need inspiration for question design?</h4>
              <p className="text-xs text-slate-600">
                Explore the Question Bank with Bloom's taxonomy tagged questions or use the AI authoring assistant.
              </p>
            </div>
          </div>
          <Button to={ROUTES.FACULTY_QUESTION_BANK} className="text-xs shrink-0">
            Open Question Bank ({questions.length} Items)
          </Button>
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
