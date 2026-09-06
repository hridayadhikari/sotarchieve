import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { MeetingSinglePage } from './pages/MeetingSinglePage';
import { DocumentsPage } from './pages/DocumentsPage';
import { LinksPage } from './pages/LinksPage';
import { AssetsPage } from './pages/AssetsPage';
import { TeamPage } from './pages/TeamPage';
import { AdminPage } from './pages/AdminPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <div style={{ width: '8px', height: '8px', background: 'var(--accent)' }} />
          Loading SOT Archive...
        </div>
      </div>
    );
  }

  if (!user || !user.is_active) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              {/* Standalone Shareable Single Page for Meeting Minutes (Works with direct link / new tab) */}
              <Route path="/meetings/:id" element={<MeetingSinglePage />} />

              {/* Authenticated Workspace App */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="knowledge" element={<KnowledgeBasePage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:id" element={<ProjectsPage />} />
                <Route path="meetings" element={<MeetingsPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="links" element={<LinksPage />} />
                <Route path="assets" element={<AssetsPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
