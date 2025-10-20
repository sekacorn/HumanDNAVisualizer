import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/auth';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('jwt_token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // Register new user
  async register(username, email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        username,
        email,
        password,
        roles: ['USER'] // Default role
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  // Login user
  async login(username, password, totpCode = null) {
    try {
      const loginData = { username, password };
      if (totpCode) {
        loginData.totpCode = totpCode;
      }

      const response = await axios.post(`${API_BASE_URL}/login`, loginData);

      if (response.data.token) {
        this.token = response.data.token;
        this.user = response.data.user;

        localStorage.setItem('jwt_token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));

        // Set default Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;

        return { success: true, data: response.data };
      } else if (response.data.mfaRequired) {
        return { success: false, mfaRequired: true };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  }

  // Logout user
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get JWT token
  getToken() {
    return this.token;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user?.roles?.includes(role) || false;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('ADMIN');
  }

  // Check if user is moderator or admin
  isModerator() {
    return this.hasRole('MODERATOR') || this.hasRole('ADMIN');
  }

  // Setup MFA
  async setupMFA() {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mfa/setup`,
        {},
        {
          headers: { Authorization: `Bearer ${this.token}` }
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'MFA setup failed'
      };
    }
  }

  // Enable MFA
  async enableMFA(totpCode) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mfa/enable`,
        { totpCode },
        {
          headers: { Authorization: `Bearer ${this.token}` }
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'MFA enable failed'
      };
    }
  }

  // Disable MFA
  async disableMFA(totpCode) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mfa/disable`,
        { totpCode },
        {
          headers: { Authorization: `Bearer ${this.token}` }
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'MFA disable failed'
      };
    }
  }

  // Verify token validity
  async verifyToken() {
    if (!this.token) return false;

    try {
      const response = await axios.get(`${API_BASE_URL}/verify`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return response.data.valid === true;
    } catch (error) {
      this.logout();
      return false;
    }
  }
}

// Export singleton instance
const authService = new AuthService();

// Set default Authorization header if token exists
if (authService.getToken()) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${authService.getToken()}`;
}

export default authService;
