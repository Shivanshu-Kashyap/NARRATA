# Narrata - AI-Powered Storytelling Platform

A modern full-stack storytelling platform that empowers writers to share their narratives, connect with readers, and engage with the entertainment industry. Now featuring **AI-powered writing assistance and cover generation** using free APIs. Built with React frontend and Node.js/Express backend.

---

## ✨ What's New: AI Features

🤖 **AI Writing Assistant** - Get real-time help improving your stories  
🎨 **AI Cover Generator** - Create professional book covers in seconds  
📊 **Story Analysis** - Get insights on readability and engagement  
💰 **Cost**: **$0/month** - Completely free using Hugging Face API!

[🚀 Quick Start Guide](./AI_QUICK_START.md) | [📖 Full AI Docs](./AI_FEATURES_README.md) | [🎬 See Examples](./AI_DEMO_EXAMPLES.md)

---

## 🚀 Features

### Core Features
- **📝 Story Creation & Management**: Rich text editor for writing and publishing stories
- **🏆 Leaderboard System**: Competitive ranking based on public engagement
- **⭐ Public Feedback**: Rating and comment system for stories
- **👤 User Profiles**: Customizable writer profiles with statistics
- **🎬 Industry Connection**: Platform for potential story adaptations
- **📱 Responsive Design**: Fully responsive interface for all devices
- **🔐 Authentication**: Secure JWT-based authentication system
- **💬 Comment System**: Nested comments with moderation features
- **🏅 Badges & Achievements**: Gamification elements for writers

### 🤖 AI Features (NEW!)
- **✨ AI Writing Assistant**: Real-time writing help with improve, continue, and suggestion features
  - **Improve Text**: Enhance grammar, style, and narrative flow
  - **Continue Story**: Generate story continuations in 6 different tones (Dramatic, Comedic, Mysterious, Romantic, Action, Horror)
  - **Creative Suggestions**: Get ideas for plot, characters, dialogue, openings, and endings
  - **Grammar Check**: Detect and correct grammatical errors
- **🎨 AI Cover Generator**: Professional book cover creation with 5 artistic styles
  - Realistic, Artistic, Minimal, Dramatic, and Fantasy styles
  - Category-aware generation
  - Auto-upload to Cloudinary
  - 20-30 second generation time
- **📊 Story Analysis**: Readability metrics, word count, reading time, and more
- **💰 Cost**: $0/month using free Hugging Face APIs

## 🛠️ Tech Stack

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Icons** & **Heroicons** for UI icons
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for file uploads
- **bcrypt** for password hashing
- **Multer** for file handling

### AI Integration
- **Hugging Face Inference API** (Free Tier)
  - **Mistral-7B-Instruct-v0.2**: Text generation and improvement
  - **Stable Diffusion 2.1**: Cover image generation
  - **Flan-T5-Large**: Grammar checking

## 📁 Project Structure

```
narrata/
├── project/                        # Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIAssistant.jsx           # AI Writing Assistant (NEW)
│   │   │   ├── AICoverGenerator.jsx      # AI Cover Generator (NEW)
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── WriteStory.jsx            # Integrated with AI (UPDATED)
│   │   │   ├── Home.jsx
│   │   │   ├── Stories.jsx
│   │   │   ├── StoryDetail.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js                    # AI API methods added (UPDATED)
│   │   └── App.jsx
│   ├── public/
│   └── package.json
└── backend/
    ├── src/
    │   ├── services/
    │   │   └── ai/
    │   │       └── huggingface.service.js  # AI Logic (NEW)
    │   ├── controllers/
    │   │   ├── ai.controller.js            # AI Controllers (NEW)
    │   │   ├── auth.controller.js
    │   │   ├── story.controller.js
    │   │   ├── comment.controller.js
    │   │   ├── user.controller.js
    │   │   └── leaderboard.controller.js
    │   ├── models/
    │   │   ├── user.model.js
    │   │   ├── story.model.js
    │   │   ├── comment.model.js
    │   │   └── leaderboard.model.js
    │   ├── routes/
    │   │   ├── ai.routes.js                # AI Routes (NEW)
    │   │   ├── auth.routes.js
    │   │   ├── story.routes.js
    │   │   ├── comment.routes.js
    │   │   ├── user.routes.js
    │   │   └── leaderboard.routes.js
    │   ├── middlewares/
    │   │   ├── auth.middleware.js
    │   │   └── multer.middleware.js
    │   ├── utils/
    │   │   ├── ApiError.js
    │   │   ├── ApiResponse.js
    │   │   ├── asyncHandler.js
    │   │   ├── cloudinary.js
    │   │   └── constants.js
    │   ├── db/
    │   │   └── index.js
    │   ├── app.js                          # AI routes added (UPDATED)
    │   └── index.js
    ├── public/
    │   └── temp/                           # Temporary file storage
    └── package.json
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone 
   cd narrata
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Create backend `.env` file:**
   ```env
   # Server Configuration
   PORT=8000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/narrata

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-token-secret
   JWT_REFRESH_EXPIRES_IN=30d

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # AI Configuration (NEW - Required for AI features)
   # Get your free API key from: https://huggingface.co/settings/tokens
   HUGGING_FACE_API_KEY=hf_your_huggingface_api_key_here

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the applications:**

   **Terminal 1 (Backend):**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`
   - API Documentation: `http://localhost:8000/api/v1/docs`

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=8000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
HUGGING_FACE_API_KEY=hf_your_huggingface_key  # NEW - Get from huggingface.co
CORS_ORIGIN=http://localhost:5173
```

### Getting Your Free Hugging Face API Key (NEW)
1. Create a free account at https://huggingface.co/join
2. Go to Settings → Access Tokens
3. Create a new token with "Read" permissions
4. Copy and paste it into your `.env` file
5. **Cost**: $0/month (completely free!)

## 📚 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh-token` - Refresh access token
- `GET /current-user` - Get current user
- `PATCH /update-account` - Update account details
- `PATCH /avatar` - Update user avatar
- `POST /change-password` - Change password
- `DELETE /delete-account` - Delete account

### Stories (`/api/v1/stories`)
- `GET /` - Get all published stories
- `POST /create` - Create new story
- `GET /trending` - Get trending stories
- `GET /:slug` - Get story by slug
- `PATCH /:storyId` - Update story
- `DELETE /:storyId` - Delete story
- `POST /:storyId/like` - Like/unlike story
- `POST /:storyId/dislike` - Dislike story

### Users (`/api/v1/users`)
- `GET /` - Get all users
- `GET /search` - Search users
- `GET /:username` - Get user profile
- `GET /:username/stories` - Get user stories

### Comments (`/api/v1/comments`)
- `GET /story/:storyId` - Get story comments
- `POST /create` - Create comment
- `PATCH /:commentId` - Update comment
- `DELETE /:commentId` - Delete comment

### Leaderboard (`/api/v1/leaderboard`)
- `GET /` - Get leaderboard
- `GET /top-writers` - Get top writers
- `GET /user/:userId` - Get user rank

### 🤖 AI Features (`/api/v1/ai`) - NEW!
- `POST /improve-text` - Enhance writing quality and grammar
- `POST /continue-story` - Generate story continuations in different tones
- `POST /suggestions` - Get creative suggestions (plot, character, dialogue, etc.)
- `POST /check-grammar` - Check and correct grammar
- `POST /generate-cover` - Generate AI cover images with multiple styles
- `POST /analyze-story` - Get readability metrics and story statistics

**All AI endpoints require JWT authentication**

## 🧪 Available Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
npm run db:seed    # Seed database with sample data
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🗂️ Database Models

### User Model
- Authentication & profile information
- Statistics (stories, views, likes, followers)
- Social links and preferences

### Story Model
- Title, content, category, tags
- Engagement metrics (views, likes, comments)
- Publication status and settings

### Comment Model
- Nested comment system (3 levels deep)
- Like/dislike functionality
- Moderation features

### Leaderboard Model
- User scoring and ranking system
- Badges and achievements
- Time-based rankings (weekly, monthly)

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** with bcrypt
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Helmet.js** for security headers
- **Input Validation** and sanitization
- **File Upload Security** with type and size limits

## 🌟 Key Features Implementation

### Authentication System
- JWT-based authentication with refresh tokens
- Protected routes with role-based access
- Email verification support
- Password reset functionality

### Story Management
- Rich text content support
- Category and tag system
- Draft/publish workflow
- View tracking and engagement metrics

### Engagement System
- Like/dislike functionality
- Nested comment system
- User following/followers
- Leaderboard and ranking

### File Upload
- Cloudinary integration for images
- Avatar and cover image support
- File type and size validation
- Automatic image optimization

### 🤖 AI-Powered Features (NEW!)

#### AI Writing Assistant
- **Floating Panel UI**: Always accessible while writing
- **Multiple AI Functions**:
  - **Improve Text**: Enhance grammar, style, and flow
  - **Continue Story**: Generate continuations in 6 tones (Dramatic, Comedic, Mysterious, Romantic, Action, Horror)
  - **Creative Suggestions**: Ideas for plot, characters, dialogue, openings, and endings
- **Smart Text Operations**: Insert or replace text in editor
- **Context-Aware**: Uses story context for better results

#### AI Cover Generator
- **Professional Quality**: Book covers using Stable Diffusion 2.1
- **5 Artistic Styles**: 
  - Realistic (photorealistic, cinematic)
  - Artistic (painterly, vibrant)
  - Minimal (clean, modern)
  - Dramatic (moody, atmospheric)
  - Fantasy (magical, ethereal)
- **Category-Aware**: Adapts prompts to story genre
- **Auto-Upload**: Seamlessly integrates with Cloudinary
- **Preview & Regenerate**: Try multiple versions

#### Story Analysis
- Word count and character count
- Reading time estimation
- Readability score (Flesch Reading Ease)
- Grade level recommendation
- Paragraph and sentence analysis

#### AI Implementation Details
- **Models Used**:
  - Mistral-7B-Instruct for text generation
  - Stable Diffusion 2.1 for images
  - Flan-T5-Large for grammar
- **Performance**: 
  - First request: 20-30s (model loading)
  - Subsequent: 3-5 seconds
- **Cost**: $0/month using free Hugging Face API
- **Rate Limits**: ~30 requests/hour (free tier)
- **Upgrade Path**: Hugging Face Pro ($9/month) for higher limits

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas database
2. Configure all environment variables (including `HUGGING_FACE_API_KEY`)
3. Deploy to platforms like Railway, Render, or AWS
4. Set up Cloudinary for file uploads
5. Ensure AI endpoints are accessible

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to Vercel, Netlify, or similar platforms
3. Update API base URL for production
4. Test AI features in production environment

### AI Features Deployment Notes
- Hugging Face API works in production (no special configuration needed)
- First AI request in production may also take 20-30s (model loading)
- Consider implementing caching for frequently requested AI operations
- Monitor API usage to stay within free tier limits
- Upgrade to Hugging Face Pro if you exceed rate limits

## 📖 AI Features Documentation

Complete documentation for AI features is available:
- **Quick Start**: See `AI_QUICK_START.md` for 5-minute setup
- **Full Documentation**: See `AI_FEATURES_README.md` for complete technical docs
- **Usage Examples**: See `AI_DEMO_EXAMPLES.md` for real-world examples
- **Architecture**: See `AI_ARCHITECTURE.md` for system diagrams
- **Testing**: See `AI_SETUP_CHECKLIST.md` for verification steps

## 🎮 Using AI Features

### For Writers
1. Navigate to the **Write Story** page
2. Start writing your story (at least 50 characters)
3. Click the purple **AI Assistant** button (bottom-right corner)
4. Choose your desired action:
   - **Improve**: Enhance selected text
   - **Continue**: Generate next paragraph
   - **Ideas**: Get creative suggestions
5. For cover images, click **Generate AI Cover** button above the cover upload area

### Tips for Best Results
- **Text Improvement**: Select 1-2 paragraphs at a time
- **Story Continuation**: Provide at least 200 words of context
- **Cover Generation**: Use descriptive titles and select appropriate category
- **First Use**: Allow 20-30 seconds for initial AI model loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🙏 Acknowledgments

- [React](https://reactjs.org) - Frontend framework
- [Express.js](https://expressjs.com) - Backend framework
- [MongoDB](https://mongodb.com) - Database
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Cloudinary](https://cloudinary.com) - Image and video management
- [Hugging Face](https://huggingface.co) - AI models and inference API
- [Mistral AI](https://mistral.ai) - Text generation model
- [Stability AI](https://stability.ai) - Image generation model

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+ (including AI features)
- **API Endpoints**: 30+ (including 6 AI endpoints)
- **React Components**: 15+ (including 2 AI components)
- **AI Models**: 3 (Text generation, Image generation, Grammar)
- **Cost**: $0/month for AI features (free tier)

## 🎯 Roadmap

### Completed ✅
- Core storytelling platform
- User authentication and profiles
- Story creation and management
- Comment system
- Leaderboard and rankings
- AI Writing Assistant
- AI Cover Generator
- Story analysis tools

### Coming Soon 🚧
- Real-time collaboration
- Story versioning
- Advanced analytics dashboard
- Mobile applications
- AI-powered story recommendations
- Multi-language support
- Voice-to-text story writing
- Advanced AI features (character consistency, plot analysis)

## 📞 Support

For support, email shivanshukashyap996@gmail.com or create an issue in this repository.

***

## 🌟 Special Features

### AI-Powered Writing (Free!)
This platform includes professional AI writing assistance at **zero cost** using Hugging Face's free inference API. Writers get access to:
- Real-time text improvement
- Story continuation generation
- Creative writing suggestions
- Professional cover image generation
- Grammar checking
- Story analysis tools

All powered by state-of-the-art AI models including Mistral-7B and Stable Diffusion 2.1.

***

**Made with ❤️ by Shivanshu Kashyap**

**Featuring AI Integration** 🤖✨