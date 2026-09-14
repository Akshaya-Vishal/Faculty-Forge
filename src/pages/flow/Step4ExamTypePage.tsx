import { useParams, useNavigate } from 'react-router-dom'
import {
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { DEPARTMENTS_CATALOG } from '../../data/mockData'
import { AppLayout } from '../../components/layout/AppLayout'
import { StepBreadcrumbs } from '../../components/layout/StepBreadcrumbs'
import { Button } from '../../components/ui/Button'
import type { InternalExamType } from '../../types/models'

interface ExamCardOption {
  type: InternalExamType
  title: string
  subtitle: string
  badge: string
  durationText: string
  durationMinutes: number
  maxMarks: number
  unitsCovered: string
  description: string
  color: string
  iconBg: string
}

const EXAM_OPTIONS: ExamCardOption[] = [
  {
    type: 'Internal 1',
    title: 'Internal Assessment - I (IAT 1)',
    subtitle: 'First Sessional Examination',
    badge: '50 Marks Blueprint',
    durationText: '1 Hour 30 Minutes (90 Mins)',
    durationMinutes: 90,
    maxMarks: 50,
    unitsCovered: 'Unit 1 & Unit 2 (Part A: 10M, Part B: 8M, Part C: 32M)',
    description: 'Autonomous format covering syllabus Units 1 & 2 with K1-K4 Bloom cognitive levels.',
    color: 'border-indigo-200 hover:border-indigo-600 bg-gradient-to-b from-indigo-50/40 to-white',
    iconBg: 'bg-indigo-600 text-white',
  },
  {
    type: 'Internal 2',
    title: 'Internal Assessment - II (IAT 2)',
    subtitle: 'Second Sessional Examination',
    badge: '50 Marks Blueprint',
    durationText: '1 Hour 30 Minutes (90 Mins)',
    durationMinutes: 90,
    maxMarks: 50,
    unitsCovered: 'Unit 3 & Unit 4 (Part A: 10M, Part B: 8M, Part C: 32M)',
    description: 'Autonomous format covering syllabus Units 3 & 4 with K1-K5 Bloom cognitive levels.',
    color: 'border-purple-200 hover:border-purple-600 bg-gradient-to-b from-purple-50/40 to-white',
    iconBg: 'bg-purple-600 text-white',
  },
  {
    type: 'Model Exam',
    title: 'Model Examination / Pre-Semester',
    subtitle: 'Comprehensive End-Term Simulation',
    badge: '100 Marks Full Syllabus',
    durationText: '3 Hours (180 Mins)',
    durationMinutes: 180,
    maxMarks: 100,
    unitsCovered: 'All 5 Syllabus Units (Comprehensive)',
    description: 'University model examination covering entire 5-unit syllabus with all cognitive domains.',
    color: 'border-emerald-200 hover:border-emerald-600 bg-gradient-to-b from-emerald-50/40 to-white',
    iconBg: 'bg-emerald-600 text-white',
  },
]

export function Step4ExamTypePage() {
  const { dept, sem, courseId } = useParams<{
    dept: string
    sem: string
    courseId: string
  }>()
  const navigate = useNavigate()
  const { courses, papers, createPaper } = useData()
  const { user } = useAuth()

  const semNumber = parseInt(sem || '3') || 3
  const selectedDept =
    DEPARTMENTS_CATALOG.find((d) => d.code === dept) || DEPARTMENTS_CATALOG[1]
  const selectedCourse =
    courses.find((c) => c.id === courseId) ||
    courses.find((c) => c.code === 'CS3301') ||
    courses[0]

  // Existing papers created for this subject
  const existingPapers = papers.filter(
    (p) => p.courseId === selectedCourse.id || p.courseCode === selectedCourse.code,
  )

  const handleSelectExam = (examOption: ExamCardOption) => {
    // Check if paper already exists for this exam type
    const existing = existingPapers.find((p) => p.internalType === examOption.type)
    if (existing) {
      navigate(`/builder/${existing.id}`)
      return
    }

    // Create a new drafted paper with default Kamaraj College 50-mark structure
    const newPaper = createPaper({
      title: `${examOption.title} - ${selectedCourse.code}`,
      examName: examOption.title,
      internalType: examOption.type,
      academicYear: '2025-2026',
      semester: `Semester ${semNumber}`,
      semesterNumber: semNumber,
      departmentCode: selectedDept.code,
      departmentName: selectedDept.name,
      branch: `B.E. ${selectedDept.name}`,
      commonTo: selectedDept.code === 'CSE' ? 'B.Tech IT / B.Tech AI & DS' : undefined,
      regulation: selectedCourse.regulation || 'KCET 2021',
      courseId: selectedCourse.id,
      courseCode: selectedCourse.code,
      courseName: selectedCourse.name,
      durationMinutes: examOption.durationMinutes,
      durationText: examOption.durationText,
      maxMarks: examOption.maxMarks,
      status: 'Draft',
      facultyId: user?.id || 'fac-101',
      facultyName: user?.name || 'Faculty Member',
      facultyDept: user?.department || selectedDept.name,
      courseOutcomesList: selectedCourse.courseOutcomes || [
        { code: 'CO1', description: 'Understand fundamental concepts and linear architectures.' },
        { code: 'CO2', description: 'Apply non-linear structures to solve algorithmic problems.' },
        { code: 'CO3', description: 'Analyze shortest path and traversal complexity tradeoffs.' },
        { code: 'CO4', description: 'Evaluate optimization strategies and sorting routines.' },
        { code: 'CO5', description: 'Design complete end-to-end software solutions.' },
      ],
      generalInstructions: [
        'Answer ALL Questions in Part A (5 x 2 = 10 Marks).',
        'Answer Question 6(a) OR 6(b) in Part B (1 x 8 = 8 Marks).',
        'Answer Question 7(a) OR 7(b), and Question 8(a) OR 8(b) in Part C (2 x 16 = 32 Marks).',
      ],
      reviewComments: [],
      setLabel: 'Set A',
      sections: [
        {
          id: 'sec-part-a',
          sectionKey: 'PART_A',
          title: 'Part A (5 x 2 = 10 Marks)',
          instruction: 'Answer all the Questions',
          totalMarks: 10,
          questions: [],
        },
        {
          id: 'sec-part-b',
          sectionKey: 'PART_B',
          title: 'Part B (1 x 8 = 8 Marks)',
          instruction: 'Answer Question 6(a) OR 6(b)',
          totalMarks: 8,
          questions: [],
        },
        {
          id: 'sec-part-c',
          sectionKey: 'PART_C',
          title: 'Part C (2 x 16 = 32 Marks)',
          instruction: 'Answer Question 7(a) OR 7(b), and Question 8(a) OR 8(b)',
          totalMarks: 32,
          questions: [],
        },
      ],
    })

    navigate(`/builder/${newPaper.id}`)
  }

  return (
    <AppLayout role="faculty" pageTitle="Step 4: Select Assessment Exam">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Step Indicator */}
        <StepBreadcrumbs
          currentStep={4}
          deptCode={selectedDept.code}
          semNumber={semNumber}
          courseId={selectedCourse.id}
          courseCode={selectedCourse.code}
        />

        {/* Hero Header */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-0.5 text-xs font-bold text-indigo-300">
              Page 4 of 6 &bull; {selectedCourse.code} &bull; {selectedCourse.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Which Examination are you Authoring for?
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Choose <b>Internal Assessment 1</b>, <b>Internal Assessment 2</b>, or <b>Model Exam</b> to enter the interactive 3-Part question builder.
          </p>
        </div>

        {/* Selected Course Quick Summary Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 font-mono font-extrabold text-indigo-700 border border-indigo-100">
              {selectedCourse.code}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">{selectedCourse.name}</h3>
              <p className="text-xs text-slate-500">
                {selectedDept.name} &bull; Semester {semNumber} &bull; {selectedCourse.credits} Credits
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold">
            KCET Autonomous Regulations
          </span>
        </div>

        {/* Examination Type Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {EXAM_OPTIONS.map((opt) => (
            <div
              key={opt.type}
              onClick={() => handleSelectExam(opt)}
              className={`group relative rounded-3xl border-2 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer flex flex-col justify-between ${opt.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex size-12 items-center justify-center rounded-2xl ${opt.iconBg} shadow-md group-hover:scale-105 transition-transform`}>
                    <FileText className="size-6" />
                  </div>
                  <span className="text-[11px] font-black text-slate-700 bg-white/90 px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs">
                    {opt.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                  {opt.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-semibold">{opt.subtitle}</p>

                <div className="mt-4 space-y-2 text-xs text-slate-600 bg-white/70 p-3.5 rounded-2xl border border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-slate-400 shrink-0" />
                    <span><b>Duration:</b> {opt.durationText}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    <span><b>Max Marks:</b> {opt.maxMarks} Marks</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <b>Coverage:</b> {opt.unitsCovered}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-extrabold text-indigo-700">
                <span>Start Authoring &rarr;</span>
                <div className="flex size-8 items-center justify-center rounded-full bg-white group-hover:bg-indigo-600 group-hover:text-white shadow-xs transition-colors">
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Existing Drafts if any */}
        {existingPapers.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">
              Previously Created Drafts for {selectedCourse.code}
            </h3>
            <div className="space-y-2">
              {existingPapers.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/builder/${p.id}`)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                    <span className="text-[11px] text-slate-500">
                      {p.sections.length} Sections &bull; Status: <b>{p.status}</b>
                    </span>
                  </div>
                  <Button variant="primary" className="text-xs py-1 px-3 h-auto bg-indigo-600">
                    Continue Editing
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
