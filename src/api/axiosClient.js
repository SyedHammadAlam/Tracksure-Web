import axios from 'axios'

const api = axios.create({
  baseURL: 'http://13.50.248.167:8080',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

export default api
