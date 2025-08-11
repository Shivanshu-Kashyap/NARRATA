import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { ApiError } from './utils/ApiError.js';
import { ApiResponse } from './utils/ApiResponse.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import storyRoutes from './routes/story.routes.js';
import commentRoutes from './routes/comment.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "https:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'http://localhost:3000',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5174'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Rate limiting with different limits for different endpoints
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => {
      // Skip rate limiting for admin users
      return req.user?.role === 'admin';
    }
  });
};

// General rate limiter
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per 15 minutes
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiter for auth endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 requests per 15 minutes
  'Too many authentication attempts, please try again later.'
);

// Apply general rate limiting
app.use('/api/', generalLimiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ 
  limit: '16kb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '16kb' 
}));
app.use(cookieParser());

// Serve static files
app.use(express.static('public'));

// API Documentation endpoint
app.get('/api/v1/docs', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      title: 'Narrata API Documentation',
      version: '1.0.0',
      description: 'RESTful API for Narrata storytelling platform',
      baseUrl: `${req.protocol}://${req.get('host')}/api/v1`,
      endpoints: {
        authentication: '/api/v1/auth',
        users: '/api/v1/users',
        stories: '/api/v1/stories',
        comments: '/api/v1/comments',
        leaderboard: '/api/v1/leaderboard'
      },
      features: [
        'User authentication and authorization',
        'Story creation and management',
        'Comment system with nested replies',
        'Leaderboard and scoring system',
        'File uploads via Cloudinary',
        'Real-time engagement tracking'
      ]
    }, 'API Documentation')
  );
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
      }
    }, 'Server is healthy')
  );
});

// API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/stories', storyRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);

// Catch-all route for undefined API endpoints
app.all('/api/*', (req, res, next) => {
  const error = new ApiError(404, `API route ${req.originalUrl} not found`);
  next(error);
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      message: 'Welcome to Narrata API',
      version: '1.0.0',
      documentation: '/api/v1/docs',
      health: '/api/v1/health'
    }, 'Narrata API Server is running')
  );
});

// 404 handler for non-API routes
app.all('*', (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
});

// Global error handling middleware
app.use((error, req, res, next) => {
  let { statusCode = 500, message } = error;

  // Handle specific error types
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    statusCode = 400;
    const field = Object.keys(error.keyValue)[0];
    message = `${field} already exists`;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map(err => err.message).join(', ');
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Don't expose internal server errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  // Log errors
  if (statusCode >= 500) {
    console.error('Server Error:', error);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { 
      stack: error.stack 
    }),
  });
});

export { app };
