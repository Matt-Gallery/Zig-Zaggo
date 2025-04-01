import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
const app = express();

import mongoose from 'mongoose';
import methodOverride from 'method-override';
import morgan from 'morgan';
import session from 'express-session';

import authRoutes from './controllers/auth.js'; // ✅ adjust path as needed



const port = process.env.PORT ? process.env.PORT : '3000';

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: false }));
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

app.get('/', (req, res) => {
  res.render('index.ejs', {
    user: req.session.user,
  });
});

app.get('/search', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/sign-in'); // 👮 redirect if not logged in
  }

  res.render('search/index.ejs', {
    user: req.session.user
  });
});

app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
