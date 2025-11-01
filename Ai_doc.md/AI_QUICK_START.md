# 🚀 Quick Start Guide - AI Features

## Step 1: Get Your Free Hugging Face API Key

1. Visit: https://huggingface.co/join
2. Create a free account
3. Go to: https://huggingface.co/settings/tokens
4. Click "New token"
5. Name it "NARRATA" and select "Read" access
6. Copy your token (starts with `hf_...`)

## Step 2: Update Backend Environment

Open `backend/.env` and add:

```env
# AI Configuration (Hugging Face)
HUGGING_FACE_API_KEY=hf_paste_your_token_here
```

## Step 3: Restart Backend Server

```bash
cd backend
npm run dev
```

You should see: `🚀 Server is running on port: 8000`

## Step 4: Restart Frontend

```bash
cd project
npm run dev
```

## Step 5: Test the Features

### Test AI Writing Assistant:
1. Go to http://localhost:5174/write
2. Start writing a story (at least 50 characters)
3. Click the purple "AI Assistant" button (bottom-right)
4. Try "Improve", "Continue", or "Ideas" tabs
5. **First request may take 20-30 seconds** (model loading)

### Test AI Cover Generator:
1. On the Write Story page
2. Fill in Title and Category
3. Click "Generate AI Cover" button
4. Select an art style
5. Click "Generate Cover Image"
6. **Wait 20-30 seconds** for generation
7. Click "Use This Cover" when ready

## 🎉 You're All Set!

The AI features are now active. Here's what you can do:

✅ **Improve Text** - Enhance your writing
✅ **Continue Story** - Get AI-generated continuations
✅ **Get Suggestions** - Creative plot/character ideas
✅ **Generate Covers** - Professional book covers
✅ **Analyze Story** - Get readability metrics

## 📌 Important Notes

- **First Use Delay**: Models need 20-30s to load initially
- **Rate Limits**: ~30 requests/hour on free tier
- **Best Results**: Provide clear titles and descriptions
- **All Free**: No credit card required!

## ⚠️ Troubleshooting

### "Model is loading" message?
**Normal!** Wait 20-30 seconds. The system retries automatically.

### "API key not configured"?
Double-check your `.env` file has the correct key.

### Not working after setup?
1. Verify `.env` has `HUGGING_FACE_API_KEY=hf_...`
2. Restart backend server (`Ctrl+C` then `npm run dev`)
3. Clear browser cache
4. Check browser console for errors (F12)

## 🆘 Still Need Help?

Check the full documentation: `AI_FEATURES_README.md`

---

**Happy Writing with AI! ✨**
