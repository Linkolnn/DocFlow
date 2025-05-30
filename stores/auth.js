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
        // Получаем токен из cookie
        const token = Cookies.get('auth_token');
        
        // Инициализация данных пользователей из JSON файла, если localStorage пуст
        await this.initializeUsersFromJson();
        
        // Если есть токен, пытаемся автоматически войти
        if (token) {
          this.token = token;
          await this.fetchUserProfile();
        }
      } catch (error) {
        console.error('Ошибка инициализации аутентификации:', error);
        this.logout();
      }
    },
    
    async initializeUsersFromJson() {
      try {
        // Проверяем, есть ли уже пользователи в localStorage
        const users = localStorage.getItem('users');
        
        if (!users || JSON.parse(users).length === 0) {
          // Импортируем данные аккаунтов из JSON файла
          const accounts = await import('~/data/accounts.json');
          localStorage.setItem('users', JSON.stringify(accounts.default));
          console.log('Аккаунты успешно инициализированы из JSON файла');
        }
        
        return true;
      } catch (error) {
        console.error('Ошибка при инициализации пользователей:', error);
        return false;
      }
    },
    
    async login(email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        // В реальном приложении это был бы API-запрос
        // Для демонстрации используем localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (!user || user.password !== password) {
          throw new Error('Неверный email или пароль');
        }
        
        // Remove password from user object before storing in state
        const { password: _, ...userWithoutPassword } = user;
        
        this.user = userWithoutPassword;
        this.token = `simulated-jwt-token-${userWithoutPassword.id}-${Math.random().toString(36).substring(2)}`;
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
        // Сначала убедимся, что данные пользователей инициализированы
        await this.initializeUsersFromJson();
        
        // Загружаем текущих пользователей
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Проверяем, не занят ли email
        if (users.some(user => user.email === userData.email)) {
          throw new Error('Этот email уже используется');
        }
        
        // Создаем нового пользователя
        const newUser = {
          id: Date.now().toString(),
          ...userData,
          role: 'user', // Роль по умолчанию - обычный пользователь
          position: userData.position || 'Сотрудник',
          department: userData.department || 'Общий отдел',
          avatar: userData.avatar || null,
          createdAt: new Date().toISOString()
        };
        
        // Добавляем пользователя в базу данных
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Автоматический вход после регистрации
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
        // В реальном приложении это был бы API-запрос с использованием токена
        // Для демонстрации используем localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Извлекаем идентификатор пользователя из токена
        // Формат токена: 'simulated-jwt-token-{userId}-{random}'
        const tokenParts = this.token.split('-');
        const userId = tokenParts.length >= 4 ? tokenParts[3] : null;
        
        // Находим пользователя по ID или по email
        let user = null;
        if (userId) {
          user = users.find(u => u.id === userId);
        }
        
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
