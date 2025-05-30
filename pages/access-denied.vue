<template>
  <div class="access-denied">
    <div class="access-denied__container">
      <div class="access-denied__icon">🔒</div>
      <h1 class="access-denied__title">Доступ запрещен</h1>
      <p class="access-denied__message">
        У вас недостаточно прав для доступа к запрошенной странице.
      </p>
      <div class="access-denied__actions">
        <Button @click="navigateTo('/dashboard')" variant="primary">
          Вернуться на главную
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
});
</script>

<style lang="scss" scoped>
.access-denied {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: $light-color;
  
  &__container {
    max-width: 500px;
    padding: $spacing-xl;
    background-color: white;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-md;
    text-align: center;
  }
  
  &__icon {
    font-size: 4rem;
    margin-bottom: $spacing-md;
  }
  
  &__title {
    color: $error-color;
    margin-bottom: $spacing-md;
  }
  
  &__message {
    margin-bottom: $spacing-lg;
    color: #777777; /* Вторичный цвет текста */
  }
  
  &__actions {
    display: flex;
    justify-content: center;
  }
}
</style>
