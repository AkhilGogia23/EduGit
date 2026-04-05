import React, { useEffect, useMemo, useRef, useState } from 'react'
import { simulateCommand } from '../services/api.js'

function nowTime() {
  const d = new Date()
  return d.toLocaleTimeString()
}

export default function Simulator({ onGo, suggestedCommand }) {
  const [command, setCommand] = useState('')
  const [busy, setBusy] = useState(false)
  const [learningMode, setLearningMode] = useState(true)
  const [entries, setEntries] = useState(() => [
    {
      kind: 'sys',
      output: `Git Mastery Simulator ready (${nowTime()})`,
      explanation: 'Type Git commands below. This simulator is stateful (branches/commits/staging) but does not run real Git.',
      nextSuggestion: 'Try: git init',
    },
  ])
  const [activeScenario, setActiveScenario] = useState(null)

  const bottomRef = useRef(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries, activeScenario])

  const prompt = useMemo(() => 'git-mastery@simulator:~$', [])

  async function run() {
    const cmd = command.trim()
    if (!cmd || busy) return

    setEntries((prev) => [...prev, { kind: 'cmd', command: cmd }])
    setCommand('')
    setBusy(true)
    try {
      const res = await simulateCommand(cmd)
      if (res?.scenario?.type) {
        setActiveScenario(res.scenario)
      } else if ((res?.output || '').toLowerCase().includes('merge conflict')) {
        setActiveScenario({
          type: 'MERGE_CONFLICT',
          title: 'Merge conflict detected',
          steps: ['Run git status', 'Resolve file(s)', 'git add .', 'git commit -m "merge: resolve conflict"'],
        })
      } else {
        setActiveScenario(null)
      }

      setEntries((prev) => [
        ...prev,
        {
          kind: res?.success ? 'ok' : 'err',
          output: res?.output || '(no output)',
          explanation: res?.explanation || '',
          nextSuggestion: res?.nextSuggestion || '',
        },
      ])
    } catch (e) {
      setActiveScenario(null)
      setEntries((prev) => [
        ...prev,
        { kind: 'err', output: e?.message || 'Request failed', explanation: '', nextSuggestion: '' },
      ])
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (suggestedCommand) {
      setCommand(suggestedCommand)
    }
  }, [suggestedCommand])

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-white text-2xl font-bold">Git Simulator</div>
          <div className="text-sm text-text/70">Terminal-style practice backed by the API.</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLearningMode((v) => !v)}
            className={[
              'rounded-xl border px-4 py-2 text-sm font-semibold transition',
              learningMode
                ? 'border-highlight/40 bg-highlight/10 text-highlight'
                : 'border-highlight/15 bg-bg/40 text-text hover:text-white hover:border-highlight/30',
            ].join(' ')}
            title="Toggle explanations and suggestions"
          >
            Learning Mode: {learningMode ? 'ON' : 'OFF'}
          </button>
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
            Take Quiz
          </button>
        </div>
      </div>

      {activeScenario?.type === 'MERGE_CONFLICT' ? (
        <div className="rounded-2xl border border-yellow-300/20 bg-yellow-500/10 p-5">
          <div className="text-yellow-200 font-semibold">⚠️ Merge conflict detected</div>
          <div className="mt-2 text-sm text-text/80">
            {activeScenario?.title || 'Follow these steps to resolve the conflict.'}
          </div>
          {Array.isArray(activeScenario?.steps) ? (
            <ol className="mt-3 list-decimal list-inside text-sm text-text/80 grid gap-1">
              {activeScenario.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-highlight/15 bg-black/40 shadow-glow overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-highlight/10 bg-card">
          <div className="text-sm text-text/80">terminal</div>
          <button
            onClick={() =>
              (setActiveScenario(null),
              setEntries([
                {
                  kind: 'sys',
                  output: `Git Mastery Simulator ready (${nowTime()})`,
                  explanation:
                    'Type Git commands below. This simulator is stateful (branches/commits/staging) but does not run real Git.',
                  nextSuggestion: 'Try: git init',
                },
              ]))
            }
            className="text-xs rounded-lg border border-highlight/15 bg-bg/40 px-3 py-1 text-text hover:text-white hover:border-highlight/30 transition"
          >
            Clear
          </button>
        </div>

        <div className="max-h-[420px] overflow-auto px-4 py-4 font-mono text-sm">
          {entries.map((e, idx) => {
            if (e.kind === 'cmd') {
              return (
                <pre key={idx} className="whitespace-pre-wrap break-words leading-relaxed text-highlight">
                  {prompt} {e.command}
                </pre>
              )
            }

            const tone =
              e.kind === 'ok' ? 'text-green-200' : e.kind === 'err' ? 'text-red-200' : 'text-text/70'

            return (
              <div key={idx} className="mb-3">
                <pre className={['whitespace-pre-wrap break-words leading-relaxed', tone].join(' ')}>
                  {e.output}
                </pre>

                {learningMode && e.explanation ? (
                  <div className="mt-2 rounded-xl border border-highlight/10 bg-card/50 px-3 py-2 text-[13px] text-highlight/90 font-sans">
                    <div className="font-semibold text-highlight">What this command does</div>
                    <div className="mt-1 text-text/80">{e.explanation}</div>
                  </div>
                ) : null}

                {learningMode && e.nextSuggestion ? (
                  <div className="mt-2 rounded-xl border border-highlight/10 bg-bg/40 px-3 py-2 text-[13px] text-text font-sans">
                    <span className="text-text/70">Next recommended:</span>{' '}
                    <span className="text-highlight font-semibold">{e.nextSuggestion}</span>
                  </div>
                ) : null}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-highlight/10 bg-bg/60 p-3">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') run()
              }}
              placeholder='Try: git status, git checkout -b feature/demo, git merge main, git log'
              className="w-full rounded-xl border border-highlight/15 bg-black/40 px-4 py-3 font-mono text-sm text-text placeholder:text-text/40 outline-none focus:border-highlight/40"
              disabled={busy}
            />
            <button
              onClick={run}
              disabled={busy}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-bg disabled:opacity-60 hover:opacity-90 transition"
            >
              {busy ? 'Running…' : 'Run'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

