const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/peervo';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`\n⚠️  Troubleshooting Tip:`);
    console.error(`   1. Make sure MongoDB Community Server / MongoDB Compass service is running locally on port 27017.`);
    console.error(`   2. Or add your free MongoDB Atlas cloud connection URI into 'server/.env' as:`);
    console.error(`      MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/peervo\n`);
    process.exit(1);
  }
};

module.exports = connectDB;
