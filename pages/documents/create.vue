<template>
  <div class="document-form-page">
    <div class="document-form-page__header">
      <h1 class="document-form-page__title">Создать документ</h1>
      <Button @click="router.back()" variant="outline">Назад</Button>
    </div>
    
    <div class="document-form">
      <ErrorMessage 
        v-if="error" 
        :message="error" 
        dismissible 
        @dismiss="error = ''" 
      />
      
      <div class="form-group">
        <label for="title" class="form-label">Название документа <span class="required">*</span></label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.title }"
          required
        />
        <div v-if="errors.title" class="form-error">{{ errors.title }}</div>
      </div>
      
      <div class="form-group">
        <label for="type" class="form-label">Тип документа <span class="required">*</span></label>
        <select
          id="type"
          v-model="form.type"
          class="form-control"
          :class="{ 'is-invalid': errors.type }"
          required
        >
          <option value="">Выберите тип документа</option>
          <option value="contract">Договор</option>
          <option value="invoice">Счет</option>
          <option value="report">Отчет</option>
          <option value="proposal">Предложение</option>
          <option value="other">Другое</option>
        </select>
        <div v-if="errors.type" class="form-error">{{ errors.type }}</div>
      </div>
      
      <div class="form-group">
        <label for="description" class="form-label">Описание</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-control"
          rows="4"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="content" class="form-label">Содержание документа <span class="required">*</span></label>
        <textarea
          id="content"
          v-model="form.content"
          class="form-control"
          :class="{ 'is-invalid': errors.content }"
          rows="10"
          required
        ></textarea>
        <div v-if="errors.content" class="form-error">{{ errors.content }}</div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Статус</label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" v-model="form.status" value="draft" />
            <span>Черновик</span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="form.status" value="pending" />
            <span>Отправить на утверждение</span>
          </label>
        </div>
      </div>
      
      <div class="form-actions">
        <Button @click="router.back()" variant="outline">Отмена</Button>
        <Button @click="saveDocument" :loading="loading">Сохранить документ</Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useDocumentsStore } from '~/stores/documents';

definePageMeta({
  layout: 'dashboard'
});

const documentsStore = useDocumentsStore();
const router = useRouter();

const loading = ref(false);
const error = ref('');
const errors = reactive({
  title: '',
  type: '',
  content: ''
});

const form = reactive({
  title: '',
  type: '',
  description: '',
  content: '',
  status: 'draft'
});

function validateForm() {
  let isValid = true;
  
  // Reset errors
  errors.title = '';
  errors.type = '';
  errors.content = '';
  
  // Validate title
  if (!form.title.trim()) {
    errors.title = 'Название документа обязательно';
    isValid = false;
  }
  
  // Validate type
  if (!form.type) {
    errors.type = 'Тип документа обязателен';
    isValid = false;
  }
  
  // Validate content
  if (!form.content.trim()) {
    errors.content = 'Содержание документа обязательно';
    isValid = false;
  }
  
  return isValid;
}

async function saveDocument() {
  if (!validateForm()) {
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const newDocument = await documentsStore.createDocument({
      title: form.title,
      type: form.type,
      description: form.description,
      content: form.content,
      status: form.status
    });
    
    if (newDocument) {
      router.push(`/documents/${newDocument.id}`);
    } else {
      error.value = 'Не удалось создать документ';
    }
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при создании документа';
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.document-form-page {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
  }
  
  &__title {
    margin: 0;
  }
}

.document-form {
  background-color: white;
  border-radius: $border-radius-md;
  padding: $spacing-lg;
  box-shadow: $shadow-sm;
}

.form-group {
  margin-bottom: $spacing-md;
}

.form-label {
  display: block;
  margin-bottom: $spacing-xs;
  font-weight: $font-weight-medium;
  
  .required {
    color: $error-color;
  }
}

.form-control {
  width: 100%;
  padding: $spacing-sm;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  font-family: $font-family-primary;
  font-size: $font-size-base;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
  }
  
  &.is-invalid {
    border-color: $error-color;
  }
}

.form-error {
  color: $error-color;
  font-size: $font-size-small;
  margin-top: $spacing-xs;
}

.radio-group {
  display: flex;
  gap: $spacing-md;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  
  input {
    margin-right: $spacing-xs;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  margin-top: $spacing-lg;
}
</style>
