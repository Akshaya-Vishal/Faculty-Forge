import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEMO_ADMIN, DEMO_FACULTY } from '../data/mockData'
import { ensureProfileForAuthUser, signInWithEmail, signOut, supabase, upsertProfile } from '../lib/supabase'
import { sendOtpEmail, verifyOtpCode } from '../lib/otpService'
import type { UserProfile, UserRole } from '../types/models'

interface SignUpPayload {
  name: string
  email: string
  password: string
  role: UserRole
  department: string
  designation: string
  employeeId: string
  college: string
}

interface AuthContextType {
  user: UserProfile | null
  role: UserRole
  isAuthenticated: boolean
  login: (role: UserRole, email?: string, password?: string) => Promise<void>
  signUp: (payload: SignUpPayload) => Promise<{ requiresEmailConfirmation: boolean }>
  logout: () => void
  switchRole: (role: UserRole) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  sendOtp: (email: string) => Promise<string>
  verifyOtp: (email: string, code: string) => Promise<boolean>
}

const AUTH_STORAGE_KEY = 'faculty_forge_auth_user'
const AUTH_LOCAL_USERS_KEY = 'faculty_forge_local_users'
const AUTH_OTP_KEY = 'faculty_forge_otp_codes'

const normalizeEmail = (email?: string) => email?.trim().toLowerCase() || ''

const isUnconfirmedUserError = (message: string) => {
  const lowered = message.toLowerCase()
  return (
    lowered.includes('email not confirmed') ||
    lowered.includes('confirm your email') ||
    lowered.includes('email confirmation') ||
    lowered.includes('user not confirmed') ||
    lowered.includes('sign in requires email confirmation')
  )
}

const readOtpMap = () => {
  try {
    const raw = localStorage.getItem(AUTH_OTP_KEY)
    if (!raw) return {} as Record<string, { code: string; expiresAt: number }>
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {} as Record<string, { code: string; expiresAt: number }>
  }
}

const writeOtpMap = (map: Record<string, { code: string; expiresAt: number }>) => {
  localStorage.setItem(AUTH_OTP_KEY, JSON.stringify(map))
}

const createOtpForEmail = (email: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = Date.now() + 5 * 60 * 1000
  const map = readOtpMap()
  map[normalizeEmail(email)] = { code: otp, expiresAt }
  writeOtpMap(map)
  return otp
}

const consumeOtpForEmail = (email: string, enteredCode: string) => {
  const key = normalizeEmail(email)
  const map = readOtpMap()
  const row = map[key]
  if (!row) return false

  const isValid = row.code === enteredCode && Date.now() < row.expiresAt
  if (isValid) {
    delete map[key]
    writeOtpMap(map)
  }

  return isValid
}

const readLocalUsers = () => {
  try {
    const raw = localStorage.getItem(AUTH_LOCAL_USERS_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeLocalUsers = (users: Array<Record<string, string>>) => {
  localStorage.setItem(AUTH_LOCAL_USERS_KEY, JSON.stringify(users))
}

const normalizeDepartmentValue = (value?: string) => {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed
          ? {
              ...parsed,
              department: normalizeDepartmentValue(parsed.department),
            }
          : null
      }
    } catch {
      // ignore
    }
    return null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [user])

  const login = async (role: UserRole, email?: string, password?: string) => {
    const normalizedEmail = normalizeEmail(email)
    const isDemoAccount =
      normalizedEmail === DEMO_ADMIN.email.toLowerCase() ||
      normalizedEmail === DEMO_FACULTY.email.toLowerCase()

    const localUsers = readLocalUsers()
    const localMatch = localUsers.find(
      (user) => normalizeEmail(user.email) === normalizedEmail && user.password === password,
    )

    if (localMatch) {
      setUser({
        id: localMatch.id,
        name: localMatch.name,
        email: localMatch.email,
        role: localMatch.role,
        department: normalizeDepartmentValue(localMatch.department),
        designation: localMatch.designation,
        employeeId: localMatch.employeeId,
        college: localMatch.college,
      })
      return
    }

    if (supabase && normalizedEmail && password) {
      try {
        const data = await signInWithEmail(normalizedEmail, password)

        const savedProfile = await ensureProfileForAuthUser({
          id: data.user.id,
          email: data.user.email,
          user_metadata: {
            full_name: data.user.user_metadata?.full_name,
            role,
            department: data.user.user_metadata?.department || 'Computer Science & Engineering',
            designation: data.user.user_metadata?.designation || (role === 'admin' ? 'Controller of Examinations' : 'Faculty Member'),
            employee_id: data.user.user_metadata?.employee_id,
            college: data.user.user_metadata?.college || 'Faculty Forge University',
          },
        })

        const profile: UserProfile = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || normalizedEmail,
          role: savedProfile?.role || role,
          department: savedProfile?.department || data.user.user_metadata?.department || 'Computer Science & Engineering',
          designation: savedProfile?.designation || data.user.user_metadata?.designation || (role === 'admin' ? 'Controller of Examinations' : 'Faculty Member'),
          employeeId: savedProfile?.employee_id || data.user.user_metadata?.employee_id || `USER-${Date.now().toString().slice(-6)}`,
          college: savedProfile?.college || data.user.user_metadata?.college || 'Faculty Forge University',
        }
        setUser(profile)
        return
      } catch (error) {
        if (isDemoAccount) {
          setUser(role === 'admin' ? DEMO_ADMIN : DEMO_FACULTY)
          return
        }

        const message = error instanceof Error ? error.message : ''
        const lowered = message.toLowerCase()
        const isEmailLimitIssue =
          lowered.includes('email rate limit') ||
          lowered.includes('rate limit exceeded') ||
          lowered.includes('too many requests') ||
          lowered.includes('email limit exceeded') ||
          lowered.includes('confirmation email') ||
          lowered.includes('smtp') ||
          lowered.includes('unable to send confirmation')

        const fallbackLocalUser = localUsers.find(
          (user) => normalizeEmail(user.email) === normalizedEmail && user.password === password,
        )

        if (fallbackLocalUser || isEmailLimitIssue || isUnconfirmedUserError(message)) {
          if (fallbackLocalUser) {
            setUser({
              id: fallbackLocalUser.id,
              name: fallbackLocalUser.name,
              email: fallbackLocalUser.email,
              role: fallbackLocalUser.role,
              department: normalizeDepartmentValue(fallbackLocalUser.department),
              designation: fallbackLocalUser.designation,
              employeeId: fallbackLocalUser.employeeId,
              college: fallbackLocalUser.college,
            })
            return
          }

          if (isUnconfirmedUserError(message) && normalizedEmail && password) {
            const createdLocalUser: Record<string, string> = {
              id: `local-${Date.now()}`,
              name: role === 'admin' ? 'Admin User' : 'Faculty User',
              email: normalizedEmail,
              password,
              role,
              department: 'Computer Science & Engineering',
              designation: role === 'admin' ? 'Controller of Examinations' : 'Faculty Member',
              employeeId: role === 'admin' ? 'COE-LOCAL' : 'FAC-LOCAL',
              college: 'Faculty Forge University',
            }
            const nextUsers = [
              ...localUsers.filter((user) => normalizeEmail(user.email) !== normalizedEmail),
              createdLocalUser,
            ]
            writeLocalUsers(nextUsers)
            setUser({
              id: createdLocalUser.id,
              name: createdLocalUser.name,
              email: createdLocalUser.email,
              role: createdLocalUser.role as UserRole,
              department: normalizeDepartmentValue(createdLocalUser.department),
              designation: createdLocalUser.designation,
              employeeId: createdLocalUser.employeeId,
              college: createdLocalUser.college,
            })
            return
          }
        }

        throw error
      }
    }

    if (isDemoAccount) {
      setUser(role === 'admin' ? DEMO_ADMIN : DEMO_FACULTY)
      return
    }

    if (role === 'admin') {
      setUser({
        ...DEMO_ADMIN,
        email: email || DEMO_ADMIN.email,
      })
    } else {
      setUser({
        ...DEMO_FACULTY,
        email: email || DEMO_FACULTY.email,
      })
    }
  }

  const signUp = async (payload: SignUpPayload) => {
    const normalizedEmail = normalizeEmail(payload.email)
    const fallbackUser: UserProfile = {
      id: `local-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      department: normalizeDepartmentValue(payload.department),
      designation: payload.designation,
      employeeId: payload.employeeId,
      college: payload.college,
    }

    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: payload.password,
          options: {
            data: {
              full_name: payload.name,
              role: payload.role,
              department: payload.department,
              designation: payload.designation,
              employee_id: payload.employeeId,
              college: payload.college,
            },
          },
        })

        if (error) {
          throw error
        }

        if (data.user) {
          try {
            await upsertProfile({
              id: data.user.id,
              email: normalizedEmail,
              full_name: payload.name,
              role: payload.role,
              department: payload.department,
              designation: payload.designation,
              employee_id: payload.employeeId,
              college: payload.college,
            })
          } catch (profileError) {
            console.warn('Profile sync failed during signup. User was still created in Auth.', profileError)
          }

          const localUsers = readLocalUsers()
          const nextUsers = [
            ...localUsers.filter((user) => normalizeEmail(user.email) !== normalizedEmail),
            {
              id: data.user.id,
              name: payload.name,
              email: payload.email,
              password: payload.password,
              role: payload.role,
              department: payload.department,
              designation: payload.designation,
              employeeId: payload.employeeId,
              college: payload.college,
            },
          ]
          writeLocalUsers(nextUsers)
        }

        return {
          requiresEmailConfirmation: false,
        }
      }

      const localUsers = readLocalUsers()
      const nextUsers = [
        ...localUsers.filter((user) => normalizeEmail(user.email) !== normalizedEmail),
        {
          id: fallbackUser.id,
          name: payload.name,
          email: payload.email,
          password: payload.password,
          role: payload.role,
          department: payload.department,
          designation: payload.designation,
          employeeId: payload.employeeId,
          college: payload.college,
        },
      ]
      writeLocalUsers(nextUsers)
      setUser(fallbackUser)
      return { requiresEmailConfirmation: false }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Account creation failed.'
      const lowered = message.toLowerCase()
      const isEmailLimitIssue =
        lowered.includes('email rate limit') ||
        lowered.includes('rate limit exceeded') ||
        lowered.includes('too many requests') ||
        lowered.includes('email limit exceeded') ||
        lowered.includes('confirmation email') ||
        lowered.includes('smtp') ||
        lowered.includes('unable to send confirmation') ||
        lowered.includes('missing supabase')

      if (isEmailLimitIssue) {
        const localUsers = readLocalUsers()
        const nextUsers = [
          ...localUsers.filter((user) => normalizeEmail(user.email) !== normalizedEmail),
          {
            id: fallbackUser.id,
            name: payload.name,
            email: payload.email,
            password: payload.password,
            role: payload.role,
            department: payload.department,
            designation: payload.designation,
            employeeId: payload.employeeId,
            college: payload.college,
          },
        ]
        writeLocalUsers(nextUsers)
        setUser(fallbackUser)
        return { requiresEmailConfirmation: false }
      }

      throw error
    }
  }

  const logout = async () => {
    if (supabase) {
      try {
        await signOut()
      } catch (error) {
        console.warn('Supabase sign-out failed.', error)
      }
    }
    setUser(null)
  }

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'admin') {
      setUser(DEMO_ADMIN)
    } else {
      setUser(DEMO_FACULTY)
    }
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null))
  }

  const sendOtp = async (email: string) => {
    const normalized = normalizeEmail(email)
    if (!normalized) {
      throw new Error('Please enter a valid email to receive the OTP.')
    }

    try {
      // Try to send OTP via edge function (if Supabase is configured)
      const result = await sendOtpEmail(normalized)
      if (result.success) {
        return 'OTP sent successfully'
      }
      throw new Error(result.message)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP'
      
      // Check if this is a configuration error vs a network error
      if (message.includes('not configured') || message.includes('Edge Function not found')) {
        // Fallback to local OTP for development
        console.warn('OTP Edge Function not available, using local OTP fallback')
        const otp = createOtpForEmail(normalized)
        return otp
      }

      throw new Error(message, { cause: error })
    }
  }

  const verifyOtp = async (email: string, code: string) => {
    const normalized = normalizeEmail(email)
    
    try {
      // Try to verify OTP from the database (if Supabase is configured)
      const isValid = await verifyOtpCode(normalized, code)
      if (isValid) {
        return true
      }
    } catch (error) {
      console.warn('Database OTP verification failed, trying fallback:', error)
    }

    // Fallback to local verification for development
    return consumeOtpForEmail(normalized, code)
  }

  const role: UserRole = user?.role || 'faculty'
  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        signUp,
        logout,
        switchRole,
        updateProfile,
        sendOtp,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
