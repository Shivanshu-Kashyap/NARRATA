import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Use the URI directly since it already includes the database name
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(
      `\n☘️ MongoDB Connected! DB Host: ${connectionInstance.connection.host}`
    );
    console.log(`📊 Database Name: ${connectionInstance.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('MongoDB connection FAILED:', error);
    process.exit(1);
  }
};

export default connectDB;
