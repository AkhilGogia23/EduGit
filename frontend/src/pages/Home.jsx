import React from 'react'

export default function Home({ onStart, onGo }) {
  return (
    <div className="grid gap-6">
      <section className="rounded-2xl bg-card border border-highlight/10 p-6 shadow-glow">
        <div className="inline-flex items-center gap-2 rounded-full border border-highlight/20 bg-bg/40 px-3 py-1 text-xs text-text/80">
          <span className="text-highlight font-semibold">Dark Mode</span>
          <span>•</span>
          <span>Real API</span>
          <span>•</span>
          <span>Git Simulator</span>
        </div>

        <h1 className="mt-4 text-3xl md:text-4xl font-bold text-white tracking-tight">
          Master Git with guided learning, a simulator, and a quiz.
        </h1>
        <p className="mt-3 max-w-2xl text-text/80">
          Learn essential commands, practice in a terminal-style simulator, then validate your knowledge with a quiz.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onStart}
            className="rounded-xl bg-primary px-5 py-3 font-semibold text-bg hover:opacity-90 transition"
          >
            Start Learning
          </button>
          <button
            onClick={() => onGo('simulator')}
            className="rounded-xl border border-highlight/20 bg-bg/40 px-5 py-3 font-semibold text-highlight hover:border-highlight/40 transition"
          >
            Open Simulator
          </button>
          <button
            onClick={() => onGo('quiz')}
            className="rounded-xl border border-highlight/10 bg-transparent px-5 py-3 font-semibold text-text hover:text-white hover:border-highlight/30 transition"
          >
            Take Quiz
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'Learn', body: 'Browse topics pulled from the Spring Boot API.' },
          { title: 'Simulate', body: 'Try safe commands like init, add, commit, branch.' },
          { title: 'Track', body: 'Your quiz score and completed topics show up in the dashboard.' },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl bg-card border border-highlight/10 p-5">
            <div className="text-highlight font-semibold">{c.title}</div>
            <div className="mt-2 text-sm text-text/80">{c.body}</div>
          </div>
        ))}
      </section>
    </div>
  )
}

