<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="form-label__required">*</span>
    </label>
    
    <div class="input-wrapper">
      <input
        v-if="type !== 'textarea'"
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :class="['form-control', { 'is-invalid': error }]"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
      />
      
      <textarea
        v-else
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :rows="rows"
        :class="['form-control', { 'is-invalid': error }]"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
      ></textarea>
    </div>
    
    <div v-if="error" class="form-error">{{ error }}</div>
    <div v-if="hint" class="form-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 3
  },
  id: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue', 'blur']);

// Generate a deterministic ID based on the label and type
// This ensures the same ID is generated on both server and client
const id = computed(() => {
  if (props.id) return props.id;
  
  // Create a deterministic ID based on the label and type
  // This will be consistent between server and client
  const baseStr = `${props.label || 'input'}-${props.type || 'text'}`;
  const hash = baseStr
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  return `field-${hash}`;
});
</script>

<style lang="scss" scoped>
.form-label {
  display: block;
  margin-bottom: $spacing-xs;
  font-weight: $font-weight-medium;
  
  &__required {
    color: $error-color;
    margin-left: 2px;
  }
}

.input-wrapper {
  position: relative;
}

.form-control {
  width: 100%;
  padding: $spacing-sm;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  font-family: $font-family-primary;
  font-size: $font-size-base;
  transition: border-color $transition-fast;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
  }
  
  &.is-invalid {
    border-color: $error-color;
  }
  
  &:disabled {
    background-color: rgba($border-color, 0.3);
    cursor: not-allowed;
  }
}

.form-error {
  color: $error-color;
  font-size: $font-size-small;
  margin-top: $spacing-xs;
}

.form-hint {
  color: rgba($text-color, 0.7);
  font-size: $font-size-small;
  margin-top: $spacing-xs;
}
</style>
