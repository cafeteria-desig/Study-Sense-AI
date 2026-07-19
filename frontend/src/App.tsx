import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TutorPage } from '@/pages/TutorPage'
import { NotesPage } from '@/pages/NotesPage'
import { QuizPage } from '@/pages/QuizPage'
import { FlashcardsPage } from '@/pages/FlashcardsPage'
import { PlannerPage } from '@/pages/PlannerPage'
import { PdfPage } from '@/pages/PdfPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { HistoryPage } from '@/pages/HistoryPage'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="font-mono text-sm text-muted-foreground animate-pulse">Loading…</span>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={<GuestGuard><LoginPage /></GuestGuard>}
      />
      <Route
        path="/register"
        element={<GuestGuard><RegisterPage /></GuestGuard>}
      />

      {/* Protected */}
      <Route path="/dashboard"  element={<AuthGuard><DashboardPage /></AuthGuard>} />
      <Route path="/tutor"      element={<AuthGuard><TutorPage /></AuthGuard>} />
      <Route path="/notes"      element={<AuthGuard><NotesPage /></AuthGuard>} />
      <Route path="/quiz"       element={<AuthGuard><QuizPage /></AuthGuard>} />
      <Route path="/flashcards" element={<AuthGuard><FlashcardsPage /></AuthGuard>} />
      <Route path="/planner"    element={<AuthGuard><PlannerPage /></AuthGuard>} />
      <Route path="/pdf"        element={<AuthGuard><PdfPage /></AuthGuard>} />
      <Route path="/settings"   element={<AuthGuard><SettingsPage /></AuthGuard>} />
      <Route path="/history"    element={<AuthGuard><HistoryPage /></AuthGuard>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

import { Toaster } from 'sonner'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="bottom-right" theme="dark" />
      </AuthProvider>
    </BrowserRouter>
  )
}

