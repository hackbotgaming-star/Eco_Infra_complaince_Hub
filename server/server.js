const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const User = require('./models/User');
const seedData = require('./utils/seed');

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded files securely with RBAC token authentication
const { protectDocumentAccess } = require('./middleware/rbac');
app.use('/uploads', protectDocumentAccess);

// Health check and root API endpoint
app.get(['/', '/api', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Eco Infra Compliance Hub — Environmental Compliance API',
    frontendUrl: 'http://localhost:5173',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      projects: '/api/projects',
      assessments: '/api/assessments',
      compliance: '/api/compliance'
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/compliance', require('./routes/compliance'));
app.use('/api/mitigation', require('./routes/mitigation'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/monitoring', require('./routes/monitoring'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/audit-logs', require('./routes/auditLogs'));
app.use('/api/messages', require('./routes/messages'));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Check if database needs initial seeding
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('⚡ Empty database detected. Auto-seeding realistic demonstration data...');
      await seedData();
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Eco Infra Compliance Hub Backend Running on port ${PORT}`);
      console.log(`📡 API Endpoints: http://localhost:${PORT}/api`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
