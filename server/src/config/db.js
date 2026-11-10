
import mongoose from 'mongoose';
import Student from '../models/Student.js';

let reconnectTimer = null;
let lifecycleListenersBound = false;
let isConnecting = false;

const scheduleReconnect = (delay = 10000) => {
  if (reconnectTimer || isConnecting) return;

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;

    try {
      await connectDB(1, delay);
    } catch (error) {
      console.error(`[MongoDB Auto-Reconnect Failed]: ${error.message}`);
    }
  }, delay);
};

export const connectDB = async (maxRetries = 5, retryDelay = 2500) => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI || /localhost|127\.0\.0\.1|<password>|<db_password>/i.test(mongoURI)) {
    console.error('[MongoDB] Invalid or missing MONGO_URI.');
    return;
  }

  const options = {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
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
      console.warn('[MongoDB] Connection lost. Retrying in 10 seconds...');
      scheduleReconnect();
    });

    mongoose.connection.on('connected', () => {
      console.log('[MongoDB] Connection established.');
    });

    process.on('SIGINT', async () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      await mongoose.connection.close();

      console.log('[MongoDB Atlas] Connection closed.');
      process.exit(0);
    });
  }

  if (mongoose.connection.readyState === 1) {
    console.log('[MongoDB Atlas] Already connected.');
    return mongoose.connection;
  }

  if (isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          console.log(
            `[MongoDB Atlas] Connection attempt ${attempt}/${maxRetries}...`
          );
        }

        const conn = await mongoose.connect(mongoURI, options);
        const connection = conn.connection;

        // Migrate legacy student roll-number index
        try {
          const indexes = await Student.collection.indexes();

          const legacyRollIndex = indexes.find(
            (index) =>
              index.unique &&
              index.key?.rollNumber === 1 &&
              !index.key?.organization
          );

          if (legacyRollIndex) {
            await Student.collection.dropIndex(legacyRollIndex.name);
            console.log('[MongoDB] Legacy roll-number index removed.');
          }

          await Student.collection.createIndex(
            { organization: 1, rollNumber: 1 },
            {
              unique: true,
              name: 'organization_1_rollNumber_1',
              partialFilterExpression: {
                organization: { $type: 'objectId' },
                rollNumber: { $type: 'string' },
              },
            }
          );

          console.log('[MongoDB] Student indexes verified.');
        } catch (indexError) {
          console.error(
            `[MongoDB Index Migration]: ${indexError.message}`
          );
        }

        // Clear pending reconnection timer
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }

        // Get actual connection details
        const host =
          connection.host ||
          connection.getClient()?.options?.srvHost ||
          'Unknown';

        const database =
          connection.db?.databaseName ||
          connection.name ||
          'Unknown';

        console.log('\n===============================================================');
        console.log('[MongoDB Atlas] Connected successfully!');
        console.log(`[MongoDB Atlas] Host: ${host}`);
        console.log(`[MongoDB Atlas] Database: ${database}`);
        console.log('===============================================================\n');

        return conn;

      } catch (error) {
        console.error(
          `\n[MongoDB Atlas Attempt ${attempt}/${maxRetries} Failed]: ${error.message}`
        );

        if (
          error.message.includes('SSL alert number 80') ||
          error.message.includes('alert internal error')
        ) {
          console.error(
            '[Tip] Check Atlas Network Access and cluster firewall settings.'
          );
        } else if (
          error.message.includes('bad auth') ||
          error.message.includes('Authentication failed')
        ) {
          console.error(
            '[Tip] Check your MongoDB username and password in MONGO_URI.'
          );
        } else if (error.name === 'MongooseServerSelectionError') {
          console.error(
            '[Tip] Check Atlas IP access, cluster availability and DNS.'
          );
        }

        if (attempt < maxRetries) {
          console.log(
            `[MongoDB Atlas] Retrying in ${retryDelay / 1000} seconds...`
          );

          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay)
          );
        } else {
          console.error(
            '[MongoDB Atlas] All attempts exhausted. Retrying in 10 seconds.'
          );

          scheduleReconnect();
        }
      }
    }
  } finally {
    isConnecting = false;
  }
};
