import React from 'react'

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-card border border-highlight/10 p-5">
      <div className="text-xs text-text/60">{label}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
      {sub ? <div className="mt-2 text-sm text-text/70">{sub}</div> : null}
    </div>
  )
}

function badgeNames(completedLessons, quizScore) {
  const out = ['Beginner']
  if (completedLessons >= 4) out.push('Git Explorer')
  if (completedLessons >= 6 || quizScore >= 70) out.push('Branch Master')
  return out
}

export default function Dashboard({ latestQuizResult, completedLessonsCount, onGo, user }) {
  const score = latestQuizResult?.scorePercent ?? null
  const correct = latestQuizResult?.correct ?? null
  const total = latestQuizResult?.total ?? null
  const submittedAt = latestQuizResult?.submittedAt ? new Date(latestQuizResult.submittedAt) : null
  const badges = badgeNames(completedLessonsCount, score ?? 0)

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-white text-2xl font-bold">Dashboard</div>
          <div className="text-sm text-text/70">
            {user ? `Welcome, ${user.name}.` : 'Your learning progress overview.'}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onGo('learning')}
            className="rounded-xl border border-highlight/15 bg-bg/40 px-4 py-2 text-sm font-semibold text-text hover:text-white hover:border-highlight/30 transition"
          >
            ← Learning
          </button>
          <button
            onClick={() => onGo('quiz')}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-bg hover:opacity-90 transition"
          >
            Retake Quiz
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Quiz Score"
          value={score == null ? '—' : `${score}%`}
          sub={score == null ? 'Take the quiz to see your score.' : `${correct} / ${total} correct`}
        />
        <Stat label="Completed Lessons" value={completedLessonsCount} sub="Mark lessons done in Learning." />
        <Stat
          label="Last Quiz"
          value={submittedAt ? submittedAt.toLocaleDateString() : '—'}
          sub={submittedAt ? submittedAt.toLocaleTimeString() : 'No submission yet.'}
        />
      </div>

      <section className="rounded-2xl bg-card border border-highlight/10 p-6">
        <div className="text-white font-semibold">Badges</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span key={b} className="rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1 text-xs font-semibold text-highlight">
              {b}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-card border border-highlight/10 p-6">
        <div className="text-white font-semibold">Next steps</div>
        <ul className="mt-3 grid gap-2 text-sm text-text/80 list-disc list-inside">
          <li>Practice commands in the Simulator to build muscle memory.</li>
          <li>Complete all topics and retake the quiz until you hit 100%.</li>
          <li>Open the H2 console to inspect seed data if you want.</li>
        </ul>
      </section>
    </div>
  )
}

