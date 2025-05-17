<template>
  <header class="header">
    <div class="container header__container">
      <NuxtLink to="/" class="header__logo">DocFlow</NuxtLink>
      
      <nav class="header__nav" :class="{ open: isMenuOpen }">
        <NuxtLink to="/" class="header__nav-item">Главная</NuxtLink>
        <NuxtLink v-if="isAuthenticated" to="/dashboard" class="header__nav-item">Дашборд</NuxtLink>
        <NuxtLink v-if="isAuthenticated" to="/documents" class="header__nav-item">Документы</NuxtLink>
        <NuxtLink v-if="isAuthenticated" to="/analytics" class="header__nav-item">Аналитика</NuxtLink>
        <NuxtLink v-if="isAdmin" to="/admin" class="header__nav-item">Админ</NuxtLink>
      </nav>
      
      <div class="header__auth">
        <template v-if="isAuthenticated">
          <div class="header__user">{{ userFullName }}</div>
          <button @click="logout" class="btn btn-outline">Выйти</button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="btn btn-outline">Войти</NuxtLink>
          <NuxtLink to="/register" class="btn btn-primary">Регистрация</NuxtLink>
        </template>
      </div>
      
      <button @click="toggleMenu" class="header__mobile-toggle">
        <span v-if="isMenuOpen">✕</span>
        <span v-else>☰</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const isMenuOpen = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);
const userFullName = computed(() => authStore.userFullName);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function logout() {
  authStore.logout();
  navigateTo('/');
}
</script>
