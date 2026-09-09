import { supabase } from './supabase'
import type { QuestionPaper } from '../types/models'

export async function fetchDepartments() {
  if (!supabase) return []

  const { data, error } = await supabase.from('departments').select('*').order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchYears() {
  if (!supabase) return []

  const { data, error } = await supabase.from('years').select('*').order('year_number', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchSemestersByYear(yearId: string) {
  if (!supabase) return []

  const { data, error } = await supabase.from('semesters').select('*').eq('year_id', yearId).order('semester_number', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchSubjectsByDepartmentAndSemester(department: string, semester: number) {
  if (!supabase) return []

  const { data, error } = await supabase.from('subjects').select('*')
  if (error) throw error

  const rows = data ?? []

  const departmentMatches = rows.filter((subject) => {
    const subjectDepartment = subject.department ?? subject.department_name ?? subject.department_id ?? null
    const deptName = typeof subjectDepartment === 'string' ? subjectDepartment : ''
    const itemMatchesName = deptName && deptName.toLowerCase() === department.toLowerCase()

    if (itemMatchesName) return true

    if (subject.department_id) {
      return true
    }

    return false
  })

  const semesterMatches = departmentMatches.filter((subject) => {
    if (subject.semester !== undefined) return Number(subject.semester) === semester
    if (subject.semester_id !== undefined) return Number(subject.semester_id) === semester
    return true
  })

  return (semesterMatches ?? []).sort((a, b) => String(a.name ?? a.course_name ?? '').localeCompare(String(b.name ?? b.course_name ?? '')))
}

export async function fetchQuestionPaperBySubject(subjectId: string) {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('question_papers')
    .select('*')
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function fetchMyPapers(facultyId: string) {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('question_papers')
    .select('*')
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function fetchQuestionsByPaper(paperId: string) {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('paper_id', paperId)
    .order('question_number', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function savePaperToSupabase(paper: Omit<QuestionPaper, 'id' | 'createdAt' | 'updatedAt'> & { faculty_id?: string }) {
  if (!supabase) return null

  const payload = {
    faculty_id: paper.facultyId,
    title: paper.title,
    exam_name: paper.examName,
    internal_type: paper.internalType || 'Internal 1',
    academic_year: paper.academicYear,
    semester: paper.semester,
    department: paper.facultyDept,
    subject_id: paper.courseId,
    course_code: paper.courseCode,
    course_name: paper.courseName,
    max_marks: paper.maxMarks,
    duration_minutes: paper.durationMinutes,
    status: paper.status,
    sections: paper.sections,
    general_instructions: paper.generalInstructions,
    set_label: paper.setLabel || 'Set A',
    review_comments: paper.reviewComments,
  }

  const { data, error } = await supabase.from('question_papers').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updatePaperInSupabase(paperId: string, updates: Partial<Record<string, unknown>>) {
  if (!supabase) return null

  const { data, error } = await supabase.from('question_papers').update(updates).eq('id', paperId).select().single()
  if (error) throw error
  return data
}

export async function getAllPapersForAdmin() {
  if (!supabase) return []

  const { data, error } = await supabase.from('question_papers').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
