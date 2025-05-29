import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
  }, [isAuthenticated, navigate]);

  const fetchUserProfile = async () => {
    try {
      const response = await authService.fetchWithAuth('/api/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const data = await response.json();
      setUser(data);
      setFormData(prev => ({
        ...prev,
        name: data.name,
        email: data.email,
      }));
    } catch (err) {
      setError('Failed to load profile. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    // Validate password fields if attempting to change password
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        setLoading(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        setLoading(false);
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        setLoading(false);
        return;
      }
    }

    // Only send password fields if attempting to change password
    const updateData = {
      name: formData.name,
      email: formData.email,
      ...(formData.newPassword && {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })
    };
    
    try {
      const response = await authService.fetchWithAuth('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      setUser(data.user);
      setSuccessMessage(data.message);
      setEditMode(false);
      
      // Clear sensitive form data
      setFormData(prev => ({
        ...prev,
        name: data.user.name,
        email: data.user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await authService.fetchWithAuth('/api/profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete account');
      }

      authService.clearTokens();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to delete account. Please try again.');
      console.error(err);
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (!user) return <div className="profile-error">No user data found.</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>User Profile</h1>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        {editMode ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="username email"
              />
            </div>

            <div className="password-section">
              <h3>Change Password</h3>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>
            
            <div className="button-group">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setEditMode(false);
                  setError('');
                  setSuccessMessage('');
                  setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  }));
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <label>Name</label>
              <p>{user.name}</p>
            </div>
            
            <div className="info-group">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            
            <div className="info-group">
              <label>Member Since</label>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div className="button-group">
              <button onClick={() => setEditMode(true)} className="btn-primary">
                Edit Profile
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="btn-danger"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Delete Account</h2>
              <p>This action cannot be undone. Please enter your password to confirm.</p>
              
              <div className="form-group">
                <label htmlFor="deletePassword">Password</label>
                <input
                  type="password"
                  id="deletePassword"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="button-group">
                <button 
                  onClick={handleDeleteAccount}
                  className="btn-danger"
                  disabled={!deletePassword}
                >
                  Delete Account
                </button>
                <button 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                    setError('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 