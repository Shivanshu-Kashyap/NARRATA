📂 Backend/
├── 📂 node_modules/      # Dependencies
├── 📂 public/            # Public assets (if any)
├── 📂 src/               # Source code
│   ├── 📂 controllers/   # Business logic for routes
│   │   ├── auth.controller.js
│   │   ├── story.controller.js
│   │   ├── user.controller.js
│   │   ├── leaderboard.controller.js
│   │   ├── comment.controller.js
│   ├── 📂 db/            # Database connection
│   │   ├── index.js
│   ├── 📂 middlewares/   # Middleware functions
│   │   ├── auth.middleware.js
│   │   ├── multer.middleware.js
│   ├── 📂 models/        # Database models
│   │   ├── user.model.js
│   │   ├── story.model.js
│   │   ├── comment.model.js
│   │   ├── leaderboard.model.js
│   ├── 📂 routes/        # API Routes
│   │   ├── auth.routes.js
│   │   ├── story.routes.js
│   │   ├── user.routes.js
│   │   ├── leaderboard.routes.js
│   │   ├── comment.routes.js
│   ├── 📂 utils/         # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── cloudinary.js
│   │   ├── constants.js
│   ├── app.js            # Main Express app
│   ├── index.js          # Entry point
├── .env                  # Environment variables
├── .gitignore            # Ignore unnecessary files
├── .prettierrc           # Code formatting rules
├── package.json          # Dependencies and scripts
├── package-lock.json     # Version lock file
├── README.md             # Documentation
