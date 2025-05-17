<template>
  <button
    :class="[
      'btn',
      `btn-${variant}`,
      { 'btn-block': block },
      { 'btn-sm': size === 'small' },
      { 'btn-lg': size === 'large' }
    ]"
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn__loader"></span>
    <span v-else><slot /></span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<style lang="scss" scoped>
.btn {
  &-block {
    display: block;
    width: 100%;
  }
  
  &-sm {
    padding: $spacing-xs $spacing-md;
    font-size: $font-size-small;
  }
  
  &-lg {
    padding: $spacing-md $spacing-xl;
    font-size: $font-size-large;
  }
  
  &__loader {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    margin-right: $spacing-xs;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
