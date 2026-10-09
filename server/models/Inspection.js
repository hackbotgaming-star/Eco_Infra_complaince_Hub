const mongoose = require('mongoose');

const InspectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide inspection title'],
    trim: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  inspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  location: {
    type: String,
    required: true,
  },
  inspectionType: {
    type: String,
    required: true,
    enum: [
      'Routine Monthly Compliance Check',
      'Surprise Regulatory Site Inspection',
      'Pre-Monsoon Drainage & Soil Inspection',
      'Hazardous Waste Storage Audit',
      'Post-Blasting Vibration & Structural Check',
      'EIA Clearance Baseline Verification',
      'Incident & Spill Investigation'
    ],
    default: 'Routine Monthly Compliance Check',
  },
  findings: {
    type: String,
    required: true,
  },
  violations: [{
    issue: String,
    severity: {
      type: String,
      enum: ['Minor', 'Moderate', 'Severe', 'Critical'],
      default: 'Moderate',
    },
    status: {
      type: String,
      enum: ['Open', 'Remediated', 'Verified'],
      default: 'Open',
    },
    correctiveAction: String,
  }],
  recommendations: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Follow-up Required'],
    default: 'Completed',
  },
  evidence: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  photos: [{
    caption: String,
    url: String,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Inspection', InspectionSchema);
