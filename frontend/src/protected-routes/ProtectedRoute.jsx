import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show a premium glassmorphic loading spinner while verifying session
  if (loading) {
    return (
      <div className="main-content" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '300px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(99, 102, 241, 0.1)',
            borderTop: '4px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <h4 style={{ fontFamily: 'var(--font-title)' }}>Verifying Session</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>Please wait a moment...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not logged in -> Redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated -> Render contents
  return children;
};

export default ProtectedRoute;
