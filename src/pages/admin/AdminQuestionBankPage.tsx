import { useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { BloomBadge, DifficultyBadge } from '../../components/ui/Badge'

export function AdminQuestionBankPage() {
  const { questions, courses, deleteQuestion } = useData()
  const { showToast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [selectedBloom, setSelectedBloom] = useState('all')

  const filtered = questions.filter((q) => {
    if (selectedCourse !== 'all' && q.courseCode !== selectedCourse) return false
    if (selectedBloom !== 'all' && q.bloomLevel !== selectedBloom) return false
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase()
      if (
        !q.text.toLowerCase().includes(s) &&
        !q.courseCode.toLowerCase().includes(s) &&
        !q.authorName.toLowerCase().includes(s)
      ) {
        return false
      }
    }
    return true
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this verified question from the master bank?')) {
      deleteQuestion(id)
      showToast('info', 'Question Removed', 'Question removed from institutional repository.')
    }
  }

  return (
    <AppLayout role="admin" pageTitle="Master Question Repository">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Institutional Master Question Bank</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Centrally curated academic question catalog for autonomous exam synthesis and moderation.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search master repository..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-medium focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
            >
              <option value="all">All Subjects</option>
              {courses.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>

            <select
              value={selectedBloom}
              onChange={(e) => setSelectedBloom(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
            >
              <option value="all">All Bloom Levels</option>
              <option value="L1">L1 - Remember</option>
              <option value="L2">L2 - Understand</option>
              <option value="L3">L3 - Apply</option>
              <option value="L4">L4 - Analyze</option>
              <option value="L5">L5 - Evaluate</option>
              <option value="L6">L6 - Create</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-200 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {q.courseCode}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                    Unit {q.unit}
                  </span>
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded">
                    {q.courseOutcome}
                  </span>
                  <BloomBadge level={q.knowledgeLevel || q.bloomLevel || 'K1'} />
                  <DifficultyBadge difficulty={q.difficulty} />
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {q.marks} Marks
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">
                    Faculty: <b>{q.authorName}</b>
                  </span>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-900 leading-relaxed font-serif">
                {q.text}
              </p>

              {q.answerHint && (
                <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Answer Scheme: </span>
                  {q.answerHint}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
