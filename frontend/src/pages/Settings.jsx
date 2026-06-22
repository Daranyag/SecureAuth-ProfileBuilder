import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, Key, Shield, Sun, Moon, Bell, Eye, EyeOff, 
  AlertCircle, CheckCircle, ArrowLeft, RefreshCw,
  BarChart2, Clock, Palette, Award, Database, Download, LogOut, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateProfileState } = useAuth();

  // Settings State
  const [themeMode, setThemeMode] = useState(user?.themeMode || 'dark');
  const [accentColor, setAccentColor] = useState(user?.accentColor || 'blue');

  // Change password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed values
  const totalLogins = user?.totalLogins || 0;
  const lastLogin = user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A';
  const daysSinceReg = user?.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0;
  
  // Profile completion percentage
  const calculateCompletion = () => {
    if (!user) return 0;
    const items = [!!user.name, !!user.email, true, !!user.profileImage];
    const doneCount = items.filter(Boolean).length;
    return Math.round((doneCount / 4) * 100);
  };
  const profileCompletion = calculateCompletion();

  const changePasswordRef = useRef(null);

  useEffect(() => {
    if (location.state?.section === 'change-password' && changePasswordRef.current) {
      setTimeout(() => {
        changePasswordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: you can focus on the first input
        const firstInput = changePasswordRef.current.querySelector('input');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  }, [location.state]);

  // Save Settings handler
  const saveSettings = async (updates) => {
    try {
      const res = await api.put('/users/settings', updates);
      if (res.data.success) {
        updateProfileState({ ...user, ...res.data.settings });
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleThemeChange = (newTheme) => {
    setThemeMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    saveSettings({ themeMode: newTheme });
  };

  const handleColorChange = (newColor) => {
    setAccentColor(newColor);
    document.documentElement.setAttribute('data-color', newColor);
    localStorage.setItem('accentColor', newColor);
    saveSettings({ accentColor: newColor });
  };


  // Download helpers
  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (data, filename) => {
    if (!data || !data.length) return;
    const keys = Object.keys(data[0]);
    const csvContent = [
      keys.join(','),
      ...data.map(row => keys.map(k => `"${row[k]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Password submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return setPwError('All fields are required');
    }
    if (newPassword.length < 8) {
      return setPwError('New password must be at least 8 characters long');
    }
    if (newPassword !== confirmNewPassword) {
      return setPwError('New passwords do not match');
    }

    setIsSubmitting(true);
    try {
      const res = await api.put('/users/change-password', {
        currentPassword, newPassword, confirmNewPassword
      });
      if (res.data.success) {
        setPwSuccess('Password changed successfully!');
        setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
      }
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="theme-settings animate-fade" style={{ minHeight: '100vh', width: '100vw', padding: '40px 0' }}>
      <div className="container-fluid" style={{ maxWidth: '850px' }}>
      
      <button 
        className="btn btn-secondary" 
        style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* SECTION 1: Account Statistics */}
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-title)' }}>
            <BarChart2 size={22} style={{ color: 'var(--primary)' }} />
            Account Statistics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Logins</p>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{totalLogins}</h3>
            </div>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Last Login</p>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{lastLogin}</h3>
            </div>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Days Since Registration</p>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{daysSinceReg}</h3>
            </div>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Profile Completion</p>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{profileCompletion}%</h3>
            </div>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Account Status</p>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--success)' }}>Active</h3>
            </div>
          </div>
        </div>



        {/* SECTION 3: Account Preferences */}
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-title)' }}>
            <Palette size={22} style={{ color: 'var(--primary)' }} />
            Account Preferences
          </h2>
          
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Theme Mode</h4>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className={`btn ${themeMode === 'light' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleThemeChange('light')}>
                <Sun size={16} style={{ marginRight: '8px' }} /> Light Mode
              </button>
              <button className={`btn ${themeMode === 'dark' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleThemeChange('dark')}>
                <Moon size={16} style={{ marginRight: '8px' }} /> Dark Mode
              </button>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Accent Color</h4>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { name: 'blue', hex: '#3B82F6' },
                { name: 'purple', hex: '#8B5CF6' },
                { name: 'green', hex: '#10B981' },
                { name: 'orange', hex: '#F97316' }
              ].map(color => (
                <button 
                  key={color.name}
                  className={`btn ${accentColor === color.name ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => handleColorChange(color.name)}
                  style={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: color.hex, display: 'inline-block', border: '2px solid rgba(255,255,255,0.3)' }} />
                  {color.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Removed Achievements and Notifications as per user request */}

        {/* SECTION 7: Account Management */}
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-title)' }}>
            <Shield size={22} style={{ color: '#ef4444' }} />
            Account Management
          </h2>
          
          <div style={{ marginBottom: '32px' }} ref={changePasswordRef}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Change Password</h4>
            
            {pwError && <div className="alert alert-error" style={{ marginBottom: '16px' }}><AlertCircle size={18} /><span>{pwError}</span></div>}
            {pwSuccess && <div className="alert alert-success" style={{ marginBottom: '16px' }}><CheckCircle size={18} /><span>{pwSuccess}</span></div>}
            
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
              <div className="input-container">
                <input type={showCurrent ? 'text' : 'password'} className="form-input" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                <button type="button" className="password-toggle" onClick={() => setShowCurrent(!showCurrent)}><Eye size={18} /></button>
              </div>
              <div className="input-container">
                <input type={showNew ? 'text' : 'password'} className="form-input" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <button type="button" className="password-toggle" onClick={() => setShowNew(!showNew)}><Eye size={18} /></button>
              </div>
              <div className="input-container">
                <input type={showConfirm ? 'text' : 'password'} className="form-input" placeholder="Confirm New Password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}><Eye size={18} /></button>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <RefreshCw size={18} className="spin" /> : 'Update Password'}
              </button>
            </form>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--panel-border)', margin: '32px 0' }} />

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => downloadJSON(user, 'account_data.json')} style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={16} /> Export Account Data
            </button>
            <button className="btn btn-secondary" onClick={logout} style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
      </div>
    </div>
  );
};

export default Settings;
