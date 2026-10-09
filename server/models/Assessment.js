const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide assessment title'],
    trim: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Please specify the project'],
  },
  assessmentType: {
    type: String,
    required: [true, 'Please specify assessment type'],
    enum: [
      'Comprehensive Environmental Impact Assessment (EIA)',
      'Environmental Management Plan (EMP)',
      'Biodiversity & Wildlife Impact Assessment',
      'Hydrological & Water Resource Study',
      'Acoustic & Noise Impact Study',
      'Air Dispersion Modeling Report',
      'Carbon & Climate Resilience Audit',
      'Social & Resettlement Impact Assessment (SIA)'
    ],
    default: 'Comprehensive Environmental Impact Assessment (EIA)',
  },
  description: {
    type: String,
    required: true,
  },
  environmentalCategory: {
    type: String,
    enum: [
      'Category A (National MoEFCC Cleared)',
      'Category B1 (State Level SEIAA Scrutinized)',
      'Category B2 (State Level Exempted from Public Hearing)',
      'Category C (Special Eco-Sensitive Zone)'
    ],
    default: 'Category A (National MoEFCC Cleared)',
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  assessmentDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  responsibleOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Draft', 'Under Review', 'Approved', 'Rejected', 'Archived'],
    default: 'Under Review',
  },
  findings: {
    type: String,
    default: '',
  },
  recommendations: {
    type: String,
    default: '',
  },
  supportingDocuments: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
