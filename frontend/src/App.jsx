import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyPage from './pages/VerifyPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import InstitutionDashboard from './pages/InstitutionDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CertificateProofPage from './pages/CertificateProofPage';
import Toast from './components/Toast';
import { useState } from 'react';

function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
  </div>;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  
  return children;
}

export default function App() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] bg-grid">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage showToast={showToast} />} />
        <Route path="/signup" element={<SignupPage showToast={showToast} />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/certificate/:uid" element={<CertificateProofPage />} />
        <Route path="/admin" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <SuperAdminDashboard showToast={showToast} />
          </ProtectedRoute>
        } />
        <Route path="/institution" element={
          <ProtectedRoute roles={['INSTITUTION_ADMIN']}>
            <InstitutionDashboard showToast={showToast} />
          </ProtectedRoute>
        } />
        <Route path="/student" element={
          <ProtectedRoute roles={['STUDENT']}>
            <StudentDashboard showToast={showToast} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
