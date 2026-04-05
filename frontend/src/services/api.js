import axios from 'axios'

// Docker Compose: build with VITE_API_BASE_URL=/api (nginx proxies to backend).
// Local dev: npm run dev uses http://localhost:8080/api when VITE is unset.
const apiBase =
  import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== ''
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
    : import.meta.env.PROD
      ? '/api'
      : 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
})

export async function fetchTopics() {
  const res = await api.get('/topics')
  return res.data
}

export async function fetchQuiz() {
  const res = await api.get('/quiz')
  return res.data
}

export async function submitQuiz(answers) {
  const res = await api.post('/quiz/submit', { answers })
  return res.data
}

export async function simulateCommand(command) {
  const res = await api.post('/simulate', { command })
  return res.data
}

export async function registerUser(payload) {
  const res = await api.post('/auth/register', payload)
  return res.data
}

export async function loginUser(payload) {
  const res = await api.post('/auth/login', payload)
  return res.data
}

export async function fetchLessons() {
  const res = await api.get('/lessons')
  return res.data
}

export async function fetchProgress(email) {
  const res = await api.get('/progress', { params: { email } })
  return res.data
}

export async function saveProgress(payload) {
  const res = await api.post('/progress', payload)
  return res.data
}

