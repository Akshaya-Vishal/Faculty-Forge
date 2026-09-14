import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  ADS_DATASET_COURSES,
  INITIAL_COURSES,
  INITIAL_DEPARTMENT_SUMMARIES,
  INITIAL_EXAM_CYCLES,
  INITIAL_QUESTIONS,
  INITIAL_QUESTION_PAPERS,
} from '../data/mockData'
import { getDepartments, getSubjects, supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import {
  deletePaperFromSupabase,
  deleteQuestionFromSupabase,
  fetchMyPapers,
  getAllPapersForAdmin,
  insertQuestionInSupabase,
  savePaperToSupabase,
  updateQuestionInSupabase,
  updateQuestionPaperInSupabase,
} from '../lib/supabaseQueries'
import type {
  Course,
  DepartmentSummary,
  ExamCycle,
  Question,
  QuestionPaper,
  ReviewComment,
} from '../types/models'

interface DataContextType {
  papers: QuestionPaper[]
  courses: Course[]
  questions: Question[]
  examCycles: ExamCycle[]
  departments: DepartmentSummary[]
  getPaperById: (id: string) => QuestionPaper | undefined
  getCourseById: (id: string) => Course | undefined
  getCourseByCode: (code: string) => Course | undefined
  createPaper: (paperData: Omit<QuestionPaper, 'id' | 'createdAt' | 'updatedAt'>) => QuestionPaper
  updatePaper: (id: string, updates: Partial<QuestionPaper>) => void
  deletePaper: (id: string) => void
  submitPaper: (id: string) => void
  approvePaper: (id: string, comment?: string) => void
  requestPaperRevision: (id: string, comment: string, sectionRef?: string) => void
  rejectPaper: (id: string, reason: string) => void
  duplicatePaper: (id: string) => QuestionPaper | undefined
  addQuestion: (qData: Omit<Question, 'id' | 'createdAt'>) => Question
  updateQuestion: (id: string, updates: Partial<Question>) => void
  deleteQuestion: (id: string) => void
  addExamCycle: (cycle: Omit<ExamCycle, 'id'>) => ExamCycle
  resetDataToDefault: () => void
}

const STORAGE_KEYS = {
  PAPERS: 'faculty_forge_papers',
  COURSES: 'faculty_forge_courses',
  QUESTIONS: 'faculty_forge_questions',
  EXAM_CYCLES: 'faculty_forge_exam_cycles',
  DEPTS: 'faculty_forge_depts',
}

const normalizeDepartmentName = (value?: string) => {
  if (!value) return ''

  const normalized = value.trim()
  const lookup = normalized.toLowerCase().replace(/&/g, 'and')

  if (
    lookup.includes('ads') ||
    lookup.includes('artificial intelligence and data science') ||
    lookup.includes('artificial intelligence and data sciences') ||
    lookup.includes('artificial intelligence & data science') ||
    lookup.includes('artificial intelligence and ds') ||
    lookup.includes('ai and data science') ||
    lookup.includes('ai & data science')
  ) {
    return 'Artificial Intelligence & Data Science'
  }

  return normalized
}

const normalizeSavedDepartmentData = <T,>(items: T[] | null | undefined, key: 'department' | 'facultyDept' | 'branch' = 'department') => {
  if (!Array.isArray(items)) return []

  return items.map((item) => {
    if (!item || typeof item !== 'object') return item
    const record = item as Record<string, unknown>
    const value = typeof record[key] === 'string' ? record[key] as string : ''
    if (value) {
      record[key] = normalizeDepartmentName(value)
    }
    return item
  })
}

const DataContext = createContext<DataContextType | undefined>(undefined)

type SupabaseRecord = Record<string, unknown>

function stringValue(record: SupabaseRecord, key: string, fallback: string) {
  return typeof record[key] === 'string' && record[key] ? record[key] as string : fallback
}

function numberValue(record: SupabaseRecord, key: string, fallback: number) {
  const value = Number(record[key])
  return Number.isFinite(value) ? value : fallback
}

function mapSupabasePaper(row: SupabaseRecord): QuestionPaper {
  return {
    id: stringValue(row, 'id', `qp-${Date.now()}`),
    title: stringValue(row, 'title', 'Untitled Question Paper'),
    examName: stringValue(row, 'exam_name', 'Internal Examination'),
    internalType: stringValue(row, 'internal_type', 'Internal 1') as QuestionPaper['internalType'],
    academicYear: stringValue(row, 'academic_year', '2024-2025'),
    semester: stringValue(row, 'semester', 'Odd'),
    semesterNumber: numberValue(row, 'semester_number', 1),
    departmentCode: stringValue(row, 'department_code', ''),
    departmentName: stringValue(row, 'department', 'General'),
    branch: stringValue(row, 'department', 'General'),
    regulation: stringValue(row, 'regulation', 'R-2023'),
    courseId: stringValue(row, 'subject_id', ''),
    courseCode: stringValue(row, 'course_code', ''),
    courseName: stringValue(row, 'course_name', ''),
    durationMinutes: numberValue(row, 'duration_minutes', 90),
    maxMarks: numberValue(row, 'max_marks', 50),
    status: stringValue(row, 'status', 'Draft') as QuestionPaper['status'],
    facultyId: stringValue(row, 'faculty_id', ''),
    facultyName: stringValue(row, 'faculty_name', ''),
    facultyDept: stringValue(row, 'department', 'General'),
    sections: Array.isArray(row.sections) ? row.sections as QuestionPaper['sections'] : [],
    courseOutcomesList: Array.isArray(row.course_outcomes_list)
      ? row.course_outcomes_list as QuestionPaper['courseOutcomesList']
      : [],
    generalInstructions: Array.isArray(row.general_instructions) ? row.general_instructions as string[] : [],
    reviewComments: Array.isArray(row.review_comments) ? row.review_comments as ReviewComment[] : [],
    setLabel: stringValue(row, 'set_label', 'Set A') as QuestionPaper['setLabel'],
    submittedAt: typeof row.submitted_at === 'string' ? row.submitted_at : undefined,
    approvedAt: typeof row.approved_at === 'string' ? row.approved_at : undefined,
    createdAt: stringValue(row, 'created_at', new Date().toISOString()),
    updatedAt: stringValue(row, 'updated_at', new Date().toISOString()),
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [papers, setPapers] = useState<QuestionPaper[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAPERS)
      const parsed = saved ? JSON.parse(saved) : INITIAL_QUESTION_PAPERS
      return normalizeSavedDepartmentData(parsed, 'facultyDept') as QuestionPaper[]
    } catch {
      return INITIAL_QUESTION_PAPERS
    }
  })

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES)
      const parsed = saved ? JSON.parse(saved) : INITIAL_COURSES
      const savedCourses = normalizeSavedDepartmentData(parsed, 'department') as Course[]
      const datasetCodes = new Set(ADS_DATASET_COURSES.map((course) => course.code))
      return [
        ...savedCourses.filter(
          (course) => !datasetCodes.has(course.code) && !course.id.startsWith('crs-ads-'),
        ),
        ...ADS_DATASET_COURSES,
      ]
    } catch {
      return INITIAL_COURSES
    }
  })

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS)
      return saved ? JSON.parse(saved) : INITIAL_QUESTIONS
    } catch {
      return INITIAL_QUESTIONS
    }
  })

  const [examCycles, setExamCycles] = useState<ExamCycle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAM_CYCLES)
      return saved ? JSON.parse(saved) : INITIAL_EXAM_CYCLES
    } catch {
      return INITIAL_EXAM_CYCLES
    }
  })

  const [departments, setDepartments] = useState<DepartmentSummary[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEPTS)
      const parsed = saved ? JSON.parse(saved) : INITIAL_DEPARTMENT_SUMMARIES
      return normalizeSavedDepartmentData(parsed, 'department') as DepartmentSummary[]
    } catch {
      return INITIAL_DEPARTMENT_SUMMARIES
    }
  })

  useEffect(() => {
    if (!supabase) return

    const hydrateFromSupabase = async () => {
      try {
        const departmentRows = await getDepartments()
        if (Array.isArray(departmentRows) && departmentRows.length > 0) {
          const mappedDepartments: DepartmentSummary[] = departmentRows
            .map((row: SupabaseRecord) => normalizeDepartmentName(stringValue(row, 'name', '')))
            .filter((name, index, values) => name && values.indexOf(name) === index)
            .map((name) => ({
              department: name,
              totalCourses: 0,
              submittedPapers: 0,
              approvedPapers: 0,
              pendingPapers: 0,
            }))
          setDepartments(mappedDepartments)
        }

        const subjectRows = await getSubjects()
        if (Array.isArray(subjectRows) && subjectRows.length > 0) {
          const mappedCourses: Course[] = subjectRows.map((row: SupabaseRecord, index: number) => ({
            id: stringValue(row, 'id', `supabase-course-${index}`),
            code: stringValue(row, 'course_code', stringValue(row, 'code', `SUB-${index + 1}`)),
            name: stringValue(row, 'course_name', stringValue(row, 'name', 'Subject')),
            department: normalizeDepartmentName(stringValue(row, 'department', stringValue(row, 'department_name', 'General'))),
            departmentCode: stringValue(row, 'department_code', 'CSE'),
            year: numberValue(row, 'year', Math.ceil(numberValue(row, 'semester', numberValue(row, 'semester_id', 1)) / 2)),
            semester: numberValue(row, 'semester', numberValue(row, 'semester_id', 1)),
            credits: numberValue(row, 'credits', 3),
            regulation: stringValue(row, 'regulation', 'R-2023'),
            totalUnits: numberValue(row, 'total_units', 5),
            units: Array.isArray(row.units) ? row.units as Course['units'] : [
              {
                unitNumber: 1,
                title: 'Core Concepts',
                topics: ['Concepts and application'],
                hoursAllocated: 9,
              },
            ],
            courseOutcomes: Array.isArray(row.course_outcomes)
              ? (row.course_outcomes as SupabaseRecord[]).map((item, idx) => ({
                  code: stringValue(item, 'code', `CO${idx + 1}`) as Course['courseOutcomes'][number]['code'],
                  description: stringValue(item, 'description', `Course outcome ${idx + 1}`),
                  bloomTarget: stringValue(item, 'bloomTarget', 'K3') as Course['courseOutcomes'][number]['bloomTarget'],
                }))
              : [
                  { code: 'CO1', description: 'Understand the concept and apply it.', bloomTarget: 'K3' },
                  { code: 'CO2', description: 'Analyze and evaluate the concept.', bloomTarget: 'K4' },
                ],
            assignedFacultyId: row.assigned_faculty_id as string | undefined,
            assignedFacultyName: row.assigned_faculty_name as string | undefined,
            assignedFacultyEmail: row.assigned_faculty_email as string | undefined,
          }))
          setCourses(mappedCourses)
        }
      } catch (error) {
        console.warn('Supabase hydration failed, using local mock data.', error)
      }
    }

    hydrateFromSupabase()
  }, [])

  useEffect(() => {
    if (!supabase || !user?.id || user.id.startsWith('demo-') || user.id.startsWith('local-')) return

    const hydratePapersFromSupabase = async () => {
      try {
        const rows = user.role === 'admin' ? await getAllPapersForAdmin() : await fetchMyPapers(user.id)
        if (rows.length > 0) {
          setPapers(rows.map((row) => mapSupabasePaper(row as SupabaseRecord)))
        }
      } catch (error) {
        console.warn('Supabase paper hydration failed, using local paper data.', error)
      }
    }

    void hydratePapersFromSupabase()
  }, [user])

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers))
  }, [papers])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses))
  }, [courses])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions))
  }, [questions])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAM_CYCLES, JSON.stringify(examCycles))
  }, [examCycles])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPTS, JSON.stringify(departments))
  }, [departments])

  const getPaperById = (id: string) => papers.find((p) => p.id === id)
  const getCourseById = (id: string) => courses.find((c) => c.id === id)
  const getCourseByCode = (code: string) => courses.find((c) => c.code === code)

  const createPaper = (paperData: Omit<QuestionPaper, 'id' | 'createdAt' | 'updatedAt'>): QuestionPaper => {
    const newPaper: QuestionPaper = {
      ...paperData,
      id: `qp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPapers((prev) => [newPaper, ...prev])
    if (supabase && !paperData.facultyId.startsWith('demo-') && !paperData.facultyId.startsWith('local-')) {
      void savePaperToSupabase(paperData)
        .then((savedPaper) => {
          if (savedPaper?.id) {
            setPapers((prev) => prev.map((paper) => (paper.id === newPaper.id ? { ...paper, id: savedPaper.id } : paper)))
          }
        })
        .catch((error) => {
          console.warn('Supabase paper creation failed. Keeping local paper data.', error)
        })
    }
    return newPaper
  }

  const updatePaper = (id: string, updates: Partial<QuestionPaper>) => {
    setPapers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)),
    )
    if (supabase && !id.startsWith('qp-') && !id.startsWith('qp-copy-')) {
      void updateQuestionPaperInSupabase(id, updates).catch((error) => {
        console.warn('Supabase paper update failed. Keeping local paper data.', error)
      })
    }
  }

  const deletePaper = (id: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== id))
    if (supabase && !id.startsWith('qp-') && !id.startsWith('qp-copy-')) {
      void deletePaperFromSupabase(id).catch((error) => {
        console.warn('Supabase paper deletion failed.', error)
      })
    }
  }

  const submitPaper = (id: string) => {
    setPapers((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Submitted',
              submittedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )
  }

  const approvePaper = (id: string, comment?: string) => {
    setPapers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const newComments = [...p.reviewComments]
        if (comment) {
          newComments.push({
            id: `rc-${Date.now()}`,
            authorName: 'Exam Cell / CoE',
            authorRole: 'Admin / CoE',
            comment,
            createdAt: new Date().toISOString(),
            resolved: true,
          })
        }
        return {
          ...p,
          status: 'Approved',
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reviewComments: newComments,
        }
      }),
    )
  }

  const requestPaperRevision = (id: string, comment: string, sectionRef?: string) => {
    const newComment: ReviewComment = {
      id: `rc-${Date.now()}`,
      authorName: 'Office of Exam Controller',
      authorRole: 'Admin / CoE',
      sectionRef,
      comment,
      createdAt: new Date().toISOString(),
      resolved: false,
    }
    setPapers((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Revision Requested',
              reviewComments: [newComment, ...p.reviewComments],
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )
  }

  const rejectPaper = (id: string, reason: string) => {
    const newComment: ReviewComment = {
      id: `rc-${Date.now()}`,
      authorName: 'Office of Exam Controller',
      authorRole: 'Admin / CoE',
      comment: `Paper Rejected: ${reason}`,
      createdAt: new Date().toISOString(),
      resolved: false,
    }
    setPapers((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Rejected',
              reviewComments: [newComment, ...p.reviewComments],
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )
  }

  const duplicatePaper = (id: string) => {
    const target = getPaperById(id)
    if (!target) return undefined
    const duplicated: QuestionPaper = {
      ...target,
      id: `qp-copy-${Date.now()}`,
      title: `${target.title} (Copy)`,
      status: 'Draft',
      submittedAt: undefined,
      approvedAt: undefined,
      reviewComments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPapers((prev) => [duplicated, ...prev])
    return duplicated
  }

  const addQuestion = (qData: Omit<Question, 'id' | 'createdAt'>): Question => {
    const newQ: Question = {
      ...qData,
      id: `q-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setQuestions((prev) => [newQ, ...prev])
    if (supabase && user?.id && !user.id.startsWith('demo-') && !user.id.startsWith('local-')) {
      void insertQuestionInSupabase(qData).catch((error) => {
        console.warn('Supabase question creation failed. Keeping local question data.', error)
      })
    }
    return newQ
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)))
    if (supabase && !id.startsWith('q-')) {
      void updateQuestionInSupabase(id, updates).catch((error) => {
        console.warn('Supabase question update failed. Keeping local question data.', error)
      })
    }
  }

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
    if (supabase && !id.startsWith('q-')) {
      void deleteQuestionFromSupabase(id).catch((error) => {
        console.warn('Supabase question deletion failed.', error)
      })
    }
  }

  const addExamCycle = (cycleData: Omit<ExamCycle, 'id'>): ExamCycle => {
    const newCycle: ExamCycle = {
      ...cycleData,
      id: `exam-${Date.now()}`,
    }
    setExamCycles((prev) => [newCycle, ...prev])
    return newCycle
  }

  const resetDataToDefault = () => {
    localStorage.removeItem(STORAGE_KEYS.PAPERS)
    localStorage.removeItem(STORAGE_KEYS.COURSES)
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS)
    localStorage.removeItem(STORAGE_KEYS.EXAM_CYCLES)
    localStorage.removeItem(STORAGE_KEYS.DEPTS)
    setPapers(INITIAL_QUESTION_PAPERS)
    setCourses(INITIAL_COURSES)
    setQuestions(INITIAL_QUESTIONS)
    setExamCycles(INITIAL_EXAM_CYCLES)
    setDepartments(INITIAL_DEPARTMENT_SUMMARIES)
  }

  return (
    <DataContext.Provider
      value={{
        papers,
        courses,
        questions,
        examCycles,
        departments,
        getPaperById,
        getCourseById,
        getCourseByCode,
        createPaper,
        updatePaper,
        deletePaper,
        submitPaper,
        approvePaper,
        requestPaperRevision,
        rejectPaper,
        duplicatePaper,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addExamCycle,
        resetDataToDefault,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
