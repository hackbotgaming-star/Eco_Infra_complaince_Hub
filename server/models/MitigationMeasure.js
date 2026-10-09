const mongoose = require('mongoose');

const MitigationMeasureSchema = new mongoose.Schema({
  measureTitle: {
    type: String,
    required: [true, 'Please provide mitigation measure title'],
    trim: true,
  },
  environmentalImpact: {
    type: String,
    required: [true, 'Please specify addressed environmental impact'],
    enum: [
      'Fugitive Dust & Air Quality Degradation',
      'Runoff Sedimentation & Water Body Contamination',
      'Noise & Vibration from Heavy Machinery & Blasting',
      'Vegetation Loss & Wildlife Corridor Fragmentation',
      'Solid & Construction Waste Dumping',
      'Soil Compaction, Erosion & Topsoil Loss',
      'Groundwater Depletion & Seepage Issues',
      'Worker Occupational Health & Toxic Exposure'
    ],
    default: 'Fugitive Dust & Air Quality Degradation',
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  responsiblePerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  implementationDate: {
    type: Date,
    required: true,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Implemented', 'Verified'],
    default: 'In Progress',
  },
  effectiveness: {
    type: String,
    enum: ['High', 'Moderate', 'Low', 'Pending Assessment'],
    default: 'Pending Assessment',
  },
  cost: {
    type: String,
    default: '$50,000',
  },
  evidence: [{
    title: String,
    url: String,
    date: { type: Date, default: Date.now }
  }],
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MitigationMeasure', MitigationMeasureSchema);
