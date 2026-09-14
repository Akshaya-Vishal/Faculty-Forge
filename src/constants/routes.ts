export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',

  // 6-Step Flow Routes
  STEP1_DEPT: '/create',
  STEP2_YEAR_SEM: '/create/:dept',
  STEP3_SUBJECT: '/create/:dept/:sem',
  STEP4_EXAM: '/create/:dept/:sem/:courseId',
  STEP5_BUILDER: '/builder/:paperId',
  STEP6_HUB: '/hub',

  // Faculty Routes
  FACULTY: '/faculty',
  FACULTY_PAPERS: '/hub',
  FACULTY_PAPER_NEW: '/create',
  FACULTY_PAPER_EDIT: '/builder/:paperId',
  FACULTY_QUESTION_BANK: '/faculty/question-bank',
  FACULTY_SYLLABUS: '/faculty/syllabus',
  FACULTY_PROFILE: '/faculty/profile',

  // Admin Routes
  ADMIN: '/admin',
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_PAPER_GENERATOR: '/admin/generator',
  ADMIN_EXAMS: '/admin/exams',
  ADMIN_QUESTION_BANK: '/admin/question-bank',
  ADMIN_FACULTY: '/admin/faculty-management',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_PROFILE: '/admin/profile',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
