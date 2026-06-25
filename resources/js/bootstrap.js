import axios from 'axios'

// Konfigurasi Axios untuk Laravel Sanctum (cookie-based SPA auth)
axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.baseURL = import.meta.env.VITE_API_URL ?? ''

window.axios = axios
