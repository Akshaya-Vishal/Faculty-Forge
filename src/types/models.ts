export type UserRole = 'faculty' | 'admin'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  designation: string
  employeeId: string
  avatarUrl?: string
  phone?: string
  college: string
  specialization?: string
}

export type KnowledgeLevel = 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6'
export type BloomLevel = KnowledgeLevel

export interface BloomInfo {
  level: KnowledgeLevel
  label: string
  kLabel: string
  verb: string
  color: string
  badgeClass: string
}

export const KNOWLEDGE_LEVEL_MAP: Record<KnowledgeLevel, BloomInfo> = {
  K1: {
    level: 'K1',
    label: 'Remember',
    kLabel: 'K-1',
    verb: 'Define, State, List, Recall',
    color: '#3b82f6',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  K2: {
    level: 'K2',
    label: 'Understand',
    kLabel: 'K-2',
    verb: 'Explain, Describe, Illustrate, Classify',
    color: '#06b6d4',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  K3: {
    level: 'K3',
    label: 'Apply',
    kLabel: 'K-3',
    verb: 'Solve, Calculate, Apply, Compute',
    color: '#10b981',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  K4: {
    level: 'K4',
    label: 'Analyze',
    kLabel: 'K-4',
    verb: 'Differentiate, Compare, Analyze, Examine',
    color: '#f59e0b',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  K5: {
    level: 'K5',
    label: 'Evaluate',
    kLabel: 'K-5',
    verb: 'Evaluate, Justify, Critique, Judge',
    color: '#8b5cf6',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  K6: {
    level: 'K6',
    label: 'Create',
    kLabel: 'K-6',
    verb: 'Design, Construct, Formulate, Propose',
    color: '#ec4899',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
}

export const BLOOM_TAXONOMY_MAP = KNOWLEDGE_LEVEL_MAP

export type CourseOutcome = 'CO1' | 'CO2' | 'CO3' | 'CO4' | 'CO5' | 'CO6'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type QuestionType = 'Descriptive' | 'Problem' | 'Short' | 'MCQ' | 'Design'

export interface Question {
  id: string
  text: string
  courseId: string
  courseCode: string
  courseName: string
  departmentCode?: string
  unit: number
  knowledgeLevel: KnowledgeLevel
  bloomLevel?: KnowledgeLevel
  courseOutcome: CourseOutcome
  difficulty: Difficulty
  marks: number
  questionType: QuestionType
  hasOptions?: boolean
  options?: string[]
  answerHint?: string
  codeSnippet?: string
  isApprovedByAdmin?: boolean
  authorName: string
  createdAt: string
}

export interface PaperQuestion {
  id: string
  questionNumber: string
  subLabel?: string // e.g. 6 (a) (i), 6 (a) (ii), etc.
  text: string
  marks: number
  knowledgeLevel: KnowledgeLevel
  bloomLevel?: KnowledgeLevel
  courseOutcome: CourseOutcome
  unit: number
  isChoice?: boolean
  orQuestion?: {
    id: string
    subLabel?: string
    text: string
    marks: number
    knowledgeLevel: KnowledgeLevel
    bloomLevel?: KnowledgeLevel
    courseOutcome: CourseOutcome
    unit: number
    answerScheme?: string
  }
  answerScheme?: string
}

export interface PaperSection {
  id: string
  sectionKey: 'PART_A' | 'PART_B' | 'PART_C'
  title: string
  instruction: string
  totalMarks: number
  questions: PaperQuestion[]
}

export type PaperStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Revision Requested'
  | 'Approved'
  | 'Rejected'

export interface ReviewComment {
  id: string
  authorName: string
  authorRole: string
  sectionRef?: string
  comment: string
  createdAt: string
  resolved?: boolean
}

export type InternalExamType = 'Internal 1' | 'Internal 2' | 'Model Exam' | 'Semester Exam'

export interface QuestionPaper {
  id: string
  title: string
  examName: string
  internalType: InternalExamType
  academicYear: string
  semester: string
  semesterNumber: number
  departmentCode: string
  departmentName: string
  branch: string
  commonTo?: string
  regulation: string
  courseId: string
  courseCode: string
  courseName: string
  durationMinutes: number
  durationText?: string
  maxMarks: number
  status: PaperStatus
  facultyId: string
  facultyName: string
  facultyDept: string
  sections: PaperSection[]
  courseOutcomesList: {
    code: CourseOutcome
    description: string
  }[]
  generalInstructions: string[]
  reviewComments: ReviewComment[]
  setLabel?: 'Set A' | 'Set B' | 'Set C'
  submittedAt?: string
  approvedAt?: string
  updatedAt: string
  createdAt: string
}

export interface SyllabusUnit {
  unitNumber: number
  title: string
  topics: string[]
  hoursAllocated: number
}

export interface Course {
  id: string
  code: string
  name: string
  departmentCode: string
  department: string
  year: number
  semester: number
  credits: number
  regulation: string
  totalUnits: number
  units: SyllabusUnit[]
  courseOutcomes: {
    code: CourseOutcome
    description: string
    bloomTarget: KnowledgeLevel
  }[]
  assignedFacultyId?: string
  assignedFacultyName?: string
  assignedFacultyEmail?: string
}

export interface DepartmentInfo {
  code: string
  name: string
  shortName: string
  icon: string
  color: string
  accentColor: string
  totalCourses: number
  activeFaculty: number
}

export interface ExamCycle {
  id: string
  name: string
  academicYear: string
  semester: string
  startDate: string
  endDate: string
  submissionDeadline: string
  status: 'Upcoming' | 'Active' | 'Under Evaluation' | 'Completed'
  totalPapersRequired: number
  totalPapersSubmitted: number
  totalPapersApproved: number
}

export interface DepartmentSummary {
  department: string
  totalCourses: number
  submittedPapers: number
  approvedPapers: number
  pendingPapers: number
}
