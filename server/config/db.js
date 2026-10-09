const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let memServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // 1. If an external or Atlas MongoDB URI is configured and reachable, connect to it
  if (uri && !uri.includes('localhost:27017')) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 7000,
        dbName: 'envirotrack',
      });
      console.log(`====================================================`);
      console.log(`☁️  MongoDB Atlas Cloud Connected Successfully!`);
      console.log(`🌐 Cluster Host: ${conn.connection.host}`);
      console.log(`📁 Database: ${conn.connection.name}`);
      console.log(`====================================================`);
      return;
    } catch (err) {
      console.warn(`! Could not connect to remote MONGODB_URI: ${err.message}.`);
    }
  }

  // 2. Persistent Local Embedded Engine with WiredTiger
  // Data is stored in .eco_infra_db in the project root so it PERMANENTLY survives server restarts,
  // file edits, node --watch reloads, and computer reboots!
  const dbDir = path.resolve(__dirname, '../../.eco_infra_db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // First, check if embedded MongoDB is ALREADY running on port 27018
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27018/envirotrack', {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(` Connected to persistent MongoDB engine on port 27018`);
    return;
  } catch (err) {
    // Port 27018 not running yet, we will start it below
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');

    // Remove any stale lock file left by abrupt process termination
    const lockFile = path.join(dbDir, 'mongod.lock');
    if (fs.existsSync(lockFile)) {
      try {
        const stats = fs.statSync(lockFile);
        if (stats.size === 0) {
          fs.unlinkSync(lockFile);
        }
      } catch (e) {
        // Ignore
      }
    }

    memServer = await MongoMemoryServer.create({
      instance: {
        port: 27018,
        dbPath: dbDir,
        storageEngine: 'wiredTiger',
        dbName: 'envirotrack',
      },
    });

    const memUri = memServer.getUri('envirotrack');
    const conn = await mongoose.connect(memUri);
    console.log(` Persistent MongoDB Engine active (WiredTiger): ${conn.connection.host}`);
    console.log(` Database Directory: ${dbDir}`);

    const gracefulStop = async () => {
      try {
        if (memServer) {
          await memServer.stop();
        }
      } catch (e) {}
    };

    process.once('SIGINT', gracefulStop);
    process.once('SIGTERM', gracefulStop);
  } catch (err) {
    console.error(` Error initializing persistent MongoDB engine: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
