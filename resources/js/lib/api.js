import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

/**
 * Instance axios dengan base URL /api/v1 dan token Sanctum otomatis.
 */
const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
})

// Sisipkan Bearer token dari store ke setiap request
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Auto-logout jika 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            useAuthStore.getState().logout()
        }
        return Promise.reject(err)
    }
)

export default api
