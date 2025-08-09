const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    const formData = new FormData();
    formData.append('fullName', userData.name);
    formData.append('email', userData.email);
    formData.append('username', userData.email.split('@')[0]); // Generate username from email
    formData.append('password', userData.password);
    
    if (userData.avatar) {
      formData.append('avatar', userData.avatar);
    }

    return this.request('/auth/register', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store tokens
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser() {
    return this.request('/auth/current-user');
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response;
  }

  // User endpoints
  async getUserProfile(username) {
    return this.request(`/users/${username}`);
  }

  async updateProfile(userData) {
    return this.request('/auth/update-account', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  // Story endpoints
  async getStories(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/stories?${queryString}`);
  }

  async createStory(storyData) {
    const formData = new FormData();
    Object.keys(storyData).forEach(key => {
      if (storyData[key] !== null && storyData[key] !== undefined) {
        formData.append(key, storyData[key]);
      }
    });

    return this.request('/stories/create', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }
}

export default new ApiService();
