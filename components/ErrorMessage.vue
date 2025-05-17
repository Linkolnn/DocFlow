<template>
  <div v-if="message" class="error-message" :class="{ 'error-message--inline': inline }">
    <div class="error-message__icon">⚠️</div>
    <div class="error-message__content">{{ message }}</div>
    <button v-if="dismissible" @click="$emit('dismiss')" class="error-message__close">×</button>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  },
  inline: {
    type: Boolean,
    default: false
  },
  dismissible: {
    type: Boolean,
    default: false
  }
});

defineEmits(['dismiss']);
</script>

<style lang="scss" scoped>
.error-message {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  background-color: rgba($error-color, 0.1);
  border-left: 4px solid $error-color;
  border-radius: $border-radius-sm;
  margin-bottom: $spacing-md;
  
  &--inline {
    padding: $spacing-xs;
    margin-top: $spacing-xs;
    font-size: $font-size-small;
  }
  
  &__icon {
    margin-right: $spacing-sm;
  }
  
  &__content {
    flex: 1;
    color: $error-color;
  }
  
  &__close {
    background: none;
    border: none;
    color: $error-color;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    margin-left: $spacing-sm;
    line-height: 1;
  }
}
</style>
