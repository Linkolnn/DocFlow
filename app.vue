<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useLanguageStore } from '~/stores/language';

const languageStore = useLanguageStore();

// Initialize stores on app load
onMounted(() => {
  const authStore = useAuthStore();
  authStore.initialize();
  
  // Инициализация языка уже происходит в плагине i18n.js
  // Здесь мы можем повторно вызвать, так как onMounted выполняется только на клиенте
  if (process.client) {
    languageStore.initLanguage();
  }
});
</script>


