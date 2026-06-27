import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Save, FileImage, Layers, UserCheck,
  ArrowLeft, CheckCircle, X, Plus, Trash2, Settings, RefreshCw
} from 'lucide-react';
import api from '../services/api';

const ProfileBuilder = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showIntroCard, setShowIntroCard] = useState(false);

  const [introRemovalText, setIntroRemovalText] = useState('');
  const [appliedIntroRemoval, setAppliedIntroRemoval] = useState('');
  const [cardRemovalText, setCardRemovalText] = useState('');
  const [appliedCardRemoval, setAppliedCardRemoval] = useState('');
  const [introVersion, setIntroVersion] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [additionalIntroSentence, setAdditionalIntroSentence] = useState('');

  const shouldRemove = (removalString, fieldNames, categories = []) => {
    if (!removalString) return false;
    const terms = removalString.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    for (const term of terms) {
      if (
        fieldNames.some(f => f.toLowerCase() === term) ||
        categories.some(c => c.toLowerCase() === term)
      ) {
        return true;
      }
    }
    return false;
  };

  const getAvailableFields = (profileData) => {
    if (!profileData) return [];
    const fields = [];
    const map = {
      fullName: 'Full Name', age: 'Age', gender: 'Gender',
      villageCity: 'Village / City', district: 'District', state: 'State', country: 'Country',
      highestQualification: 'Qualification', department: 'Department', collegeName: 'School / College Name',
      graduationYear: 'Graduation Year', cgpaPercentage: 'Current CGPA / Marks',
      occupation: 'Occupation / Current Role', companyName: 'Company Name', experience: 'Experience',
      areaOfInterest: 'Area of Interest', certifications: 'Certifications',
      careerGoal: 'Career Goal', dreamJobRole: 'Dream Company / Role',
      familyBackground: 'Family Background', fatherName: 'Father Name', motherName: 'Mother Name', siblings: 'Siblings',
      technicalSkills: 'Technical Skills', softSkills: 'Soft Skills', languagesKnown: 'Languages Known', portfolioLink: 'Portfolio Link',
      hobbies: 'Hobbies',
    };
    Object.keys(map).forEach(key => {
      if (profileData[key]) {
        fields.push((profileData.labels && profileData.labels[key]) || map[key]);
      }
    });
    if (profileData.customFields && profileData.customFields.length > 0) {
      profileData.customFields.forEach(cf => {
        if (cf.fieldName) fields.push(cf.fieldName);
      });
    }
    return fields;
  };

  const handleToggleField = (field, currentText, setText) => {
    const terms = currentText.split(',').map(s => s.trim()).filter(Boolean);
    const lowerField = field.toLowerCase();
    const index = terms.findIndex(t => t.toLowerCase() === lowerField);
    if (index !== -1) {
      terms.splice(index, 1);
      setText(terms.join(terms.length > 0 ? ', ' : ''));
    } else {
      setText([...terms, field].join(', '));
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/personal-profile');
      if (res.data.success) {
        let fetchedProfile = res.data.profile || {};
        if (!fetchedProfile.customFields) fetchedProfile.customFields = [];
        setProfile(fetchedProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({ customFields: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  
  
  const handleAddAdditionalSentence = () => {
    if (!additionalIntroSentence.trim()) return;
    const currentIntro = profile.generatedIntro || '';
    const newIntro = currentIntro ? currentIntro + '\n\n' + additionalIntroSentence.trim() : additionalIntroSentence.trim();
    setProfile(prev => ({ ...prev, generatedIntro: newIntro }));
    setHasUnsavedChanges(true);
  };

  const handleLabelChange = (e) => {
    setHasUnsavedChanges(true);
    setShowProfileCard(false);
    setShowIntroCard(false);
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      labels: {
        ...(prev.labels || {}),
        [name]: value
      }
    }));
  };

  const handleChange = (e) => {
    setHasUnsavedChanges(true);
    setShowProfileCard(false);
    setShowIntroCard(false);
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (index, field, value) => {
    setHasUnsavedChanges(true);
    setShowProfileCard(false);
    setShowIntroCard(false);
    const updatedCustom = [...(profile.customFields || [])];
    updatedCustom[index] = { ...updatedCustom[index], [field]: value };
    setProfile(prev => ({ ...prev, customFields: updatedCustom }));
  };

  const addCustomField = () => {
    setHasUnsavedChanges(true);
    setShowProfileCard(false);
    setShowIntroCard(false);
    setProfile(prev => ({
      ...prev,
      customFields: [...(prev.customFields || []), { fieldName: '', value: '' }]
    }));
  };

  const removeCustomField = (index) => {
    setHasUnsavedChanges(true);
    setShowProfileCard(false);
    setShowIntroCard(false);
    const updatedCustom = [...(profile.customFields || [])];
    updatedCustom.splice(index, 1);
    setProfile(prev => ({ ...prev, customFields: updatedCustom }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      const res = await api.post('/users/personal-profile', profile);
      if (res.data.success) {
        setProfile(res.data.profile);
        setHasUnsavedChanges(false);
        setMessage({ type: 'success', text: '✓ Profile saved successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadImage = async (elementId, filename) => {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
      alert("Please generate the card first.");
      return;
    }

    if (!window.htmlToImage) {
      console.error('html-to-image library not loaded');
      return;
    }

    try {
      // Wait for component to fully render
      await new Promise(resolve => setTimeout(resolve, 300));

      // Capture the actual visible card with high scale
      const dataUrl = await window.htmlToImage.toPng(originalElement, {
        quality: 1.0,
        pixelRatio: 3, // High quality scale
        backgroundColor: '#ffffff',
        style: {
          margin: '0',
          padding: '40px'
        }
      });

      const link = document.createElement('a');
      link.download = filename || 'profile-card.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Image export failed:', err);
      alert("Failed to download image. Please try again.");
    }
  };

  const handleGenerateProfileCard = async () => {
    try {
      const res = await api.get('/users/personal-profile');
      if (res.data.success && res.data.profile && Object.keys(res.data.profile).length > 0) {
        let fetchedProfile = res.data.profile;
        if (!fetchedProfile.customFields) fetchedProfile.customFields = [];
        setProfile(fetchedProfile);
        setAppliedCardRemoval('');
        setCardRemovalText('');
        setShowProfileCard(true);
        setShowIntroCard(false);
      } else {
        alert("Please create and save your profile first.");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert("Please create and save your profile first.");
    }
  };

  const handleGenerateIntro = async () => {
    try {
      const res = await api.get('/users/personal-profile');
      if (res.data.success && res.data.profile && Object.keys(res.data.profile).length > 0) {
        let fetchedProfile = res.data.profile;
        if (!fetchedProfile.customFields) fetchedProfile.customFields = [];
        setProfile(fetchedProfile);
        setAppliedIntroRemoval('');
        setIntroRemovalText('');
        generateSmartIntro('', fetchedProfile);
      } else {
        alert("Please create and save your profile first.");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert("Please create and save your profile first.");
    }
  };

  // ── Smart Intro Generator ──────────────────────────────────────────────────
  const generateSmartIntro = (config = appliedIntroRemoval, currentProfile = profile, forceVersion = introVersion) => {
    const p = currentProfile || {};
    if (Object.keys(p).length === 0) return;
    const opts = config;
    const paragraphs = [];

    // Sanitization helper to avoid undefined, null, N/A, and empty work
    const cln = (val) => {
      if (!val) return null;
      const s = val.toString().trim();
      if (!s || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'no work' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return null;
      return s;
    };

    const status = cln(p.currentStatus) || '';
    const v = forceVersion % 3;

    // ── Paragraph 1: Identity + Location ──────────────────────────────────────
    const para1Parts = [];
    const name = cln(p.fullName);
    const age = cln(p.age);
    const gender = cln(p.gender) ? cln(p.gender).toLowerCase() : 'individual';

    if (name && !shouldRemove(opts, ['Name', 'Full Name'], ['Personal Information'])) {
      if (v === 0) {
        let opening = `Hello, my name is ${name}.`;
        if (age && !shouldRemove(opts, ['Age'], ['Personal Information'])) {
          opening += ` I am a ${age}-year-old professional.`;
        }
        para1Parts.push(opening);
      } else if (v === 1) {
        let opening = `I am ${name}`;
        if (age && !shouldRemove(opts, ['Age'], ['Personal Information'])) opening += `, a ${age}-year-old driven ${gender}`;
        para1Parts.push(opening + '.');
      } else {
        let opening = `Greetings, my name is ${name}.`;
        if (age && !shouldRemove(opts, ['Age'], ['Personal Information'])) opening += ` I am ${age} years old.`;
        para1Parts.push(opening);
      }
    }

    const locParts = [];
    if (cln(p.villageCity) && !shouldRemove(opts, ['City', 'Village', 'VillageCity'], ['Place Details', 'Location Details', 'Location Information'])) locParts.push(cln(p.villageCity));
    if (cln(p.district) && !shouldRemove(opts, ['District'], ['Place Details', 'Location Details', 'Location Information'])) locParts.push(cln(p.district));
    if (cln(p.state) && !shouldRemove(opts, ['State'], ['Place Details', 'Location Details', 'Location Information'])) locParts.push(cln(p.state));
    if (cln(p.country) && !shouldRemove(opts, ['Country'], ['Place Details', 'Location Details', 'Location Information'])) locParts.push(cln(p.country));

    if (locParts.length > 0) {
      const locStr = locParts.join(', ');
      if (v === 0) para1Parts.push(`I am currently based in ${locStr}.`);
      else if (v === 1) para1Parts.push(`I reside in the vibrant area of ${locStr}.`);
      else para1Parts.push(`I live in ${locStr}.`);
    }

    if (para1Parts.length > 0) paragraphs.push(para1Parts.join(' '));

    // ── Paragraph 1.5: Family ──────────────────────────────────────────────────
    const familyParts = [];
    const famBg = cln(p.familyBackground);
    const fat = cln(p.fatherName);
    const mot = cln(p.motherName);
    const sib = cln(p.siblings);

    if (famBg && !shouldRemove(opts, ['Family Background'], ['Family Details', 'Family'])) {
      if (v === 0) familyParts.push(`On a personal note, I come from a ${famBg} background.`);
      else if (v === 1) familyParts.push(`My personal foundation is rooted in a ${famBg} background.`);
      else familyParts.push(`I was raised in a supportive ${famBg} environment.`);
    }

    const fatLabel = (p.labels && p.labels.fatherName !== undefined) ? p.labels.fatherName : 'Father Name';
    if (fat && !shouldRemove(opts, ['Father Name', 'Father'], ['Family Details', 'Family'])) familyParts.push(`My ${fatLabel} is ${fat}.`);
    
    const motLabel = (p.labels && p.labels.motherName !== undefined) ? p.labels.motherName : 'Mother Name';
    if (mot && !shouldRemove(opts, ['Mother Name', 'Mother'], ['Family Details', 'Family'])) familyParts.push(`My ${motLabel} is ${mot}.`);

    const sibLabel = (p.labels && p.labels.siblings !== undefined) ? p.labels.siblings : 'Siblings';
    if (sib && !shouldRemove(opts, ['Siblings', 'Sibling Details'], ['Family Details', 'Family'])) familyParts.push(`My ${sibLabel} is ${sib}.`);

    if (familyParts.length > 0) paragraphs.push(familyParts.join(' '));

    // ── Paragraph 2: Status-Specific Details ──────────────────────────────────
    const para2Parts = [];
    if (status === 'Student') {
      const qual = cln(p.highestQualification);
      const dept = cln(p.department);
      const school = cln(p.collegeName) || cln(p.schoolName);
      const gradYear = cln(p.graduationYear);
      const cgpa = cln(p.cgpaPercentage);

      const hasQual = qual && !shouldRemove(opts, ['Qualification', 'Highest Qualification'], ['Education']);
      const hasDept = dept && !shouldRemove(opts, ['Department'], ['Education']);
      const hasSchool = school && !shouldRemove(opts, ['College', 'School', 'College Name', 'School Name'], ['Education']);

      if (v === 0) {
        let sent = [];
        if (hasQual) sent.push(`pursuing a ${qual}`);
        if (hasDept) sent.push(`in ${dept}`);
        if (hasSchool) sent.push(`at ${school}`);
        if (sent.length > 0) {
          let str = `I am currently ${sent.join(' ')}.`;
          if (gradYear && !shouldRemove(opts, ['Graduation', 'Graduation Year'], ['Education'])) str += ` I expect to graduate in ${gradYear}.`;
          para2Parts.push(str);
        }
        if (cgpa && !shouldRemove(opts, ['CGPA', 'CGPA Percentage', 'Marks'], ['Education'])) para2Parts.push(`My current academic standing is a CGPA of ${cgpa}.`);
      } else if (v === 1) {
        let sent = [];
        if (hasQual) sent.push(`As a dedicated ${qual} student`);
        if (hasDept) sent.push(`focusing on ${dept}`);
        if (hasSchool) sent.push(`at ${school}`);
        if (sent.length > 0) para2Parts.push(`${sent.join(' ')}, I am deeply passionate about my field of study.`);
        if (gradYear && !shouldRemove(opts, ['Graduation', 'Graduation Year'], ['Education'])) para2Parts.push(`My graduation is anticipated in ${gradYear}.`);
        if (cgpa && !shouldRemove(opts, ['CGPA', 'CGPA Percentage', 'Marks'], ['Education'])) para2Parts.push(`I maintain a strong academic record with a ${cgpa} CGPA.`);
      } else {
        let sent = [];
        if (hasSchool) sent.push(`My academic journey at ${school} has been incredibly rewarding.`);
        if (hasQual || hasDept) sent.push(`I am studying for my ${hasQual ? qual : 'degree'} ${hasDept ? 'in ' + dept : ''}.`);
        if (sent.length > 0) para2Parts.push(sent.join(' '));
        if (gradYear && !shouldRemove(opts, ['Graduation', 'Graduation Year'], ['Education'])) para2Parts.push(`I look forward to graduating in ${gradYear}.`);
      }
    } else if (status === 'Working Professional' || status === 'Freelancer') {
      const occ = cln(p.occupation);
      const comp = cln(p.companyName);
      const exp = cln(p.experience);
      const area = cln(p.areaOfInterest);

      const hasOcc = occ && !shouldRemove(opts, ['Occupation'], ['Professional Information']);
      const hasComp = comp && status !== 'Freelancer' && !shouldRemove(opts, ['Company', 'Company Name'], ['Professional Information']);
      const hasExp = exp && !shouldRemove(opts, ['Experience'], ['Professional Information']);

      if (v === 0) {
        let sent = [];
        if (hasOcc) sent.push(status === 'Freelancer' ? `working as a freelance ${occ}` : `working as a ${occ}`);
        if (hasComp) sent.push(`at ${comp}`);
        if (sent.length > 0) para2Parts.push(`I am currently ${sent.join(' ')}.`);
        if (hasExp) para2Parts.push(`I bring ${exp} of valuable experience to my role.`);
        if (area && !shouldRemove(opts, ['Area of Interest'], ['Career'])) para2Parts.push(`My main area of specialization is ${area}.`);
      } else if (v === 1) {
        let sent = [];
        if (hasOcc) sent.push(`As an experienced ${occ}`);
        if (hasComp) sent.push(`at ${comp}`);
        if (sent.length > 0) para2Parts.push(`${sent.join(' ')}, I strive to deliver exceptional results.`);
        if (hasExp) para2Parts.push(`I have accumulated ${exp} of hands-on experience in the industry.`);
        if (area && !shouldRemove(opts, ['Area of Interest'], ['Career'])) para2Parts.push(`I am particularly focused on ${area}.`);
      } else {
        let sent = [];
        if (hasOcc) sent.push(`My professional career revolves around my work as a ${occ}.`);
        if (hasComp) sent.push(`I am proudly associated with ${comp}.`);
        if (sent.length > 0) para2Parts.push(sent.join(' '));
        if (hasExp) para2Parts.push(`Over the past ${exp}, I have honed my expertise.`);
        if (area && !shouldRemove(opts, ['Area of Interest'], ['Career'])) para2Parts.push(`I am highly interested in ${area}.`);
      }

      const port = cln(p.portfolioLink);
      if (port && !shouldRemove(opts, ['Portfolio', 'Portfolio Link'], ['Professional Information'])) para2Parts.push(`You can explore my professional portfolio at ${port}.`);
    } else if (status === 'Job Seeker') {
      const qual = cln(p.highestQualification);
      const goal = cln(p.careerGoal);
      const certs = cln(p.certifications);

      if (qual && !shouldRemove(opts, ['Qualification', 'Highest Qualification'], ['Education'])) para2Parts.push(`I recently completed my ${qual}.`);
      if (goal && !shouldRemove(opts, ['Career Goal'], ['Career'])) para2Parts.push(`I am actively seeking new opportunities and aspire to become a ${goal}.`);
      if (certs && !shouldRemove(opts, ['Certifications'], ['Skills'])) para2Parts.push(`To strengthen my profile, I have acquired certifications in ${certs}.`);
    }

    if (para2Parts.length > 0) paragraphs.push(para2Parts.join(' '));

    // ── Paragraph 3: Skills, Languages & Career Goals ─────────────────────────
    const para3Parts = [];
    const tech = cln(p.technicalSkills);
    const soft = cln(p.softSkills);
    const langs = cln(p.languagesKnown);
    const certs = cln(p.certifications);
    const goal = cln(p.careerGoal);
    const dream = cln(p.dreamJobRole);

    const hasTech = tech && !shouldRemove(opts, ['Technical Skills', 'Technical'], ['Skills']);
    const hasSoft = soft && !shouldRemove(opts, ['Soft Skills'], ['Skills']);

    if (v === 0) {
      if (hasTech && hasSoft) para3Parts.push(`My technical expertise includes ${tech}, complemented by strong soft skills such as ${soft}.`);
      else if (hasTech) para3Parts.push(`My core technical competencies include ${tech}.`);
      else if (hasSoft) para3Parts.push(`I pride myself on strong interpersonal skills, including ${soft}.`);
    } else if (v === 1) {
      if (hasTech && hasSoft) para3Parts.push(`Equipped with technical proficiencies in ${tech}, I also leverage my soft skills like ${soft} to drive success.`);
      else if (hasTech) para3Parts.push(`I bring a robust technical skill set encompassing ${tech}.`);
      else if (hasSoft) para3Parts.push(`My professional toolkit is highlighted by key strengths in ${soft}.`);
    } else {
      if (hasTech && hasSoft) para3Parts.push(`I possess a balanced skill profile, combining technical abilities in ${tech} with essential soft skills like ${soft}.`);
      else if (hasTech) para3Parts.push(`I have developed a strong technical foundation in ${tech}.`);
      else if (hasSoft) para3Parts.push(`Effective ${soft} are among my greatest professional assets.`);
    }

    if (langs && !shouldRemove(opts, ['Languages Known', 'Languages'], ['Skills'])) {
      if (v === 0) para3Parts.push(`I am fluent in ${langs}.`);
      else if (v === 1) para3Parts.push(`Additionally, I have strong linguistic abilities in ${langs}.`);
      else para3Parts.push(`Communication is key, and I am proficient in ${langs}.`);
    }

    if (status !== 'Job Seeker' && certs && !shouldRemove(opts, ['Certifications'], ['Skills'])) {
      para3Parts.push(`I have furthered my learning through certifications in ${certs}.`);
    }

    const hasGoal = status !== 'Job Seeker' && goal && !shouldRemove(opts, ['Career Goal'], ['Career']);
    const hasDream = dream && !shouldRemove(opts, ['Dream Company', 'Dream Role', 'Dream Job Role'], ['Career']);

    const dreamLabel = (p.labels && p.labels.dreamJobRole !== undefined) ? p.labels.dreamJobRole : 'Dream Company';
    if (hasGoal && hasDream) {
      if (v === 0) para3Parts.push(`My ultimate career goal is to excel as a ${goal}, and my ${dreamLabel} is ${dream}.`);
      else if (v === 1) para3Parts.push(`Looking ahead, I aim to establish myself as a ${goal} with aspirations to join ${dream}, where my ${dreamLabel} is ${dream}.`);
      else para3Parts.push(`I am driven by the goal of becoming a ${goal}, and my ${dreamLabel} is ${dream}.`);
    } else if (hasGoal) {
      para3Parts.push(`My long-term career goal is to become a successful ${goal}.`);
    } else if (hasDream) {
      para3Parts.push(`My ${dreamLabel} is ${dream}.`);
    }

    if (para3Parts.length > 0) paragraphs.push(para3Parts.join(' '));

    // ── Paragraph 4: Family + Custom (optional) ────────────────────
    const para4Parts = [];


    const hob = cln(p.hobbies);
    if (hob && !shouldRemove(opts, ['Hobbies'])) {
      if (v === 0) para4Parts.push(`In my free time, I enjoy ${hob}, which help me stay creative and continuously learn new things.`);
      else if (v === 1) para4Parts.push(`Outside of work, my hobbies include ${hob}, which keep me inspired and well-rounded.`);
      else para4Parts.push(`I am passionate about ${hob}, and these interests fuel my creativity and personal growth.`);
    }

    if (p.customFields?.length > 0 && !shouldRemove(opts, ['Custom Fields'])) {
      p.customFields.forEach(cf => {
        const cfName = cln(cf.fieldName);
        const cfVal = cln(cf.value);
        if (cfName && cfVal && !shouldRemove(opts, [cfName])) {
          if (v === 0) para4Parts.push(`My ${cfName} is ${cfVal}.`);
          else if (v === 1) para4Parts.push(`Regarding my ${cfName}, it is ${cfVal}.`);
          else para4Parts.push(`A unique detail about me is my ${cfName}, which is ${cfVal}.`);
        }
      });
    }

    if (para4Parts.length > 0) paragraphs.push(para4Parts.join(' '));

    // ── Final Cleanup ──────────────────────────────────────────────────────────
    let finalIntro = paragraphs
      .filter(Boolean)
      .join('\n\n')
      .replace(/  +/g, ' ')
      .replace(/ \./g, '.')
      .replace(/\.{2,}/g, '.')
      .trim();

    if (finalIntro.length < 10) {
      finalIntro = 'Hello! I am building my professional profile. Please check back for more details.';
    }

    // Append additional sentence if present
    if (additionalIntroSentence && additionalIntroSentence.trim()) {
      finalIntro = finalIntro + '\n\n' + additionalIntroSentence.trim();
    }

    const updatedProfile = { ...profile, generatedIntro: finalIntro };
    setProfile(updatedProfile);
    setShowIntroCard(true);
    setShowProfileCard(false);
    api.post('/users/personal-profile', updatedProfile).catch(e => console.error(e));
  };



  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const p = profile || {};
  const completionPct = p.completionPercentage || 0;
  const status = p.currentStatus || '';

  const cardStyle = {
    background: '#ffffff',
    color: '#1a1a1a',
    padding: '40px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    wordWrap: 'break-word'
  };

  return (
    <div className="theme-dashboard animate-fade" style={{ minHeight: '100vh', width: '100vw', padding: '40px 0', overflowX: 'hidden' }}>
      <div className="container-fluid" style={{ maxWidth: '1200px', width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={26} style={{ color: 'var(--primary)' }} /> Personal Profile Builder
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Manage your personal, educational and professional details.
            </p>
          </div>
        </div>

        {/* Completion Bar */}
        <div className="glass-panel" style={{ padding: '20px 28px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Profile Completion</span>
            <strong style={{ color: completionPct >= 100 ? 'var(--success)' : 'var(--primary)', fontSize: '1rem' }}>
              {completionPct}%
            </strong>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${completionPct}%`, background: completionPct >= 100 ? 'linear-gradient(90deg,#10b981,#059669)' : 'var(--primary-gradient)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Top Level - Status Selection (Important to drive dynamic fields) */}
            <div className="glass-panel" style={{ padding: '30px', background: 'rgba(99, 102, 241, 0.05)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
                Profile Status
              </h3>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="currentStatus" value={(p.labels && p.labels.currentStatus !== undefined) ? p.labels.currentStatus : "Current Status"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<select name="currentStatus" className="form-input" value={status} onChange={handleChange} style={{ maxWidth: '400px' }}>
                  <option value="">Select Status</option>
                  <option value="Student">Student</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Job Seeker">Job Seeker</option>
                  <option value="Freelancer">Freelancer</option>
                </select>
              </div>
            </div>

            {/* Personal Information */}
            <div className="glass-panel" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
                Personal Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="fullName" value={(p.labels && p.labels.fullName !== undefined) ? p.labels.fullName : "Full Name"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="fullName" className="form-input" placeholder="e.g. Daranya K" value={p.fullName || ''} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="age" value={(p.labels && p.labels.age !== undefined) ? p.labels.age : "Age"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="number" name="age" className="form-input" placeholder="e.g. 22" value={p.age || ''} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="gender" value={(p.labels && p.labels.gender !== undefined) ? p.labels.gender : "Gender"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<select name="gender" className="form-input" value={p.gender || ''} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="dateOfBirth" value={(p.labels && p.labels.dateOfBirth !== undefined) ? p.labels.dateOfBirth : "Date of Birth"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="date" name="dateOfBirth" className="form-input" value={p.dateOfBirth || ''} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="phoneNumber" value={(p.labels && p.labels.phoneNumber !== undefined) ? p.labels.phoneNumber : "Phone Number"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="phoneNumber" className="form-input" placeholder="e.g. 9876543210" value={p.phoneNumber || ''} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="emailAddress" value={(p.labels && p.labels.emailAddress !== undefined) ? p.labels.emailAddress : "Email Address"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="email" name="emailAddress" className="form-input" placeholder="e.g. you@example.com" value={p.emailAddress || ''} onChange={handleChange} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="hobbies" value={(p.labels && p.labels.hobbies !== undefined) ? p.labels.hobbies : "Hobbies"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<textarea name="hobbies" className="form-input" placeholder="e.g. Reading Books, Coding, Music, Sports, Photography" value={p.hobbies || ''} onChange={handleChange} rows={2} style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>

            {/* Dynamic Rendering Section based on Status */}
            {status === 'Student' && (
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
                  Educational & Academic Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="collegeName" value={(p.labels && p.labels.collegeName !== undefined) ? p.labels.collegeName : "School / College Name"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="collegeName" className="form-input" placeholder="e.g. SIET" value={p.collegeName || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="department" value={(p.labels && p.labels.department !== undefined) ? p.labels.department : "Department"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="department" className="form-input" placeholder="e.g. Computer Science" value={p.department || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="highestQualification" value={(p.labels && p.labels.highestQualification !== undefined) ? p.labels.highestQualification : "Qualification"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="highestQualification" className="form-input" placeholder="e.g. B.E" value={p.highestQualification || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="graduationYear" value={(p.labels && p.labels.graduationYear !== undefined) ? p.labels.graduationYear : "Graduation Year"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="graduationYear" className="form-input" placeholder="e.g. 2025" value={p.graduationYear || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="cgpaPercentage" value={(p.labels && p.labels.cgpaPercentage !== undefined) ? p.labels.cgpaPercentage : "Current CGPA / Marks"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="cgpaPercentage" className="form-input" placeholder="e.g. 8.5" value={p.cgpaPercentage || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="areaOfInterest" value={(p.labels && p.labels.areaOfInterest !== undefined) ? p.labels.areaOfInterest : "Area of Interest"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="areaOfInterest" className="form-input" placeholder="e.g. Web Development" value={p.areaOfInterest || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="careerGoal" value={(p.labels && p.labels.careerGoal !== undefined) ? p.labels.careerGoal : "Career Goal"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="careerGoal" className="form-input" placeholder="e.g. Full Stack Developer" value={p.careerGoal || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="dreamJobRole" value={(p.labels && p.labels.dreamJobRole !== undefined) ? p.labels.dreamJobRole : "Dream Company / Role"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="dreamJobRole" className="form-input" placeholder="e.g. Google / SDE" value={p.dreamJobRole || ''} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            {status === 'Working Professional' && (
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
                  Professional Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="companyName" value={(p.labels && p.labels.companyName !== undefined) ? p.labels.companyName : "Company Name"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="companyName" className="form-input" placeholder="e.g. TechCorp" value={p.companyName || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="occupation" value={(p.labels && p.labels.occupation !== undefined) ? p.labels.occupation : "Occupation / Current Role"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="occupation" className="form-input" placeholder="e.g. Software Engineer" value={p.occupation || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="experience" value={(p.labels && p.labels.experience !== undefined) ? p.labels.experience : "Experience"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="experience" className="form-input" placeholder="e.g. 3 Years" value={p.experience || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="areaOfInterest" value={(p.labels && p.labels.areaOfInterest !== undefined) ? p.labels.areaOfInterest : "Industry / Domain"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="areaOfInterest" className="form-input" placeholder="e.g. FinTech, Healthcare" value={p.areaOfInterest || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="careerGoal" value={(p.labels && p.labels.careerGoal !== undefined) ? p.labels.careerGoal : "Career Goal"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="careerGoal" className="form-input" placeholder="e.g. Technical Lead" value={p.careerGoal || ''} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            {status === 'Job Seeker' && (
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
                  Job Seeker Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="highestQualification" value={(p.labels && p.labels.highestQualification !== undefined) ? p.labels.highestQualification : "Highest Qualification"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="highestQualification" className="form-input" placeholder="e.g. MBA" value={p.highestQualification || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="technicalSkills" value={(p.labels && p.labels.technicalSkills !== undefined) ? p.labels.technicalSkills : "Technical Skills"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="technicalSkills" className="form-input" placeholder="e.g. Python, SQL" value={p.technicalSkills || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="certifications" value={(p.labels && p.labels.certifications !== undefined) ? p.labels.certifications : "Certifications"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="certifications" className="form-input" placeholder="e.g. AWS Certified" value={p.certifications || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="careerGoal" value={(p.labels && p.labels.careerGoal !== undefined) ? p.labels.careerGoal : "Preferred Job Role / Career Goal"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="careerGoal" className="form-input" placeholder="e.g. Data Analyst" value={p.careerGoal || ''} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            {status === 'Freelancer' && (
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
                  Freelancer Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="occupation" value={(p.labels && p.labels.occupation !== undefined) ? p.labels.occupation : "Services Offered"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="occupation" className="form-input" placeholder="e.g. Web Design, Copywriting" value={p.occupation || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="experience" value={(p.labels && p.labels.experience !== undefined) ? p.labels.experience : "Experience"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="experience" className="form-input" placeholder="e.g. 5 Years" value={p.experience || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="technicalSkills" value={(p.labels && p.labels.technicalSkills !== undefined) ? p.labels.technicalSkills : "Core Skills"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="technicalSkills" className="form-input" placeholder="e.g. Figma, React" value={p.technicalSkills || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="portfolioLink" value={(p.labels && p.labels.portfolioLink !== undefined) ? p.labels.portfolioLink : "Portfolio Link"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="url" name="portfolioLink" className="form-input" placeholder="e.g. https://myportfolio.com" value={p.portfolioLink || ''} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            {/* General Skills (Visible to all, but Job/Freelancer have it prominently above too, so this acts as secondary if needed. We'll show soft skills here) */}
            <div className="glass-panel" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
                Additional Skills & Info
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {status !== 'Job Seeker' && status !== 'Freelancer' && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="technicalSkills" value={(p.labels && p.labels.technicalSkills !== undefined) ? p.labels.technicalSkills : "Technical Skills"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="technicalSkills" className="form-input" placeholder="e.g. C, Java, MongoDB, React" value={p.technicalSkills || ''} onChange={handleChange} />
                  </div>
                )}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="softSkills" value={(p.labels && p.labels.softSkills !== undefined) ? p.labels.softSkills : "Soft Skills"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="softSkills" className="form-input" placeholder="e.g. Communication, Leadership" value={p.softSkills || ''} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="languagesKnown" value={(p.labels && p.labels.languagesKnown !== undefined) ? p.labels.languagesKnown : "Languages Known"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="languagesKnown" className="form-input" placeholder="e.g. Tamil, English, Hindi" value={p.languagesKnown || ''} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="glass-panel" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
                Location Information (Optional)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="villageCity" value={(p.labels && p.labels.villageCity !== undefined) ? p.labels.villageCity : "Village / City"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="villageCity" className="form-input" placeholder="e.g. Chennai" value={p.villageCity || ''} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="district" value={(p.labels && p.labels.district !== undefined) ? p.labels.district : "District"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="district" className="form-input" placeholder="e.g. Chennai" value={p.district || ''} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="state" value={(p.labels && p.labels.state !== undefined) ? p.labels.state : "State"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="state" className="form-input" placeholder="e.g. Tamil Nadu" value={p.state || ''} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="country" value={(p.labels && p.labels.country !== undefined) ? p.labels.country : "Country"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="country" className="form-input" placeholder="e.g. India" value={p.country || ''} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Family Information */}
            <div className="glass-panel" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
                Family Information (Optional)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="fatherName" value={(p.labels && p.labels.fatherName !== undefined) ? p.labels.fatherName : "Father Name"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="fatherName" className="form-input" placeholder="e.g. John Doe" value={p.fatherName || ''} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="motherName" value={(p.labels && p.labels.motherName !== undefined) ? p.labels.motherName : "Mother Name"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="motherName" className="form-input" placeholder="e.g. Jane Doe" value={p.motherName || ''} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="siblings" value={(p.labels && p.labels.siblings !== undefined) ? p.labels.siblings : "Siblings"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="siblings" className="form-input" placeholder="e.g. 1 Brother, 1 Sister" value={p.siblings || ''} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}><input type="text" name="familyBackground" value={(p.labels && p.labels.familyBackground !== undefined) ? p.labels.familyBackground : "Family Background"} onChange={handleLabelChange} style={{ background: "transparent", border: "none", borderBottom: "1px dashed #9ca3af", color: "inherit", fontSize: "inherit", padding: 0, outline: "none", width: "100%", fontFamily: "inherit" }} /></label>
<input type="text" name="familyBackground" className="form-input" placeholder="e.g. Agricultural, Business" value={p.familyBackground || ''} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Custom Profile Fields */}
            <div className="glass-panel" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', margin: 0 }}>
                  Custom Fields (Optional)
                </h3>
                <button type="button" className="btn btn-secondary" onClick={addCustomField} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Add Custom Field
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {p.customFields && p.customFields.map((field, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}>Field Name</label>
                      <input type="text" className="form-input" placeholder="e.g. Favorite Language" value={field.fieldName || ''} onChange={(e) => handleCustomFieldChange(idx, 'fieldName', e.target.value)} />
                    </div>
                    <div style={{ flex: 2 }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}>Value</label>
                      <input type="text" className="form-input" placeholder="e.g. Java" value={field.value || ''} onChange={(e) => handleCustomFieldChange(idx, 'value', e.target.value)} />
                    </div>
                    <button type="button" onClick={() => removeCustomField(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginTop: '24px', padding: '8px' }} title="Remove Field">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                {(!p.customFields || p.customFields.length === 0) && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '10px 0' }}>No custom fields added yet.</p>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="glass-panel" style={{ padding: '24px 30px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', fontSize: '1rem' }}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
              </button>

              {(Object.keys(p).length > 0 || message.type === 'success') && (
                <>
                  {hasUnsavedChanges ? (
                    <span style={{ color: 'var(--primary)', marginLeft: '16px', fontStyle: 'italic', fontWeight: '500' }}>
                      Save profile to generate
                    </span>
                  ) : (
                    <>
                      <button type="button" className="btn btn-secondary"
                        onClick={handleGenerateProfileCard}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                        <Layers size={18} /> Generate Profile Card
                      </button>
                      <button type="button" className="btn btn-secondary"
                        onClick={handleGenerateIntro}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                        <UserCheck size={18} /> Generate Self Introduction
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </form>



        {/* ── GENERATED PROFILE CARD ── */}
        {showProfileCard && (
          <div className="glass-panel" style={{ padding: '30px', marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={20} style={{ color: 'var(--primary)' }} /> Generated Profile Card
              </h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => handleDownloadImage('profile-card-content', 'profile-card.png')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileImage size={16} /> Download Image
                </button>
                <button className="btn btn-secondary" onClick={() => setShowProfileCard(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}>
                  <X size={16} /> Close
                </button>
              </div>
            </div>

            <div id="profile-card-content" style={cardStyle}>
              {/* Header */}
              <div style={{ borderBottom: '3px solid #3b82f6', paddingBottom: '16px', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#1e3a8a', margin: '0 0 4px 0', fontWeight: '700' }}>
                  {p.fullName || 'Personal Profile'}
                </h1>
                {(p.occupation || p.currentStatus) && (
                  <p style={{ margin: 0, color: '#4b5563', fontSize: '1rem' }}>{p.occupation || p.currentStatus}</p>
                )}
              </div>

              {/* Grid of details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {p.age && !shouldRemove(appliedCardRemoval, ['Age'], ['Personal Information']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.age) || 'Age'}:</strong> <span style={{ color: '#4b5563' }}>{p.age}</span></div>}
                {p.gender && !shouldRemove(appliedCardRemoval, ['Gender'], ['Personal Information']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.gender) || 'Gender'}:</strong> <span style={{ color: '#4b5563' }}>{p.gender}</span></div>}
                {p.phoneNumber && !shouldRemove(appliedCardRemoval, ['Phone', 'Phone Number'], ['Personal Information']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.phoneNumber) || 'Phone'}:</strong> <span style={{ color: '#4b5563' }}>{p.phoneNumber}</span></div>}
                {p.emailAddress && !shouldRemove(appliedCardRemoval, ['Email', 'Email Address'], ['Personal Information']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.emailAddress) || 'Email'}:</strong> <span style={{ color: '#4b5563' }}>{p.emailAddress}</span></div>}
                {p.currentStatus && !shouldRemove(appliedCardRemoval, ['Status'], ['Personal Information', 'Professional Information']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.currentStatus) || 'Status'}:</strong> <span style={{ color: '#4b5563' }}>{p.currentStatus}</span></div>}
                {p.villageCity && !shouldRemove(appliedCardRemoval, ['City', 'Village', 'VillageCity'], ['Place Details', 'Location Details', 'Location Information']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.villageCity) || 'City'}:</strong> <span style={{ color: '#4b5563' }}>{p.villageCity}</span></div>}
                {p.district && !shouldRemove(appliedCardRemoval, ['District'], ['Place Details', 'Location Details', 'Location Information']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.district) || 'District'}:</strong> <span style={{ color: '#4b5563' }}>{p.district}</span></div>}
                {p.state && !shouldRemove(appliedCardRemoval, ['State'], ['Place Details', 'Location Details', 'Location Information']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.state) || 'State'}:</strong> <span style={{ color: '#4b5563' }}>{p.state}</span></div>}
                {p.country && !shouldRemove(appliedCardRemoval, ['Country'], ['Place Details', 'Location Details', 'Location Information']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.country) || 'Country'}:</strong> <span style={{ color: '#4b5563' }}>{p.country}</span></div>}
              </div>

              {/* Education (For Student/Job Seeker) */}
              {(p.highestQualification || p.collegeName || p.department) && !shouldRemove(appliedCardRemoval, ['Education']) && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '1rem', color: '#1e3a8a', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Education</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: '0.95rem' }}>
                    {p.highestQualification && !shouldRemove(appliedCardRemoval, ['Qualification', 'Highest Qualification']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.highestQualification) || 'Qualification'}:</strong> <span style={{ color: '#4b5563' }}>{p.highestQualification}</span></div>}
                    {p.collegeName && !shouldRemove(appliedCardRemoval, ['College', 'School', 'College Name', 'School Name']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.collegeName) || 'College'}:</strong> <span style={{ color: '#4b5563' }}>{p.collegeName}</span></div>}
                    {p.department && !shouldRemove(appliedCardRemoval, ['Department']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.department) || 'Department'}:</strong> <span style={{ color: '#4b5563' }}>{p.department}</span></div>}
                    {p.graduationYear && !shouldRemove(appliedCardRemoval, ['Graduation', 'Graduation Year']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.graduationYear) || 'Graduation'}:</strong> <span style={{ color: '#4b5563' }}>{p.graduationYear}</span></div>}
                    {p.cgpaPercentage && !shouldRemove(appliedCardRemoval, ['CGPA', 'CGPA Percentage', 'Marks']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.cgpaPercentage) || 'CGPA/Marks'}:</strong> <span style={{ color: '#4b5563' }}>{p.cgpaPercentage}</span></div>}
                  </div>
                </div>
              )}

              {/* Skills */}
              {(p.technicalSkills || p.softSkills || p.languagesKnown || p.certifications) && !shouldRemove(appliedCardRemoval, ['Skills']) && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '1rem', color: '#1e3a8a', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills & Certifications</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.95rem' }}>
                    {p.technicalSkills && !shouldRemove(appliedCardRemoval, ['Technical Skills', 'Technical']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.technicalSkills) || 'Technical'}:</strong> <span style={{ color: '#4b5563' }}>{p.technicalSkills}</span></div>}
                    {p.softSkills && !shouldRemove(appliedCardRemoval, ['Soft Skills']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.softSkills) || 'Soft Skills'}:</strong> <span style={{ color: '#4b5563' }}>{p.softSkills}</span></div>}
                    {p.languagesKnown && !shouldRemove(appliedCardRemoval, ['Languages Known', 'Languages']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.languagesKnown) || 'Languages'}:</strong> <span style={{ color: '#4b5563' }}>{p.languagesKnown}</span></div>}
                    {p.certifications && !shouldRemove(appliedCardRemoval, ['Certifications']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.certifications) || 'Certifications'}:</strong> <span style={{ color: '#4b5563' }}>{p.certifications}</span></div>}
                    {p.hobbies && !shouldRemove(appliedCardRemoval, ['Hobbies']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.hobbies) || 'Hobbies'}:</strong> <span style={{ color: '#4b5563' }}>{p.hobbies}</span></div>}
                  </div>
                </div>
              )}

              {/* Career & Work */}
              {(p.careerGoal || p.areaOfInterest || p.companyName || p.experience || p.portfolioLink) && !shouldRemove(appliedCardRemoval, ['Career', 'Professional Information', 'Experience']) && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '1rem', color: '#1e3a8a', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Professional Details</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: '0.95rem' }}>
                    {p.companyName && !shouldRemove(appliedCardRemoval, ['Company', 'Company Name']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.companyName) || 'Company/Clients'}:</strong> <span style={{ color: '#4b5563' }}>{p.companyName}</span></div>}
                    {p.experience && !shouldRemove(appliedCardRemoval, ['Experience']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.experience) || 'Experience'}:</strong> <span style={{ color: '#4b5563' }}>{p.experience}</span></div>}
                    {p.careerGoal && !shouldRemove(appliedCardRemoval, ['Career Goal']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.careerGoal) || 'Career Goal'}:</strong> <span style={{ color: '#4b5563' }}>{p.careerGoal}</span></div>}
                    {p.areaOfInterest && !shouldRemove(appliedCardRemoval, ['Area of Interest']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.areaOfInterest) || 'Domain/Interest'}:</strong> <span style={{ color: '#4b5563' }}>{p.areaOfInterest}</span></div>}
                    {p.dreamJobRole && !shouldRemove(appliedCardRemoval, ['Dream Company', 'Dream Role', 'Dream Job Role']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.dreamJobRole) || 'Dream Role'}:</strong> <span style={{ color: '#4b5563' }}>{p.dreamJobRole}</span></div>}
                    {p.portfolioLink && !shouldRemove(appliedCardRemoval, ['Portfolio', 'Portfolio Link']) && <div><strong style={{ color: '#374151' }}>Portfolio:</strong> <a href={p.portfolioLink} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>{p.portfolioLink}</a></div>}
                  </div>
                </div>
              )}

              {/* Family Details */}
              {(p.fatherName || p.motherName || p.familyBackground) && !shouldRemove(appliedCardRemoval, ['Family Details', 'Family']) && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '1rem', color: '#1e3a8a', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Family Details</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: '0.95rem' }}>
                    {p.fatherName && !shouldRemove(appliedCardRemoval, ['Father Name', 'Father']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.fatherName) || 'Father'}:</strong> <span style={{ color: '#4b5563' }}>{p.fatherName}</span></div>}
                    {p.motherName && !shouldRemove(appliedCardRemoval, ['Mother Name', 'Mother']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.motherName) || 'Mother'}:</strong> <span style={{ color: '#4b5563' }}>{p.motherName}</span></div>}
                    {p.familyBackground && !shouldRemove(appliedCardRemoval, ['Family Background']) && <div><strong style={{ color: '#374151' }}>{(p.labels && p.labels.familyBackground) || 'Background'}:</strong> <span style={{ color: '#4b5563' }}>{p.familyBackground}</span></div>}
                  </div>
                </div>
              )}

              {/* Siblings */}
              {p.siblings && !shouldRemove(appliedCardRemoval, ['Siblings', 'Sibling Details']) && (
                <div style={{ marginTop: '14px', fontSize: '0.95rem' }}>
                  <strong style={{ color: '#374151' }}>Siblings:</strong> <span style={{ color: '#4b5563' }}>{p.siblings}</span>
                </div>
              )}

              {/* Custom Fields */}
              {p.customFields && p.customFields.filter(cf => cf.fieldName && cf.value).length > 0 && !shouldRemove(appliedCardRemoval, ['Custom Fields']) && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '1rem', color: '#1e3a8a', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Additional Information</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: '0.95rem' }}>
                    {p.customFields.map((cf, idx) => (
                      cf.fieldName && cf.value && !shouldRemove(appliedCardRemoval, [cf.fieldName]) && (
                        <div key={idx}><strong style={{ color: '#374151' }}>{cf.fieldName}:</strong> <span style={{ color: '#4b5563' }}>{cf.value}</span></div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem', color: '#9ca3af' }}>
                <span>SecureAuth Portal</span>
                <span>Generated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Profile Card Customization */}
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--panel-border)' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Remove Fields From Profile Card</h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Enter fields to remove or select from below:</label>
                <input
                  type="text"
                  placeholder="e.g. Father Name, District, Country"
                  value={cardRemovalText}
                  onChange={(e) => setCardRemovalText(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '12px' }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {getAvailableFields(p).map(field => {
                    const isSelected = cardRemovalText.toLowerCase().includes(field.toLowerCase());
                    return (
                      <button
                        key={field}
                        type="button"
                        onClick={() => handleToggleField(field, cardRemovalText, setCardRemovalText)}
                        style={{
                          background: isSelected ? 'var(--primary)' : 'var(--panel-border)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {field} {isSelected ? '✕' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setAppliedCardRemoval(cardRemovalText)}>
                  Apply Changes
                </button>
                <button className="btn btn-secondary" onClick={() => {
                  setAppliedCardRemoval('');
                  setCardRemovalText('');
                }}>
                  Restore All Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── GENERATED SELF INTRODUCTION CARD ── */}
        {showIntroCard && (
          <div className="glass-panel" style={{ padding: '30px', marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={20} style={{ color: 'var(--success)' }} /> Self Introduction Card
              </h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => handleDownloadImage('intro-card-content', 'self-introduction.png')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileImage size={16} /> Download Image
                </button>
                <button className="btn btn-secondary" onClick={() => setShowIntroCard(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}>
                  <X size={16} /> Close
                </button>
              </div>
            </div>

            <div id="intro-card-content" style={{ ...cardStyle, textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <div style={{ borderBottom: '3px solid #10b981', paddingBottom: '24px', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2.2rem', color: '#065f46', margin: '0 0 12px 0', fontWeight: '700' }}>
                  Professional Self Introduction
                </h1>
                {p.fullName && <p style={{ margin: 0, color: '#374151', fontSize: '1.4rem', fontWeight: '600' }}>{p.fullName}</p>}
              </div>

              <p style={{ flex: 1, fontSize: '1.25rem', lineHeight: '2.0', color: '#374151', textAlign: 'center', whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: '0 0 32px 0' }}>
                {p.generatedIntro || 'No introduction generated yet. Please save your profile first, then return to generate the introduction.'}
              </p>

              <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontSize: '1rem', color: '#9ca3af' }}>
                <span style={{ fontWeight: '600' }}>Generated By SecureAuth Portal</span>
                <span>Generated Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Intro Card Customization */}
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--panel-border)' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Remove Fields From Self Introduction</h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Enter fields to remove or select from below:</label>
                <input
                  type="text"
                  placeholder="e.g. Father Name, District, Country"
                  value={introRemovalText}
                  onChange={(e) => setIntroRemovalText(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '12px' }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {getAvailableFields(p).map(field => {
                    const isSelected = introRemovalText.toLowerCase().includes(field.toLowerCase());
                    return (
                      <button
                        key={field}
                        type="button"
                        onClick={() => handleToggleField(field, introRemovalText, setIntroRemovalText)}
                        style={{
                          background: isSelected ? 'var(--primary)' : 'var(--panel-border)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {field} {isSelected ? '✕' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => {
                  setAppliedIntroRemoval(introRemovalText);
                  generateSmartIntro(introRemovalText);
                }}>
                  Apply Changes
                </button>
                <button className="btn btn-secondary" onClick={() => {
                  setAppliedIntroRemoval('');
                  setIntroRemovalText('');
                  generateSmartIntro('');
                }}>
                  Restore All Details
                </button>
                <button className="btn btn-secondary" onClick={() => {
                  const newVer = introVersion + 1;
                  setIntroVersion(newVer);
                  generateSmartIntro(appliedIntroRemoval, profile, newVer);
                }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={16} /> Generate New Version
                </button>
              </div>

              {/* Additional Information */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--panel-border)' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '12px' }}>Additional Information</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Write any additional sentence or information you want to include in your self introduction.
                </p>
                <textarea
                  rows="3"
                  placeholder="Example: I actively participate in coding competitions and enjoy learning emerging technologies."
                  value={additionalIntroSentence}
                  onChange={(e) => setAdditionalIntroSentence(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '12px', fontFamily: 'inherit', resize: 'vertical' }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddAdditionalSentence}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.95rem' }}
                >
                  <Plus size={16} /> Add To Introduction
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
};

export default ProfileBuilder;
