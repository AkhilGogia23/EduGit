import { api } from './api.js'

export async function askAiHelp(query) {
  const res = await api.post('/ai/help', { query })
  return res.data
}

