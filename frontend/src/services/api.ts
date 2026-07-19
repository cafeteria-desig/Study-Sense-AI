import { supabase } from './supabaseClient'

const API_URL = import.meta.env.VITE_API_URL as string

async function authFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })
}

export const api = {
  tutor: (messages: { role: string; content: string }[]) =>
    authFetch('/api/tutor', { method: 'POST', body: JSON.stringify({ messages }) }),

  notes: (topic: string, style?: string) =>
    authFetch('/api/notes', { method: 'POST', body: JSON.stringify({ topic, style }) }),

  quiz: (topic: string, count?: number) =>
    authFetch('/api/quiz', { method: 'POST', body: JSON.stringify({ topic, count }) }),

  flashcards: (topic: string, count?: number) =>
    authFetch('/api/flashcards', { method: 'POST', body: JSON.stringify({ topic, count }) }),

  planner: (subject: string, examDate: string, dailyHours?: number) =>
    authFetch('/api/planner', { method: 'POST', body: JSON.stringify({ subject, examDate, dailyHours }) }),

  pdf: (text: string, fileName: string) =>
    authFetch('/api/pdf', { method: 'POST', body: JSON.stringify({ text, fileName }) }),
}
