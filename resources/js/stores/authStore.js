import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user:  null,
            token: null,

            setAuth: (user, token) => set({ user, token }),

            logout: async () => {
                try {
                    await axios.post('/api/v1/auth/logout', {}, {
                        headers: { Authorization: `Bearer ${get().token}` },
                    })
                } catch (_) {
                    // lanjut meski request gagal
                }
                set({ user: null, token: null })
            },

            updateUser: (data) => set((s) => ({ user: { ...s.user, ...data } })),
        }),
        {
            name: 'smart-menstrual-auth',
            partialize: (s) => ({ user: s.user, token: s.token }),
        }
    )
)
