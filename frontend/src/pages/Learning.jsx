import React, { useEffect, useMemo, useState } from 'react'
import { fetchLessons } from '../services/api.js'

const lessonToCommand = (title) => {
  const t = (title || '').toLowerCase()
  if (t.includes('init')) return 'git init'
  if (t.includes('add')) return 'git add .'
  if (t.includes('branch')) return 'git checkout -b feature/demo'
  if (t.includes('merg')) return 'git merge feature/demo'
  if (t.includes('workflow')) return 'git push origin main'
  return 'git status'
}

export default function Learning({ completedLessonIds, onToggleCompleteLesson, onGoSimulator, onGo }) {
  const [lessons, setLessons] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    fetchLessons()
      .then((data) => {
        if (!alive) return
        const list = Array.isArray(data) ? data : []
        setLessons(list)
        if (list.length > 0) setActiveId(list[0].id)
      })
      .catch((e) => {
        if (!alive) return
        setError(e?.message || 'Failed to load lessons')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const completedCount = useMemo(() => completedLessonIds.length, [completedLessonIds])
  const active = useMemo(() => lessons.find((l) => l.id === activeId) || lessons[0], [lessons, activeId])
  const progressPercent = lessons.length === 0 ? 0 : Math.round((completedCount * 100) / lessons.length)
  const suggestedCommand = lessonToCommand(active?.title)

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-white text-2xl font-bold">Learning Hub</div>
          <div className="text-sm text-text/70">Structured lessons from the backend API.</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onGoSimulator(suggestedCommand)}
            className="rounded-xl border border-highlight/20 bg-bg/40 px-4 py-2 text-sm font-semibold text-highlight hover:border-highlight/40 transition"
          >
            Practice in Simulator
          </button>
          <button
            onClick={() => onGo('quiz')}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-bg hover:opacity-90 transition"
          >
            Take Quiz
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-highlight/10 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-text/80">
            Completed lessons: <span className="text-white font-semibold">{completedCount}</span> / {lessons.length}
          </div>
          <button onClick={() => onGo('dashboard')} className="text-sm text-highlight hover:underline">
            View Dashboard →
          </button>
        </div>
        <div className="mt-3 h-2 rounded-full bg-bg/80 overflow-hidden">
          <div className="h-full bg-highlight" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {loading && <div className="text-text/70">Loading lessons...</div>}
      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-12">
          <aside className="md:col-span-4 rounded-2xl bg-card border border-highlight/10 p-3">
            <div className="text-sm font-semibold text-white px-2 py-1">Topics</div>
            <div className="mt-2 grid gap-1">
              {lessons.map((lesson) => {
                const selected = lesson.id === active?.id
                const done = completedLessonIds.includes(lesson.id)
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveId(lesson.id)}
                    className={[
                      'text-left rounded-xl px-3 py-3 border transition',
                      selected
                        ? 'border-highlight/40 bg-highlight/10'
                        : 'border-highlight/10 bg-bg/40 hover:border-highlight/30',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-white">{lesson.title}</div>
                      {done ? <span className="text-[10px] text-highlight">Done</span> : null}
                    </div>
                    <div className="text-xs text-text/60 mt-1">{lesson.level}</div>
                  </button>
                )
              })}
            </div>
          </aside>

          <section className="md:col-span-8 rounded-2xl bg-card border border-highlight/10 p-6">
            {active ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-highlight">{active.level}</div>
                    <h3 className="text-2xl font-bold text-white">{active.title}</h3>
                  </div>
                  <button
                    onClick={() => onToggleCompleteLesson(active.id)}
                    className={[
                      'rounded-xl px-3 py-2 text-xs font-semibold border transition',
                      completedLessonIds.includes(active.id)
                        ? 'border-highlight/40 bg-highlight/10 text-highlight'
                        : 'border-highlight/15 bg-bg/40 text-text hover:text-white hover:border-highlight/35',
                    ].join(' ')}
                  >
                    {completedLessonIds.includes(active.id) ? 'Completed' : 'Mark as completed'}
                  </button>
                </div>

                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-text/85">{active.content}</div>

                <div className="mt-5 rounded-xl border border-highlight/15 bg-black/35 p-4">
                  <div className="text-xs text-text/60">Example command</div>
                  <pre className="mt-2 text-sm font-mono text-highlight">{suggestedCommand}</pre>
                </div>

                <div className="mt-5 rounded-xl border border-highlight/10 bg-bg/40 p-4">
                  <div className="text-sm font-semibold text-highlight">Interactive step</div>
                  <div className="text-sm text-text/75 mt-1">Now try this in simulator:</div>
                  <div className="mt-2 font-mono text-sm text-white">{suggestedCommand}</div>
                  <button
                    onClick={() => onGoSimulator(suggestedCommand)}
                    className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-bg"
                  >
                    Try in Simulator
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-text/70">No lessons found.</div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

