import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();
const connectionStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

router.get('/', (req, res) => {
  const connection = mongoose.connection;
  const connected = connection.readyState === 1;
  const databaseStatus = connectionStates[connection.readyState] || 'unknown';
  const databaseName = connected ? connection.db?.databaseName || connection.name || null : null;
  const databaseHost = connected ? connection.host || null : null;

  res.status(200).json({
    success: true,
    platform: 'CardForge ID Card API',
    status: connected ? 'ONLINE' : 'DEGRADED',
    database: {
      status: databaseStatus,
      connected,
      name: databaseName,
      host: databaseHost,
    },
    // Flat aliases keep simple status panels easy to wire up.
    databaseStatus,
    databaseName,
    databaseHost,
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

export default router;
