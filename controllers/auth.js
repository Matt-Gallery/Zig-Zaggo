// Authentication controller that handles user sign-up, sign-in, and sign-out functionality
import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';

import User from '../models/user.js';

// Route to display the sign-up form
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up');
});

// Route to handle user sign-in
router.post('/sign-in', async (req, res) => {
  try {
    // Find user in database by username
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) {
      return res.render('auth/sign-in', { error: 'Invalid username or password' });
    }

    // Verify password using bcrypt
    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );
    if (!validPassword) {
      return res.render('auth/sign-in', { error: 'Invalid username or password' });
    }

    // Store user info in session
    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
    };

    res.redirect('/search');
  } catch (error) {
    console.log(error);
    res.render('auth/sign-in', { error: 'An error occurred. Please try again.' });
  }
});


// Route to display the sign-in form
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs', { error: null });
});

// Route to handle user sign-out
router.get('/sign-out', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/sign-in');
});

// Route to handle user sign-up
router.post('/sign-up', async (req, res) => {
  try {
    const { username, password, confirmPassword, name, emailAddress } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.send('Username already taken.');
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.send('Password and Confirm Password must match.');
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create the user
    await User.create({
      username,
      password: hashedPassword,
      name,
      emailAddress,
    });

    res.redirect('/auth/sign-in');
  } catch (error) {
    console.error('Error during sign-up:', error);
    res.status(500).send('An error occurred. Please try again later.');
  }
});



export default router;