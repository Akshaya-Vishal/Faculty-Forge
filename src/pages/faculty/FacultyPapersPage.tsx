import { useState } from 'react'
import {
  Copy,
  FileEdit,
  FilePlus,
  FileText,
  MoreVertical,
  Printer,
  Search,
  Send,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { PaperPreviewModal } from '../../components/common/PaperPreviewModal'
import type { QuestionPaper } from '../../types/models'

export function FacultyPapersPage() {
  const { papers, deletePaper, submitPaper, duplicatePaper } = useData()
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const visiblePapers = user?.role === 'admin' ? papers : papers.filter((paper) => paper.facultyId === user?.id)

  const [activeTab, setActiveTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  const tabOptions = [
    { id: 'all', label: 'All Papers', count: visiblePapers.length },
    {
      id: 'Draft',
      label: 'Drafts',
      count: visiblePapers.filter((p) => p.status === 'Draft').length,
    },
    {
      id: 'Submitted',
      label: 'Submitted / In Review',
      count: visiblePapers.filter((p) => p.status === 'Submitted' || p.status === 'Under Review').length,
    },
    {
      id: 'Revision Requested',
      label: 'Needs Revision',
      count: visiblePapers.filter((p) => p.status === 'Revision Requested').length,
    },
    {
      id: 'Approved',
      label: 'Approved',
      count: visiblePapers.filter((p) => p.status === 'Approved').length,
    },
  ]

  const resolveInternalTypeLabel = (paper: QuestionPaper) =>
    paper.internalType ||
    (paper.examName?.includes('Internal 2')
      ? 'Internal 2'
      : paper.examName?.includes('Internal 1')
        ? 'Internal 1'
        : 'Internal 1')

  const filteredPapers = visiblePapers.filter((paper) => {
    if (activeTab === 'Submitted') {
      if (paper.status !== 'Submitted' && paper.status !== 'Under Review') return false
    } else if (activeTab !== 'all') {
      if (paper.status !== activeTab) return false
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match =
        paper.title.toLowerCase().includes(q) ||
        paper.courseCode.toLowerCase().includes(q) ||
        paper.courseName.toLowerCase().includes(q) ||
        paper.examName.toLowerCase().includes(q) ||
        resolveInternalTypeLabel(paper).toLowerCase().includes(q)
      if (!match) return false
    }

    return true
  })

  const groupedPapers = Array.from(
    filteredPapers.reduce((map, paper) => {
      const key = resolveInternalTypeLabel(paper)
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(paper)
      return map
    }, new Map<string, QuestionPaper[]>()),
  ).map(([groupName, groupItems]) => ({
    groupName,
    papers: groupItems.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  }))

  const handleSubmitPaper = (paper: QuestionPaper) => {
    submitPaper(paper.id)
    showToast(
      'success',
      'Paper Submitted Successfully!',
      `${paper.courseCode} question paper has been sent to the Controller of Examinations.`,
    )
  }

  const handleDuplicate = (id: string) => {
    const dup = duplicatePaper(id)
    if (dup) {
      showToast('info', 'Paper Duplicated', `Created a copy of ${dup.title}`)
      navigate(`/faculty/papers/${dup.id}/edit`)
    }
  }

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deletePaper(id)
      showToast('info', 'Paper Deleted', `Removed ${title} from drafts.`)
    }
  }

  return (
    <AppLayout role="faculty" pageTitle="My Question Papers">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Question Papers</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Draft, validate blueprints, and submit examination question papers.
            </p>
          </div>

          <Button to={ROUTES.FACULTY_PAPER_NEW} className="gap-2 shrink-0">
            <FilePlus className="size-4" />
            Author New Question Paper
          </Button>
        </div>

        <Tabs tabs={tabOptions} activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course code, title, exam..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9.5 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
            />
          </div>

          <p className="text-xs font-semibold text-slate-500 self-end sm:self-auto">
            Showing <b className="text-slate-900">{filteredPapers.length}</b> papers
          </p>
        </div>

        {filteredPapers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <FileText className="size-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No question papers found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search criteria or switch to another filter tab.'
                : 'Get started by creating your first university question paper blueprint.'}
            </p>
            <div className="mt-5">
              <Button to={ROUTES.FACULTY_PAPER_NEW} variant="primary" className="text-xs">
                Author Question Paper
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedPapers.map(({ groupName, papers: groupItems }) => (
              <div key={groupName} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-xs font-bold text-violet-700">
                    {groupName}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{groupItems.length} paper{groupItems.length > 1 ? 's' : ''}</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {groupItems.map((paper) => {
                    const totalQuestions = paper.sections.reduce(
                      (acc, sec) => acc + sec.questions.length,
                      0,
                    )

                    return (
                      <div
                        key={paper.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-200 hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                      >
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                              {paper.courseCode}
                            </span>
                            <span className="text-xs font-semibold text-slate-600">
                              {paper.courseName}
                            </span>
                            <span className="rounded bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700 border border-violet-200">
                              {resolveInternalTypeLabel(paper)}
                            </span>
                            <StatusBadge status={paper.status} />
                            {paper.setLabel && (
                              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                                {paper.setLabel}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-slate-900">
                            {paper.title}
                          </h3>

                          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                            <span>Exam: <b>{paper.examName}</b></span>
                            <span>&bull;</span>
                            <span>Type: <b>{resolveInternalTypeLabel(paper)}</b></span>
                            <span>&bull;</span>
                            <span>Marks: <b>{paper.maxMarks} M</b></span>
                            <span>&bull;</span>
                            <span>Duration: <b>{paper.durationMinutes} mins</b></span>
                            <span>&bull;</span>
                            <span>{paper.sections.length} Sections ({totalQuestions} Questions)</span>
                            <span>&bull;</span>
                            <span>Updated: {new Date(paper.updatedAt).toLocaleDateString()}</span>
                          </div>

                          {paper.status === 'Revision Requested' && paper.reviewComments.length > 0 && (
                            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                              <span className="font-bold block mb-0.5">Examination Cell Revision Note:</span>
                              {paper.reviewComments[0].comment}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end lg:self-center border-t lg:border-t-0 pt-3 lg:pt-0 w-full lg:w-auto justify-between lg:justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setPreviewPaper(paper)}
                            className="text-xs px-3 py-1.5 h-auto bg-slate-50 hover:bg-slate-100"
                            title="Open University Print Preview"
                          >
                            <Printer className="size-3.5" />
                            Preview
                          </Button>

                          <Button
                            to={`/faculty/papers/${paper.id}/edit`}
                            variant="outline"
                            className="text-xs px-3 py-1.5 h-auto"
                          >
                            <FileEdit className="size-3.5" />
                            Edit
                          </Button>

                          {paper.status === 'Draft' || paper.status === 'Revision Requested' ? (
                            <Button
                              variant="primary"
                              onClick={() => handleSubmitPaper(paper)}
                              className="text-xs px-3.5 py-1.5 h-auto bg-indigo-600 hover:bg-indigo-700"
                            >
                              <Send className="size-3.5" />
                              Submit
                            </Button>
                          ) : null}

                          <div className="relative">
                            <button
                              onClick={() =>
                                setActionMenuOpen(actionMenuOpen === paper.id ? null : paper.id)
                              }
                              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                              aria-label="More actions"
                            >
                              <MoreVertical className="size-4" />
                            </button>

                            {actionMenuOpen === paper.id && (
                              <div className="absolute right-0 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-20">
                                <button
                                  onClick={() => {
                                    setActionMenuOpen(null)
                                    handleDuplicate(paper.id)
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                                >
                                  <Copy className="size-3.5 text-slate-400" />
                                  Duplicate Paper
                                </button>
                                {paper.status === 'Draft' && (
                                  <button
                                    onClick={() => {
                                      setActionMenuOpen(null)
                                      handleDelete(paper.id, paper.title)
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                                  >
                                    <Trash2 className="size-3.5" />
                                    Delete Draft
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PaperPreviewModal
        paper={previewPaper}
        isOpen={previewPaper !== null}
        onClose={() => setPreviewPaper(null)}
      />
    </AppLayout>
  )
}
