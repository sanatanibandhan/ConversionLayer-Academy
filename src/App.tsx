import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Labs } from './pages/Labs';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & SaaS Home */}
        <Route path="/" element={<Home />} />

        {/* SyncOps Labs - Internal Engineering Sandbox & YouTube Channel Showcase */}
        <Route path="/labs" element={<Labs />} />

        {/* Admin Authentication Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Master Admin Dashboard (Protected by Firebase Auth Guard) */}
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
  );
}
