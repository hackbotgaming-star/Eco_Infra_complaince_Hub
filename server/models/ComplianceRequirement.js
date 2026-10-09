const mongoose = require('mongoose');

const ComplianceRequirementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide requirement title'],
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Please specify project'],
  },
  regulatoryCategory: {
    type: String,
    required: true,
    enum: [
      'Air (Prevention & Control of Pollution) Act, 1981',
      'Water (Prevention & Control of Pollution) Act, 1974',
      'Environment (Protection) Act, 1986',
      'Forest (Conservation) Act, 1980',
      'Wildlife (Protection) Act, 1972',
      'Hazardous & Other Wastes Management Rules',
      'Noise Pollution (Regulation and Control) Rules',
      'Construction & Demolition Waste Management Rules',
      'Fly Ash Utilization Notification',
      'Bio-Medical & Chemical Storage Regulations'
    ],
    default: 'Environment (Protection) Act, 1986',
  },
  responsiblePerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'High',
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Overdue', 'Under Review'],
    default: 'In Progress',
  },
  progressPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 25,
  },
  evidence: [{
    name: String,
    fileUrl: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
  }],
  relatedApproval: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Approval',
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ComplianceRequirement', ComplianceRequirementSchema);
