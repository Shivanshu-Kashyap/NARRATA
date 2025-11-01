# 🤖 AI Features Implementation Guide

This document describes the AI features implemented in the NARRATA storytelling platform using **free Hugging Face APIs**.

## ✨ Features Implemented

### 1. 🎨 AI Story Writing Assistant
Helps writers improve their stories with real-time AI assistance.

**Capabilities:**
- **Improve Text**: Enhance grammar, style, and narrative flow
- **Continue Story**: Generate story continuations in different tones
- **Writing Suggestions**: Get creative ideas for plot, characters, dialogue, etc.
- **Grammar Check**: Detect and correct grammatical errors

**Technologies:**
- Mistral-7B-Instruct (Text Generation)
- Flan-T5 Large (Grammar Synthesis)
- Hugging Face Inference API (Free Tier)

### 2. 🖼️ AI Cover Image Generator
Generate professional book cover images using AI.

**Capabilities:**
- Generate unique cover images from story title and description
- Multiple artistic styles (Realistic, Artistic, Minimal, Dramatic, Fantasy)
- Category-aware generation
- Automatic upload to Cloudinary

**Technologies:**
- Stable Diffusion 2.1
- Hugging Face Inference API (Free Tier)

---

## 🚀 Setup Instructions

### Backend Setup

#### 1. Get Hugging Face API Key (Free)

1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up for a free account
3. Navigate to Settings → Access Tokens
4. Create a new token with "Read" permissions
5. Copy your token

#### 2. Configure Environment Variables

Add to your `backend/.env` file:

```env
# AI Configuration (Hugging Face)
HUGGING_FACE_API_KEY=hf_your_api_key_here
```

#### 3. Install Dependencies (if needed)

The implementation uses only built-in Node.js `fetch`, so no additional packages are required.

#### 4. Start Backend Server

```bash
cd backend
npm run dev
```

The AI routes will be available at: `http://localhost:8000/api/v1/ai`

---

## 📡 API Endpoints

### POST `/api/v1/ai/improve-text`
Improve text quality using AI.

**Request Body:**
```json
{
  "text": "Your text to improve",
  "context": "general" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "original": "Your text to improve",
    "improved": "Enhanced version of your text",
    "model": "mistralai/Mistral-7B-Instruct-v0.2"
  }
}
```

---

### POST `/api/v1/ai/continue-story`
Continue a story with AI assistance.

**Request Body:**
```json
{
  "text": "Story content so far...",
  "tone": "dramatic" // dramatic, comedic, mysterious, romantic, action, horror
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "continuation": "AI-generated story continuation...",
    "model": "mistralai/Mistral-7B-Instruct-v0.2"
  }
}
```

---

### POST `/api/v1/ai/suggestions`
Get writing suggestions for your story.

**Request Body:**
```json
{
  "text": "Story content...",
  "type": "plot" // plot, character, dialogue, opening, ending
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": "1. First suggestion...\n2. Second suggestion...",
    "type": "plot",
    "model": "mistralai/Mistral-7B-Instruct-v0.2"
  }
}
```

---

### POST `/api/v1/ai/check-grammar`
Check and correct grammar.

**Request Body:**
```json
{
  "text": "Text to check for grammar"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "original": "Text with grammar issues",
    "corrected": "Corrected text",
    "model": "pszemraj/flan-t5-large-grammar-synthesis"
  }
}
```

---

### POST `/api/v1/ai/generate-cover`
Generate a cover image for your story.

**Request Body:**
```json
{
  "title": "Story Title",
  "excerpt": "Brief story description",
  "category": "Romance",
  "style": "realistic" // realistic, artistic, minimal, dramatic, fantasy
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coverImageUrl": "https://res.cloudinary.com/...",
    "publicId": "narrata/ai-covers/...",
    "prompt": "Book cover for 'Story Title'...",
    "style": "realistic"
  }
}
```

---

### POST `/api/v1/ai/analyze-story`
Analyze story metrics and readability.

**Request Body:**
```json
{
  "text": "Full story content..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wordCount": 1234,
    "charCount": 6789,
    "paragraphCount": 15,
    "sentenceCount": 67,
    "avgWordsPerSentence": 18,
    "readingTime": 7,
    "readabilityScore": 65,
    "readabilityLevel": "Moderate",
    "estimatedReadingLevel": "8th grade"
  }
}
```

---

## 🎨 Frontend Components

### AIAssistant Component
Floating AI assistant panel for the story editor.

**Usage:**
```jsx
import AIAssistant from '../components/AIAssistant';

<AIAssistant
  content={storyContent}
  onInsertText={(text) => insertTextAtCursor(text)}
  onReplaceText={(oldText, newText) => replaceInContent(oldText, newText)}
/>
```

**Features:**
- Tabbed interface (Improve, Continue, Suggestions)
- Loading states with informative messages
- Error handling
- Text insertion/replacement

---

### AICoverGenerator Component
Modal for generating AI cover images.

**Usage:**
```jsx
import AICoverGenerator from '../components/AICoverGenerator';

<AICoverGenerator
  storyTitle={title}
  storyExcerpt={excerpt}
  category={category}
  onCoverGenerated={(coverUrl) => setCoverImage(coverUrl)}
/>
```

**Features:**
- Multiple art style selection
- Live preview
- Loading state (20-30s for first generation)
- Auto-upload to Cloudinary

---

## ⚡ Performance & Limitations

### Free Tier Limits
- **Hugging Face Inference API**: Rate-limited (30 req/hour typically)
- **First Request Delay**: Models may need 20-30s to load initially
- **Concurrent Requests**: Limited to prevent abuse

### Optimization Tips
1. **Cache Results**: Store AI responses to avoid duplicate API calls
2. **User Rate Limiting**: Implement per-user rate limits
3. **Loading States**: Always show clear loading indicators
4. **Error Handling**: Gracefully handle model loading delays

### Recommended Upgrades
For production with high traffic:
- Upgrade to Hugging Face Pro ($9/month)
- Use dedicated inference endpoints
- Implement Redis caching
- Add queue system (Bull.js)

---

## 🔧 Troubleshooting

### Issue: "Model is loading" error
**Solution**: This is normal for first request. The code automatically retries after the estimated wait time.

### Issue: Rate limit exceeded
**Solution**: 
- Wait 1 hour for rate limit reset
- Upgrade to Hugging Face Pro
- Implement user-level rate limiting

### Issue: Generated images look poor
**Solution**:
- Try different art styles
- Provide more descriptive titles/excerpts
- Adjust the prompt in `huggingface.service.js`

### Issue: Text improvement not working well
**Solution**:
- Ensure text is at least 10 characters
- Adjust the prompt template in the service
- Try smaller text chunks (under 500 words)

---

## 🎯 Future Enhancements

### Short-term (Easy)
- [ ] Add more art styles
- [ ] Implement response caching
- [ ] Add usage analytics
- [ ] Save favorite AI suggestions

### Medium-term (Moderate)
- [ ] Multi-language support
- [ ] Custom prompt templates
- [ ] AI writing history
- [ ] Batch operations

### Long-term (Advanced)
- [ ] Fine-tuned models for story writing
- [ ] Real-time collaborative AI editing
- [ ] Voice-to-text integration
- [ ] Personalized AI based on writing style

---

## 📊 Cost Analysis

### Current Setup (FREE)
- Hugging Face Inference API: **$0/month**
- Cloudinary Free Tier: **$0/month** (25k transformations)
- Total: **$0/month** ✅

### Scaling for 10,000 Users
Assuming 5 AI requests per user per month:
- Hugging Face Pro: **$9/month**
- Cloudinary: **Free tier sufficient**
- Total: **$9/month** 

### Enterprise (100,000+ users)
- Dedicated Inference Endpoints: **~$100/month**
- Cloudinary Advanced: **~$50/month**
- Redis Caching: **~$30/month**
- Total: **~$180/month**

---

## 🔐 Security Best Practices

1. **API Key Protection**
   - Never expose API keys in frontend
   - Use environment variables
   - Rotate keys regularly

2. **Rate Limiting**
   - Implement per-user limits
   - Track usage in database
   - Block abusive users

3. **Input Validation**
   - Sanitize all user inputs
   - Limit text length
   - Validate file uploads

4. **Content Moderation**
   - Filter inappropriate requests
   - Log all AI interactions
   - Implement reporting system

---

## 📚 Additional Resources

- [Hugging Face Documentation](https://huggingface.co/docs)
- [Stable Diffusion Guide](https://huggingface.co/docs/diffusers)
- [Mistral AI Documentation](https://docs.mistral.ai/)
- [Cloudinary API Docs](https://cloudinary.com/documentation)

---

## 🤝 Support

For issues or questions:
1. Check this documentation first
2. Review the [Hugging Face Community](https://discuss.huggingface.co/)
3. Open an issue on the project repository
4. Contact the development team

---

## 📝 License

These AI features are part of the NARRATA platform and follow the same license.

---

**Built with ❤️ using Free AI APIs**
