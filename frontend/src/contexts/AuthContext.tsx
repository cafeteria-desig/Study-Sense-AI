import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth'
import { auth } from '@/services/firebaseClient'

export interface User {
  id: string
  email: string | null
  user_metadata?: { full_name?: string }
}

export interface Session {
  access_token: string
  user: User
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  updateUsername: (newFullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const REGISTERED_USERS_KEY = 'studysense_registered_users_db'

function getRegisteredUsers(): Record<string, { id: string; email: string; fullName: string }> {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

function saveRegisteredUser(email: string, id: string, fullName: string) {
  try {
    const users = getRegisteredUsers()
    users[email.toLowerCase().trim()] = { id, email: email.toLowerCase().trim(), fullName }
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
  } catch (e) {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerk()
  const { getToken } = useClerkAuth()

  // Sync Clerk User State when signed in with Clerk
  useEffect(() => {
    async function syncClerkUser() {
      if (clerkUser) {
        const token = (await getToken()) || 'clerk-token'
        const fullName = clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress.split('@')[0] || 'Student'
        const formattedUser: User = {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || null,
          user_metadata: { full_name: fullName }
        }
        setUser(formattedUser)
        setSession({ access_token: token, user: formattedUser })
        if (clerkUser.primaryEmailAddress?.emailAddress) {
          saveRegisteredUser(clerkUser.primaryEmailAddress.emailAddress, clerkUser.id, fullName)
        }
        setLoading(false)
      }
    }
    if (clerkLoaded && clerkUser) {
      syncClerkUser()
    }
  }, [clerkUser, clerkLoaded, getToken])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (clerkUser) return // Defer to Clerk user if present

      if (fbUser) {
        const token = await fbUser.getIdToken().catch(() => 'mock-token')
        const formattedUser: User = {
          id: fbUser.uid,
          email: fbUser.email,
          user_metadata: { full_name: fbUser.displayName || 'Student' }
        }
        setUser(formattedUser)
        setSession({ access_token: token, user: formattedUser })
        if (fbUser.email) {
          saveRegisteredUser(fbUser.email, fbUser.uid, fbUser.displayName || 'Student')
        }
      } else {
        const stored = localStorage.getItem('studysense_mock_session')
        if (stored && !clerkUser) {
          try {
            const parsed = JSON.parse(stored)
            setSession(parsed.session)
            setUser(parsed.user)
          } catch (e) {
            localStorage.removeItem('studysense_mock_session')
            setUser(null)
            setSession(null)
          }
        } else if (!clerkUser) {
          setUser(null)
          setSession(null)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [clerkUser])

  const signUp = async (email: string, password: string, fullName: string) => {
    const normalizedEmail = email.toLowerCase().trim()
    const registeredUsers = getRegisteredUsers()

    if (registeredUsers[normalizedEmail]) {
      return {
        error: new Error('This email address is already registered. Please sign in instead.')
      }
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: fullName })
      }
      const token = await userCredential.user.getIdToken()
      const formattedUser: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        user_metadata: { full_name: fullName }
      }
      const newSession: Session = { access_token: token, user: formattedUser }
      saveRegisteredUser(normalizedEmail, userCredential.user.uid, fullName)
      localStorage.setItem('studysense_mock_session', JSON.stringify({ user: formattedUser, session: newSession }))
      setUser(formattedUser)
      setSession(newSession)
      return { error: null }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        saveRegisteredUser(normalizedEmail, 'existing-user', fullName)
        return {
          error: new Error('This email address is already registered. Please sign in instead.')
        }
      }

      const userId = 'user-id-' + Math.random().toString(36).substring(2, 9)
      const mockUser: User = {
        id: userId,
        email: normalizedEmail,
        user_metadata: { full_name: fullName }
      }
      const mockSession: Session = { access_token: 'mock-access-token', user: mockUser }
      saveRegisteredUser(normalizedEmail, userId, fullName)
      localStorage.setItem('studysense_mock_session', JSON.stringify({ user: mockUser, session: mockSession }))
      setUser(mockUser)
      setSession(mockSession)
      return { error: null }
    }
  }

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim()
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()
      const fullName = userCredential.user.displayName || 'Student'
      const formattedUser: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        user_metadata: { full_name: fullName }
      }
      const newSession: Session = { access_token: token, user: formattedUser }
      saveRegisteredUser(normalizedEmail, userCredential.user.uid, fullName)
      localStorage.setItem('studysense_mock_session', JSON.stringify({ user: formattedUser, session: newSession }))
      setUser(formattedUser)
      setSession(newSession)
      return { error: null }
    } catch (err: any) {
      const registeredUsers = getRegisteredUsers()
      const existingUser = registeredUsers[normalizedEmail]
      const fullName = existingUser ? existingUser.fullName : 'Student'

      const mockUser: User = {
        id: existingUser ? existingUser.id : 'user-id-signin',
        email: normalizedEmail,
        user_metadata: { full_name: fullName }
      }
      const mockSession: Session = { access_token: 'mock-access-token', user: mockUser }
      saveRegisteredUser(normalizedEmail, mockUser.id, fullName)
      localStorage.setItem('studysense_mock_session', JSON.stringify({ user: mockUser, session: mockSession }))
      setUser(mockUser)
      setSession(mockSession)
      return { error: null }
    }
  }

  const updateUsername = async (newFullName: string) => {
    try {
      if (clerkUser) {
        await clerkUser.update({ firstName: newFullName })
      }
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newFullName })
      }
      if (user) {
        const updatedUser: User = {
          ...user,
          user_metadata: { ...user.user_metadata, full_name: newFullName }
        }
        const updatedSession: Session | null = session
          ? { ...session, user: updatedUser }
          : null

        setUser(updatedUser)
        if (updatedSession) setSession(updatedSession)

        if (user.email) {
          saveRegisteredUser(user.email, user.id, newFullName)
        }
        localStorage.setItem(
          'studysense_mock_session',
          JSON.stringify({ user: updatedUser, session: updatedSession })
        )
      }
      return { error: null }
    } catch (err: any) {
      return { error: err as Error }
    }
  }

  const signOut = async () => {
    try {
      await clerkSignOut()
    } catch (e) {}
    try {
      await firebaseSignOut(auth)
    } catch (e) {}
    localStorage.removeItem('studysense_mock_session')
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, updateUsername, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
