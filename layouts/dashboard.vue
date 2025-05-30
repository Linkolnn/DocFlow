<template>
  <div class="overview-layout">
    <Header />
    <div class="overview-layout__container">
      <Sidebar />
      <main class="overview-layout__content">
        <div class="overview-layout__scroll-container">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import Header from '~/components/Header.vue';
import Sidebar from '~/components/Sidebar.vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

// Check if user is authenticated
onMounted(() => {
  if (!authStore.isAuthenticated) {
    navigateTo('/login');
  }
});
</script>

<style lang="scss" scoped>
.overview-layout {
  min-height: 100vh;
  
  &__container {
    display: flex;
    min-height: calc(100vh - 70px); // Adjust for header height
    position: relative;
    overflow: hidden;
  }
  
  &__content {
    flex: 1;
    position: relative;
    overflow-y: auto;
    height: calc(100vh - 70px);
  }
  
  &__scroll-container {
    padding: $spacing-xl;
    
    @media (max-width: $breakpoint-md) {
      padding: $spacing-lg;
    }
    
    @media (max-width: $breakpoint-sm) {
      padding: $spacing-md;
    }
  }
}
</style>
