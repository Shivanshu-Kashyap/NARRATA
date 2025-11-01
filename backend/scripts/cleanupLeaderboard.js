#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../src/db/index.js';
import mongoose from 'mongoose';

async function run() {
  try {
    await connectDB();

    const Story = mongoose.model('Story');
    const LeaderboardEntry = mongoose.model('LeaderboardEntry');

    const authorsWithPublished = await Story.distinct('author', { status: 'published' });

    console.log('Authors with published stories:', authorsWithPublished.length);

    // Mark entries inactive for users without published stories
    const result = await LeaderboardEntry.updateMany(
      { user: { $nin: authorsWithPublished } },
      { $set: { isActive: false } }
    );

    console.log('Leaderboard cleanup result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

run();
