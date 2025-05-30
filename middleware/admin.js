import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  // Проверяем, является ли пользователь администратором
  if (!authStore.isAdmin) {
    // Если нет, перенаправляем на страницу доступа запрещен
    return navigateTo('/access-denied');
  }
});
