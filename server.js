// ChatGPT and Cursor used extensively throughout

// Main server file that initializes the Express application and sets up routes
import express from 'express';
import methodOverride from 'method-override';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import searchController from './controllers/search.js';
import bookingController from './controllers/booking.js';
import authRoutes from './controllers/auth.js';
import userRoutes from './routes/user.js';
import bookingRoutes from './routes/bookings.js';
import profileRoutes from './routes/profile.js';
import { verifyToken } from './middleware/auth.js';

// Configure environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || '5001';

const app = express();

// Configure Mongoose
mongoose.set('strictQuery', true);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zigzaggo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev')); // HTTP request logger

// API Routes
app.use('/api/search', searchController);
app.use('/booking', verifyToken, bookingController);
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/profile', profileRoutes);

// Protected routes
app.use('/api/bookings', verifyToken, bookingRoutes);
app.use('/api/profile', verifyToken, profileRoutes);

// Check authentication status endpoint
app.get('/api/auth/check', verifyToken, (req, res) => {
  res.json({ isAuthenticated: true });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  // In development, handle the root route
  app.get('/', (req, res) => {
    res.json({ message: 'API server is running' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});