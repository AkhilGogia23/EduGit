import React, { useEffect, useRef, useState } from 'react'
import { askAiHelp } from '../services/aiApi.js'

export default function AiMentor() {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am your Git Mentor. Ask me anything about Git commands, workflow, conflicts, and best practices.' },
  ])
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, open, busy])

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setBusy(true)
    try {
      const res = await askAiHelp(text)
      setMessages((prev) => [...prev, { role: 'ai', text: res?.answer || 'AI service unavailable, please try again' }])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'AI service unavailable, please try again' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-primary text-bg px-4 py-3 shadow-glow font-semibold"
      >
        {open ? 'Close Mentor' : 'AI Mentor'}
      </button>

      {open ? (
        <div className="fixed bottom-20 right-5 z-40 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-highlight/20 bg-card shadow-glow overflow-hidden">
          <div className="px-4 py-3 border-b border-highlight/10 flex items-center justify-between">
            <div className="text-white font-semibold">Groq AI Mentor</div>
            <div className="text-xs text-text/70">Llama3</div>
          </div>

          <div ref={listRef} className="h-[360px] overflow-y-auto px-3 py-3 bg-bg/40">
            <div className="grid gap-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={[
                    'max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'ml-auto bg-highlight/20 border border-highlight/30 text-white'
                      : 'mr-auto bg-card border border-highlight/10 text-text',
                  ].join(' ')}
                >
                  {m.text}
                </div>
              ))}
              {busy ? <div className="mr-auto text-xs text-highlight">AI is typing...</div> : null}
            </div>
          </div>

          <div className="p-3 border-t border-highlight/10 bg-card">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') send()
                }}
                placeholder="Ask about Git..."
                className="w-full rounded-xl border border-highlight/15 bg-bg/40 px-3 py-2 text-sm text-text outline-none focus:border-highlight/40"
              />
              <button
                onClick={send}
                disabled={busy}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-bg disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

