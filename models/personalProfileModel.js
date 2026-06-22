const mongoose = require('mongoose');

const personalProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Personal Information
    fullName: { type: String, default: '' },
    age: { type: String, default: '' },
    gender: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    alternatePhoneNumber: { type: String, default: '' },
    emailAddress: { type: String, default: '' },

    // Address Information
    address: { type: String, default: '' },
    villageCity: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    pinCode: { type: String, default: '' },

    // Educational Information
    highestQualification: { type: String, default: '' },
    schoolName: { type: String, default: '' },
    collegeName: { type: String, default: '' },
    department: { type: String, default: '' },
    graduationYear: { type: String, default: '' },
    cgpaPercentage: { type: String, default: '' },

    // Professional Information
    occupation: { type: String, default: '' },
    companyName: { type: String, default: '' },
    experience: { type: String, default: '' },
    internshipDetails: { type: String, default: '' },
    currentSalary: { type: String, default: '' },
    currentStatus: { 
      type: String, 
      enum: ['Student', 'College Student', 'Working Professional', 'Job Seeker', 'Freelancer', ''],
      default: '' 
    },

    // Skills Information
    technicalSkills: { type: String, default: '' },
    softSkills: { type: String, default: '' },
    languagesKnown: { type: String, default: '' },
    certifications: { type: String, default: '' },

    // Career Information
    careerGoal: { type: String, default: '' },
    areaOfInterest: { type: String, default: '' },
    dreamJobRole: { type: String, default: '' },

    // Additional Information
    hobbies: { type: String, default: '' },
    strengths: { type: String, default: '' },
    achievements: { type: String, default: '' },
    additionalNotes: { type: String, default: '' },
    portfolioLink: { type: String, default: '' },

    // Family Information
    fatherName: { type: String, default: '' },
    motherName: { type: String, default: '' },
    siblings: { type: String, default: '' },
    familyBackground: { type: String, default: '' },

    // Custom Fields
    customFields: [
      {
        fieldName: { type: String },
        value: { type: String }
      }
    ],

    // System fields
    completionPercentage: { type: Number, default: 0 },
    generatedIntro: { type: String, default: '' },
    
    // Custom Labels for standard fields
    labels: {
      type: Map,
      of: String,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PersonalProfile', personalProfileSchema);
