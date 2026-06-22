import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Upload, Camera, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [validationError, setValidationError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setValidationError('File size exceeds the 2MB limit');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setValidationError('Only images (JPEG, JPG, PNG, WEBP) are allowed');
        return;
      }

      setValidationError('');
      setSelectedFile(file);

      // Create local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Validate and preview
      if (file.size > 2 * 1024 * 1024) {
        setValidationError('File size exceeds the 2MB limit');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setValidationError('Only images are allowed');
        return;
      }
      setValidationError('');
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !email) {
      setValidationError('Name and Email fields are required');
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use FormData for file upload compatibility
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      const res = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setSuccessMsg('Profile updated successfully!');
        updateProfileState(res.data.user);
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to update profile details';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Profile image URL resolver
  const getAvatarSource = () => {
    if (previewUrl) return previewUrl;
    if (user?.profileImage) return `http://localhost:5000/uploads/${user.profileImage}`;
    return null;
  };

  return (
    <div className="theme-profile animate-fade" style={{ minHeight: '100vh', width: '100vw', padding: '40px 0' }}>
      <div className="container-fluid" style={{ maxWidth: '800px' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <button 
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <button 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          onClick={() => navigate('/profile-builder')}
        >
          <User size={16} /> Personal Profile Builder
        </button>
      </div>

      <div className="glass-panel animate-scale" style={{ padding: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontFamily: 'var(--font-title)' }}>My Profile</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Update your account name, email address, and avatar image.
        </p>

        {/* Alerts */}
        {validationError && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{validationError}</span>
          </div>
        )}
        {errorMsg && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
            
            {/* Avatar upload left side */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                {getAvatarSource() ? (
                  <img src={getAvatarSource()} alt="Avatar" className="avatar avatar-large" style={{ border: '3px solid var(--primary)' }} />
                ) : (
                  <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&color=fff&size=128`} alt="Default Avatar" className="avatar avatar-large" style={{ border: '3px solid var(--primary)' }} />
                )}
                
                {/* Upload circle button overlay */}
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--primary-gradient)',
                    border: '2px solid var(--bg-color)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}
                  onClick={() => fileInputRef.current.click()}
                >
                  <Camera size={14} />
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*"
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Max image size: 2MB</span>
            </div>

            {/* Drag & drop upload target box */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                flex: 1,
                minWidth: '240px',
                height: '100px',
                border: '2px dashed var(--input-border)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              onClick={() => fileInputRef.current.click()}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--input-border)'}
            >
              <Upload size={20} style={{ marginBottom: '8px', color: 'var(--primary)' }} />
              <span>Drag & drop profile image here or click to browse</span>
            </div>

          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--panel-border)', margin: '10px 0' }} />

          {/* Form details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="profile-name">Full Name</label>
              <div className="input-container">
                <input
                  id="profile-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <User className="input-icon" size={18} />
              </div>
            </div>

            {/* Email */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="profile-email">Email Address</label>
              <div className="input-container">
                <input
                  id="profile-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="input-icon" size={18} />
              </div>
            </div>

          </div>

          {/* User Role & Join Date (ReadOnly) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '10px' }}>
            {/* Role removed */}
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Member Since:</span>
              <p style={{ marginTop: '6px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setName(user?.name || '');
                setEmail(user?.email || '');
                setSelectedFile(null);
                setPreviewUrl(null);
                setValidationError('');
              }}
              disabled={isSubmitting}
            >
              Reset Changes
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ padding: '12px 32px' }}
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
              ) : 'Save Changes'}
            </button>
          </div>

        </form>

      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    </div>
  );
};

export default Profile;
