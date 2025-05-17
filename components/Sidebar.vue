<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <button @click="toggleSidebar" class="sidebar__toggle">
      <span v-if="isOpen">✕</span>
      <span v-else>☰</span>
    </button>
    
    <nav class="sidebar__nav">
      <NuxtLink to="/dashboard" class="sidebar__item" exact-active-class="active">
        <span class="sidebar__item-icon">📊</span>
        Дашборд
      </NuxtLink>
      
      <div class="sidebar__section">Документы</div>
      <NuxtLink to="/documents" class="sidebar__item" exact-active-class="active">
        <span class="sidebar__item-icon">📄</span>
        Все документы
      </NuxtLink>
      <NuxtLink to="/documents/create" class="sidebar__item" exact-active-class="active">
        <span class="sidebar__item-icon">➕</span>
        Создать документ
      </NuxtLink>
      
      <div class="sidebar__section">Задачи</div>
      <NuxtLink to="/tasks" class="sidebar__item" exact-active-class="active">
        <span class="sidebar__item-icon">✓</span>
        Мои задачи
      </NuxtLink>
      <NuxtLink to="/tasks/create" class="sidebar__item" exact-active-class="active">
        <span class="sidebar__item-icon">➕</span>
        Создать задачу
      </NuxtLink>
      
      <div class="sidebar__section">Аналитика</div>
      <NuxtLink to="/analytics" class="sidebar__item" exact-active-class="active">
        <span class="sidebar__item-icon">📈</span>
        Отчеты
      </NuxtLink>
      
      <template v-if="isAdmin">
        <div class="sidebar__section">Администрирование</div>
        <NuxtLink to="/admin/users" class="sidebar__item" exact-active-class="active">
          <span class="sidebar__item-icon">👥</span>
          Пользователи
        </NuxtLink>
        <NuxtLink to="/admin/settings" class="sidebar__item" exact-active-class="active">
          <span class="sidebar__item-icon">⚙️</span>
          Настройки
        </NuxtLink>
      </template>
      
      <div class="sidebar__section">Профиль</div>
      <button @click="logout" class="sidebar__item sidebar__logout">
        <span class="sidebar__item-icon">🚪</span>
        Выйти
      </button>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const isOpen = ref(false);

const isAdmin = computed(() => authStore.isAdmin);

function toggleSidebar() {
  isOpen.value = !isOpen.value;
}

function logout() {
  authStore.logout();
  navigateTo('/login');
}

// Close sidebar when route changes (on mobile)
watch(() => useRoute().path, () => {
  isOpen.value = false;
});
</script>
