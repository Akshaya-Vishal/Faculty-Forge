import { supabase } from './supabase'

export type DepartmentRow = {
  id: string
  name: string
  code: string
  is_active?: boolean
}

export type YearRow = {
  id: string
  year_number: number
  display_name: string
}

export type SemesterRow = {
  id: string
  semester_number: number
  display_name: string
  year_id: string
}

export type SubjectRow = {
  id: string
  department_id: string
  year_id: string
  semester_id: string
  course_code: string
  course_name: string
  regulation: string
  is_active?: boolean
  created_at?: string
}

export async function fetchDepartmentsFromSupabase() {
  if (!supabase) return []
  const { data, error } = await supabase.from('departments').select('*').order('name', { ascending: true })
  if (error) throw error
  return data as DepartmentRow[]
}

export async function fetchYearsFromSupabase() {
  if (!supabase) return []
  const { data, error } = await supabase.from('years').select('*').order('year_number', { ascending: true })
  if (error) throw error
  return data as YearRow[]
}

export async function fetchSemestersForYearFromSupabase(yearId: string) {
  if (!supabase) return []
  const { data, error } = await supabase.from('semesters').select('*').eq('year_id', yearId).order('semester_number', { ascending: true })
  if (error) throw error
  return data as SemesterRow[]
}

export async function fetchSubjectsForDepartmentSemesterFromSupabase(departmentId: string, semesterId: string) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('department_id', departmentId)
    .eq('semester_id', semesterId)
    .order('course_name', { ascending: true })
  if (error) throw error
  return data as SubjectRow[]
}

export async function fetchCourseOutcomesForSubject(subjectId: string) {
  if (!supabase) return []
  const { data, error } = await supabase.from('course_outcomes').select('*').eq('subject_id', subjectId)
  if (error) throw error
  return data ?? []
}

export async function fetchQuestionsForPaper(paperId: string) {
  if (!supabase) return []
  const { data, error } = await supabase.from('questions').select('*').eq('question_paper_id', paperId).order('display_order', { ascending: true })
  if (error) throw error
  return data ?? []
}
