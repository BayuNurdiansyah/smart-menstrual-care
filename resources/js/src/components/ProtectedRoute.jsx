import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../utils/roles';

/**
 * Pembungkus route terproteksi.
 *  - Belum login        -> diarahkan ke /login.
 *  - Role tidak diizinkan -> diarahkan ke beranda role-nya sendiri.
 *
 * Pakai: <ProtectedRoute allow={['murid']}><Page /></ProtectedRoute>
 */
export default function ProtectedRoute({ allow, children }) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allow && !allow.includes(user?.role)) {
        return <Navigate to={roleHome(user?.role)} replace />;
    }

    return children;
}
