const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Project = require('../models/Project');
const Assessment = require('../models/Assessment');
const Approval = require('../models/Approval');
const ComplianceRequirement = require('../models/ComplianceRequirement');
const MitigationMeasure = require('../models/MitigationMeasure');
const Task = require('../models/Task');
const Inspection = require('../models/Inspection');
const Document = require('../models/Document');
const MonitoringRecord = require('../models/MonitoringRecord');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const defaultPersonas = [
  {
    name: 'Dr. Vikram Sengupta',
    email: 'admin@ecoinfracompliance.io',
    password: 'admin123',
    role: 'ADMIN',
    department: 'Regulatory Compliance & Executive Directorate',
    phone: '+91-9811223344',
  },
  {
    name: 'Sarah Jenkins, PMP',
    email: 'pm@ecoinfracompliance.io',
    password: 'pm123456',
    role: 'PROJECT_MANAGER',
    department: 'Mega Infrastructure Project Delivery',
    phone: '+91-9822334455',
  },
  {
    name: 'Arunabh Sharma',
    email: 'officer@ecoinfracompliance.io',
    password: 'officer123',
    role: 'ENVIRONMENTAL_OFFICER',
    department: 'Environmental Science, Auditing & Ecology',
    phone: '+91-9833445566',
  },
  {
    name: 'Elena Rodriguez',
    email: 'staff@ecoinfracompliance.io',
    password: 'staff123',
    role: 'COMPLIANCE_STAFF',
    department: 'Field Verification & Documentation Office',
    phone: '+91-9844556677',
  },
];

const seedData = async () => {
  try {
    // Safely ensure all 4 RBAC demo personas exist without deleting user-created projects!
    for (const persona of defaultPersonas) {
      const exists = await User.findOne({ email: persona.email });
      if (!exists) {
        await User.create(persona);
        console.log(` Created user persona: ${persona.name} (${persona.role})`);
      }
    }
    console.log('✅ Demo user accounts verified and ready.');
  } catch (err) {
    console.error('❌ Error initializing user accounts:', err.message);
    throw err;
  }
};

// Allow standalone execution
if (require.main === module) {
  const run = async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/envirotrack';
    try {
      await mongoose.connect(mongoUri);
      await seedData();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  };
  run();
}

module.exports = seedData;
