require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!uri) {
  console.error('\n❌ Error: MONGO_URI or MONGODB_URI is not defined in the .env file.');
  console.log('Please ensure you have a .env file with your MongoDB Atlas connection string.');
  process.exit(1);
}

async function testConnection() {
  console.log('⏳ Attempting to connect to MongoDB Atlas...');
  try {
    // Attempt to connect
    await mongoose.connect(uri);

    // On successful connection
    const db = mongoose.connection;
    console.log('\n✅ MongoDB Connected Successfully');
    console.log(`📂 Database Name: ${db.name || 'test (default)'}`);
    console.log(`🌐 Connection Host: ${db.host}`);
    
  } catch (error) {
    // On connection failure
    console.error('\n❌ MongoDB Connection Failed\n');
    console.error(`Error Details: ${error.message}\n`);
    
    // Debugging checks
    console.log('--- Troubleshooting Checklist ---');
    const errMessage = error.message.toLowerCase();
    
    // Check for Invalid credentials
    if (errMessage.includes('authentication failed') || errMessage.includes('bad auth')) {
      console.log('🔍 Potential Issue: Invalid Credentials');
      console.log('   Action: Check your database username and password in the MONGODB_URI.');
      console.log('   Note: Ensure special characters in your password are URL-encoded.');
    }
    // Check for Network/IP whitelist issues
    else if (errMessage.includes('enotfound') || errMessage.includes('etimedout') || errMessage.includes('ip not whitelisted') || errMessage.includes('connrefused')) {
      console.log('🔍 Potential Issue: IP Not Whitelisted or Network Error');
      console.log('   Action 1: Go to MongoDB Atlas -> Security -> Network Access and ensure your current IP address is whitelisted (or add 0.0.0.0/0 for global access temporarily).');
      console.log('   Action 2: Check if a firewall is blocking the connection or if you have internet access issues.');
    }
    // Check for Incorrect connection string / DNS issues
    else if (errMessage.includes('querysrv') || errMessage.includes('servfail') || errMessage.includes('bad_uri')) {
      console.log('🔍 Potential Issue: Incorrect Connection String / DNS Issue');
      console.log('   Action: Verify that you copied the correct connection string from MongoDB Atlas. Ensure there are no typos in the cluster hostname.');
    } 
    // Generic fallback
    else {
      console.log('🔍 Review the error details above.');
      console.log('   Action: Ensure your cluster is active and your connection string is formatted correctly.');
    }

  } finally {
    // Clean up and exit the process
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from database.');
    }
    console.log('🏁 Exiting connection test.');
    process.exit(0);
  }
}

testConnection();
