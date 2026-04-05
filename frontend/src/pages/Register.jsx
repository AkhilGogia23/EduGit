import React, { useState } from 'react'
import { registerUser } from '../services/api.js'

export default function Register({ onSuccess, onGoLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const res = await registerUser({ name, email, password })
      if (!res?.success) {
        setMessage(res?.message || 'Register failed')
        return
      }
      onSuccess?.({ userId: res.userId, name: res.name, email: res.email })
    } catch (err) {
      setMessage(err?.message || 'Network error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md mx-auto rounded-2xl bg-card border border-highlight/10 p-6">
      <h2 className="text-2xl font-bold text-white">Register</h2>
      <p className="text-sm text-text/70 mt-1">Create an account to track lesson progress.</p>

      <form onSubmit={submit} className="mt-5 grid gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded-xl border border-highlight/15 bg-bg/40 px-4 py-3 text-sm text-text outline-none focus:border-highlight/40"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-xl border border-highlight/15 bg-bg/40 px-4 py-3 text-sm text-text outline-none focus:border-highlight/40"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-xl border border-highlight/15 bg-bg/40 px-4 py-3 text-sm text-text outline-none focus:border-highlight/40"
        />
        <button
          disabled={busy}
          className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-bg disabled:opacity-60"
        >
          {busy ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {message ? <div className="mt-3 text-sm text-red-200">{message}</div> : null}

      <button onClick={onGoLogin} className="mt-4 text-sm text-highlight hover:underline">
        Already have an account? Login
      </button>
    </div>
  )
}

