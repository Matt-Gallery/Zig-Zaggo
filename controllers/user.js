// ChatGPT and Cursor used extensively throughout

// controllers/user.js
import User from '../models/user.js';
import bcrypt from 'bcryptjs';

/**
 * GET /account
 * Get account page data for signed-in user
 */
export const getAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Error fetching account:', err);
    res.status(500).json({ error: 'Unable to load account data' });
  }
};

/**
 * POST /update-profile
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, name, emailAddress, currentPassword, newPassword, confirmPassword } = req.body;
    
    // Get the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if any profile information is being changed
    const isProfileChanged = username !== user.username || 
                            name !== user.name || 
                            emailAddress !== user.emailAddress;
    
    // Require current password for any profile changes
    if (isProfileChanged && !currentPassword) {
      return res.status(400).json({ error: 'Please enter password to update profile' });
    }
    
    // Verify current password if provided
    if (currentPassword) {
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }
    
    // Check if username is being changed and if it's already taken
    if (username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken. Please choose another one.' });
      }
    }
    
    // Handle password change if provided
    if (newPassword) {
      // Verify password confirmation
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
      }
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }
    
    // Update other fields
    user.username = username;
    user.name = name;
    user.emailAddress = emailAddress;
    
    // Save the updated user
    await user.save();
    
    // Return the updated user without password
    const updatedUser = await User.findById(userId).select('-password');
    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Unable to update profile' });
  }
};

/**
 * POST /delete-account
 * Delete user account
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;
    
    // Get the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify password
    if (!password) {
      return res.status(400).json({ error: 'Please enter your password to delete your account' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Password is incorrect. Cannot delete account.' });
    }
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ error: 'Unable to delete account. Please try again.' });
  }
};
