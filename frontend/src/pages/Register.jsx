import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, user, error, setError } = useAuth();
  const navigate = useNavigate();

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

  const validateForm = () => {
    setValidationError('');
    setApiError('');

    if (!name || !email || !password || !confirmPassword) {
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

    // Password must contain at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setValidationError('Password must contain at least one letter and one number');
      return false;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null); // Clear context error

    const result = await register(name, email, password, confirmPassword);
    if (result && result.success) {
      navigate('/dashboard');
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-content animate-fade theme-auth-register" style={{ minHeight: '100vh', width: '100vw', padding: '20px' }}>
      <div className="glass-panel animate-scale auth-card" style={{ 
        width: '100%', 
        maxWidth: '480px', 
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
            <ShieldCheck size={32} />
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Register to set up your profile and get started
          </p>
        </div>

        {/* Errors */}
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

        {/* Sign up form */}
        <form onSubmit={handleSubmit}>
          
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div className="input-container">
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <User className="input-icon" size={18} />
            </div>
          </div>

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
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Min 8 chars, 1 letter, 1 number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-container">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Lock className="input-icon" size={18} />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn"
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '14px',
              background: 'linear-gradient(135deg, #06B6D4, #10B981)',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '1rem',
              letterSpacing: '0.5px',
              boxShadow: '0 6px 20px rgba(6, 182, 212, 0.4)',
              border: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(6, 182, 212, 0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)'; }}
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
            ) : '🚀 Sign Up'}
          </button>

        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: '#1E293B', fontWeight: '700', textDecoration: 'underline', transition: 'all 0.2s ease', display: 'inline-block' }}
            onMouseEnter={e => { e.target.style.color = '#0F172A'; e.target.style.fontWeight = '900'; e.target.style.transform = 'scale(1.06)'; }}
            onMouseLeave={e => { e.target.style.color = '#1E293B'; e.target.style.fontWeight = '700'; e.target.style.transform = 'scale(1)'; }}
          >
            Sign In
          </Link>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;
