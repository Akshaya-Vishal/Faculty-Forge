import { Fragment } from 'react'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import type { QuestionPaper, PaperQuestion } from '../types/models'
import { downloadFilledQuestionPaper } from '../lib/docxTemplate'

const samplePaper: QuestionPaper = {
  id: 'preview-template',
  title: 'Internal 1 - ARTIFICIAL INTELLIGENCE (2025-2026)',
  examName: 'Internal Assessment: I',
  internalType: 'Internal 1',
  academicYear: '2025-2026',
  semester: 'Third Semester',
  semesterNumber: 3,
  departmentCode: 'ADS',
  departmentName: 'Artificial Intelligence & Data Science',
  branch: 'B.Tech Artificial Intelligence & Data Science',
  commonTo: 'B.E. Computer Science & Engineering',
  regulation: 'KCET 2021',
  courseId: 'AI2201',
  courseCode: 'AI2201',
  courseName: 'ARTIFICIAL INTELLIGENCE',
  durationMinutes: 90,
  maxMarks: 50,
  status: 'Approved',
  facultyId: 'fac-101',
  facultyName: 'Dr. Sarah Jenkins',
  facultyDept: 'Artificial Intelligence & Data Science',
  courseOutcomesList: [
    { code: 'CO1', description: 'Understand fundamental search algorithms.' },
    { code: 'CO2', description: 'Apply knowledge representation techniques.' },
    { code: 'CO3', description: 'Analyze machine learning classification algorithms.' },
    { code: 'CO4', description: 'Evaluate neural network convergence.' },
    { code: 'CO5', description: 'Design complete AI solutions.' },
  ],
  sections: [
    {
      id: 'part-a',
      sectionKey: 'PART_A',
      title: 'Part A (5 x 2 = 10 Marks)',
      instruction: 'Answer all the Questions',
      totalMarks: 10,
      questions: [
        { id: 'q1', questionNumber: '1.', text: 'Define Artificial Intelligence and list its applications.', marks: 2, knowledgeLevel: 'K1', bloomLevel: 'K1', courseOutcome: 'CO1', unit: 1 },
        { id: 'q2', questionNumber: '2.', text: 'Differentiate between informed and uninformed search.', marks: 2, knowledgeLevel: 'K2', bloomLevel: 'K2', courseOutcome: 'CO2', unit: 2 },
        { id: 'q3', questionNumber: '3.', text: 'State the role of heuristic function in A* Algorithm.', marks: 2, knowledgeLevel: 'K1', bloomLevel: 'K1', courseOutcome: 'CO2', unit: 2 },
        { id: 'q4', questionNumber: '4.', text: 'Explain the concept of machine learning with an example.', marks: 2, knowledgeLevel: 'K2', bloomLevel: 'K2', courseOutcome: 'CO3', unit: 3 },
        { id: 'q5', questionNumber: '5.', text: 'Write a short note on decision tree classification.', marks: 2, knowledgeLevel: 'K4', bloomLevel: 'K4', courseOutcome: 'CO4', unit: 4 },
      ],
    },
    {
      id: 'part-b',
      sectionKey: 'PART_B',
      title: 'Part B (1 x 8 = 8 Marks)',
      instruction: 'Answer Question 6(a) OR 6(b)',
      totalMarks: 8,
      questions: [
        { id: 'q6', questionNumber: '6 (a)', subLabel: '6 (a)', text: 'Describe the working of BFS and DFS with suitable examples.', marks: 8, knowledgeLevel: 'K3', bloomLevel: 'K3', courseOutcome: 'CO2', unit: 2, isChoice: true, orQuestion: { id: 'q6-or', subLabel: '6 (b)', text: 'Explain A* algorithm with heuristic evaluation and complexity analysis.', marks: 8, knowledgeLevel: 'K3', bloomLevel: 'K3', courseOutcome: 'CO2', unit: 2 } },
      ],
    },
    {
      id: 'part-c',
      sectionKey: 'PART_C',
      title: 'Part C (2 x 16 = 32 Marks)',
      instruction: 'Answer Question 7(a) OR 7(b), and Question 8(a) OR 8(b)',
      totalMarks: 32,
      questions: [
        { id: 'q7', questionNumber: '7 (a)', subLabel: '7 (a)', text: 'Design a smart AI system for student performance prediction using suitable regression and classification techniques.', marks: 16, knowledgeLevel: 'K6', bloomLevel: 'K6', courseOutcome: 'CO5', unit: 5, isChoice: true, orQuestion: { id: 'q7-or', subLabel: '7 (b)', text: 'Analyze the ethical issues in AI and propose mitigation strategies with case studies.', marks: 16, knowledgeLevel: 'K4', bloomLevel: 'K4', courseOutcome: 'CO5', unit: 5 } },
      ],
    },
  ],
  generalInstructions: ['Answer all questions in Part A (5 x 2 = 10 Marks).', 'Answer Question 6(a) OR 6(b) in Part B (1 x 8 = 8 Marks).', 'Answer Question 7(a) OR 7(b) in Part C (2 x 16 = 32 Marks).'],
  reviewComments: [],
  setLabel: 'Set A',
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
}

function renderQuestionRow(question: PaperQuestion) {
  const rowLabel = question.subLabel ?? `${question.questionNumber}`

  return (
    <tr key={question.id} className="align-top text-[11px] text-slate-800">
      <td className="border border-black px-1 py-1 text-center align-middle">{question.courseOutcome}</td>
      <td className="border border-black px-1 py-1 text-center align-middle">{question.knowledgeLevel || question.bloomLevel}</td>
      <td className="border border-black px-1 py-1 text-center align-middle">{rowLabel}</td>
      <td className="border border-black px-1 py-1 align-top leading-relaxed text-left">
        <div className="min-h-[24px]">
          {question.text || 'Question text will appear here'}
          {question.isChoice && question.orQuestion && (
            <div className="mt-2 border-t border-dashed border-slate-400 pt-2 text-[10px] italic">
              (OR) {question.orQuestion.text || 'Alternative question'}
            </div>
          )}
        </div>
      </td>
      <td className="border border-black px-1 py-1 text-center align-middle">{question.marks}</td>
    </tr>
  )
}

export function TemplatePreviewPage() {
  const location = useLocation()
  const templateUrl = '/templates/question-paper-template.docx'
  const paper = (location.state as { paper?: QuestionPaper } | null)?.paper ?? samplePaper
  const handleDownloadWord = async () => {
    try {
      await downloadFilledQuestionPaper(paper)
    } catch (error) {
      console.error('Unable to create filled Word document', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="no-print flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.STEP6_HUB}
              className="inline-flex rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Back to question papers"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-700">Official Preview</p>
              <h1 className="text-lg font-extrabold text-slate-900">Question Paper Template Layout</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={templateUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Printer className="size-4" />
              Open Official DOCX
            </a>
            <button
              type="button"
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500"
            >
              <Download className="size-4" />
              Download Filled Word
            </button>
          </div>
        </div>

        <div
          className="mx-auto w-full max-w-[794px] overflow-hidden border-[2px] border-black bg-white text-slate-900"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          <div className="px-5 pt-7 text-center text-[12px] font-bold uppercase">
            <div>B.E. / B.TECH. DEGREE EXAMINATIONS</div>
            <div className="mt-1">(JUNE to OCTOBER 2026)</div>
            <div className="mt-1">DEPARTMENT OF {paper.departmentName || paper.branch || '________________'}</div>
          </div>

          <div className="flex items-center justify-between px-5 py-5 text-[11px] font-bold">
            <div>Roll No.____________________________</div>
            <div>Internal Assessment: {paper.internalType === 'Internal 2' ? 'II' : 'I'}&nbsp;&nbsp; Semester: {paper.semester || 'Third/Fifth/Seventh'}</div>
          </div>

          <div className="px-5 pb-2">
            <div className="grid grid-cols-[1.4fr_2.4fr_1.2fr] border border-black text-[11px] font-bold">
              <div className="border-r border-black px-2 py-1.5">Course Code - Course Name</div>
              <div className="border-r border-black px-2 py-1.5">{paper.courseCode || '________________'} - {paper.courseName || '________________'}</div>
              <div className="px-2 py-1.5 text-center">(Common to {paper.commonTo || '____'})</div>
            </div>
          </div>

          <div className="px-5 pb-2">
            <div className="grid grid-cols-[1.4fr_1.4fr_1.3fr_1.5fr] border border-black text-[11px] font-bold">
              <div className="border-r border-black px-2 py-1.5">Regulation: {paper.regulation || 'KCET 2021'}</div>
              <div className="border-r border-black px-2 py-1.5">Max. Marks : {paper.maxMarks || 50} Marks</div>
              <div className="border-r border-black px-2 py-1.5">Duration</div>
              <div className="px-2 py-1.5">{paper.durationText || '1 hour 30 minutes'}</div>
            </div>
          </div>

          {paper.courseOutcomesList && paper.courseOutcomesList.length > 0 && (
            <div className="px-5 pb-2">
              <div className="grid grid-cols-[1fr_4fr] border border-black text-[11px] font-bold">
                <div className="border-r border-black px-2 py-1.5 text-center">CO Index</div>
                <div className="px-2 py-1.5 text-center">Course Outcomes</div>
                {paper.courseOutcomesList.map((co) => (
                  <Fragment key={co.code}>
                    <div className="border-r border-t border-black px-2 py-1.5 text-center">{co.code}</div>
                    <div className="border-t border-black px-2 py-1.5 font-normal">{co.description}</div>
                  </Fragment>
                ))}
              </div>
            </div>
          )}

          <div className="px-5 pb-2">
            <div className="mb-1 border border-black px-2 py-1 text-center text-[11px] font-bold">
              Marks distribution based on Bloom&apos;s Taxonomy Level
            </div>
            <div className="grid grid-cols-5 border border-black text-[11px] font-bold">
              <div className="border-r border-black px-2 py-1.5 text-center">Remember</div>
              <div className="border-r border-black px-2 py-1.5 text-center">Understand</div>
              <div className="border-r border-black px-2 py-1.5 text-center">Apply</div>
              <div className="border-r border-black px-2 py-1.5 text-center">Analyze</div>
              <div className="px-2 py-1.5 text-center">Create</div>
            </div>
          </div>

          <div className="px-4 py-2 text-center text-[12px] font-black uppercase tracking-[0.08em]">
            Answer ALL questions
          </div>

          <div className="px-4 pb-5">
            <table className="w-full border border-black text-[11px]">
              <thead>
                <tr className="bg-slate-100 font-black">
                  <th className="w-[12%] border border-black px-1 py-1.5 text-center">CO / BT</th>
                  <th className="w-[8%] border border-black px-1 py-1.5 text-center">Q.No</th>
                  <th className="w-[68%] border border-black px-1 py-1.5 text-center">Question</th>
                  <th className="w-[12%] border border-black px-1 py-1.5 text-center">Marks</th>
                </tr>
              </thead>
              <tbody>
                {paper.sections.map((section) => (
                  <Fragment key={section.id}>
                    <tr className="bg-slate-50 font-black">
                      <td colSpan={4} className="border border-black px-2 py-1 text-center uppercase">
                        {section.title}
                      </td>
                    </tr>
                    {section.questions.map((question) => renderQuestionRow(question))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t-[2px] border-black px-4 py-3 text-[11px] font-bold">
            <div className="grid grid-cols-3 gap-4">
              <div className="border-t border-black pt-2 text-center">Faculty Signature</div>
              <div className="border-t border-black pt-2 text-center">HOD Signature</div>
              <div className="border-t border-black pt-2 text-center">Controller of Examinations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
