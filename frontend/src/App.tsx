import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPlansPage } from './pages/AdminPlansPage';
import { WebhookSimulatorPage } from './pages/WebhookSimulatorPage';
import { WebhookViewerPage } from './pages/WebhookViewerPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <ProtectedRoute>
              <AdminPlansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/simulator"
          element={
            <ProtectedRoute>
              <WebhookSimulatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/observer"
          element={
            <ProtectedRoute>
              <WebhookViewerPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
