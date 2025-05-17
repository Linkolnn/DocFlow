import { defineStore } from 'pinia';
import Cookies from 'js-cookie';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),
  
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    userFullName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
  },
  
  actions: {
    async initialize() {
      try {
        // Get token from secure cookie
        const token = Cookies.get('auth_token');
        
        if (token) {
          this.token = token;
          await this.fetchUserProfile();
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        this.logout();
      }
    },
    
    async login(email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate authentication with localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (!user || user.password !== password) {
          throw new Error('Invalid email or password');
        }
        
        // Remove password from user object before storing in state
        const { password: _, ...userWithoutPassword } = user;
        
        this.user = userWithoutPassword;
        this.token = 'simulated-jwt-token-' + Math.random().toString(36).substring(2);
        this.isAuthenticated = true;
        
        // Store token in secure cookie (httpOnly should be true in production)
        Cookies.set('auth_token', this.token, { 
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        return true;
      } catch (error) {
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate registration with localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already exists
        if (users.some(user => user.email === userData.email)) {
          throw new Error('Email already in use');
        }
        
        // Add user to "database"
        const newUser = {
          id: Date.now().toString(),
          ...userData,
          role: 'user', // Default role
          createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login after registration
        return await this.login(userData.email, userData.password);
      } catch (error) {
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchUserProfile() {
      if (!this.token) return false;
      
      this.loading = true;
      
      try {
        // In a real app, this would be an API call using the token
        // For now, we'll simulate it with localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Find user by simulated token (in real app, would decode JWT)
        // This is just for demonstration
        const user = users[0]; // Just get first user for demo
        
        if (!user) {
          throw new Error('User not found');
        }
        
        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;
        
        this.user = userWithoutPassword;
        this.isAuthenticated = true;
        
        return true;
      } catch (error) {
        this.error = error.message;
        this.logout();
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      
      // Remove token from cookies
      Cookies.remove('auth_token');
    },
    
    clearError() {
      this.error = null;
    }
  }
});
