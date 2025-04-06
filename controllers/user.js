// controllers/user.js
import User from '../models/user.js';
import bcrypt from 'bcrypt';

/**
 * GET /account
 * Get account page data for signed-in user
 */
export const getAccount = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).select('-password');
    if (!user) {
      req.session.destroy();
      return res.redirect('/auth/sign-in');
    }

    res.render('user/account', { user });
  } catch (err) {
    console.error('Error fetching account:', err);
    res.render('error', { error: 'Unable to load account page' });
  }
};

/**
 * POST /update-profile
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { username, name, emailAddress, currentPassword, newPassword, confirmPassword } = req.body;
    
    // Get the current user
    const user = await User.findById(userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/auth/sign-in');
    }
    
    // Check if any profile information is being changed
    const isProfileChanged = username !== user.username || 
                            name !== user.name || 
                            emailAddress !== user.emailAddress;
    
    // Require current password for any profile changes
    if (isProfileChanged && !currentPassword) {
      return res.render('user/account', { 
        user, 
        error: 'Please enter password to update profile' 
      });
    }
    
    // Verify current password if provided
    if (currentPassword) {
      const validPassword = bcrypt.compareSync(currentPassword, user.password);
      if (!validPassword) {
        return res.render('user/account', { 
          user, 
          error: 'Current password is incorrect.' 
        });
      }
    }
    
    // Check if username is being changed and if it's already taken
    if (username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.render('user/account', { 
          user, 
          error: 'Username already taken. Please choose another one.' 
        });
      }
    }
    
    // Handle password change if provided
    if (newPassword) {
      // Verify password confirmation
      if (newPassword !== confirmPassword) {
        return res.render('user/account', { 
          user, 
          error: 'New passwords do not match.' 
        });
      }
      
      // Hash the new password
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      user.password = hashedPassword;
    }
    
    // Update other fields
    user.username = username;
    user.name = name;
    user.emailAddress = emailAddress;
    
    // Save the updated user
    await user.save();
    
    // Update session with new username if changed
    if (username !== req.session.user.username) {
      req.session.user.username = username;
    }
    
    res.redirect('/user/account');
  } catch (err) {
    console.error('Error updating profile:', err);
    res.render('error', { error: 'Unable to update profile' });
  }
};
