import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    if (error.message?.includes('ENOTFOUND') || error.code === 'ENOTFOUND') {
      throw new Error(
        'Cannot resolve MongoDB host. In Atlas: Connect → Drivers → copy the full connection string. ' +
          'The host must look like cluster0.xxxxx.mongodb.net (not cluster.mongodb.net).'
      );
    }
    throw error;
  }
};
