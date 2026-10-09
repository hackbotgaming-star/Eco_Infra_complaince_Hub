const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide document title'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Environmental Assessment',
      'Approval',
      'Compliance Evidence',
      'Inspection Report',
      'Monitoring Report',
      'Permit',
      'Certificate',
      'Audit Documentation',
      'Other'
    ],
    default: 'Compliance Evidence',
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    default: 'application/pdf',
  },
  fileSize: {
    type: String,
    default: '2.4 MB',
  },
  cloudinaryPublicId: {
    type: String,
    default: null,
  },
  storageProvider: {
    type: String,
    enum: ['cloudinary', 'local'],
    default: 'local',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  relatedModel: {
    type: String,
    enum: ['Assessment', 'Approval', 'ComplianceRequirement', 'Inspection', 'General'],
    default: 'General',
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  tags: [{
    type: String,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Document', DocumentSchema);
