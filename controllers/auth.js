import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';

import User from '../models/user.js';

router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up');
});

router.post('/sign-in', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) {
      return res.send('Login failed. Please try again.');
    }

    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );
    if (!validPassword) {
      return res.send('Login failed. Please try again.');
    }

    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
    };

    res.redirect('/search'); // ✅ redirect after successful login
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});


router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs');
});

router.get('/sign-out', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

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