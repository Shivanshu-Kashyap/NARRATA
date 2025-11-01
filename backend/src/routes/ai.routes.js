import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  improveTextHandler,
  continueStoryHandler,
  getSuggestionsHandler,
  checkGrammarHandler,
  generateCoverHandler,
  analyzeStoryHandler,
} from '../controllers/ai.controller.js';

const router = express.Router();

// All AI routes require authentication
router.use(verifyJWT);

// AI Writing Assistant routes
router.post('/improve-text', improveTextHandler);
router.post('/continue-story', continueStoryHandler);
router.post('/suggestions', getSuggestionsHandler);
router.post('/check-grammar', checkGrammarHandler);

// AI Image Generation routes
router.post('/generate-cover', generateCoverHandler);

// Story Analysis routes
router.post('/analyze-story', analyzeStoryHandler);

export default router;
