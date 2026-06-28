import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Shield, Clock, Trash2, Slash, UserCheck,
  Search, Users, UserMinus, ShieldAlert, Award, Activity,
  Key, Settings as SettingsIcon, CheckCircle, XCircle,
  TrendingUp, LogIn, AlertTriangle, Calendar, Monitor,
  BarChart2, Zap, Lock, BookOpen, Book, Star, Trophy, Target, Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';


/* ─── helpers ─── */
const formatDate = (d) => {
  if (!d) return 'Never';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/* ═══════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ── admin: live stats ── */
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0, loggedIn: 0, todayLogins: 0 });

  /* ── dashboard data ── */
  const [dashData, setDashData] = useState(null);
  const [loadingDash, setLoadingDash] = useState(true);

  /* ── learning tracker state ── */
  const [learningStats, setLearningStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  
  const [learningForm, setLearningForm] = useState({
    learningText: '',
    category: 'Programming',
    duration: '0-30',
    difficulty: 'Beginner'
  });
  const [learningMsg, setLearningMsg] = useState({ type: '', text: '' });
  const [submittingLearning, setSubmittingLearning] = useState(false);

  /* ── fetchers ── */
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/users/stats');
      if (res.data.success) setStats(res.data.stats);
    } catch (err) { console.error('Stats fetch error:', err); }
  }, [user]);

  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    try {
      const res = await api.get('/users/dashboard');
      if (res.data.success) setDashData(res.data.data);
    } catch (err) { console.error('Dashboard fetch error:', err); }
    finally { setLoadingDash(false); }
  }, []);

  const fetchLearningData = useCallback(async () => {
    try {
      const statsRes = await api.get('/users/learning/stats');
      if (statsRes.data.success) setLearningStats(statsRes.data.stats);

      const leaderRes = await api.get('/users/learning/leaderboard');
      if (leaderRes.data.success) setLeaderboard(leaderRes.data.leaderboard);
    } catch (err) { console.error('Learning fetch error:', err); }
  }, [user]);

  useEffect(() => {
    fetchStats();
    fetchDashboard();
    fetchLearningData();
  }, [user, fetchStats, fetchDashboard, fetchLearningData]);

  /* ── learning submit ── */
  const handleLearningSubmit = async (e) => {
    e.preventDefault();
    setLearningMsg({ type: '', text: '' });
    if (!learningForm.learningText.trim()) {
      return setLearningMsg({ type: 'error', text: 'Please enter what you learned.' });
    }
    setSubmittingLearning(true);
    try {
      const res = await api.post('/users/learning', learningForm);
      if (res.data.success) {
        setLearningMsg({ type: 'success', text: res.data.message });
        setLearningForm({ ...learningForm, learningText: '' });
        fetchLearningData();
      }
    } catch (err) {
      setLearningMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit' });
    } finally {
      setSubmittingLearning(false);
    }
  };

  const getAvatarUrl = (img) => img ? `/uploads/${img}` : null;

  /* ── admin stat values ── */
  const totalUsers   = stats.total;
  const activeCount  = stats.active;
  const todayLogins  = stats.todayLogins;

  /* ── profile completion ── */
  const completion = dashData?.profileCompletion;
  const security   = dashData?.security;
  const analytics  = dashData?.analytics;

  /* ═══════════════════════════════ RENDER ═══════════════════════════════ */
  return (
    <div className="theme-dashboard animate-fade" style={{ minHeight: '100vh', width: '100%', padding: '40px 20px', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <div className="container-fluid dashboard-container">
        {/* ── Welcome Card ── */}
      <div className="glass-panel welcome-card" style={{ padding: '32px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="welcome-profile" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {getAvatarUrl(user?.profileImage)
            ? <img src={getAvatarUrl(user.profileImage)} alt="Avatar" className="avatar avatar-large" />
            : <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&color=fff&size=128`} alt="Default Avatar" className="avatar avatar-large" />
          }
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Welcome Back, {user?.name}!</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} /> {user?.email}
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
            <Clock size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Last Login:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{formatDate(user?.lastLogin)}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
            <Award size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Member Since:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{formatDate(user?.createdAt)}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Account Status:</span>
            <strong style={{ color: 'var(--success)' }}>Active</strong>
          </div>
        </div>
      </div>

      {/* ══ MANAGEMENT PANEL ══ */}
        <div className="animate-scale">
          <h2 style={{ fontSize: '1.6rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-title)' }}>
            <Shield size={24} style={{ color: 'var(--accent)' }} /> User Management & Statistics
          </h2>

          {/* Stats Grid */}
          <div className="stat-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
            {[
              { icon: <Users size={24} />, value: totalUsers, label: 'Total Registered Users', grad: 'var(--primary-gradient)' },
              { icon: <UserCheck size={24} />, value: activeCount, label: 'Active User Accounts', grad: 'linear-gradient(135deg,#10b981,#059669)' },
              { icon: <LogIn size={24} />, value: todayLogins, label: "Today's Login Count", grad: 'var(--accent-gradient)' },
            ].map((s, i) => (
              <div className="glass-panel stat-card" key={i}>
                <div className="stat-icon" style={{ background: s.grad }}>{s.icon}</div>
                <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
              </div>
            ))}
          </div>


          {/* End User Management Section */}
        </div>
      {/* ══ QUICK SERVICES ══ */}
        <div className="animate-scale" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)' }}>Quick Portal Services</h2>
          <div className="dashboard-grid">
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--primary-gradient)', color: 'white' }}><User size={20} /></div>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>My Personal Profile</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>Manage profile credentials, verify contact details, or upload a custom avatar.</p>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => navigate('/profile')}>Configure Profile</button>
            </div>
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--accent-gradient)', color: 'white' }}><Shield size={20} /></div>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>Security & Settings</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>Update your password, manage notifications, or toggle display modes.</p>
              <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => navigate('/settings')}>Access Settings</button>
            </div>
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}><UserCheck size={20} /></div>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>Account Integrity</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>Your account is in good standing. All security protocols are operational.</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: '600', fontSize: '0.9rem' }}>
                <UserCheck size={16} /> Fully Verified & Protected
              </div>
            </div>
          </div>
        </div>


      {/* ══════════════════════════════════════════════════ */}
      {/* ENHANCED DASHBOARD SECTIONS (for ALL users)       */}
      {/* ══════════════════════════════════════════════════ */}

      {/* ── Personal Profile Builder Section ── */}
      <div className="glass-panel profile-builder-card" style={{ padding: '32px', marginBottom: '32px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-title)' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--primary-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} />
            </div>
            Personal Profile Builder
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.5' }}>
            Fill and generate your card! Create a stunning personal profile, manage your professional details, and generate smart introductions instantly.
          </p>
        </div>
        <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem', fontWeight: '600', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }} onClick={() => navigate('/profile-builder')}>
          Complete / Edit Profile Details
        </button>
      </div>

      {/* ── Quick Actions ── */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-title)' }}>
          <Zap size={20} style={{ color: 'var(--primary)' }} /> Quick Actions
        </h2>
        <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
          {[
            { label: 'Edit Profile', icon: <User size={18} />, action: () => navigate('/profile'), style: 'btn-primary' },
            { label: 'Change Password', icon: <Key size={18} />, action: () => navigate('/settings', { state: { section: 'change-password' } }), style: 'btn-secondary' },
            { label: 'Settings', icon: <SettingsIcon size={18} />, action: () => navigate('/settings'), style: 'btn-secondary' },
          ].map((btn, i) => (
            <button key={i} className={`btn ${btn.style}`} onClick={btn.action}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px' }}>
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Security Center + Profile Completion ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '28px' }}>

        {/* Security Center */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-title)' }}>
            <Lock size={20} style={{ color: 'var(--warning)' }} /> Security Center
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                icon: <Shield size={16} />,
                label: 'Password Strength',
                value: security?.lastPasswordChange ? 'Strong' : 'Set',
                valueColor: 'var(--success)',
              },
              {
                icon: <Calendar size={16} />,
                label: 'Last Password Change',
                value: formatDate(security?.lastPasswordChange),
                valueColor: 'var(--text-primary)',
              },
              {
                icon: <AlertTriangle size={16} />,
                label: 'Failed Login Attempts',
                value: security?.failedLoginAttempts ?? 0,
                valueColor: security?.failedLoginAttempts > 0 ? 'var(--danger)' : 'var(--success)',
              },
              {
                icon: <CheckCircle size={16} />,
                label: 'Account Status',
                value: security?.accountStatus ?? 'Active',
                valueColor: security?.accountStatus === 'Active' ? 'var(--success)' : 'var(--danger)',
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--panel-border)' : 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--primary)' }}>{item.icon}</span> {item.label}
                </span>
                <strong style={{ color: item.valueColor, fontSize: '0.9rem' }}>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Completion */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-title)' }}>
            <User size={20} style={{ color: 'var(--primary)' }} /> Profile Completion
          </h2>
          {completion ? (
            <>
              {/* Progress bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Overall Progress</span>
                  <strong style={{ color: completion.percentage >= 75 ? 'var(--success)' : 'var(--warning)', fontSize: '1rem' }}>{completion.percentage}%</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${completion.percentage}%`, background: completion.percentage >= 75 ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {completion.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.done
                      ? <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                      : <XCircle size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    }
                    <span style={{ color: item.done ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '24px' }}>
                {completion.percentage < 100 ? (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/profile')}>
                    Complete Profile
                  </button>
                ) : (
                  <button className="btn btn-secondary" style={{ width: '100%', color: 'var(--success)' }} disabled>
                    Profile Completed ✓
                  </button>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ width: '24px', height: '24px', border: '2px solid rgba(99,102,241,0.1)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>
          )}
        </div>
      </div>

      {/* ── User Analytics ── */}
      {analytics && (
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-title)' }}>
            <BarChart2 size={20} style={{ color: 'var(--primary)' }} /> User Analytics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { icon: <TrendingUp size={22} />, label: 'New Registrations This Month', value: analytics.newThisMonth, color: 'var(--primary)', bg: 'rgba(99,102,241,0.12)' },
              { icon: <UserCheck size={22} />, label: 'Active Accounts', value: analytics.active, color: 'var(--success)', bg: 'rgba(16,185,129,0.12)' }
            ].map((card, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: card.color, lineHeight: 1 }}>{card.value}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{card.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        
        /* Dashboard Responsiveness */
        .dashboard-container { max-width: 1200px; margin: 0 auto; width: 100%; }
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        
        @media (max-width: 1024px) {
          .welcome-card { padding: 24px !important; }
        }
        
        @media (max-width: 768px) {
          .theme-dashboard { padding: 24px 16px !important; }
          .navbar { flex-wrap: wrap; height: auto !important; padding: 12px 16px !important; gap: 12px; }
          .nav-links { flex-wrap: wrap; justify-content: center; width: 100%; order: 3; margin-top: 10px; }
          .welcome-card { flex-direction: column; align-items: stretch !important; text-align: center; }
          .welcome-profile { flex-direction: column; align-items: center !important; }
          .welcome-profile h1 { justify-content: center; font-size: 1.5rem !important; text-align: center; }
          .welcome-text p { justify-content: center; }
          .profile-builder-card { flex-direction: column; text-align: center; padding: 24px !important; }
          .profile-builder-card h2 { justify-content: center; font-size: 1.3rem !important; }
          .profile-builder-card button { width: 100%; }
        }
        
        @media (max-width: 425px) {
          .theme-dashboard { padding: 16px 12px !important; }
          .stat-card-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .quick-actions-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .welcome-profile h1 { font-size: 1.3rem !important; }
          .avatar-large { width: 80px; height: 80px; }
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
        
        @media (max-width: 375px) {
          .profile-builder-card h2 { font-size: 1.2rem !important; }
          .nav-brand span { display: none; }
        }
        
        @media (max-width: 320px) {
          .theme-dashboard { padding: 12px 8px !important; }
        }
      `}</style>
    </div>
    </div>
  );
};

export default Dashboard;
