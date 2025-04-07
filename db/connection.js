// ChatGPT and Cursor used extensively throughout

// Database connection module that handles MongoDB connection and error handling
import mongoose from 'mongoose';

/**
 * Connects to the MongoDB database using the provided URI
 * @param {string} uri - The MongoDB connection URI
 * @returns {Promise} - A promise that resolves when the connection is established
 */
const connectDB = async (uri) => {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`Connected to MongoDB ${conn.connection.name}.`);
    
    // Handle MongoDB connection errors and disconnections
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default connectDB;
