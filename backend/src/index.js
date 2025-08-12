// src/index.js

import dotenv from 'dotenv';

// **FIX:** Moved this line to the very top of the file.
// This ensures that all environment variables are loaded before any other code runs.
dotenv.config({
  path: './.env'
});

// Now, we can import our other modules, which depend on the .env variables.
import connectDB from './db/index.js';
import { app } from './app.js';

app.set('trust proxy', 1);

const PORT = process.env.PORT || 8000;

// Connect to database and start server
connectDB()
  .then(() => {
    app.on('error', (error) => {
      console.error('Express app error:', error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port: ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed!', error);
    process.exit(1);
  });
