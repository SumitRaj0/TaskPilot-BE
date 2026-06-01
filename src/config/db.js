import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing from .env');

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    if (err.message?.includes('ENOTFOUND') || err.code === 'ENOTFOUND') {
      throw new Error(
        'Bad MongoDB host — copy the full URI from Atlas (cluster0.xxxxx.mongodb.net)'
      );
    }
    throw err;
  }
};
