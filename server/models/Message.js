const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    channel: {
      type: String,
      enum: [
        'general-regulatory',
        'environmental-clearances',
        'site-inspections',
        'project-coordination',
      ],
      default: 'general-regulatory',
    },
    category: {
      type: String,
      enum: [
        'Doubt & Question',
        'Regulatory Guidance',
        'Urgent Inquiry',
        'General Discussion',
      ],
      default: 'Doubt & Question',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', MessageSchema);
