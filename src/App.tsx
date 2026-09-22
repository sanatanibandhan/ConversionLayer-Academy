import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';
import { Labs } from './pages/Labs';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ClientAuth } from './pages/client/ClientAuth';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ProjectPortal } from './pages/client/ProjectPortal';
import { ProtectedRoute, ClientProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & SaaS Home */}
          <Route path="/" element={<Home />} />

          {/* SyncOps Labs - Internal Engineering Sandbox & YouTube Channel Showcase */}
          <Route path="/labs" element={<Labs />} />

          {/* Client Authentication - World-Class Split-Screen Portal */}
          <Route path="/login" element={<ClientAuth />} />
          <Route path="/client/login" element={<Navigate to="/login" replace />} />

          {/* Client SaaS Portal (Protected by Firebase Auth Guard) */}
          <Route
            path="/client/dashboard"
            element={
              <ClientProtectedRoute>
                <ClientDashboard />
              </ClientProtectedRoute>
            }
          />
          <Route
            path="/client/project/:projectId"
            element={
              <ClientProtectedRoute>
                <ProjectPortal />
              </ClientProtectedRoute>
            }
          />

          {/* Hidden & Protected Lead Architect Admin Terminal Route */}
          <Route path="/admin/terminal" element={<AdminLogin />} />
          <Route path="/admin/login" element={<Navigate to="/admin/terminal" replace />} />

          {/* Master Admin Dashboard (Protected strictly by Admin Email Guard) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
