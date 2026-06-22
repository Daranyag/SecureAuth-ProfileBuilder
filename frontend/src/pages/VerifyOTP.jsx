import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Key, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otp) {
      setErrorMsg('Please enter the 5-digit OTP');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      if (res.data.success) {
        setSuccessMsg('OTP verified successfully!');
        setTimeout(() => {
          navigate('/reset-password', { state: { email, otp } });
        }, 1000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid or expired OTP');
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
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Verify OTP</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter the 5-digit OTP sent to your email</p>
        </div>

        {errorMsg && <div className="alert alert-error"><AlertCircle size={18} /><span>{errorMsg}</span></div>}
        {successMsg && <div className="alert alert-success"><CheckCircle size={18} /><span>{successMsg}</span></div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="otp">5-Digit OTP</label>
            <div className="input-container">
              <input id="otp" type="text" maxLength="5" className="form-input" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} autoComplete="off" />
              <Key className="input-icon" size={18} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '14px' }} disabled={isSubmitting}>
            {isSubmitting ? (
              <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : 'Verify OTP'}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VerifyOTP;
