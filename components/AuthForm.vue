<template>
  <div class="auth-form">
    <div class="auth-form__header">
      <h1 class="auth-form__header-title">{{ title }}</h1>
      <p class="auth-form__header-subtitle">{{ subtitle }}</p>
    </div>
    
    <ErrorMessage 
      v-if="error" 
      :message="error" 
      dismissible 
      @dismiss="clearError" 
    />
    
    <form @submit.prevent="handleSubmit">
      <InputField
        v-if="formType === 'register'"
        v-model="form.firstName"
        :label="$t('firstName')"
        required
        :error="errors.firstName"
        @blur="validateField('firstName')"
      />
      
      <InputField
        v-if="formType === 'register'"
        v-model="form.lastName"
        :label="$t('lastName')"
        required
        :error="errors.lastName"
        @blur="validateField('lastName')"
      />
      
      <InputField
        v-model="form.email"
        :label="$t('email')"
        type="email"
        required
        :error="errors.email"
        @blur="validateField('email')"
      />
      
      <InputField
        v-model="form.password"
        :label="$t('password')"
        type="password"
        required
        :error="errors.password"
        @blur="validateField('password')"
      />
      
      <InputField
        v-if="formType === 'register'"
        v-model="form.confirmPassword"
        :label="$t('confirmPassword')"
        type="password"
        required
        :error="errors.confirmPassword"
        @blur="validateField('confirmPassword')"
      />
      
      <InputField
        v-if="formType === 'register'"
        v-model="form.position"
        :label="$t('position')"
        :error="errors.position"
        @blur="validateField('position')"
      />
      
      <InputField
        v-if="formType === 'register'"
        v-model="form.department"
        :label="$t('department')"
        :error="errors.department"
        @blur="validateField('department')"
      />
      
      <InputField
        v-if="formType === 'register'"
        v-model="form.company"
        :label="$t('company')"
        :error="errors.company"
        @blur="validateField('company')"
      />
      
      <Button 
        type="submit" 
        :loading="loading" 
        block
        class="auth-form__submit"
      >
        {{ submitButtonText }}
      </Button>
    </form>
    
    <div class="auth-form__footer">
      <p v-if="formType === 'login'">
        {{ $t('dontHaveAccount') }} <NuxtLink to="/register">{{ $t('register') }}</NuxtLink>
      </p>
      <p v-else>
        {{ $t('alreadyHaveAccount') }} <NuxtLink to="/login">{{ $t('login') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useLanguageStore } from '~/stores/language';
import { useAuthStore } from '~/stores/auth';

const props = defineProps({
  formType: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value)
  }
});

const emit = defineEmits(['success']);

const authStore = useAuthStore();
const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  position: '',
  department: '',
  company: ''
});

const errors = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  position: '',
  department: '',
  company: ''
});

const languageStore = useLanguageStore();
const $t = (key) => languageStore.t(key);

const title = computed(() => props.formType === 'login' ? $t('welcomeBack') : $t('createAccount'));
const subtitle = computed(() => props.formType === 'login' ? $t('signInToAccount') : $t('joinDocFlow'));
const submitButtonText = computed(() => props.formType === 'login' ? $t('signIn') : $t('createAccount'));

function validateField(field) {
  errors.value[field] = '';
  
  switch (field) {
    case 'firstName':
    case 'lastName':
      if (props.formType === 'register' && !form.value[field]) {
        errors.value[field] = $t('fieldRequired').replace('{field}', $t(field));
      }
      break;
      
    case 'email':
      if (!form.value.email) {
        errors.value.email = $t('fieldRequired').replace('{field}', $t('email'));
      } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
        errors.value.email = $t('validEmail');
      }
      break;
      
    case 'password':
      if (!form.value.password) {
        errors.value.password = $t('fieldRequired').replace('{field}', $t('password'));
      } else if (props.formType === 'register' && form.value.password.length < 8) {
        errors.value.password = $t('passwordLength');
      }
      break;
      
    case 'confirmPassword':
      if (props.formType === 'register') {
        if (!form.value.confirmPassword) {
          errors.value.confirmPassword = $t('pleaseConfirmPassword');
        } else if (form.value.confirmPassword !== form.value.password) {
          errors.value.confirmPassword = $t('passwordsDoNotMatch');
        }
      }
      break;
  }
}

function validateForm() {
  // Валидируем все поля в зависимости от типа формы
  if (props.formType === 'login') {
    validateField('email');
    validateField('password');
  } else {
    validateField('firstName');
    validateField('lastName');
    validateField('email');
    validateField('password');
    validateField('confirmPassword');
    validateField('position');
    validateField('department');
    validateField('company');
  }
  
  // Проверяем, есть ли ошибки
  return !Object.values(errors.value).some(error => error);
}

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }
  
  let success = false;
  
  if (props.formType === 'login') {
    success = await authStore.login(form.value.email, form.value.password);
  } else {
    success = await authStore.register({
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      email: form.value.email,
      password: form.value.password,
      position: form.value.position,
      department: form.value.department,
      company: form.value.company
    });
  }
  
  if (success) {
    emit('success');
  }
}

function clearError() {
  authStore.clearError();
}
</script>
