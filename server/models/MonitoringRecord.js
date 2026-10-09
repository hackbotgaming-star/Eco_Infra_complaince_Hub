const mongoose = require('mongoose');

const MonitoringRecordSchema = new mongoose.Schema({
  monitoringDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  parameter: {
    type: String,
    required: true,
    enum: [
      'PM2.5 Ambient Air',
      'PM10 Ambient Air',
      'SO2 Sulfur Dioxide',
      'NOx Nitrogen Oxides',
      'BOD Biochemical Oxygen Demand',
      'COD Chemical Oxygen Demand',
      'pH Level',
      'TDS (Total Dissolved Solids)',
      'Ambient Noise (Day Time)',
      'Ambient Noise (Night Time)',
      'Heavy Metals (Lead/Arsenic)',
      'Turbidity (NTU)',
      'Biodiversity Conservation Index'
    ],
    default: 'PM2.5 Ambient Air',
  },
  measuredValue: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
    default: 'µg/m³',
  },
  allowedLimit: {
    type: Number,
    required: true,
  },
  observation: {
    type: String,
    default: '',
  },
  complianceStatus: {
    type: String,
    enum: ['Compliant', 'Non-compliant', 'Alert'],
    default: 'Compliant',
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MonitoringRecord', MonitoringRecordSchema);
