import { useState } from 'react'
import {
  Database,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { BloomBadge, DifficultyBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import type { KnowledgeLevel, CourseOutcome, Difficulty, QuestionType } from '../../types/models'

export function QuestionBankPage() {
  const { user } = useAuth()
  const { questions, courses, addQuestion, deleteQuestion } = useData()
  const { showToast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('all')
  const [selectedUnit, setSelectedUnit] = useState<string>('all')
  const [selectedBloom, setSelectedBloom] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  // Add Question Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCourseCode, setNewCourseCode] = useState(courses[0]?.code || 'CS3301')
  const [newUnit, setNewUnit] = useState<number>(1)
  const [newBloom, setNewBloom] = useState<KnowledgeLevel>('K3')
  const [newCO, setNewCO] = useState<CourseOutcome>('CO1')
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('Medium')
  const [newMarks, setNewMarks] = useState<number>(8)
  const [newType] = useState<QuestionType>('Problem')
  const [newText, setNewText] = useState('')
  const [newHint, setNewHint] = useState('')

  const filteredQuestions = questions.filter((q) => {
    if (selectedCourseCode !== 'all' && q.courseCode !== selectedCourseCode) return false
    if (selectedUnit !== 'all' && q.unit.toString() !== selectedUnit) return false
    if (selectedBloom !== 'all' && q.knowledgeLevel !== selectedBloom && q.bloomLevel !== selectedBloom) return false
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false

    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase()
      if (
        !q.text.toLowerCase().includes(s) &&
        !q.courseCode.toLowerCase().includes(s) &&
        !q.courseName.toLowerCase().includes(s)
      ) {
        return false
      }
    }
    return true
  })

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newText.trim()) return

    const matchedCourse = courses.find((c) => c.code === newCourseCode) || courses[0]

    addQuestion({
      text: newText,
      courseId: matchedCourse.id,
      courseCode: matchedCourse.code,
      courseName: matchedCourse.name,
      unit: newUnit,
      knowledgeLevel: newBloom,
      bloomLevel: newBloom,
      courseOutcome: newCO,
      difficulty: newDifficulty,
      marks: newMarks,
      questionType: newType,
      authorName: user?.name || 'Faculty Member',
      answerHint: newHint,
    })

    showToast('success', 'Question Added', 'New question successfully cataloged into repository.')
    setIsAddModalOpen(false)
    setNewText('')
    setNewHint('')
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this question from the bank?')) {
      deleteQuestion(id)
      showToast('info', 'Question Removed', 'Question removed from question repository.')
    }
  }

  return (
    <AppLayout role="faculty" pageTitle="Question Bank Repository">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Question Bank Repository</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Categorized repository tagged by Unit, Knowledge Level (K1-K6), Course Outcomes, and marks.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 shrink-0 bg-indigo-600 shadow-md"
          >
            <Plus className="size-4" />
            Add New Question
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search question text or keywords..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9.5 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={selectedCourseCode}
                onChange={(e) => setSelectedCourseCode(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Subjects</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>

              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Units</option>
                <option value="1">Unit 1</option>
                <option value="2">Unit 2</option>
                <option value="3">Unit 3</option>
                <option value="4">Unit 4</option>
                <option value="5">Unit 5</option>
              </select>

              <select
                value={selectedBloom}
                onChange={(e) => setSelectedBloom(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Knowledge Levels</option>
                <option value="K1">K-1 (Remember)</option>
                <option value="K2">K-2 (Understand)</option>
                <option value="K3">K-3 (Apply)</option>
                <option value="K4">K-4 (Analyze)</option>
                <option value="K5">K-5 (Evaluate)</option>
                <option value="K6">K-6 (Create)</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Database className="size-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No questions match criteria</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try clearing active filters or adding a new question to the repository.
              </p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-200 hover:shadow-md space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
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

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">
                      Author: {q.authorName}
                    </span>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      aria-label="Delete question"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-900 leading-relaxed font-serif">
                  {q.text}
                </p>

                {q.answerHint && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-600">
                    <span className="font-bold text-slate-800">Answer Scheme / Key: </span>
                    {q.answerHint}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Question to Repository"
        description="Catalog a new syllabus-mapped question with Knowledge Level & Course Outcome parameters."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Subject</label>
              <select
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Unit</label>
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900"
              >
                <option value={1}>Unit 1</option>
                <option value={2}>Unit 2</option>
                <option value={3}>Unit 3</option>
                <option value={4}>Unit 4</option>
                <option value={5}>Unit 5</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Course Outcome</label>
              <select
                value={newCO}
                onChange={(e) => setNewCO(e.target.value as CourseOutcome)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-indigo-700 font-mono"
              >
                <option value="CO1">CO1</option>
                <option value="CO2">CO2</option>
                <option value="CO3">CO3</option>
                <option value="CO4">CO4</option>
                <option value="CO5">CO5</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Knowledge Level</label>
              <select
                value={newBloom}
                onChange={(e) => setNewBloom(e.target.value as KnowledgeLevel)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900"
              >
                <option value="K1">K-1 (Remember)</option>
                <option value="K2">K-2 (Understand)</option>
                <option value="K3">K-3 (Apply)</option>
                <option value="K4">K-4 (Analyze)</option>
                <option value="K5">K-5 (Evaluate)</option>
                <option value="K6">K-6 (Create)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Marks</label>
              <input
                type="number"
                required
                value={newMarks}
                onChange={(e) => setNewMarks(parseInt(e.target.value) || 2)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Question Description</label>
            <textarea
              rows={4}
              required
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Enter full question text, parameters, diagrams notation..."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Answer Scheme / Evaluation Hint (Optional)</label>
            <textarea
              rows={2}
              value={newHint}
              onChange={(e) => setNewHint(e.target.value)}
              placeholder="Key derivation steps, formula, expected outcomes..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="text-xs bg-indigo-600">
              Save to Question Bank
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
