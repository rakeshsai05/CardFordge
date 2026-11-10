
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const testConnection = async () => {
    const uri = process.env.MONGO_URI;

    console.log('\n===============================================================');
    console.log('       MongoDB Atlas Connection Diagnostic Tool');
    console.log('===============================================================');

    if (!uri) {
        console.error('❌ ERROR: MONGO_URI is missing from server/.env file.');
        process.exit(1);
    }

    if (
        uri.includes('<username>') ||
        uri.includes('<password>') ||
        uri.includes('<db_username>') ||
        uri.includes('<db_password>')
    ) {
        console.error('❌ ERROR: MONGO_URI still contains placeholder values.');
        console.error('Replace the placeholder values with your actual credentials.');
        process.exit(1);
    }

    // Mask password for safe terminal output
    const maskedUri = uri.replace(
        /(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/,
        '$1****$3'
    );

    console.log(`📡 Connecting to: ${maskedUri}`);

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 20000,
            family: 4
        });

        const connection = mongoose.connection;

        // Retrieve actual connection details
        const host = new URL(uri).hostname;
        const database = connection.db.databaseName;

        console.log('\n✅ Connection SUCCESSFUL!');
        console.log(`   Host:     ${host}`);
        console.log(`   Database: ${database}`);
        console.log(`   State:    Connected (ReadyState: ${connection.readyState})`);

        // List collections
        const collections = await connection.db.listCollections().toArray();

        console.log(`\n📦 Collections Found (${collections.length}):`);

        if (collections.length === 0) {
            console.log('   (No collections yet. They will be created when the app runs or users sign up)');
        } else {
            collections.forEach((col) => {
                console.log(`   - ${col.name}`);
            });
        }

        console.log('\n===============================================================');
        console.log('🎉 Your MongoDB Atlas database is ready to use with CardForge!');
        console.log('===============================================================\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Connection FAILED!');
        console.error(`   Error Message: ${error.message}\n`);

        if (
            error.message.includes('bad auth') ||
            error.message.includes('Authentication failed')
        ) {
            console.error('💡 TROUBLESHOOTING TIP: Incorrect Username or Password');
            console.error('   1. Check Atlas -> Security -> Database Access.');
            console.error('   2. Verify your database username and password.');
            console.error('   3. URL-encode special characters in your password.');
        } else if (
            error.message.includes('querySrv') ||
            error.message.includes('ENOTFOUND')
        ) {
            console.error('💡 TROUBLESHOOTING TIP: DNS / Cluster Address Not Found');
            console.error('   1. Verify your internet connection.');
            console.error('   2. Check your cluster URL in Atlas -> Connect -> Drivers.');
        } else if (
            error.message.includes('timed out') ||
            error.message.includes('whitelist') ||
            error.message.includes('ETIMEDOUT')
        ) {
            console.error('💡 TROUBLESHOOTING TIP: IP Access Issue');
            console.error('   1. Go to Atlas -> Security -> Network Access.');
            console.error('   2. Add your current IP address.');
            console.error('   3. Wait for the network rule to become active.');
        }

        console.log('===============================================================\n');

        await mongoose.disconnect().catch(() => {});
        process.exit(1);
    }
};

testConnection();
