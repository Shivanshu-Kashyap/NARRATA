import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { 
  improveText, 
  continueStory, 
  generateSuggestions, 
  generateCoverImage,
  checkGrammar 
} from '../services/ai/huggingface.service.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @route POST /api/v1/ai/improve-text
 * @desc Improve text using AI
 * @access Private
 */
export const improveTextHandler = asyncHandler(async (req, res) => {
  const { text, context } = req.body;

  if (!text || text.trim().length === 0) {
    throw new ApiError(400, 'Text is required');
  }

  if (text.length > 2000) {
    throw new ApiError(400, 'Text is too long. Maximum 2000 characters.');
  }

  const result = await improveText(text, context);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Text improved successfully'));
});

/**
 * @route POST /api/v1/ai/continue-story
 * @desc Continue story using AI
 * @access Private
 */
export const continueStoryHandler = asyncHandler(async (req, res) => {
  const { text, tone } = req.body;

  if (!text || text.trim().length === 0) {
    throw new ApiError(400, 'Story text is required');
  }

  if (text.length < 50) {
    throw new ApiError(400, 'Story text must be at least 50 characters');
  }

  const validTones = ['dramatic', 'comedic', 'mysterious', 'romantic', 'action', 'horror'];
  const selectedTone = validTones.includes(tone) ? tone : 'dramatic';

  const result = await continueStory(text, selectedTone);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Story continuation generated successfully'));
});

/**
 * @route POST /api/v1/ai/suggestions
 * @desc Get writing suggestions using AI
 * @access Private
 */
export const getSuggestionsHandler = asyncHandler(async (req, res) => {
  const { text, type } = req.body;

  if (!text || text.trim().length === 0) {
    throw new ApiError(400, 'Story text is required');
  }

  const validTypes = ['plot', 'character', 'dialogue', 'opening', 'ending'];
  const suggestionType = validTypes.includes(type) ? type : 'plot';

  const result = await generateSuggestions(text, suggestionType);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Suggestions generated successfully'));
});

/**
 * @route POST /api/v1/ai/check-grammar
 * @desc Check grammar and get corrections
 * @access Private
 */
export const checkGrammarHandler = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    throw new ApiError(400, 'Text is required');
  }

  if (text.length > 1000) {
    throw new ApiError(400, 'Text is too long. Maximum 1000 characters for grammar check.');
  }

  const result = await checkGrammar(text);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Grammar checked successfully'));
});

/**
 * @route POST /api/v1/ai/generate-cover
 * @desc Generate cover image for story using AI
 * @access Private
 */
export const generateCoverHandler = asyncHandler(async (req, res) => {
  const { title, excerpt, category, style } = req.body;

  if (!title || title.trim().length === 0) {
    throw new ApiError(400, 'Story title is required');
  }

  const validStyles = ['realistic', 'artistic', 'minimal', 'dramatic', 'fantasy'];
  const selectedStyle = validStyles.includes(style) ? style : 'realistic';

  // Generate the image
  const { imageBuffer, mimeType, prompt } = await generateCoverImage(
    title,
    excerpt || '',
    category || 'Fiction',
    selectedStyle
  );

  // Save temporarily
  const tempDir = path.join(__dirname, '../../public/temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFileName = `cover_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
  const tempFilePath = path.join(tempDir, tempFileName);

  // Write buffer to file
  fs.writeFileSync(tempFilePath, imageBuffer);

  try {
    // Upload to Cloudinary
    const uploadResult = await uploadOnCloudinary(tempFilePath, 'narrata/ai-covers');

    if (!uploadResult) {
      throw new ApiError(500, 'Failed to upload generated image');
    }

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    return res
      .status(200)
      .json(new ApiResponse(200, {
        coverImageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        prompt: prompt,
        style: selectedStyle,
      }, 'Cover image generated successfully'));

  } catch (error) {
    // Clean up temp file on error
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw error;
  }
});

/**
 * @route POST /api/v1/ai/analyze-story
 * @desc Analyze story and provide insights
 * @access Private
 */
export const analyzeStoryHandler = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    throw new ApiError(400, 'Story text is required');
  }

  // Basic analysis without AI (can be enhanced later)
  const wordCount = text.trim().split(/\s+/).length;
  const charCount = text.length;
  const paragraphCount = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = Math.round(wordCount / sentenceCount);
  const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

  // Simple readability score (Flesch Reading Ease approximation)
  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = 1.5; // Rough estimate
  const readabilityScore = Math.round(
    206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord
  );

  const analysis = {
    wordCount,
    charCount,
    paragraphCount,
    sentenceCount,
    avgWordsPerSentence,
    readingTime,
    readabilityScore,
    readabilityLevel: readabilityScore > 60 ? 'Easy' : readabilityScore > 30 ? 'Moderate' : 'Difficult',
    estimatedReadingLevel: readabilityScore > 90 ? '5th grade' : 
                           readabilityScore > 60 ? '8th grade' : 
                           readabilityScore > 30 ? 'High school' : 'College',
  };

  return res
    .status(200)
    .json(new ApiResponse(200, analysis, 'Story analyzed successfully'));
});

export default {
  improveTextHandler,
  continueStoryHandler,
  getSuggestionsHandler,
  checkGrammarHandler,
  generateCoverHandler,
  analyzeStoryHandler,
};
