<template>
  <div class="app-layout">
    <Header />
    <main class="app-layout__content">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '~/components/Header.vue';
import Footer from '~/components/Footer.vue';
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  
  &__content {
    flex: 1;
    padding: $spacing-xl 0;
  }
}
</style>
