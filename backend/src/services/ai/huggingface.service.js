import { ApiError } from '../../utils/ApiError.js';

/**
 * Hugging Face AI Service
 * Free tier API integration for text generation and image generation
 */

const HF_API_URL = 'https://api-inference.huggingface.co/models';
const HF_API_TOKEN = process.env.HUGGING_FACE_API_KEY;

// Model configurations
const MODELS = {
  TEXT_GENERATION: 'mistralai/Mistral-7B-Instruct-v0.2', // Free, high-quality text model
  IMAGE_GENERATION: 'stabilityai/stable-diffusion-2-1', // Free Stable Diffusion
  GRAMMAR_CHECK: 'pszemraj/flan-t5-large-grammar-synthesis', // Grammar correction
};

/**
 * Make request to Hugging Face API
 */
async function queryHuggingFace(model, payload, retries = 3) {
  const url = `${HF_API_URL}/${model}`;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        
        // If model is loading, wait and retry
        if (error.error && error.error.includes('loading')) {
          const waitTime = error.estimated_time || 20;
          console.log(`Model loading, waiting ${waitTime}s... (attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
          continue;
        }
        
        throw new Error(error.error || `API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  
  throw new Error('Max retries reached');
}

/**
 * Generate image blob from Hugging Face
 */
async function queryHuggingFaceImage(model, payload, retries = 3) {
  const url = `${HF_API_URL}/${model}`;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        
        if (error.error && error.error.includes('loading')) {
          const waitTime = error.estimated_time || 30;
          console.log(`Image model loading, waiting ${waitTime}s... (attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
          continue;
        }
        
        throw new Error(error.error || `Image API request failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 3000 * (i + 1)));
    }
  }
  
  throw new Error('Max retries reached for image generation');
}

/**
 * AI Writing Assistant - Improve text
 */
export async function improveText(text, context = 'general') {
  if (!HF_API_TOKEN) {
    throw new ApiError(500, 'Hugging Face API key not configured');
  }

  if (!text || text.trim().length < 10) {
    throw new ApiError(400, 'Text must be at least 10 characters long');
  }

  const prompt = `<s>[INST] You are a professional story editor. Improve the following text by making it more engaging, fixing grammar, and enhancing the narrative flow. Keep the original meaning but make it more compelling.

Original text:
${text}

Improved version: [/INST]`;

  try {
    const result = await queryHuggingFace(MODELS.TEXT_GENERATION, {
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false,
      },
    });

    if (result && result[0] && result[0].generated_text) {
      return {
        original: text,
        improved: result[0].generated_text.trim(),
        model: MODELS.TEXT_GENERATION,
      };
    }

    throw new Error('Unexpected response format from AI model');
  } catch (error) {
    console.error('Error improving text:', error);
    throw new ApiError(500, `Failed to improve text: ${error.message}`);
  }
}

/**
 * AI Writing Assistant - Continue story
 */
export async function continueStory(currentText, tone = 'dramatic') {
  if (!HF_API_TOKEN) {
    throw new ApiError(500, 'Hugging Face API key not configured');
  }

  if (!currentText || currentText.trim().length < 50) {
    throw new ApiError(400, 'Story text must be at least 50 characters long');
  }

  const prompt = `<s>[INST] You are a creative story writer. Continue the following story in a ${tone} tone. Write the next paragraph that naturally follows the story.

Story so far:
${currentText.slice(-500)} // Last 500 chars for context

Continue the story: [/INST]`;

  try {
    const result = await queryHuggingFace(MODELS.TEXT_GENERATION, {
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.8,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false,
      },
    });

    if (result && result[0] && result[0].generated_text) {
      return {
        continuation: result[0].generated_text.trim(),
        model: MODELS.TEXT_GENERATION,
      };
    }

    throw new Error('Unexpected response format from AI model');
  } catch (error) {
    console.error('Error continuing story:', error);
    throw new ApiError(500, `Failed to continue story: ${error.message}`);
  }
}

/**
 * AI Writing Assistant - Generate suggestions
 */
export async function generateSuggestions(text, suggestionType = 'plot') {
  if (!HF_API_TOKEN) {
    throw new ApiError(500, 'Hugging Face API key not configured');
  }

  const prompts = {
    plot: 'Suggest 3 interesting plot twists or developments for this story.',
    character: 'Suggest 3 ways to develop the characters in this story.',
    dialogue: 'Suggest 3 improvements for dialogue in this story.',
    opening: 'Suggest 3 alternative opening lines for this story.',
    ending: 'Suggest 3 possible endings for this story.',
  };

  const prompt = `<s>[INST] You are a creative writing consultant. ${prompts[suggestionType] || prompts.plot}

Story context:
${text.slice(0, 500)}

Provide 3 specific, actionable suggestions: [/INST]`;

  try {
    const result = await queryHuggingFace(MODELS.TEXT_GENERATION, {
      inputs: prompt,
      parameters: {
        max_new_tokens: 400,
        temperature: 0.9,
        top_p: 0.95,
        do_sample: true,
        return_full_text: false,
      },
    });

    if (result && result[0] && result[0].generated_text) {
      return {
        suggestions: result[0].generated_text.trim(),
        type: suggestionType,
        model: MODELS.TEXT_GENERATION,
      };
    }

    throw new Error('Unexpected response format from AI model');
  } catch (error) {
    console.error('Error generating suggestions:', error);
    throw new ApiError(500, `Failed to generate suggestions: ${error.message}`);
  }
}

/**
 * AI Cover Image Generator
 */
export async function generateCoverImage(storyTitle, storyExcerpt, category, style = 'realistic') {
  if (!HF_API_TOKEN) {
    throw new ApiError(500, 'Hugging Face API key not configured');
  }

  if (!storyTitle) {
    throw new ApiError(400, 'Story title is required');
  }

  // Build intelligent prompt based on story details
  const stylePrompts = {
    realistic: 'photorealistic, detailed, cinematic lighting, 8k',
    artistic: 'artistic, painterly, vibrant colors, expressive',
    minimal: 'minimalist, clean, simple, modern design',
    dramatic: 'dramatic lighting, moody, atmospheric, high contrast',
    fantasy: 'fantasy art, magical, ethereal, detailed illustration',
  };

  const categoryThemes = {
    'Romance': 'romantic atmosphere, emotional, warm colors',
    'Thriller': 'suspenseful, dark, mysterious, tense atmosphere',
    'Mystery': 'mysterious, noir style, shadowy, intriguing',
    'Science Fiction': 'futuristic, sci-fi elements, technology, space',
    'Fantasy': 'magical, mythical, fantastical elements',
    'Horror': 'dark, eerie, haunting, scary atmosphere',
    'Adventure': 'epic, action-packed, adventurous',
    'Drama': 'emotional depth, dramatic lighting',
    'Comedy': 'light-hearted, colorful, fun',
    'Historical': 'period setting, historical accuracy, vintage',
  };

  // Create comprehensive prompt
  const prompt = `Book cover for "${storyTitle}". ${categoryThemes[category] || 'engaging story'}, ${stylePrompts[style] || stylePrompts.realistic}. Professional book cover design, no text, high quality, suitable for publishing`;

  console.log('Generating cover image with prompt:', prompt);

  try {
    const imageBlob = await queryHuggingFaceImage(MODELS.IMAGE_GENERATION, {
      inputs: prompt,
      parameters: {
        negative_prompt: 'text, words, letters, watermark, signature, low quality, blurry',
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    });

    // Convert blob to buffer for Cloudinary upload
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      imageBuffer: buffer,
      mimeType: imageBlob.type || 'image/png',
      prompt: prompt,
      model: MODELS.IMAGE_GENERATION,
    };
  } catch (error) {
    console.error('Error generating cover image:', error);
    throw new ApiError(500, `Failed to generate cover image: ${error.message}`);
  }
}

/**
 * Check grammar and get corrections
 */
export async function checkGrammar(text) {
  if (!HF_API_TOKEN) {
    throw new ApiError(500, 'Hugging Face API key not configured');
  }

  if (!text || text.trim().length < 10) {
    throw new ApiError(400, 'Text must be at least 10 characters long');
  }

  try {
    const result = await queryHuggingFace(MODELS.GRAMMAR_CHECK, {
      inputs: text,
      parameters: {
        max_length: text.length + 200,
      },
    });

    if (result && result[0] && result[0].generated_text) {
      return {
        original: text,
        corrected: result[0].generated_text.trim(),
        model: MODELS.GRAMMAR_CHECK,
      };
    }

    throw new Error('Unexpected response format from grammar checker');
  } catch (error) {
    console.error('Error checking grammar:', error);
    throw new ApiError(500, `Failed to check grammar: ${error.message}`);
  }
}

export default {
  improveText,
  continueStory,
  generateSuggestions,
  generateCoverImage,
  checkGrammar,
};
