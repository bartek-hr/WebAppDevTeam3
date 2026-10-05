import axios from 'axios'

// Eén gedeelde axios-instantie. Vite proxyt /api naar GameShelf.Server.
export const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
