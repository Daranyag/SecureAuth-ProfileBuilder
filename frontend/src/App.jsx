import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import ProtectedRoute from './protected-routes/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProfileBuilder from './pages/ProfileBuilder';
import Settings from './pages/Settings';
import { Shield, LayoutDashboard, User, Settings as SettingsIcon, LogOut, Sun, Moon, Trash2, Heart } from 'lucide-react';
import api from './services/api';

const AppContent = () => {
  const { user, logout, updateProfileState } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Theme state synced with document node
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Sync theme with user preference when user loads or updates
  useEffect(() => {
    if (user && user.themeMode && user.themeMode !== theme) {
      setTheme(user.themeMode);
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Accent color initialization
  useEffect(() => {
    const savedColor = localStorage.getItem('accentColor');
    if (savedColor) {
      document.documentElement.setAttribute('data-color', savedColor);
    }
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (user && updateProfileState) {
      try {
        await api.put('/users/settings', { themeMode: newTheme });
        updateProfileState({ ...user, themeMode: newTheme });
      } catch (err) {
        console.error('Failed to save theme setting:', err);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to check active nav link
  const isActive = (path) => location.pathname === path;

  // Don't show navbar on auth pages
  const authPaths = ['/login', '/register', '/forgot-password'];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <div className="app-container">
      
      {/* Sticky Glassmorphic Navbar */}
      {!isAuthPage && user && (
        <header className="navbar glass-panel animate-fade" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
          <Link to="/dashboard" className="nav-brand">
            <Shield size={24} style={{ color: 'var(--primary)' }} />
            <span>SecureAuth</span>
          </Link>

          <nav className="nav-links">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LayoutDashboard size={16} />
              <span style={{ display: 'inline' }}>Dashboard</span>
            </Link>
            
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <User size={16} />
              <span style={{ display: 'inline' }}>Profile</span>
            </Link>

            <Link 
              to="/profile-builder" 
              className={`nav-link ${isActive('/profile-builder') ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LayoutDashboard size={16} style={{ transform: 'rotate(90deg)' }} />
              <span style={{ display: 'inline' }}>Profile Builder</span>
            </Link>

            <Link 
              to="/settings" 
              className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <SettingsIcon size={16} />
              <span style={{ display: 'inline' }}>Settings</span>
            </Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* Quick Theme Toggle Icon */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              title="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? <Sun size={18} style={{ color: 'var(--warning)' }} /> : <Moon size={18} style={{ color: 'var(--primary)' }} />}
            </button>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: '0.9rem',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: 'var(--danger)',
                background: 'rgba(239, 68, 68, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>
      )}

      {/* Main page router viewport */}
      <main style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="/profile-builder" element={
            <ProtectedRoute>
              <ProfileBuilder />
            </ProtectedRoute>
          } />

          {/* Root redirect checks */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Modern footer layout */}
      <footer className="footer">
        <div className="container-fluid" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', textAlign: 'center', padding: '4px 0' }}>
          <Shield size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span style={{ fontWeight: '600', fontSize: '0.78rem', color: 'var(--text-primary)' }}>SecureAuth Portal</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap', justifyContent: 'center' }}>
            &copy; {new Date().getFullYear()} All Rights Reserved. Securing your digital world with <Heart size={12} fill="currentColor" style={{ color: '#ef4444', flexShrink: 0 }} />.
          </span>
        </div>
      </footer>

    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
