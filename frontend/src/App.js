import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/Auth/AuthProvider';
import Header from './components/Common/Header';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TaskListPage from './pages/TaskListPage';
import TaskFormPage from './pages/TaskFormPage';
import TaskTimerPage from './pages/TaskTimerPage';
import ProfilePage from './pages/ProfilePage';
import { CssBaseline } from '@mui/material';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : children;
}

function AppRoutes() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } />
        <Route path="/auth" element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        } />
        <Route path="/tasks" element={
          <PrivateRoute>
            <TaskListPage />
          </PrivateRoute>
        } />
        <Route path="/tasks/add" element={
          <PrivateRoute>
            <TaskFormPage />
          </PrivateRoute>
        } />
        <Route path="/tasks/edit/:id" element={
          <PrivateRoute>
            <TaskFormPage />
          </PrivateRoute>
        } />
        <Route path="/tasks/timer/:id" element={
          <PrivateRoute>
            <TaskTimerPage />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App; 