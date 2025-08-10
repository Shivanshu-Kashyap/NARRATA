# Narrata - Storytelling Platform

A modern full-stack storytelling platform that empowers writers to share their narratives, connect with readers, and engage with the entertainment industry. Built with React frontend and Node.js/Express backend.

## 🚀 Features

- **📝 Story Creation & Management**: Rich text editor for writing and publishing stories
- **🏆 Leaderboard System**: Competitive ranking based on public engagement
- **⭐ Public Feedback**: Rating and comment system for stories
- **👤 User Profiles**: Customizable writer profiles with statistics
- **🎬 Industry Connection**: Platform for potential story adaptations
- **📱 Responsive Design**: Fully responsive interface for all devices
- **🔐 Authentication**: Secure JWT-based authentication system
- **💬 Comment System**: Nested comments with moderation features
- **🏅 Badges & Achievements**: Gamification elements for writers

## 🛠️ Tech Stack

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Icons** for UI icons
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for file uploads
- **bcrypt** for password hashing
- **Multer** for file handling

## 📁 Project Structure

```
narrata/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
└── backend/
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── middlewares/
    │   ├── utils/
    │   ├── db/
    │   ├── app.js
    │   └── index.js
    ├── public/
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

   # Cloudinary Configuration (Optional)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

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
CORS_ORIGIN=http://localhost:5173
```

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

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas database
2. Configure environment variables
3. Deploy to platforms like Railway, Render, or AWS
4. Set up Cloudinary for file uploads

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to Vercel, Netlify, or similar platforms
3. Update API base URL for production

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

## 📞 Support

For support, email shivanshukashyap996@gmail.com or create an issue in this repository.

***

**Made with ❤️ by the Shivanshu Kashyap**