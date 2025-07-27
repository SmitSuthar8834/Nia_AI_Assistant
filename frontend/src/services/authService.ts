import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: {
      id: string;
      name: string;
      permissions: string[];
    };
    isActive: boolean;
  };
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Mock authentication for testing UI
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    if (email === 'admin@nia.ai' && password === 'admin123') {
      const mockResponse: LoginResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '1',
          email: 'admin@nia.ai',
          firstName: 'Admin',
          lastName: 'User',
          role: {
            id: '1',
            name: 'admin',
            permissions: ['admin', 'user_management', 'system_config', 'analytics']
          },
          isActive: true
        }
      };
      return mockResponse;
    } else if (email === 'user@nia.ai' && password === 'user123') {
      const mockResponse: LoginResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '2',
          email: 'user@nia.ai',
          firstName: 'Test',
          lastName: 'User',
          role: {
            id: '2',
            name: 'sales_rep',
            permissions: ['voice_assistant', 'crm_access', 'task_management']
          },
          isActive: true
        }
      };
      return mockResponse;
    } else {
      throw new Error('Invalid credentials');
    }
  },

  async register(userData: RegisterData): Promise<LoginResponse> {
    // Mock registration for testing UI
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const mockResponse: LoginResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: {
          id: '2',
          name: 'sales_rep',
          permissions: ['voice_assistant', 'crm_access']
        },
        isActive: true
      }
    };
    return mockResponse;
  },

  async getCurrentUser() {
    // Mock current user for testing UI
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found');
    }
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    return {
      id: '1',
      email: 'admin@nia.ai',
      firstName: 'Admin',
      lastName: 'User',
      role: {
        id: '1',
        name: 'admin',
        permissions: ['admin', 'user_management', 'system_config', 'analytics']
      },
      isActive: true
    };
  },

  async forgotPassword(email: string): Promise<void> {
    // Mock forgot password for testing UI
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    console.log(`Mock: Password reset email sent to ${email}`);
  },

  async resetPassword(token: string, password: string): Promise<void> {
    // Mock reset password for testing UI
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    console.log(`Mock: Password reset for token ${token}`);
  },

  logout(): void {
    localStorage.removeItem('authToken');
  },
};