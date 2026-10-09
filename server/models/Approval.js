const mongoose = require('mongoose');

const ApprovalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide approval/permit name'],
    trim: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Please specify associated project'],
  },
  approvalType: {
    type: String,
    required: [true, 'Please specify approval type'],
    enum: [
      'Environmental Clearance (EC)',
      'Forest Clearance (Stage-I In-Principle)',
      'Forest Clearance (Stage-II Final)',
      'Consent to Establish (CTE)',
      'Consent to Operate (CTO)',
      'Wildlife Clearance (NBWL Recommendation)',
      'Coastal Regulation Zone (CRZ) Clearance',
      'Central Ground Water Authority (CGWA) NOC',
      'Hazardous Waste Authorization',
      'Tree Felling & Compensatory Afforestation Permit'
    ],
    default: 'Environmental Clearance (EC)',
  },
  authority: {
    type: String,
    required: [true, 'Please provide issuing regulatory authority'],
    trim: true,
  },
  referenceNumber: {
    type: String,
    required: [true, 'Please provide clearance file/reference number'],
    trim: true,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Submitted', 'Approved', 'Rejected', 'Expired'],
    default: 'Approved',
  },
  conditions: [{
    title: { type: String, required: true },
    isComplied: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    deadline: { type: Date }
  }],
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Approval', ApprovalSchema);
