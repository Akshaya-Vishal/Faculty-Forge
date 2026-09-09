import { useState } from 'react'
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Eye,
  EyeOff,
  MessageSquare,
  Printer,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { BloomBadge, StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { BloomTaxonomyChart } from '../../components/common/BloomTaxonomyChart'
import { PaperPreviewModal } from '../../components/common/PaperPreviewModal'
import type { QuestionPaper } from '../../types/models'

export function AdminReviewsPage() {
  const { papers, approvePaper, requestPaperRevision, rejectPaper } = useData()
  const { showToast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPaperId, setSelectedPaperId] = useState<string>(
    papers.find((p) => p.status === 'Submitted')?.id || papers[0]?.id || '',
  )
  const [isAnonymized, setIsAnonymized] = useState(false)
  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null)

  // Revision Modal State
  const [revisionModalOpen, setRevisionModalOpen] = useState(false)
  const [revisionComment, setRevisionComment] = useState('')
  const [sectionRef, setSectionRef] = useState('General')

  const selectedPaper = papers.find((p) => p.id === selectedPaperId) || papers[0]

  const resolveInternalTypeLabel = (paper: QuestionPaper) =>
    paper.internalType ||
    (paper.examName?.includes('Internal 2')
      ? 'Internal 2'
      : paper.examName?.includes('Internal 1')
        ? 'Internal 1'
        : 'Internal 1')

  const groupedSubmissions = Array.from(
    papers.reduce((map, paper) => {
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

  const handleApprove = () => {
    if (!selectedPaper) return
    approvePaper(
      selectedPaper.id,
      'Approved by Controller of Examinations. Blueprint verified for autonomous examination.',
    )
    showToast(
      'success',
      'Question Paper Approved',
      `${selectedPaper.courseCode} has been officially approved and stamped.`,
    )
  }

  const handleRequestRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPaper || !revisionComment.trim()) return

    requestPaperRevision(selectedPaper.id, revisionComment, sectionRef)
    showToast(
      'warning',
      'Revision Requested',
      `Feedback dispatched to ${selectedPaper.facultyName} for ${selectedPaper.courseCode}.`,
    )
    setRevisionModalOpen(false)
    setRevisionComment('')
  }

  const handleReject = () => {
    if (!selectedPaper) return
    const reason = prompt('Please enter the reason for paper rejection:')
    if (reason) {
      rejectPaper(selectedPaper.id, reason)
      showToast('error', 'Paper Rejected', `Rejection notice dispatched for ${selectedPaper.courseCode}.`)
    }
  }

  const totalCalculatedMarks =
    selectedPaper?.sections.reduce(
      (acc, s) => acc + s.questions.reduce((qAcc, q) => qAcc + q.marks, 0),
      0,
    ) || 0

  return (
    <AppLayout role="admin" pageTitle="Review Workbench">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Question Paper Review Workbench</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Inspect submitted blueprints, verify Bloom's balance, and certify examination papers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAnonymized(!isAnonymized)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                isAnonymized
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isAnonymized ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {isAnonymized ? 'Blind Review Active' : 'Enable Blind Review'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Submissions Queue ({papers.length})
              </h3>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search submissions..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8.5 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {groupedSubmissions.map(({ groupName, papers: groupItems }) => (
                <div key={groupName} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <span className="rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                      {groupName}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">{groupItems.length}</span>
                  </div>

                  {groupItems.map((paper) => {
                    const isSelected = paper.id === selectedPaper?.id
                    return (
                      <div
                        key={paper.id}
                        onClick={() => setSelectedPaperId(paper.id)}
                        className={`rounded-xl p-3.5 border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700">
                            {paper.courseCode}
                          </span>
                          <StatusBadge status={paper.status} />
                        </div>
                        <h4 className="mt-1 text-xs font-bold text-slate-900 truncate">
                          {paper.title}
                        </h4>
                        <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-500">
                          <span>{resolveInternalTypeLabel(paper)}</span>
                          <span>{paper.setLabel || 'Set A'}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 truncate">
                          {isAnonymized ? 'Faculty Coordinator [Hidden]' : paper.facultyName}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {selectedPaper ? (
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
                      {selectedPaper.courseCode}
                    </span>
                    <StatusBadge status={selectedPaper.status} />
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                      {selectedPaper.setLabel || 'Set A'}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                    {selectedPaper.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Faculty Coordinator:{' '}
                    <b className="text-slate-800">
                      {isAnonymized ? 'Blind Mode (Identity Hidden)' : selectedPaper.facultyName}
                    </b>{' '}
                    &bull; Dept: {selectedPaper.facultyDept}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewPaper(selectedPaper)}
                    className="text-xs gap-1.5"
                  >
                    <Printer className="size-4" />
                    University Print Layout
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-indigo-600" />
                  Automated Blueprint Compliance Checklist
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-white border border-slate-200 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block font-medium">Marks Verification</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {totalCalculatedMarks} / {selectedPaper.maxMarks} M
                      </span>
                    </div>
                    {totalCalculatedMarks === selectedPaper.maxMarks ? (
                      <CheckCircle2 className="size-6 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="size-6 text-amber-500" />
                    )}
                  </div>

                  <div className="rounded-xl bg-white border border-slate-200 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block font-medium">Syllabus Coverage</span>
                      <span className="font-bold text-slate-900 text-sm">All 5 Units</span>
                    </div>
                    <CheckCircle2 className="size-6 text-emerald-500" />
                  </div>

                  <div className="rounded-xl bg-white border border-slate-200 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block font-medium">Duration Allocated</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedPaper.durationMinutes} Minutes
                      </span>
                    </div>
                    <CheckCircle2 className="size-6 text-emerald-500" />
                  </div>
                </div>

                <div className="pt-2">
                  <BloomTaxonomyChart paper={selectedPaper} showGuidelineNotice={false} />
                </div>
              </div>

              {selectedPaper.reviewComments.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                  <span className="text-xs font-bold uppercase text-amber-900 block">
                    Review History / Feedback Logs:
                  </span>
                  {selectedPaper.reviewComments.map((rc) => (
                    <div key={rc.id} className="text-xs text-amber-950 border-t border-amber-200/60 pt-2">
                      <div className="flex items-center justify-between font-bold">
                        <span>{rc.authorName}</span>
                        <span className="text-[10px] text-amber-800 font-normal">
                          {new Date(rc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-0.5">{rc.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Question Content Scrutiny</h4>
                {selectedPaper.sections.map((section) => (
                  <div
                    key={section.id}
                    className="rounded-xl border border-slate-200 p-4 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-xs uppercase text-indigo-700">
                        {section.title}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        Total: {section.totalMarks} Marks
                      </span>
                    </div>

                    <div className="space-y-3">
                      {section.questions.map((q) => (
                        <div
                          key={q.id}
                          className="rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded">
                                Q{q.questionNumber}
                              </span>
                              <span className="text-xs font-bold text-slate-900">{q.marks} Marks</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                                {q.courseOutcome}
                              </span>
                              <BloomBadge level={q.knowledgeLevel || q.bloomLevel || 'K1'} />
                            </div>
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed font-serif">{q.text}</p>
                          {q.isChoice && q.orQuestion && (
                            <div className="pt-2 border-t border-dashed border-slate-300">
                              <span className="text-[10px] font-bold text-amber-800 block uppercase">
                                --- OR Alternative ---
                              </span>
                              <p className="text-xs text-slate-700 italic font-serif">
                                {q.orQuestion.text}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  <XCircle className="size-4" />
                  Reject Paper
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setRevisionModalOpen(true)}
                    className="text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200"
                  >
                    <MessageSquare className="size-4" />
                    Request Revisions
                  </Button>

                  <Button
                    variant="primary"
                    onClick={handleApprove}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 font-bold shadow-md shadow-emerald-600/20"
                  >
                    <Award className="size-4" />
                    Certify & Approve Question Paper
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        isOpen={revisionModalOpen}
        onClose={() => setRevisionModalOpen(false)}
        title="Request Revisions from Faculty Author"
        description="Provide actionable constructive feedback for syllabus coverage or Bloom's taxonomy adjustment."
        maxWidth="lg"
      >
        <form onSubmit={handleRequestRevisionSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Section Reference</label>
            <select
              value={sectionRef}
              onChange={(e) => setSectionRef(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold"
            >
              <option value="General">General Paper Structure</option>
              <option value="Part A">Part A (Short Questions)</option>
              <option value="Part B">Part B (Descriptive / Problems)</option>
              <option value="Part C">Part C (Case Study / Design)</option>
              <option value="Bloom Balance">Bloom's Taxonomy Cognitive Balance</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Feedback Notes for Faculty</label>
            <textarea
              rows={4}
              required
              value={revisionComment}
              onChange={(e) => setRevisionComment(e.target.value)}
              placeholder="e.g. Please replace Q8 with a problem requiring higher-order analysis (L4) from Unit 3..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setRevisionModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="text-xs bg-amber-600 hover:bg-amber-700">
              Dispatch Revision Notice
            </Button>
          </div>
        </form>
      </Modal>

      <PaperPreviewModal
        paper={previewPaper}
        isOpen={previewPaper !== null}
        onClose={() => setPreviewPaper(null)}
      />
    </AppLayout>
  )
}
