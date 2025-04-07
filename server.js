// ChatGPT and Cursor used extensively throughout

// Main server file that initializes the Express application and sets up routes
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
const app = express();

import methodOverride from 'method-override';
import morgan from 'morgan';
import session from 'express-session';
import passUserToViews from './middleware/passUserToViews.js';
import authRoutes from './controllers/auth.js';
import searchController from './controllers/search.js';
import bookingController from './controllers/booking.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import userRoutes from './routes/user.js';
import connectDB from './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT ? process.env.PORT : '3000';

// Connect to MongoDB database using the connection module
connectDB(process.env.MONGODB_URI)
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware setup for parsing request bodies and serving static files
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(methodOverride('_method'));
app.use(express.static('public'));
// app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
// Middleware to pass user data to all views
app.use(passUserToViews);

// Add middleware to pass current path to all views
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

// Set up routes for search, booking, and user functionality
app.use('/search', searchController);
app.use('/booking', bookingController);

// Home page route
app.get('/', (req, res) => {
  res.render('index.ejs', { user: req.session?.user || null });
});


// Authentication and user routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});