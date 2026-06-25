import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { TOKEN_KEY, USER_KEY } from '../utils/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Hidrasi awal dari localStorage agar sesi bertahan saat refresh.
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    });

    const login = useCallback((newToken, newUser) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            token,
            user,
            isAuthenticated: Boolean(token),
            login,
            logout,
        }),
        [token, user, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (ctx === null) {
        throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
    }
    return ctx;
}
