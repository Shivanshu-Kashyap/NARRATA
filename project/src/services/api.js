// src/services/api.js

// Read the API base URL from the environment variables.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    if (!this.baseURL) {
        console.error("VITE_API_BASE_URL is not set. Please check your .env file.");
    }
  }

  /**
   * A generic request handler for JSON-based API calls.
   * It automatically adds the auth token and handles JSON responses.
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'An unknown error occurred');
      }
      return responseData.data; 
    } catch (error) {
      console.error(`API Error on endpoint ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * A specialized request handler for API calls involving file uploads (FormData).
   * It intentionally does NOT set the 'Content-Type' header, allowing the browser to set it.
   */
  async multipartRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        // NO 'Content-Type' here. The browser will add it automatically.
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'An unknown error occurred');
      }
      return responseData.data; 
    } catch (error) {
      console.error(`API Error on multipart endpoint ${endpoint}:`, error);
      throw error;
    }
  }

  // --- AUTHENTICATION ENDPOINTS ---

  async register(userData) {
    const formData = new FormData();
    formData.append('fullName', userData.name);
    formData.append('email', userData.email);
    formData.append('username', userData.email.split('@')[0]); 
    formData.append('password', userData.password);
    
    if (userData.avatar) {
      formData.append('avatar', userData.avatar);
    }

    // **FIX:** Use the dedicated multipartRequest for file uploads.
    return this.multipartRequest('/auth/register', {
      method: 'POST',
      body: formData,
    });
  }

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.clear();
    }
  }

  async getCurrentUser() {
    return this.request('/auth/current-user');
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    const data = await this.request('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    return data;
  }

  // --- USER ENDPOINTS ---
  async getUserProfile(username) {
    return this.request(`/users/${username}`);
  }

  async updateProfile(userData) {
    return this.request('/users/account/update-details', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

async updateUserAvatar(formData) {
    return this.multipartRequest('/users/account/update-avatar', {
      method: 'PATCH',
      body: formData,
    });
  }

  // --- STORY ENDPOINTS ---
  async getAllStories(params) {
    const queryString = params ? `?${params.toString()}` : '';
    return this.request(`/stories${queryString}`);
  }

  async getStoryBySlug(slug) {
    return this.request(`/stories/${slug}`);
  }

  async createStory(formData) {
    // **FIX:** Use the dedicated multipartRequest for file uploads.
    return this.multipartRequest('/stories/create', {
      method: 'POST',
      body: formData,
    });
  }

// **NEW:** Method to update an existing story
  async updateStory(storyId, formData) {
    return this.multipartRequest(`/stories/${storyId}`, {
      method: 'PATCH',
      body: formData,
    });
  }

  // **NEW:** Method to delete a story
  async deleteStory(storyId) {
    return this.request(`/stories/${storyId}`, {
      method: 'DELETE',
    });
  }

// **NEW:** Method to like a story
  async likeStory(storyId) {
    return this.request(`/stories/${storyId}/like`, { method: 'POST' });
  }
  // **NEW:** Method to dislike a story
  async dislikeStory(storyId) {
    return this.request(`/stories/${storyId}/dislike`, { method: 'POST' });
  }


  // --- COMMENT ENDPOINTS ---
  async getStoryComments(storyId) {
    return this.request(`/comments/story/${storyId}`);
  }

  async createComment(commentData) {
    return this.request('/comments/create', {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

// Method to fetch the leaderboard data
  async getLeaderboard(params) {
    const queryString = params ? `?${params.toString()}` : '';
    return this.request(`/leaderboard${queryString}`);
  }

}



export default new ApiService();
