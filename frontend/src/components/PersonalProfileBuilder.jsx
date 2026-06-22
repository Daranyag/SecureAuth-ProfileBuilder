import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Save, FileText, Download, FileImage, Layers, UserCheck } from 'lucide-react';

const PersonalProfileBuilder = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Visibility toggles
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showIntroCard, setShowIntroCard] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/personal-profile');
      if (res.data.success) {
        setProfile(res.data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      const res = await api.post('/users/personal-profile', profile);
      if (res.data.success) {
        setProfile(res.data.profile);
        setMessage('Profile saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadImage = async (elementId, filename) => {
    const originalElement = document.getElementById(elementId);
    if (!originalElement || !window.htmlToImage) return;

    // Get exact screen boundaries
    const rect = originalElement.getBoundingClientRect();

    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    exportContainer.style.top = '-9999px';
    exportContainer.style.margin = '0';
    exportContainer.style.padding = '0';
    exportContainer.style.border = 'none';
    exportContainer.style.width = `${rect.width}px`;
    exportContainer.style.height = `${rect.height}px`;
    exportContainer.style.backgroundColor = '#ffffff';

    const clonedElement = originalElement.cloneNode(true);
    clonedElement.style.margin = '0';
    clonedElement.style.boxShadow = 'none';
    clonedElement.style.width = '100%';
    clonedElement.style.height = '100%';

    exportContainer.appendChild(clonedElement);
    document.body.appendChild(exportContainer);

    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const dataUrl = await window.htmlToImage.toPng(exportContainer, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        width: rect.width,
        height: rect.height,
        style: { margin: '0', padding: '0' }
      });
      const link = document.createElement('a');
      link.download = filename || 'profile-card.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Image export failed:', err);
    } finally {
      document.body.removeChild(exportContainer);
    }
  };

  if (loading) return <div>Loading Profile Builder...</div>;

  const currentProfile = profile || {};
  const completionPct = currentProfile.completionPercentage || 0;

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        Complete / Edit Profile Details
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center',
          alignItems: 'flex-start', overflowY: 'auto', padding: '40px 20px'
        }}>
          <div className="personal-profile-builder" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '800px', position: 'relative' }}>
            
            <button className="btn btn-secondary" onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.1)' }}>
              Close
            </button>

      {/* Profile Form */}
      <div className="glass-panel" style={{ padding: '30px', marginTop: '40px' }}>
        <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <User size={22} style={{ color: 'var(--primary)' }} />
          Personal Profile Builder
        </h2>
        
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Profile Completion</span>
            <strong style={{ color: completionPct >= 100 ? 'var(--success)' : 'var(--primary)' }}>{completionPct}%</strong>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${completionPct}%`, background: 'var(--primary-gradient)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {message && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>{message}</div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Personal Info */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <input type="text" name="fullName" placeholder="Full Name" className="form-input" value={currentProfile.fullName || ''} onChange={handleChange} />
              <input type="number" name="age" placeholder="Age" className="form-input" value={currentProfile.age || ''} onChange={handleChange} />
              <select name="gender" className="form-input" value={currentProfile.gender || ''} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input type="date" name="dateOfBirth" className="form-input" value={currentProfile.dateOfBirth || ''} onChange={handleChange} />
              <input type="text" name="phoneNumber" placeholder="Phone Number" className="form-input" value={currentProfile.phoneNumber || ''} onChange={handleChange} />
              <input type="text" name="hobbies" placeholder="Hobbies (e.g., Reading Books, Coding)" className="form-input" value={currentProfile.hobbies || ''} onChange={handleChange} />
              <input type="text" name="alternatePhoneNumber" placeholder="Alternate Phone" className="form-input" value={currentProfile.alternatePhoneNumber || ''} onChange={handleChange} />
              <input type="email" name="emailAddress" placeholder="Email Address" className="form-input" value={currentProfile.emailAddress || ''} onChange={handleChange} />
            </div>
          </div>

          {/* Address Info */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Address Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <input type="text" name="address" placeholder="Address" className="form-input" value={currentProfile.address || ''} onChange={handleChange} style={{ gridColumn: '1 / -1' }} />
              <input type="text" name="villageCity" placeholder="Village / City" className="form-input" value={currentProfile.villageCity || ''} onChange={handleChange} />
              <input type="text" name="district" placeholder="District" className="form-input" value={currentProfile.district || ''} onChange={handleChange} />
              <input type="text" name="state" placeholder="State" className="form-input" value={currentProfile.state || ''} onChange={handleChange} />
              <input type="text" name="country" placeholder="Country" className="form-input" value={currentProfile.country || ''} onChange={handleChange} />
              <input type="text" name="pinCode" placeholder="PIN Code" className="form-input" value={currentProfile.pinCode || ''} onChange={handleChange} />
            </div>
          </div>

          {/* Educational Info */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Educational Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <input type="text" name="highestQualification" placeholder="Highest Qualification (e.g., B.E Computer Science)" className="form-input" value={currentProfile.highestQualification || ''} onChange={handleChange} />
              <input type="text" name="schoolName" placeholder="School Name" className="form-input" value={currentProfile.schoolName || ''} onChange={handleChange} />
              <input type="text" name="collegeName" placeholder="College Name" className="form-input" value={currentProfile.collegeName || ''} onChange={handleChange} />
              <input type="text" name="department" placeholder="Department" className="form-input" value={currentProfile.department || ''} onChange={handleChange} />
              <input type="text" name="graduationYear" placeholder="Graduation Year" className="form-input" value={currentProfile.graduationYear || ''} onChange={handleChange} />
              <input type="text" name="cgpaPercentage" placeholder="CGPA / Percentage" className="form-input" value={currentProfile.cgpaPercentage || ''} onChange={handleChange} />
            </div>
          </div>

          {/* Professional Info */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Professional Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <select name="currentStatus" className="form-input" value={currentProfile.currentStatus || ''} onChange={handleChange}>
                <option value="">Current Status</option>
                <option value="Student">Student</option>
                <option value="Working Professional">Working Professional</option>
                <option value="Job Seeker">Job Seeker</option>
                <option value="Freelancer">Freelancer</option>
              </select>
              <input type="text" name="occupation" placeholder="Occupation" className="form-input" value={currentProfile.occupation || ''} onChange={handleChange} />
              <input type="text" name="companyName" placeholder="Company Name" className="form-input" value={currentProfile.companyName || ''} onChange={handleChange} />
              <input type="text" name="experience" placeholder="Experience" className="form-input" value={currentProfile.experience || ''} onChange={handleChange} />
            </div>
          </div>

          {/* Skills Info */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Skills Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <input type="text" name="technicalSkills" placeholder="Technical Skills (e.g., C, Java, MongoDB)" className="form-input" value={currentProfile.technicalSkills || ''} onChange={handleChange} style={{ gridColumn: '1 / -1' }} />
              <input type="text" name="softSkills" placeholder="Soft Skills" className="form-input" value={currentProfile.softSkills || ''} onChange={handleChange} style={{ gridColumn: '1 / -1' }} />
              <input type="text" name="languagesKnown" placeholder="Languages Known" className="form-input" value={currentProfile.languagesKnown || ''} onChange={handleChange} />
              <input type="text" name="certifications" placeholder="Certifications" className="form-input" value={currentProfile.certifications || ''} onChange={handleChange} />
            </div>
          </div>

          {/* Career & Additional */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Career & Additional Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <input type="text" name="careerGoal" placeholder="Career Goal (e.g., Full Stack Developer)" className="form-input" value={currentProfile.careerGoal || ''} onChange={handleChange} />
              <input type="text" name="areaOfInterest" placeholder="Area of Interest" className="form-input" value={currentProfile.areaOfInterest || ''} onChange={handleChange} />
              <input type="text" name="dreamJobRole" placeholder="Dream Job Role" className="form-input" value={currentProfile.dreamJobRole || ''} onChange={handleChange} />
              <input type="text" name="strengths" placeholder="Strengths" className="form-input" value={currentProfile.strengths || ''} onChange={handleChange} />
              <input type="text" name="achievements" placeholder="Achievements" className="form-input" value={currentProfile.achievements || ''} onChange={handleChange} />
              <textarea name="additionalNotes" placeholder="Additional Notes" className="form-input" value={currentProfile.additionalNotes || ''} onChange={handleChange} rows={3} style={{ gridColumn: '1 / -1' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
            
            {currentProfile._id && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowProfileCard(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} /> Generate Profile Card
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowIntroCard(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={18} /> Generate Self Introduction
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* GENERATED PROFILE CARD */}
      {showProfileCard && (
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)' }}>Generated Profile Card</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => handleDownloadImage('profile-card-content', 'profile-card.png')}>
                <FileImage size={16} style={{ marginRight: '6px' }} /> Download Image
              </button>
            </div>
          </div>

          <div id="profile-card-content" style={{
            background: '#ffffff',
            color: '#1a1a1a',
            padding: '40px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: '600px',
            margin: '0 auto',
            fontFamily: 'sans-serif'
          }}>
            <h1 style={{ fontSize: '2rem', borderBottom: '2px solid #3b82f6', paddingBottom: '10px', marginBottom: '20px', color: '#1e3a8a', margin: '0 0 20px 0' }}>
              Personal Profile
            </h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', fontSize: '1.1rem', lineHeight: '1.6' }}>
              {currentProfile.fullName && <><strong style={{ color: '#4b5563' }}>Name:</strong> <span>{currentProfile.fullName}</span></>}
              {currentProfile.age && <><strong style={{ color: '#4b5563' }}>Age:</strong> <span>{currentProfile.age}</span></>}
              {currentProfile.phoneNumber && <><strong style={{ color: '#4b5563' }}>Phone:</strong> <span>{currentProfile.phoneNumber}</span></>}
              {currentProfile.district && <><strong style={{ color: '#4b5563' }}>District:</strong> <span>{currentProfile.district}</span></>}
              {currentProfile.highestQualification && <><strong style={{ color: '#4b5563' }}>Qualification:</strong> <span>{currentProfile.highestQualification}</span></>}
              {(currentProfile.occupation || currentProfile.currentStatus) && <><strong style={{ color: '#4b5563' }}>Occupation:</strong> <span>{currentProfile.occupation || currentProfile.currentStatus}</span></>}
              {currentProfile.technicalSkills && <><strong style={{ color: '#4b5563' }}>Skills:</strong> <span>{currentProfile.technicalSkills}</span></>}
              {currentProfile.careerGoal && <><strong style={{ color: '#4b5563' }}>Career Goal:</strong> <span>{currentProfile.careerGoal}</span></>}
              {currentProfile.hobbies && <><strong style={{ color: '#4b5563' }}>Hobbies:</strong> <span>{currentProfile.hobbies}</span></>}
            </div>
            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', fontSize: '0.9rem', color: '#6b7280', textAlign: 'right' }}>
              Generated Date: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* GENERATED SELF INTRODUCTION CARD */}
      {showIntroCard && (
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)' }}>Self Introduction Card</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => handleDownloadImage('intro-card-content', 'profile-card.png')}>
                <FileImage size={16} style={{ marginRight: '6px' }} /> Download Image
              </button>
            </div>
          </div>

          <div id="intro-card-content" style={{
            background: '#ffffff',
            color: '#1a1a1a',
            padding: '40px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: '600px',
            margin: '0 auto',
            fontFamily: 'sans-serif'
          }}>
            <h1 style={{ fontSize: '1.8rem', borderBottom: '2px solid #10b981', paddingBottom: '10px', marginBottom: '20px', color: '#065f46', margin: '0 0 20px 0' }}>
              Professional Self Introduction
            </h1>
            <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#374151', textAlign: 'justify', whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: 0 }}>
              {currentProfile.generatedIntro || 'No introduction available. Please fill out your profile and save to generate.'}
            </p>
            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', fontSize: '0.9rem', color: '#6b7280', textAlign: 'right' }}>
              Generated Date: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

        </div>
        </div>
      )}
    </>
  );
};

export default PersonalProfileBuilder;
