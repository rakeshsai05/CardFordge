import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerificationPage from './pages/VerificationPage';
import StudentDashboard from './pages/StudentDashboard';
import IDCardStudioPage from './pages/IDCardStudioPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminCardsQueue from './pages/AdminCardsQueue';
import AdminStudentsDirectory from './pages/AdminStudentsDirectory';
import NotFoundPage from './pages/NotFoundPage';
import OrganizationRegisterPage from './pages/OrganizationRegisterPage';
import OrganizationWorkspacePage from './pages/OrganizationWorkspacePage';
import { useAuth } from './context/AuthContext';
import PlatformOwnerPage from './pages/PlatformOwnerPage';

function AdminHome() {
  const { user } = useAuth();
  return user?.role === 'mid_admin' ? <OrganizationWorkspacePage /> : <AdminDashboard />;
}

export default function App() {
  return (
    <Routes>
      {/* 1. Public Marketing and Auth Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/organization/register" element={<OrganizationRegisterPage />} />
        <Route path="/admin-login" element={<LoginPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/studio" element={<IDCardStudioPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 2. Public Edge Verification Route (Clean mobile viewport for camera scanners) */}
      <Route path="/verify/:verificationId" element={<VerificationPage />} />
      <Route path="/verify" element={<VerificationPage />} />
      <Route path="/owner" element={<ProtectedRoute allowedRoles={['platform_owner']}><PlatformOwnerPage /></ProtectedRoute>} />

      {/* 3. Student & Campus Workspace */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student', 'general_user']}>
            <DashboardLayout userRole="student" />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="id-card" element={<IDCardStudioPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 4. Administrator Command Center */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'main_admin', 'mid_admin']}>
            <DashboardLayout userRole="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="workspace" element={<OrganizationWorkspacePage />} />
        <Route path="cards" element={<AdminCardsQueue />} />
        <Route path="students" element={<AdminStudentsDirectory />} />
        <Route path="id-card" element={<IDCardStudioPage />} />
      </Route>
    </Routes>
  );
}

