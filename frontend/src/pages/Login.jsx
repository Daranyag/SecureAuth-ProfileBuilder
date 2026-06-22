import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, error, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Sync API error state
  useEffect(() => {
    if (error) {
      setApiError(error);
      setIsSubmitting(false);
    }
  }, [error]);

  // Handle query parameter messages (e.g. from registration redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const registered = params.get('registered');
    if (registered) {
      setSuccessMsg('Account created successfully! Please log in.');
      navigate('/login', { replace: true });
    }
    // Handle state message (e.g. from account deletion)
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      navigate('/login', { replace: true, state: {} });
    }
  }, [location, navigate]);

  const validateForm = () => {
    setValidationError('');
    setApiError('');
    setSuccessMsg('');

    if (!email || !password) {
      setValidationError('Please enter all fields');
      return false;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null); // Clear context error

    const result = await login(email, password);
    if (result && result.success) {
      navigate('/dashboard');
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-content animate-fade theme-auth-login" style={{ minHeight: '100vh', width: '100vw', padding: '20px' }}>
      <div className="glass-panel animate-scale auth-card" style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '40px'
      }}>
        
        {/* Header Icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
          }}>
            <Shield size={32} />
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Enter your credentials to access your secure portal
          </p>
        </div>

        {/* Status Messages */}
        {validationError && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{validationError}</span>
          </div>
        )}

        {apiError && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{apiError}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success">
            <AlertCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-container">
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Mail className="input-icon" size={18} />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</Link>
            </div>
            <div className="input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Lock className="input-icon" size={18} />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn"
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '14px',
              background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '1rem',
              letterSpacing: '0.5px',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
              border: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(239, 68, 68, 0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)'; }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : '🔐 Sign In'}
          </button>

        </form>

        {/* Footer Links */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: '#1E293B', fontWeight: '700', textDecoration: 'underline', transition: 'all 0.2s ease', display: 'inline-block' }}
            onMouseEnter={e => { e.target.style.color = '#0F172A'; e.target.style.fontWeight = '900'; e.target.style.transform = 'scale(1.06)'; }}
            onMouseLeave={e => { e.target.style.color = '#1E293B'; e.target.style.fontWeight = '700'; e.target.style.transform = 'scale(1)'; }}
          >
            Sign Up
          </Link>
        </div>

      </div>
      
      {/* Global Inline Spinner Styling */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
