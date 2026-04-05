import React, { useState } from 'react'
import { loginUser } from '../services/api.js'

export default function Login({ onSuccess, onGoRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const res = await loginUser({ email, password })
      if (!res?.success) {
        setMessage(res?.message || 'Login failed')
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
      <h2 className="text-2xl font-bold text-white">Login</h2>
      <p className="text-sm text-text/70 mt-1">Access your learning dashboard and progress.</p>

      <form onSubmit={submit} className="mt-5 grid gap-3">
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
          {busy ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {message ? <div className="mt-3 text-sm text-red-200">{message}</div> : null}

      <button onClick={onGoRegister} className="mt-4 text-sm text-highlight hover:underline">
        New here? Register
      </button>
    </div>
  )
}

