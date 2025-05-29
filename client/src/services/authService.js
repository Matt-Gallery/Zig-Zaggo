// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Auth service class
class AuthService {
  constructor() {
    this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  getAccessToken() {
    return this.accessToken;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { accessToken, refreshToken, user } = await response.json();
      this.setTokens(accessToken, refreshToken);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const { accessToken, refreshToken, user } = await response.json();
      this.setTokens(accessToken, refreshToken);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      if (this.refreshToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { accessToken, refreshToken } = await response.json();
      this.setTokens(accessToken, refreshToken);
      return accessToken;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  // Utility method to handle API requests with token refresh
  async fetchWithAuth(url, options = {}) {
    try {
      // Add authorization header
      const headers = {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
      };

      const response = await fetch(url, { ...options, headers });

      // If the request was unauthorized, try to refresh the token
      if (response.status === 401) {
        try {
          await this.refreshAccessToken();
          // Retry the request with new token
          headers.Authorization = `Bearer ${this.accessToken}`;
          return await fetch(url, { ...options, headers });
        } catch (refreshError) {
          throw new Error('Authentication expired. Please login again.');
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService; 