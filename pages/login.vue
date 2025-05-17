<template>
  <div class="auth-page">
    <div class="container">
      <AuthForm 
        formType="login" 
        @success="onLoginSuccess" 
      />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useLanguageStore } from '~/stores/language';

definePageMeta({
  layout: 'default'
});

const authStore = useAuthStore();
const router = useRouter();

// If already authenticated, redirect to dashboard
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  }
});

function onLoginSuccess() {
  router.push('/dashboard');
}
</script>

<style lang="scss" scoped>
.auth-page {
  padding: $spacing-xxl 0;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba($primary-color, 0.05);
}
</style>
