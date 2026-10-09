const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Please provide a project code'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  projectType: {
    type: String,
    required: [true, 'Please specify project type'],
    enum: [
      'Highway & Expressways',
      'Railway & Dedicated Freight Corridor',
      'Solar & Renewable Power',
      'Thermal & Hydro Power',
      'Oil & Gas Pipeline',
      'Industrial & Petrochemical Facility',
      'Airport & Port Logistics',
      'Urban Metro & Transit System',
      'Mining & Minerals',
      'Bulk Water Infrastructure'
    ],
    default: 'Highway & Expressways',
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    default: 'National',
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  estimatedCost: {
    type: String,
    default: '$120M / ₹1,000 Cr',
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'Under Review', 'Suspended', 'Completed'],
    default: 'Active',
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  environmentalOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  complianceStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedTeam: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  compliancePercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  environmentalClearanceStatus: {
    type: String,
    enum: ['Pending', 'Granted', 'Under Amendment', 'Exempted'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Project', ProjectSchema);
