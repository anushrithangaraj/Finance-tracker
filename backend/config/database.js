const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use the same approach that worked in the test
    const mongoURI = process.env.MONGODB_URI;
    
    console.log('Connecting to MongoDB...');
    console.log('URI found:', mongoURI ? 'YES' : 'NO');
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;