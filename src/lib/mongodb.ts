import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brain-fog-monitor';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached: any = null;

async function connectDB() {
  if (cached) {
    return cached;
  }

  try {
    const opts = {
      bufferCommands: false,
    };

    cached = await mongoose.connect(MONGODB_URI, opts);
    console.log('MongoDB connected successfully');
    return cached;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectDB; 