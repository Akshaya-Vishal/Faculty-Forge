import { useState } from 'react'
import {
  CheckCircle2,
  Printer,
  Sparkles,
  Zap,
} from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { PaperPreviewModal } from '../../components/common/PaperPreviewModal'
import type { QuestionPaper } from '../../types/models'

export function AdminPaperGeneratorPage() {
  const { user } = useAuth()
  const { courses, examCycles, createPaper } = useData()
  const { showToast } = useToast()

  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '')
  const [selectedExamName, setSelectedExamName] = useState(examCycles[0]?.name || 'End Semester Exam 2026')
  const [maxMarks, setMaxMarks] = useState<number>(50)
  const [durationMinutes, setDurationMinutes] = useState<number>(90)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSets, setGeneratedSets] = useState<QuestionPaper[]>([])
  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null)

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0]

  const handleGenerateSets = () => {
    setIsGenerating(true)

    setTimeout(() => {
      const setA: Omit<QuestionPaper, 'id' | 'createdAt' | 'updatedAt'> = {
        title: `${selectedExamName} - ${selectedCourse.code} (Set A - Auto Generated)`,
        examName: selectedExamName,
        internalType: 'Internal 1',
        academicYear: '2025-2026',
        semester: `Semester ${selectedCourse.semester}`,
        branch: selectedCourse.department,
        regulation: selectedCourse.regulation,
        courseId: selectedCourse.id,
        courseCode: selectedCourse.code,
        courseName: selectedCourse.name,
        durationMinutes,
        maxMarks,
        status: 'Approved',
        facultyId: user?.id || 'adm-001',
        facultyName: 'Examination Cell Auto-Engine',
        facultyDept: 'Office of the CoE',
        setLabel: 'Set A',
        semesterNumber: selectedCourse.semester || 3,
        departmentCode: selectedCourse.departmentCode || 'CSE',
        departmentName: selectedCourse.department || 'Computer Science & Engineering',
        courseOutcomesList: selectedCourse.courseOutcomes || [
          { code: 'CO1', description: 'Understand fundamental concepts and linear architectures.' },
          { code: 'CO2', description: 'Apply non-linear structures to solve algorithmic problems.' },
          { code: 'CO3', description: 'Analyze shortest path and traversal complexity tradeoffs.' },
          { code: 'CO4', description: 'Evaluate optimization strategies and sorting routines.' },
          { code: 'CO5', description: 'Design complete end-to-end software solutions.' },
        ],
        generalInstructions: [
          'Answer all questions in Part A (5 x 2 = 10 Marks).',
          'Answer Question 6(a) OR 6(b) in Part B (1 x 8 = 8 Marks).',
          'Answer Question 7(a) OR 7(b), and Question 8(a) OR 8(b) in Part C (2 x 16 = 32 Marks).',
        ],
        reviewComments: [],
        sections: [
          {
            id: `sec-a-${Date.now()}`,
            sectionKey: 'PART_A',
            title: 'Part A (5 x 2 = 10 Marks)',
            instruction: 'Answer ALL 5 Questions. (5 x 2 = 10 Marks)',
            totalMarks: 10,
            questions: [
              { id: 'g-1', questionNumber: '1.', text: `State the fundamental definition and scope of ${selectedCourse.units[0]?.topics[0] || 'Unit 1 ADT'}.`, marks: 2, knowledgeLevel: 'K1', bloomLevel: 'K1', courseOutcome: 'CO1', unit: 1 },
              { id: 'g-2', questionNumber: '2.', text: `Differentiate operational characteristics in ${selectedCourse.units[0]?.topics[1] || 'Unit 1 queue'}.\na) Option A  b) Option B  c) Option C  d) Option D\nJustify your answer.`, marks: 2, knowledgeLevel: 'K2', bloomLevel: 'K2', courseOutcome: 'CO1', unit: 1 },
              { id: 'g-3', questionNumber: '3.', text: `Compute the balance conditions for ${selectedCourse.units[1]?.topics[0] || 'Unit 2 trees'}.`, marks: 2, knowledgeLevel: 'K3', bloomLevel: 'K3', courseOutcome: 'CO2', unit: 2 },
              { id: 'g-4', questionNumber: '4.', text: `Explain the traversal property of ${selectedCourse.units[2]?.topics[0] || 'Unit 3 graph'}.\na) Option A  b) Option B  c) Option C  d) Option D\nJustify your answer.`, marks: 2, knowledgeLevel: 'K2', bloomLevel: 'K2', courseOutcome: 'CO3', unit: 3 },
              { id: 'g-5', questionNumber: '5.', text: `Compare time complexities for ${selectedCourse.units[3]?.topics[0] || 'Unit 4 algorithms'}.`, marks: 2, knowledgeLevel: 'K4', bloomLevel: 'K4', courseOutcome: 'CO4', unit: 4 },
            ],
          },
          {
            id: `sec-b-${Date.now()}`,
            sectionKey: 'PART_B',
            title: 'Part B (1 x 8 = 8 Marks)',
            instruction: 'Answer Question 6(a) OR 6(b). (1 x 8 = 8 Marks)',
            totalMarks: 8,
            questions: [
              {
                id: 'g-6',
                questionNumber: '6 (a)',
                subLabel: '6 (a)',
                text: `(i) Formulate the algorithmic routine for ${selectedCourse.units[0]?.topics[2] || 'linear structures'} with complexity proof. (5M)\n(ii) Demonstrate trace on sample input sequence. (3M)`,
                marks: 8,
                knowledgeLevel: 'K3',
                bloomLevel: 'K3',
                courseOutcome: 'CO1',
                unit: 1,
                isChoice: true,
                orQuestion: {
                  id: 'g-7',
                  subLabel: '6 (b)',
                  text: `(i) Explain in detail the non-linear transformations and memory representations for ${selectedCourse.units[1]?.topics[1] || 'trees'}. (5M)\n(ii) Illustrate pointer operations. (3M)`,
                  marks: 8,
                  knowledgeLevel: 'K3',
                  bloomLevel: 'K3',
                  courseOutcome: 'CO2',
                  unit: 2,
                },
              },
            ],
          },
          {
            id: `sec-c-${Date.now()}`,
            sectionKey: 'PART_C',
            title: 'Part C (2 x 16 = 32 Marks)',
            instruction: 'Answer Question 7(a) OR 7(b), and Question 8(a) OR 8(b). (2 x 16 = 32 Marks)',
            totalMarks: 32,
            questions: [
              {
                id: 'g-8',
                questionNumber: '7 (a)',
                subLabel: '7 (a)',
                text: `(i) Construct the optimal tree/graph solution for ${selectedCourse.units[2]?.topics[1] || 'shortest path'} on a 7-node network. (10M)\n(ii) Analyze iteration complexity. (6M)`,
                marks: 16,
                knowledgeLevel: 'K4',
                bloomLevel: 'K4',
                courseOutcome: 'CO3',
                unit: 3,
                isChoice: true,
                orQuestion: {
                  id: 'g-9',
                  subLabel: '7 (b)',
                  text: `(i) Apply Dynamic Programming optimization to solve the multi-stage decision problem for ${selectedCourse.units[3]?.topics[1] || 'optimization'}. (10M)\n(ii) Compare recursion vs memoization table. (6M)`,
                  marks: 16,
                  knowledgeLevel: 'K5',
                  bloomLevel: 'K5',
                  courseOutcome: 'CO4',
                  unit: 4,
                },
              },
              {
                id: 'g-10',
                questionNumber: '8 (a)',
                subLabel: '8 (a)',
                text: `(i) Design an enterprise-scale data pipeline incorporating ${selectedCourse.units[4]?.topics[0] || 'hashing and storage'}. Provide architectural block diagram and worst-case latency mitigation. (10M)\n(ii) Justify fault-tolerance tradeoffs. (6M)`,
                marks: 16,
                knowledgeLevel: 'K6',
                bloomLevel: 'K6',
                courseOutcome: 'CO5',
                unit: 5,
                isChoice: true,
                orQuestion: {
                  id: 'g-11',
                  subLabel: '8 (b)',
                  text: `(i) Formulate complete distributed database caching mechanism for ${selectedCourse.units[4]?.topics[1] || 'storage'}. (10M)\n(ii) Evaluate consistency constraints. (6M)`,
                  marks: 16,
                  knowledgeLevel: 'K5',
                  bloomLevel: 'K5',
                  courseOutcome: 'CO5',
                  unit: 5,
                },
              },
            ],
          },
        ],
      }

      const setB: Omit<QuestionPaper, 'id' | 'createdAt' | 'updatedAt'> = {
        ...setA,
        title: `${selectedExamName} - ${selectedCourse.code} (Set B - Auto Generated)`,
        setLabel: 'Set B',
        sections: setA.sections.map((sec) => ({
          ...sec,
          questions: sec.questions.map((q) => ({
            ...q,
            text: `[Set B Variant] ${q.text.replace('(a)', '(a) Alternative:')}`,
          })),
        })),
      }

      const paperA = createPaper(setA)
      const paperB = createPaper(setB)

      setGeneratedSets([paperA, paperB])
      setIsGenerating(false)
      showToast(
        'success',
        'Examination Sets Generated!',
        `Created balanced Set A & Set B for ${selectedCourse.code}. Added directly to certified papers repository.`,
      )
    }, 600)
  }

  return (
    <AppLayout role="admin" pageTitle="Automated Paper Set Generator">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Automated Examination Set Generator (Set A & B)
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Algorithmically assemble randomized question paper sets complying with university syllabus blueprints.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="size-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Examination Blueprint Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Subject</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Exam Cycle</label>
              <select
                value={selectedExamName}
                onChange={(e) => setSelectedExamName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              >
                {examCycles.map((e) => (
                  <option key={e.id} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Max Marks</label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(parseInt(e.target.value) || 50)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration (Mins)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 90)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-800 block">Syllabus Coverage Strategy</span>
              <span className="text-slate-500 mt-0.5 block">Uniform distribution across all 5 Units (20% per unit).</span>
            </div>
            <div>
              <span className="font-bold text-slate-800 block">Cognitive Domain Weighting</span>
              <span className="text-slate-500 mt-0.5 block">30% LOT (L1-L2) &bull; 70% HOT (L3-L6) AICTE blueprint.</span>
            </div>
            <div>
              <span className="font-bold text-slate-800 block">Sets Generated</span>
              <span className="text-slate-500 mt-0.5 block">Simultaneous Set A and Set B generation.</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={handleGenerateSets}
              disabled={isGenerating}
              className="gap-2 text-xs bg-gradient-to-r from-indigo-600 to-indigo-500 font-bold px-6 py-3 shadow-lg shadow-indigo-600/30"
            >
              <Zap className="size-4" />
              {isGenerating ? 'Synthesizing Sets...' : 'Generate Balanced Set A & Set B'}
            </Button>
          </div>
        </div>

        {generatedSets.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              Generated Examination Papers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedSets.map((paper) => (
                <div
                  key={paper.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
                      {paper.courseCode} &bull; {paper.setLabel}
                    </span>
                    <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                      Certified Set
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{paper.title}</h4>

                  <p className="text-xs text-slate-500">
                    Max Marks: <b>{paper.maxMarks}M</b> &bull; Duration: <b>{paper.durationMinutes} mins</b> &bull; {paper.sections.length} Sections
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setPreviewPaper(paper)}
                      className="text-xs gap-1.5"
                    >
                      <Printer className="size-3.5" />
                      Preview Print Layout
                    </Button>

                    <Button
                      to={ROUTES.ADMIN_REVIEWS}
                      variant="primary"
                      className="text-xs bg-indigo-600"
                    >
                      Open in Workbench
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
