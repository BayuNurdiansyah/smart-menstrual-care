import api from '../utils/axios';

// Pembungkus tipis endpoint auth backend (/api/v1/auth/*).
export const registerRequest = (payload) => api.post('/auth/register', payload);

export const loginRequest = (payload) => api.post('/auth/login', payload);

export const verifyOtpRequest = (payload) => api.post('/auth/verify-otp', payload);

export const meRequest = () => api.get('/auth/me');

export const logoutRequest = () => api.post('/auth/logout');
