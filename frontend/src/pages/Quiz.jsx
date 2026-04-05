import React, { useEffect, useMemo, useState } from 'react'
import { fetchQuiz, submitQuiz } from '../services/api.js'

export default function Quiz({ onGo, onSubmitted }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    fetchQuiz()
      .then((data) => {
        if (!alive) return
        setQuestions(Array.isArray(data) ? data : [])
      })
      .catch((e) => {
        if (!alive) return
        setError(e?.message || 'Failed to load quiz')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])

  async function submit() {
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] ?? '',
      }))
      const result = await submitQuiz(payload)
      onSubmitted?.(result)
    } catch (e) {
      setError(e?.message || 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-white text-2xl font-bold">Quiz</div>
          <div className="text-sm text-text/70">Questions are fetched from the backend API.</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onGo('learning')}
            className="rounded-xl border border-highlight/15 bg-bg/40 px-4 py-2 text-sm font-semibold text-text hover:text-white hover:border-highlight/30 transition"
          >
            ← Learning
          </button>
          <button
            onClick={() => onGo('dashboard')}
            className="rounded-xl border border-highlight/20 bg-bg/40 px-4 py-2 text-sm font-semibold text-highlight hover:border-highlight/40 transition"
          >
            Dashboard →
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-highlight/10 p-4 flex items-center justify-between">
        <div className="text-sm text-text/80">
          Answered: <span className="text-white font-semibold">{answeredCount}</span> /{' '}
          <span className="text-white font-semibold">{questions.length}</span>
        </div>
        <button
          onClick={submit}
          disabled={loading || submitting || questions.length === 0}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-bg disabled:opacity-60 hover:opacity-90 transition"
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>

      {loading && <div className="text-text/70">Loading quiz…</div>}
      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-2xl bg-card border border-highlight/10 p-5">
              <div className="text-text/60 text-xs">Question {idx + 1}</div>
              <div className="mt-2 text-white font-semibold">{q.question}</div>
              <div className="mt-4 grid gap-2">
                {(q.options || []).map((opt) => {
                  const selected = answers[q.id] === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                      className={[
                        'text-left rounded-xl border px-4 py-3 text-sm transition',
                        selected
                          ? 'border-highlight/50 bg-highlight/10 text-highlight'
                          : 'border-highlight/15 bg-bg/40 text-text hover:text-white hover:border-highlight/35',
                      ].join(' ')}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

