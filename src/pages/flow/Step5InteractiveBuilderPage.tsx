import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Download,
  Eye,
  Plus,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Database,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { AppLayout } from '../../components/layout/AppLayout'
import { StepBreadcrumbs } from '../../components/layout/StepBreadcrumbs'
import { KnowledgeBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { downloadFilledQuestionPaper } from '../../lib/docxTemplate'
import { PaperPreviewModal } from '../../components/common/PaperPreviewModal'
import { BloomTaxonomyChart } from '../../components/common/BloomTaxonomyChart'
import type {
  KnowledgeLevel,
  CourseOutcome,
  PaperQuestion,
  QuestionPaper,
} from '../../types/models'

function removeLeadingQuestionNumber(text: string) {
  return text.replace(/^\s*(?:question\s*)?\d+(?:\s*\([a-z0-9ivx]+\))*\s*[.):]?\s+/i, '').trim()
}

function getPartCQuestionNumberForIndex(index: number, partMarks: number) {
  if (partMarks === 8) {
    const labels = [
      '7 (a) (i)',
      '7 (a) (ii)',
      '7 (b) (i)',
      '7 (b) (ii)',
      '8 (a) (i)',
      '8 (a) (ii)',
      '8 (b) (i)',
      '8 (b) (ii)',
    ]
    return labels[index] || labels[labels.length - 1]
  }
  return index === 0 ? '7 (a)' : '8 (a)'
}

function getAlternativeQuestionNumber(questionNumber: string) {
  if (/\(i\)\s*$/i.test(questionNumber)) return questionNumber.replace(/\(i\)\s*$/i, '(ii)')
  return questionNumber.replace('(a)', '(b)')
}

function normalizePartCQuestionNumber(questionNumber: string, marks: number) {
  if (marks !== 16) return questionNumber
  return questionNumber.replace(/\s*\((?:i|ii)\)\s*$/i, '').trim()
}

function getPartCFormat(partMarks: number) {
  return partMarks === 8
    ? {
        title: 'Part C (4 x 8 = 32 Marks)',
        instruction: 'Answer four questions from Question 7(a)(i)/(ii) OR 7(b)(i)/(ii), and four questions from Question 8(a)(i)/(ii) OR 8(b)(i)/(ii).',
      }
    : {
        title: 'Part C (2 x 16 = 32 Marks)',
        instruction: 'Answer Question 7(a) OR 7(b), and Question 8(a) OR 8(b).',
      }
}

function getInsertedMarks(paper: QuestionPaper) {
      return paper.sections.reduce(
        (total, section) =>
          total + section.questions.reduce((sectionTotal, question) => sectionTotal + Math.max(0, question.marks || 0), 0),
        0,
      )
}

export function Step5InteractiveBuilderPage() {
  const { paperId } = useParams<{ paperId: string }>()
  const navigate = useNavigate()
  const { getPaperById, updatePaper, submitPaper, questions: bankQuestions } = useData()
  const { showToast } = useToast()

  const [paper, setPaper] = useState<QuestionPaper | null>(() =>
    paperId ? getPaperById(paperId) ?? null : null,
  )
  const [previewOpen, setPreviewOpen] = useState(false)
  const [bankModalOpen, setBankModalOpen] = useState(false)

  // Form State for Inserting Questions
  const [targetSectionKey, setTargetSectionKey] = useState<'PART_A' | 'PART_B' | 'PART_C'>('PART_A')
  const [qNumber, setQNumber] = useState('1.')
  const [knowledgeLevel, setKnowledgeLevel] = useState<KnowledgeLevel>('K2')
  const [courseOutcome, setCourseOutcome] = useState<CourseOutcome>('CO1')
  const [marks, setMarks] = useState<number>(2)
  const [questionText, setQuestionText] = useState('')
  const [isOrChoice, setIsOrChoice] = useState(false)
  const [orQuestionText, setOrQuestionText] = useState('')
  const [isMcqFormat, setIsMcqFormat] = useState(false)
  const [mcqOptions, setMcqOptions] = useState(['', '', '', ''])

  const isPartAMcqNumber = (value: string) => {
    const number = Number.parseInt(value, 10)
    return targetSectionKey === 'PART_A' && (number === 2 || number === 4)
  }

  if (!paper) {
    return (
      <AppLayout role="faculty" pageTitle="Loading Question Paper...">
        <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 font-medium">Loading question paper blueprint...</p>
        </div>
      </AppLayout>
    )
  }

  // Update question marks and defaults based on section key
  const handleSectionChange = (secKey: 'PART_A' | 'PART_B' | 'PART_C') => {
    setTargetSectionKey(secKey)
    if (secKey === 'PART_A') {
      const existingPartA = paper.sections.find((s) => s.sectionKey === 'PART_A')
      const count = existingPartA ? existingPartA.questions.length + 1 : 1
      setQNumber(`${count}.`)
      setMarks(2)
      setKnowledgeLevel('K2')
      setCourseOutcome('CO1')
      setIsOrChoice(false)
      setIsMcqFormat(count === 2 || count === 4)
      setMcqOptions(['', '', '', ''])
    } else if (secKey === 'PART_B') {
      setQNumber('6 (a)')
      setMarks(8)
      setKnowledgeLevel('K2')
      setCourseOutcome('CO1')
      setIsOrChoice(true)
      setIsMcqFormat(false)
    } else {
      const existingPartC = paper.sections.find((s) => s.sectionKey === 'PART_C')
      const count = existingPartC ? existingPartC.questions.length : 0
      setQNumber(getPartCQuestionNumberForIndex(count, 16))
      setMarks(16)
      setKnowledgeLevel('K3')
      setCourseOutcome(count === 0 ? 'CO2' : 'CO3')
      setIsOrChoice(true)
      setIsMcqFormat(false)
    }
  }

  // Calculate live marks
  const totalCalculatedMarks = getInsertedMarks(paper)

  // Insert Question directly into paper
  const handleInsertQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    const currentSection = paper.sections.find((section) => section.sectionKey === targetSectionKey)
    if (targetSectionKey === 'PART_A' && (currentSection?.questions.length || 0) >= 5) {
      showToast('warning', 'Part A is full', 'Only 5 questions are allowed in Part A.')
      return
    }
    if (targetSectionKey === 'PART_C' && marks === 8 && (currentSection?.questions.length || 0) >= 8) {
      showToast('warning', 'Part C is full', 'The 8-mark format allows four questions for Question 7 and four for Question 8.')
      return
    }
    if (!questionText.trim()) {
      showToast('warning', 'Missing Question Text', 'Please enter question content before inserting.')
      return
    }

    const mcqEnabled = isMcqFormat || isPartAMcqNumber(qNumber)
    if (mcqEnabled && mcqOptions.some((option) => !option.trim())) {
      showToast('warning', 'Missing MCQ Options', 'Enter all four options before inserting this 2-mark question.')
      return
    }

    let finalQuestionText = removeLeadingQuestionNumber(questionText)
    const defaultAlternativeText = targetSectionKey === 'PART_C' && marks === 8
      ? `(i) Explain alternative approach for ${courseOutcome}. (4 Marks)\n(ii) Compare performance metrics. (4 Marks)`
      : `(i) Explain alternative approach for ${courseOutcome}. (5 Marks)\n(ii) Compare performance metrics. (3 Marks)`
    if (mcqEnabled) {
      const optionLines = mcqOptions.map((option, index) => `${String.fromCharCode(97 + index)}) ${option.trim()}`)
      finalQuestionText = `${finalQuestionText}\n${optionLines.join('\n')}`
    }

    const isIndependentPartCQuestion = targetSectionKey === 'PART_C' && marks === 8
    const normalizedQuestionNumber = normalizePartCQuestionNumber(qNumber, marks)
    const alternativeQuestionNumber = marks === 16
      ? normalizedQuestionNumber.replace('(a)', '(b)')
      : getAlternativeQuestionNumber(normalizedQuestionNumber)
    const newQ: PaperQuestion = {
      id: `pq-${Date.now()}`,
      questionNumber: normalizedQuestionNumber,
      text: finalQuestionText,
      marks,
      knowledgeLevel,
      bloomLevel: knowledgeLevel,
      courseOutcome,
      unit: 1,
      isChoice: isIndependentPartCQuestion ? false : isOrChoice,
      orQuestion: isIndependentPartCQuestion || !isOrChoice
        ? undefined
        : {
            id: `or-${Date.now()}`,
            subLabel: alternativeQuestionNumber,
            text: orQuestionText || defaultAlternativeText,
            marks,
            knowledgeLevel,
            bloomLevel: knowledgeLevel,
            courseOutcome,
            unit: 1,
          },
    }

    const updatedSections = paper.sections.map((sec) => {
      if (sec.sectionKey !== targetSectionKey) return sec
      return {
        ...sec,
        questions: [...sec.questions, newQ],
      }
    })

    const updatedPaper = {
      ...paper,
      sections: updatedSections,
      updatedAt: new Date().toISOString(),
    }

    setPaper(updatedPaper)
    updatePaper(paper.id, { sections: updatedSections })

    showToast(
      'success',
      'Question Inserted & Pasted!',
      `Added Q${qNumber} (${knowledgeLevel}, ${courseOutcome}, ${marks}M) directly to ${targetSectionKey.replace('_', ' ')}.`,
    )

    // Reset Form for next input
    setQuestionText('')
    setOrQuestionText('')
    setMcqOptions(['', '', '', ''])

    // Auto increment Q number if Part A
    if (targetSectionKey === 'PART_A') {
      const nextNum = parseInt(qNumber) + 1
      if (!isNaN(nextNum) && nextNum <= 5) {
        setQNumber(`${nextNum}.`)
        setCourseOutcome(nextNum <= 3 ? 'CO1' : 'CO2')
        setMarks(2)
        setIsMcqFormat(nextNum === 2 || nextNum === 4)
      }
    } else if (targetSectionKey === 'PART_B') {
      setTargetSectionKey('PART_C')
      setQNumber(getPartCQuestionNumberForIndex(0, 16))
      setMarks(16)
      setKnowledgeLevel('K3')
      setCourseOutcome('CO2')
      setIsOrChoice(true)
    } else if (targetSectionKey === 'PART_C') {
      const nextPartCIndex = (currentSection?.questions.length || 0) + 1
      setQNumber(getPartCQuestionNumberForIndex(nextPartCIndex, marks))
      if (nextPartCIndex >= 4) setCourseOutcome('CO3')
    }
  }

  // Remove question
  const handleRemoveQuestion = (sectionKey: string, questionId: string) => {
    const updatedSections = paper.sections.map((sec) => {
      if (sec.sectionKey !== sectionKey) return sec
      return {
        ...sec,
        questions: sec.questions.filter((q) => q.id !== questionId),
      }
    })

    setPaper({ ...paper, sections: updatedSections })
    updatePaper(paper.id, { sections: updatedSections })
    showToast('info', 'Question Removed', 'Removed question item from paper.')
  }

  // AI Suggestion Generator
  const handleAiSuggest = () => {
    const topic = paper.courseName || 'Data Structures'
    const templates: Record<KnowledgeLevel, string> = {
      K1: `Define the fundamental definition and operational rules of ${topic} components.`,
      K2: `Explain the architectural working mechanism of ${topic} with a neat schematic diagram.`,
      K3: `(i) Calculate and demonstrate the step-by-step trace of ${topic} on a 6-element input sequence. (10 Marks)\n(ii) Write the algorithmic procedure. (6 Marks)`,
      K4: `Analyze the time and space complexity tradeoffs of ${topic} compared with traditional sequential methods.`,
      K5: `Evaluate the robustness and performance degradation of ${topic} under maximum load constraints.`,
      K6: `Design a comprehensive system architecture incorporating ${topic} to meet high-throughput enterprise scalability.`,
    }

    setQuestionText(templates[knowledgeLevel] || templates.K2)
    showToast('success', 'AI Suggestion Inserted', `Generated ${knowledgeLevel} question stem for ${topic}.`)
  }

  // Submit Paper to Public Hub
  const handleSubmitPaper = () => {
    submitPaper(paper.id)
    showToast(
      'success',
      '🚀 Question Paper Submitted Successfully!',
      `${paper.courseCode} (${paper.internalType || 'Internal Assessment'}) is now published to the Public Question Paper Hub!`,
    )
    navigate('/hub')
  }

  const handleDownloadWordTemplate = async () => {
    try {
      await downloadFilledQuestionPaper(paper)
    } catch (error) {
      showToast('error', 'Template unavailable', 'The original Word template could not be opened.')
      console.error('Unable to open filled Word template', error)
    }
  }

  const partA = paper.sections.find((s) => s.sectionKey === 'PART_A')
  const partB = paper.sections.find((s) => s.sectionKey === 'PART_B')
  const partC = paper.sections.find((s) => s.sectionKey === 'PART_C')
  const courseOutcomeOptions: CourseOutcome[] = ['CO1', 'CO2', 'CO3', 'CO4', 'CO5']
  const defaultCourseOutcomeDescriptions: Record<CourseOutcome, string> = {
    CO1: 'Understand fundamental concepts and terminology.',
    CO2: 'Apply concepts and methods to solve problems.',
    CO3: 'Analyze processes, results, and complexity.',
    CO4: 'Evaluate solutions and compare alternatives.',
    CO5: 'Design complete solutions for practical problems.',
    CO6: 'Create and develop innovative solutions.',
  }
  const getCourseOutcomeDescription = (code: CourseOutcome) =>
    paper.courseOutcomesList.find((outcome) => outcome.code === code)?.description || defaultCourseOutcomeDescriptions[code]
  const getStoredCourseOutcomeDescription = (code: CourseOutcome) =>
    paper.courseOutcomesList.find((outcome) => outcome.code === code)?.description || ''

  const handleCourseOutcomeDescriptionChange = (code: CourseOutcome, description: string) => {
    const existingOutcome = paper.courseOutcomesList.find((outcome) => outcome.code === code)
    const courseOutcomesList = existingOutcome
      ? paper.courseOutcomesList.map((outcome) =>
          outcome.code === code ? { ...outcome, description } : outcome,
        )
      : [...paper.courseOutcomesList, { code, description }]
    const updatedPaper = { ...paper, courseOutcomesList, updatedAt: new Date().toISOString() }
    setPaper(updatedPaper)
    updatePaper(paper.id, { courseOutcomesList })
  }

  const handleFacultyNameChange = (facultyName: string) => {
    const updatedPaper = { ...paper, facultyName, updatedAt: new Date().toISOString() }
    setPaper(updatedPaper)
    updatePaper(paper.id, { facultyName })
  }

  return (
    <AppLayout role="faculty" pageTitle="Step 5: Interactive Question Paper Builder">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Step Indicator */}
        <StepBreadcrumbs
          currentStep={5}
          deptCode={paper.departmentCode}
          semNumber={paper.semesterNumber}
          courseId={paper.courseId}
          courseCode={paper.courseCode}
          examType={paper.internalType}
        />

        {/* Top Header & The 3 Main Action Buttons */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 font-mono text-xs font-bold text-indigo-700">
                {paper.courseCode}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {paper.internalType || 'Internal Assessment 1'} &bull; {paper.semester}
              </span>
              <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                KCET Autonomous 2021
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {paper.title}
            </h1>
            <p className="text-xs text-slate-500">
              Department of {paper.departmentName || paper.branch} &bull; Coordinator: {paper.facultyName}
            </p>
          </div>

          {/* 3 Main Action Buttons: Preview | Download | Submit */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              className="text-xs font-bold"
            >
              <Eye className="size-4" />
              1. Preview Official Template
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadWordTemplate}
              className="text-xs font-bold"
            >
              <Download className="size-4" />
              2. Download Word
            </Button>

            <Button
              variant="primary"
              onClick={handleSubmitPaper}
              className="bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <Send className="size-4" />
              3. Submit Question Paper
            </Button>
          </div>
        </div>

        {/* Live Marks Balance Bar */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div
            className={`rounded-xl border p-4 flex items-center justify-between ${
              totalCalculatedMarks === paper.maxMarks
                ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                : 'border-amber-200 bg-amber-50 text-amber-950'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">
                Total Marks Check
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black">{totalCalculatedMarks}</span>
                <span className="text-xs font-bold opacity-75">/ {paper.maxMarks} Marks</span>
              </div>
              <p className="text-[11px] font-semibold mt-0.5">
                {totalCalculatedMarks === paper.maxMarks
                  ? `✓ Perfectly balanced (${paper.maxMarks} marks)`
                  : `Add questions to complete ${paper.maxMarks} marks`}
              </p>
            </div>
            {totalCalculatedMarks === paper.maxMarks ? (
              <CheckCircle2 className="size-8 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="size-8 text-amber-600 shrink-0" />
            )}
          </div>

          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4">
            <BloomTaxonomyChart paper={paper} showGuidelineNotice={false} />
          </div>
        </div>

        {/* The Question Form (Interactive Question Inserter) */}
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                Add a question
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                Enter the question details
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleAiSuggest}
                className="h-auto px-3 py-1.5 text-xs font-bold"
              >
                <Sparkles className="size-3.5 text-purple-600" />
                AI Suggest
              </Button>
              <Button
                variant="outline"
                onClick={() => setBankModalOpen(true)}
                className="h-auto px-3 py-1.5 text-xs font-bold"
              >
                <Database className="size-3.5 text-indigo-600" />
                Pick from Bank
              </Button>
            </div>
          </div>

          <form onSubmit={handleInsertQuestion} className="space-y-4 text-xs">
            {/* Step 1: Select Part */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide text-[11px]">
                1. Select Question Paper Section
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSectionChange('PART_A')}
                  disabled={(partA?.questions.length ?? 0) >= 5}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    (partA?.questions.length ?? 0) >= 5
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                      : targetSectionKey === 'PART_A'
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Part A (5 x 2 = 10 Marks)
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionChange('PART_B')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    targetSectionKey === 'PART_B'
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Part B (1 x 8 = 8 Marks)
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionChange('PART_C')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    targetSectionKey === 'PART_C'
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Part C (2 x 16 = 32 Marks)
                </button>
              </div>
            </div>

            {/* Step 2: Meta Tags (Q.No, Knowledge Level, CO, Marks, Unit) */}
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Q. Number</label>
                <input
                  type="text"
                  required
                  value={qNumber}
                  onChange={(e) => {
                    const value = e.target.value
                    setQNumber(value)
                    if (targetSectionKey === 'PART_A') {
                      const number = Number.parseInt(value, 10)
                      setMarks(2)
                      setIsMcqFormat(number === 2 || number === 4)
                    }
                  }}
                  placeholder="e.g. 1. or 6 (a)"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Knowledge Level</label>
                <select
                  value={knowledgeLevel}
                  onChange={(e) => setKnowledgeLevel(e.target.value as KnowledgeLevel)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 bg-white"
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
                <label className="block font-bold text-slate-700 mb-1">Course Outcome</label>
                <select
                  value={courseOutcome}
                  onChange={(e) => setCourseOutcome(e.target.value as CourseOutcome)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-indigo-700 font-mono bg-white"
                >
                  <option value="CO1">CO1</option>
                  <option value="CO2">CO2</option>
                  <option value="CO3">CO3</option>
                  <option value="CO4">CO4</option>
                  <option value="CO5">CO5</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Allocated Marks</label>
                {targetSectionKey === 'PART_B' ? (
                  <input
                    type="number"
                    required
                    value={8}
                    readOnly
                    className="w-full rounded-xl border border-slate-300 bg-slate-100 p-2 text-center text-xs font-bold text-slate-900"
                  />
                ) : targetSectionKey === 'PART_C' ? (
                  <select
                    required
                    value={marks}
                    onChange={(e) => {
                      const selectedMarks = Number(e.target.value) === 8 ? 8 : 16
                      const partCCount = paper.sections.find((section) => section.sectionKey === 'PART_C')?.questions.length || 0
                      const partCFormat = getPartCFormat(selectedMarks)
                      const updatedSections = paper.sections.map((section) =>
                        section.sectionKey === 'PART_C'
                          ? { ...section, title: partCFormat.title, instruction: partCFormat.instruction }
                          : section,
                      )
                      setMarks(selectedMarks)
                      setIsOrChoice(selectedMarks === 16)
                      setQNumber(getPartCQuestionNumberForIndex(
                        selectedMarks === 8 ? partCCount : (qNumber.startsWith('8') ? 1 : 0),
                        selectedMarks,
                      ))
                      setPaper({ ...paper, sections: updatedSections })
                      updatePaper(paper.id, { sections: updatedSections })
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-center text-xs font-bold text-slate-900"
                  >
                    <option value={8}>8 Marks</option>
                    <option value={16}>16 Marks</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    required
                    value={marks}
                    readOnly
                    className="w-full rounded-xl border border-slate-300 bg-slate-100 p-2 text-center text-xs font-bold text-slate-900"
                  />
                )}
              </div>

              <div className="col-span-2 sm:col-span-4">
                <label className="block font-bold text-slate-700 mb-1">Faculty Name</label>
                <input
                  type="text"
                  required
                  value={paper.facultyName}
                  onChange={(event) => handleFacultyNameChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-indigo-900">
                    Course Outcome for this question
                  </p>
                  <p className="text-[11px] font-semibold text-indigo-700">
                    Select the CO that belongs to Q{qNumber}. It will be inserted in the question row.
                  </p>
                </div>
                <span className="rounded-md bg-white px-2 py-1 font-mono text-xs font-black text-indigo-700">
                  {courseOutcome}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {courseOutcomeOptions.map((outcomeCode) => (
                  <button
                    key={outcomeCode}
                    type="button"
                    onClick={() => setCourseOutcome(outcomeCode)}
                    className={`rounded-lg border px-4 py-2 text-xs font-black transition-colors ${
                      courseOutcome === outcomeCode
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-indigo-200 bg-white text-indigo-700 hover:border-indigo-500 hover:bg-indigo-100'
                    }`}
                    title={getCourseOutcomeDescription(outcomeCode)}
                  >
                    <span className="block">{outcomeCode}</span>
                    <span className="mt-0.5 block max-w-36 text-[10px] font-semibold leading-tight opacity-80">
                      {getCourseOutcomeDescription(outcomeCode)}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {courseOutcomeOptions.map((outcomeCode) => (
                  <label key={`${outcomeCode}-description`} className="text-[11px] font-bold text-indigo-900">
                    {outcomeCode} meaning
                    <input
                      type="text"
                      value={getStoredCourseOutcomeDescription(outcomeCode)}
                      onChange={(event) => handleCourseOutcomeDescriptionChange(outcomeCode, event.target.value)}
                      placeholder={`Type what ${outcomeCode} means`}
                      className="mt-1 w-full rounded-lg border border-indigo-200 bg-white p-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Question Text */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  Question Description & Sub-divisions:
                </label>
                {targetSectionKey === 'PART_A' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isPartAMcqNumber(qNumber)) setIsMcqFormat(!isMcqFormat)
                    }}
                    className={`font-bold text-[11px] ${isPartAMcqNumber(qNumber) ? 'cursor-default text-indigo-500' : 'text-indigo-600 hover:underline'}`}
                  >
                    {isPartAMcqNumber(qNumber)
                      ? '✓ Required MCQ for this question'
                      : isMcqFormat
                        ? '✓ MCQ Format Active'
                        : '+ Format as Multiple-choice Question'}
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter complete question description, parameters, or sub-parts (i), (ii)..."
                className="w-full rounded-lg border border-slate-300 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden font-serif leading-relaxed"
              />
            </div>

            {targetSectionKey === 'PART_A' && isMcqFormat && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-indigo-900">
                      Four options required for Q{qNumber}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-indigo-700">
                      This Part A question is fixed at 2 marks.
                    </p>
                  </div>
                  <span className="rounded-md bg-white px-2 py-1 text-[11px] font-black text-indigo-700">
                    2 Marks
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {mcqOptions.map((option, index) => (
                    <label key={String.fromCharCode(97 + index)} className="text-xs font-bold text-slate-700">
                      Option {String.fromCharCode(65 + index)}
                      <input
                        type="text"
                        required
                        value={option}
                        onChange={(e) => {
                          const nextOptions = [...mcqOptions]
                          nextOptions[index] = e.target.value
                          setMcqOptions(nextOptions)
                        }}
                        placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                        className="mt-1 w-full rounded-lg border border-indigo-200 bg-white p-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Optional OR Question for Part B / Part C */}
            {(targetSectionKey === 'PART_B' || (targetSectionKey === 'PART_C' && marks === 16)) && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-900 text-xs uppercase tracking-wide">
                    --- (OR) Alternative Question ({getAlternativeQuestionNumber(qNumber)}) ---
                  </span>
                  <span className="text-[11px] font-bold text-amber-800">{marks} Marks</span>
                </div>
                <textarea
                  rows={2}
                  value={orQuestionText}
                  onChange={(e) => setOrQuestionText(e.target.value)}
                  placeholder={`Enter alternate (OR) question for ${getAlternativeQuestionNumber(qNumber)}...`}
                  className="w-full rounded-xl border border-amber-300 bg-white p-3 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden font-serif"
                />
              </div>
            )}

            {/* Submit Question to Paper Button */}
            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                className="w-full bg-indigo-600 text-sm font-bold hover:bg-indigo-700 sm:w-auto"
              >
                <Plus className="size-5" />
                ➕ Insert Question to Question Paper
              </Button>
            </div>
          </form>
        </div>

        {/* Live Question Paper Preview Sheet */}
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                Questions in this paper
              </span>
              <h3 className="text-lg font-black text-slate-900">
                {paper.courseCode} - {paper.courseName} ({paper.internalType || 'Internal 1'})
              </h3>
            </div>

            <Button
              variant="outline"
              onClick={handleDownloadWordTemplate}
              className="text-xs gap-1.5 font-bold"
            >
              <Eye className="size-4" />
              Download Filled Word
            </Button>
          </div>

          {/* Part A Table */}
          {partA && (
            <div className="space-y-2">
              <div className="bg-slate-100 px-4 py-2 rounded-xl flex items-center justify-between font-bold text-xs text-slate-800 border border-slate-200">
                <span>{partA.title}</span>
                <span>{partA.questions.length} / 5 Questions Added ({partA.questions.reduce((a, q) => a + q.marks, 0)} M)</span>
              </div>

              {partA.questions.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                  No questions in Part A yet. Use the form above to insert Q1 to Q5.
                </div>
              ) : (
                <div className="space-y-2">
                  {partA.questions.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-start justify-between gap-3 hover:bg-white transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-extrabold text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-xs">
                            Q {q.questionNumber}
                          </span>
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {q.courseOutcome}
                          </span>
                          <KnowledgeBadge level={q.knowledgeLevel || 'K2'} />
                          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {q.marks} Marks
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed font-serif pt-1 whitespace-pre-line">
                          {q.text}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveQuestion('PART_A', q.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove question"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Part B Table */}
          {partB && (
            <div className="space-y-2">
              <div className="bg-slate-100 px-4 py-2 rounded-xl flex items-center justify-between font-bold text-xs text-slate-800 border border-slate-200">
                <span>{partB.title}</span>
                <span>{partB.questions.length} / 1 Question with (OR) ({partB.questions.reduce((a, q) => a + q.marks, 0)} M)</span>
              </div>

              {partB.questions.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                  No questions in Part B yet. Use the form above to insert Q6(a) and Q6(b).
                </div>
              ) : (
                <div className="space-y-2">
                  {partB.questions.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-xs">
                            Q {q.questionNumber}
                          </span>
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {q.courseOutcome}
                          </span>
                          <KnowledgeBadge level={q.knowledgeLevel || 'K2'} />
                          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {q.marks} Marks
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveQuestion('PART_B', q.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-line">
                        {q.text}
                      </p>

                      {q.isChoice && q.orQuestion && (
                        <div className="pt-3 border-t border-dashed border-slate-300 space-y-1">
                          <div className="text-center font-bold text-xs uppercase tracking-widest text-slate-500 my-1">
                            --- (OR) ---
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-line">
                            {q.orQuestion.text}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Part C Table */}
          {partC && (
            <div className="space-y-2">
              <div className="bg-slate-100 px-4 py-2 rounded-xl flex items-center justify-between font-bold text-xs text-slate-800 border border-slate-200">
                <span>{partC.title}</span>
                <span>{partC.questions.length} / 2 Questions with (OR) ({partC.questions.reduce((a, q) => a + q.marks, 0)} M)</span>
              </div>

              {partC.questions.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                  No questions in Part C yet. Use the form above to insert Q7(a)/(b) and Q8(a)/(b).
                </div>
              ) : (
                <div className="space-y-2">
                  {partC.questions.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-xs">
                            Q {q.questionNumber}
                          </span>
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {q.courseOutcome}
                          </span>
                          <KnowledgeBadge level={q.knowledgeLevel || 'K3'} />
                          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {q.marks} Marks
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveQuestion('PART_C', q.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-line">
                        {q.text}
                      </p>

                      {q.isChoice && q.orQuestion && (
                        <div className="pt-3 border-t border-dashed border-slate-300 space-y-1">
                          <div className="text-center font-bold text-xs uppercase tracking-widest text-slate-500 my-1">
                            --- (OR) {q.orQuestion.subLabel || ''} ---
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-line">
                            {q.orQuestion.text}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Pinned Action Bar with the 3 Core Buttons */}
        <div className="sticky bottom-4 z-20 flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">Total Progress:</span>
            <span
              className={`rounded-md px-3 py-1 text-xs font-bold ${
                totalCalculatedMarks === paper.maxMarks
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {totalCalculatedMarks} / {paper.maxMarks} Marks
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              className="text-xs font-bold"
            >
              <Eye className="size-4" />
              1. Preview Official Template
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadWordTemplate}
              className="text-xs font-bold"
            >
              <Download className="size-4" />
              2. Download Word
            </Button>

            <Button
              variant="primary"
              onClick={handleSubmitPaper}
              className="bg-emerald-600 text-xs font-bold hover:bg-emerald-700"
            >
              <Send className="size-4" />
              3. Submit to Hub
            </Button>
          </div>
        </div>
      </div>

      {/* Official Kamaraj College Question Paper Printable Preview Modal */}
      <PaperPreviewModal
        paper={paper}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      {/* Pick from Bank Modal */}
      <Modal
        isOpen={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        title="Select Question from Subject Repository"
        description="Choose a question from the question repository to populate directly into the form."
        maxWidth="4xl"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {bankQuestions.map((bq) => (
            <div
              key={bq.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-3.5 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all bg-white"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    Unit {bq.unit}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {bq.courseOutcome}
                  </span>
                  <KnowledgeBadge level={bq.knowledgeLevel || 'K2'} />
                  <span className="text-xs font-bold text-slate-800">{bq.marks} Marks</span>
                </div>
                <p className="text-xs text-slate-800 font-serif leading-relaxed">{bq.text}</p>
              </div>

              <Button
                variant="primary"
                onClick={() => {
                  setQuestionText(bq.text)
                  setKnowledgeLevel((bq.knowledgeLevel || 'K2') as KnowledgeLevel)
                  setCourseOutcome(bq.courseOutcome)
                  setMarks(bq.marks)
                  setBankModalOpen(false)
                  showToast('success', 'Question Loaded', 'Populated question text into form.')
                }}
                className="text-xs px-3 py-1.5 h-auto shrink-0 bg-indigo-600 font-bold"
              >
                Use Question
              </Button>
            </div>
          ))}
        </div>
      </Modal>
    </AppLayout>
  )
}
