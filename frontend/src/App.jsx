import React, { useEffect, useMemo, useState } from 'react'
import Home from './pages/Home.jsx'
import Learning from './pages/Learning.jsx'
import Simulator from './pages/Simulator.jsx'
import Quiz from './pages/Quiz.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { fetchProgress, saveProgress } from './services/api.js'
import AiMentor from './components/AiMentor.jsx'

const ROUTES = ['home', 'learning', 'simulator', 'quiz', 'dashboard', 'login', 'register']

function readLocalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export default function App() {
  const [route, setRoute] = useState('home')
  const [user, setUser] = useState(() => readLocalJson('gm_user', null))
  const [completedLessonIds, setCompletedLessonIds] = useState(() => readLocalJson('gm_completed_lessons', []))
  const [latestQuizResult, setLatestQuizResult] = useState(() => readLocalJson('gm_quiz_result', null))
  const [simulatorSuggestedCommand, setSimulatorSuggestedCommand] = useState('')

  useEffect(() => {
    localStorage.setItem('gm_user', JSON.stringify(user))
  }, [user])

  useEffect(() => {
    localStorage.setItem('gm_completed_lessons', JSON.stringify(completedLessonIds))
  }, [completedLessonIds])

  useEffect(() => {
    localStorage.setItem('gm_quiz_result', JSON.stringify(latestQuizResult))
  }, [latestQuizResult])

  useEffect(() => {
    let alive = true
    if (!user?.email) return
    fetchProgress(user.email)
      .then((p) => {
        if (!alive || !p) return
        if (Array.isArray(p.completedLessonIds)) setCompletedLessonIds(p.completedLessonIds)
        if (typeof p.quizScore === 'number' && !Number.isNaN(p.quizScore)) {
          setLatestQuizResult((prev) => ({ ...(prev || {}), scorePercent: p.quizScore }))
        }
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [user?.email])

  const navItems = useMemo(
    () => [
      { id: 'home', label: 'Home' },
      { id: 'learning', label: 'Learning' },
      { id: 'simulator', label: 'Simulator' },
      { id: 'quiz', label: 'Quiz' },
      { id: 'dashboard', label: 'Dashboard' },
      { id: user ? 'logout' : 'login', label: user ? 'Logout' : 'Login' },
    ],
    [user]
  )

  function go(to) {
    if (ROUTES.includes(to)) setRoute(to)
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 border-b border-highlight/10 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-card shadow-glow grid place-items-center">
              <span className="text-highlight font-bold">GM</span>
            </div>
            <div>
              <div className="text-white font-semibold leading-tight">Git Mastery</div>
              <div className="text-xs text-text/70">Learn • Practice • Prove it</div>
            </div>
          </div>

          <nav className="hidden gap-2 md:flex">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (n.id === 'logout') {
                    setUser(null)
                    setRoute('home')
                    return
                  }
                  go(n.id)
                }}
                className={[
                  'rounded-lg px-3 py-2 text-sm transition border',
                  route === n.id || (n.id === 'logout' && false)
                    ? 'bg-card border-highlight/30 text-highlight shadow-glow'
                    : 'bg-transparent border-highlight/10 text-text hover:border-highlight/30 hover:text-white',
                ].join(' ')}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {route === 'home' && <Home onStart={() => go('learning')} onGo={go} />}
        {route === 'learning' && (
          <Learning
            completedLessonIds={completedLessonIds}
            onToggleCompleteLesson={(id) => {
              const updated = completedLessonIds.includes(id)
                ? completedLessonIds.filter((x) => x !== id)
                : [...completedLessonIds, id]
              setCompletedLessonIds(updated)
              if (user?.email) {
                saveProgress({
                  email: user.email,
                  completedLessonIds: updated,
                  quizScore: latestQuizResult?.scorePercent ?? 0,
                }).catch(() => {})
              }
            }}
            onGoSimulator={(command) => {
              setSimulatorSuggestedCommand(command || '')
              go('simulator')
            }}
            onGo={go}
          />
        )}
        {route === 'simulator' && <Simulator onGo={go} suggestedCommand={simulatorSuggestedCommand} />}
        {route === 'quiz' && (
          <Quiz
            onGo={go}
            onSubmitted={(result) => {
              const payload = { ...result, submittedAt: new Date().toISOString() }
              setLatestQuizResult(payload)
              if (user?.email) {
                saveProgress({
                  email: user.email,
                  completedLessonIds,
                  quizScore: result?.scorePercent ?? 0,
                }).catch(() => {})
              }
              go('dashboard')
            }}
          />
        )}
        {route === 'dashboard' && user && (
          <Dashboard
            latestQuizResult={latestQuizResult}
            completedLessonsCount={completedLessonIds.length}
            onGo={go}
            user={user}
          />
        )}
        {route === 'dashboard' && !user && (
          <div className="rounded-2xl bg-card border border-highlight/10 p-6 text-text">
            <div className="text-white font-semibold">Dashboard is protected.</div>
            <button onClick={() => go('login')} className="mt-3 rounded-lg bg-primary px-4 py-2 text-bg font-semibold">
              Login to continue
            </button>
          </div>
        )}
        {route === 'login' && (
          <Login
            onSuccess={(u) => {
              setUser(u)
              go('dashboard')
            }}
            onGoRegister={() => go('register')}
          />
        )}
        {route === 'register' && (
          <Register
            onSuccess={(u) => {
              setUser(u)
              go('dashboard')
            }}
            onGoLogin={() => go('login')}
          />
        )}
      </main>

      <footer className="border-t border-highlight/10">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-text/60">
          Backend: <span className="text-text/80">http://localhost:8080</span> • Frontend:{' '}
          <span className="text-text/80">http://localhost:5173</span>
        </div>
      </footer>
      <AiMentor />
    </div>
  )
}

