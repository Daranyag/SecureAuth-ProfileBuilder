import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  useEffect(() => {
    if (!email || !otp) {
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || !confirmNewPassword) {
      setErrorMsg('Please fill all fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword, confirmNewPassword });
      if (res.data.success) {
        setSuccessMsg('Password reset successfully. Please login with your new password.');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-content animate-fade">
      <div className="glass-panel animate-scale" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)' }}>
            <Shield size={32} />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter a new secure password</p>
        </div>

        {errorMsg && <div className="alert alert-error"><AlertCircle size={18} /><span>{errorMsg}</span></div>}
        {successMsg && <div className="alert alert-success"><CheckCircle size={18} /><span>{successMsg}</span></div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <div className="input-container">
              <input id="newPassword" type={showNew ? 'text' : 'password'} className="form-input" placeholder="Min 8 characters, 1 letter, 1 number" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Lock className="input-icon" size={18} />
              <button type="button" className="password-toggle" onClick={() => setShowNew(!showNew)} tabIndex="-1">
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmNewPassword">Confirm New Password</label>
            <div className="input-container">
              <input id="confirmNewPassword" type={showConfirm ? 'text' : 'password'} className="form-input" placeholder="Re-enter new password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
              <Lock className="input-icon" size={18} />
              <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)} tabIndex="-1">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '14px' }} disabled={isSubmitting}>
            {isSubmitting ? (
              <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : 'Reset Password'}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ResetPassword;
