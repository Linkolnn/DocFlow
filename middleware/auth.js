// Middleware для проверки аутентификации
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  // Проверяем, аутентифицирован ли пользователь
  if (!authStore.isAuthenticated) {
    // Если нет, перенаправляем на страницу входа
    return navigateTo('/login');
  }
});
