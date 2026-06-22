import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [validationError, setValidationError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setErrorMsg('');
    setSuccessMsg('');

    // Client-side validation
    if (!email || !newPassword || !confirmNewPassword) {
      setValidationError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setValidationError('Password must contain at least one letter and one number');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/reset-password', { email, newPassword, confirmNewPassword });
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Password reset successfully. Please login with your new password.');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-content animate-fade">
      <div className="glass-panel animate-scale" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>

        {/* Header Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'var(--primary-gradient)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
          }}>
            <Shield size={32} />
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Enter your email address and choose a new password
          </p>
        </div>

        {/* Alerts */}
        {validationError && (
          <div className="alert alert-error">
            <AlertCircle size={18} /><span>{validationError}</span>
          </div>
        )}
        {errorMsg && (
          <div className="alert alert-error">
            <AlertCircle size={18} /><span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success">
            <CheckCircle size={18} /><span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="fp-email">Email Address</label>
            <div className="input-container">
              <input
                id="fp-email"
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

          {/* New Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="fp-newPassword">New Password</label>
            <div className="input-container">
              <input
                id="fp-newPassword"
                type={showNew ? 'text' : 'password'}
                className="form-input"
                placeholder="Min 8 characters, 1 letter, 1 number"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Lock className="input-icon" size={18} />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNew(!showNew)}
                tabIndex="-1"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="fp-confirmPassword">Confirm New Password</label>
            <div className="input-container">
              <input
                id="fp-confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Lock className="input-icon" size={18} />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex="-1"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '14px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div style={{
                width: '18px', height: '18px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : 'Reset Password'}
          </button>
        </form>

        {/* Back to Login */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ForgotPassword;
