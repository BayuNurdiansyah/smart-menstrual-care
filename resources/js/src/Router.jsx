import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { roleHome } from './utils/roles';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import MuridDashboard from './pages/murid/MuridDashboard';
import ModulStage from './pages/murid/ModulStage';
import KalenderTracker from './pages/murid/KalenderTracker';
import Assessment from './pages/murid/Assessment';
import InformasiAkun from './pages/murid/InformasiAkun';
import AdminDashboard from './pages/admin/AdminDashboard';
import MaterialForm from './pages/admin/MaterialForm';
import AssessmentQuestionsAdmin from './pages/admin/AssessmentQuestionsAdmin';
import WheelQuestionsAdmin from './pages/admin/WheelQuestionsAdmin';
import GuardianLinksAdmin from './pages/admin/GuardianLinksAdmin';
import GuardianDashboard from './pages/guardian/GuardianDashboard';

// Arahkan "/" sesuai status & role.
function HomeRedirect() {
    const { isAuthenticated, user } = useAuth();
    return <Navigate to={isAuthenticated ? roleHome(user?.role) : '/login'} replace />;
}

export default function AppRouter() {
    return (
        <Routes>
            {/* Publik */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            {/* Murid */}
            <Route
                path="/murid"
                element={
                    <ProtectedRoute allow={['murid']}>
                        <MuridDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/murid/stage/:stageId"
                element={
                    <ProtectedRoute allow={['murid']}>
                        <ModulStage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/murid/tracker"
                element={
                    <ProtectedRoute allow={['murid']}>
                        <KalenderTracker />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/murid/assessment"
                element={
                    <ProtectedRoute allow={['murid']}>
                        <Assessment />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/murid/akun"
                element={
                    <ProtectedRoute allow={['murid']}>
                        <InformasiAkun />
                    </ProtectedRoute>
                }
            />

            {/* Admin */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allow={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/materials/create"
                element={
                    <ProtectedRoute allow={['admin']}>
                        <MaterialForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/materials/:id/edit"
                element={
                    <ProtectedRoute allow={['admin']}>
                        <MaterialForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/assessment-questions"
                element={
                    <ProtectedRoute allow={['admin']}>
                        <AssessmentQuestionsAdmin />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/wheel-questions"
                element={
                    <ProtectedRoute allow={['admin']}>
                        <WheelQuestionsAdmin />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/guardian-links"
                element={
                    <ProtectedRoute allow={['admin']}>
                        <GuardianLinksAdmin />
                    </ProtectedRoute>
                }
            />

            {/* Ortu / Guru */}
            <Route
                path="/guardian"
                element={
                    <ProtectedRoute allow={['ortu', 'guru']}>
                        <GuardianDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Default & fallback */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
