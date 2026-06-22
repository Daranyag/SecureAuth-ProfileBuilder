const PersonalProfile = require('../models/personalProfileModel');

// Helper to calculate completion percentage
const calculateCompletion = (profile) => {
  const fieldsToCheck = [
    'fullName', 'age', 'gender', 'dateOfBirth', 'phoneNumber', 'alternatePhoneNumber', 'emailAddress',
    'address', 'villageCity', 'district', 'state', 'country', 'pinCode',
    'highestQualification', 'schoolName', 'collegeName', 'department', 'graduationYear', 'cgpaPercentage',
    'occupation', 'companyName', 'experience', 'currentStatus', 'internshipDetails', 'currentSalary',
    'technicalSkills', 'softSkills', 'languagesKnown', 'certifications',
    'careerGoal', 'areaOfInterest', 'dreamJobRole',
    'hobbies', 'strengths', 'achievements', 'additionalNotes'
  ];
  let filled = 0;
  fieldsToCheck.forEach(field => {
    if (profile[field] && profile[field].trim() !== '') {
      filled += 1;
    }
  });
  return Math.round((filled / fieldsToCheck.length) * 100);
};

// @desc    Get personal profile
// @route   GET /api/users/personal-profile
// @access  Private
const getPersonalProfile = async (req, res) => {
  try {
    let profile = await PersonalProfile.findOne({ userId: req.user.id });
    if (!profile) {
      // Return an empty template if none exists
      return res.status(200).json({ success: true, profile: {} });
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching personal profile' });
  }
};

// @desc    Update personal profile
// @route   POST /api/users/personal-profile
// @access  Private
const updatePersonalProfile = async (req, res) => {
  try {
    const data = req.body;
    let profile = await PersonalProfile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = new PersonalProfile({ userId: req.user.id, ...data });
    } else {
      Object.assign(profile, data);
    }

    profile.completionPercentage = calculateCompletion(profile);

    // Update completion percentage
    profile.completionPercentage = calculateCompletion(profile);

    // generatedIntro will now be updated directly via req.body (handled by Object.assign above)
    // if the frontend decides to pass it.
    
    await profile.save();


    res.status(200).json({ success: true, message: 'Profile saved successfully', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error saving personal profile' });
  }
};

module.exports = {
  getPersonalProfile,
  updatePersonalProfile
};
