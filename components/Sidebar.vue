<template>
  <div class="sidebar-container">
    <!-- Полупрозрачный оверлей для мобильной версии -->
    <div 
      v-if="isSidebarOpen" 
      class="sidebar-overlay" 
      @click="toggleSidebar"
      :class="{ 'sidebar-overlay--active': isSidebarOpen }"
    ></div>
    
    <aside class="sidebar" :class="{ 'sidebar--open': isSidebarOpen }">
    <nav class="sidebar__nav">
      <NuxtLink to="/dashboard" class="sidebar__item" exact-active-class="active">
        <span class="sidebar__item-icon">📊</span>
        Информационная панель
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
        <NuxtLink to="/admin/tasks" class="sidebar__item" exact-active-class="active">
          <span class="sidebar__item-icon">📋</span>
          Управление задачами
        </NuxtLink>
        <NuxtLink to="/admin/users" class="sidebar__item" exact-active-class="active">
          <span class="sidebar__item-icon">👥</span>
          Пользователи
        </NuxtLink>
      </template>
      
      <div class="sidebar__section">Профиль</div>
      <button @click="logout" class="sidebar__item sidebar__logout">
        <span class="sidebar__item-icon">🚪</span>
        Выйти
      </button>
    </nav>
  </aside>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useUIStore } from '~/stores/ui';

const authStore = useAuthStore();
const uiStore = useUIStore();

const isAdmin = computed(() => authStore.isAdmin);
const isSidebarOpen = computed(() => uiStore.isSidebarOpen);

// Функция переключения боковой панели
function toggleSidebar() {
  uiStore.toggleSidebar();
}

// Закрытие меню при нажатии ESC
function handleEscKey(event) {
  if (event.key === 'Escape' && isSidebarOpen.value) {
    uiStore.closeSidebar();
  }
}

function logout() {
  authStore.logout();
  navigateTo('/login');
}

// Закрытие меню при изменении маршрута
watch(() => useRoute().path, () => {
  if (isSidebarOpen.value) {
    uiStore.closeSidebar();
  }
});

// Добавление обработчика клавиши ESC
onMounted(() => {
  document.addEventListener('keydown', handleEscKey);
});

// Удаление обработчика при уничтожении компонента
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey);
});
</script>

<style lang="scss" scoped>
.sidebar-container {
  position: relative;
  height: 100%;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1024; /* z-index-modal-backdrop */
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  &--active {
    opacity: 1;
    visibility: visible;
  }
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 280px;
  background-color: white;
  box-shadow: $shadow-md;
  z-index: 1030; /* z-index-fixed */
  padding: $spacing-md;
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  
  &--open {
    transform: translateX(0);
  }
  
  &__toggle {
    position: absolute;
    top: $spacing-md;
    right: -48px;
    width: 40px;
    height: 40px;
    border-radius: 0 $border-radius-md $border-radius-md 0;
    background-color: $primary-color;
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.25rem;
    box-shadow: $shadow-sm;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: darken($primary-color, 10%);
    }
  }
  
  &__nav {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }
  
  &__section {
    font-size: $font-size-small;
    color: #777777; /* Вторичный цвет текста */
    font-weight: $font-weight-bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: $spacing-md 0 $spacing-xs;
    padding-bottom: $spacing-xs;
    border-bottom: 1px solid $border-color;
  }
  
  &__item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius-md;
    color: $text-color;
    text-decoration: none;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: rgba($primary-color, 0.05);
    }
    
    &.active {
      background-color: rgba($primary-color, 0.1);
      color: $primary-color;
      font-weight: $font-weight-medium;
    }
  }
  
  &__item-icon {
    font-size: 1.25rem;
    width: 24px;
    text-align: center;
  }
  
  &__logout {
    margin-top: auto;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: inherit;
    font-family: inherit;
    
    &:hover {
      color: $error-color;
    }
  }
  
  @media (min-width: $breakpoint-lg) {
    position: sticky;
    top: 0;
    transform: translateX(0);
    height: 100vh;
    
    &__toggle {
      display: none;
    }
  }
}
</style>
