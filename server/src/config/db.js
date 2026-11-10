import mongoose from 'mongoose';
import Student from '../models/Student.js';

let reconnectTimer = null;
let lifecycleListenersBound = false;

const scheduleReconnect = (mongoURI, options, delay = 10000) => {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      await connectDB(1, delay);
    } catch (error) {
      console.error(`[MongoDB Auto-Reconnect Failed]: ${error.message}`);
    }
  }, delay);
};

/**
 * Initializes and manages the MongoDB Atlas connection lifecycle with auto-retry.
 */
export const connectDB = async (maxRetries = 5, retryDelay = 2500) => {
  const mongoURI = process.env.MONGO_URI;

  if (
    !mongoURI ||
    mongoURI.includes('127.0.0.1') ||
    mongoURI.includes('localhost') ||
    mongoURI.includes('<password>') ||
    mongoURI.includes('<db_password>')
  ) {
    if (!mongoURI || mongoURI.includes('<password>') || mongoURI.includes('<db_password>')) {
      console.warn('\n===============================================================');
      console.warn(' [MongoDB Atlas Setup Required]');
      console.warn(' MONGO_URI in server/.env still contains `<db_password>` placeholder.');
      console.warn(' Please replace `<db_password>` with your real Atlas user password.');
      console.warn('===============================================================\n');
      return;
    }
  }

  const options = {
    serverSelectionTimeoutMS: 30000, // 30s timeout gives Atlas replica set discovery ample time
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4 to prevent dual-stack DNS TLS alert 80 on Windows
    maxPoolSize: 10,
    minPoolSize: 0,
    retryWrites: true,
    w: 'majority',
  };

  if (!lifecycleListenersBound) {
    lifecycleListenersBound = true;
    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB Runtime Error]: ${err.message}`);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection lost. Retrying in 10s...');
      scheduleReconnect(mongoURI, options);
    });
    process.on('SIGINT', async () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      await mongoose.connection.close();
      console.log('[MongoDB Atlas] Connection closed through app termination (SIGINT).');
      process.exit(0);
    });
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`[MongoDB Atlas] Connection attempt ${attempt}/${maxRetries}...`);
      }

      const conn = await mongoose.connect(mongoURI, options);
      // Older versions enforced roll numbers globally; multi-organization IDs
      // are only required to be unique inside one tenant.
      try {
        const indexes = await Student.collection.indexes();
        const legacyRollIndex = indexes.find((index) => index.unique && index.key?.rollNumber === 1 && !index.key?.organization);
        if (legacyRollIndex) await Student.collection.dropIndex(legacyRollIndex.name);
        await Student.collection.createIndex({ organization: 1, rollNumber: 1 }, { unique: true, name: 'organization_1_rollNumber_1', partialFilterExpression: { organization: { $type: 'objectId' }, rollNumber: { $type: 'string' } } });
      } catch (indexError) {
        console.error(`[MongoDB Index Migration]: ${indexError.message}`);
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      console.log(`\n===============================================================`);
      console.log(` [MongoDB Atlas] Connected successfully!`);
      console.log(` [MongoDB Atlas] Host: ${conn.connection.host}`);
      console.log(` [MongoDB Atlas] Database: ${conn.connection.name}`);
      console.log(`===============================================================\n`);
      return conn;
    } catch (error) {
      console.error(`\n[MongoDB Atlas Attempt ${attempt}/${maxRetries} Failed]: ${error.message}`);

      if (
        error.message.includes('SSL alert number 80') ||
        error.message.includes('alert internal error')
      ) {
        console.error(` [Tip] Atlas SSL Alert 80: Connection was rejected by Atlas cluster firewall.`);
        console.error(`       Add this machine's current public IP (/32) in Atlas Security -> Network Access.`);
      } else if (
        error.message.includes('bad auth') ||
        error.message.includes('Authentication failed')
      ) {
        console.error(` [Tip] Database username or password in MONGO_URI is incorrect.`);
      } else if (error.name === 'MongooseServerSelectionError') {
        console.error(` [Tip] Check the Atlas IP access list, cluster availability, and DNS/network access.`);
      }

      if (attempt < maxRetries) {
        console.log(`[MongoDB Atlas] Auto-retrying connection in ${retryDelay / 1000}s...`);
        await new Promise((res) => setTimeout(res, retryDelay));
      } else {
        console.error(`[MongoDB Atlas] All ${maxRetries} attempts exhausted. Retrying in 10 seconds.`);
        scheduleReconnect(mongoURI, options);
      }
    }
  }

};

