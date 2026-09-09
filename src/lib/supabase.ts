import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export const isSupabaseReady = Boolean(supabase)

export type ProfileInsert = {
  id: string
  email: string
  full_name: string
  role: 'faculty' | 'admin'
  department: string
  designation: string
  employee_id: string
  college: string
}

export async function upsertProfile(profile: ProfileInsert) {
  if (!supabase) return null

  const { data, error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' }).select().single()
  if (error) throw error
  return data
}

export async function ensureProfileForAuthUser(user: {
  id: string
  email?: string | null
  user_metadata?: {
    full_name?: string
    role?: 'faculty' | 'admin'
    department?: string
    designation?: string
    employee_id?: string
    college?: string
  }
}) {
  if (!supabase || !user?.id) return null

  const nextProfile = {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    role: user.user_metadata?.role || 'faculty',
    department: user.user_metadata?.department || 'Computer Science & Engineering',
    designation: user.user_metadata?.designation || 'Faculty Member',
    employee_id: user.user_metadata?.employee_id || `USER-${Date.now().toString().slice(-6)}`,
    college: user.user_metadata?.college || 'Faculty Forge University',
  }

  return upsertProfile(nextProfile)
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getProfilesByEmail(email: string) {
  if (!supabase) return []

  const { data, error } = await supabase.from('profiles').select('*').eq('email', email)
  if (error) throw error
  return data ?? []
}

export async function getDepartments() {
  if (!supabase) return []

  const { data, error } = await supabase.from('departments').select('*').order('name')
  if (error) throw error
  return data ?? []
}

export async function getSubjects() {
  if (!supabase) return []

  const { data, error } = await supabase.from('subjects').select('*')
  if (error) {
    const fallback = await supabase.from('subjects').select('*')
    if (fallback.error) throw fallback.error
    return fallback.data ?? []
  }
  return data ?? []
}
