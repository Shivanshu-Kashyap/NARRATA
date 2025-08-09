import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

// Configure environment variables
dotenv.config({
  path: './.env'
});

const PORT = process.env.PORT || 8000;

// Connect to database and start server
connectDB()
  .then(() => {
    // Handle server errors
    app.on('error', (error) => {
      console.error('Express app error:', error);
      throw error;
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port: ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed!', error);
    process.exit(1);
  });
