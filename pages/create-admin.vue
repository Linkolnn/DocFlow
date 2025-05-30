<template>
  <div class="create-admin">
    <div class="create-admin__container">
      <h1 class="create-admin__title">Создание администратора</h1>
      
      <div v-if="success" class="create-admin__success">
        <p>Администратор успешно создан!</p>
        <div class="create-admin__credentials">
          <p><strong>Email:</strong> {{ adminEmail }}</p>
          <p><strong>Пароль:</strong> {{ adminPassword }}</p>
        </div>
        <Button @click="navigateTo('/login')" variant="primary">
          Перейти к входу
        </Button>
      </div>
      
      <form v-else @submit.prevent="createAdmin" class="create-admin__form">
        <div class="form-group">
          <label for="firstName" class="form-label">Имя</label>
          <input 
            type="text" 
            id="firstName" 
            v-model="firstName" 
            class="form-control" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="lastName" class="form-label">Фамилия</label>
          <input 
            type="text" 
            id="lastName" 
            v-model="lastName" 
            class="form-control" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            class="form-control" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Пароль</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            class="form-control" 
            required
            minlength="6"
          />
        </div>
        
        <div class="form-actions">
          <Button type="submit" variant="primary" :loading="loading">
            Создать администратора
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

definePageMeta({
  layout: 'default'
});

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const success = ref(false);
const adminEmail = ref('');
const adminPassword = ref('');

async function createAdmin() {
  loading.value = true;
  
  try {
    // Получаем существующих пользователей
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Проверяем, существует ли уже пользователь с таким email
    if (users.some(user => user.email === email.value)) {
      alert('Пользователь с таким email уже существует');
      return;
    }
    
    // Создаем нового администратора
    const admin = {
      id: Date.now().toString(),
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    
    // Добавляем администратора в список пользователей
    users.push(admin);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Сохраняем учетные данные для отображения
    adminEmail.value = email.value;
    adminPassword.value = password.value;
    
    // Показываем сообщение об успехе
    success.value = true;
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
    alert('Произошла ошибка при создании администратора');
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.create-admin {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: $light-color;
  
  &__container {
    width: 100%;
    max-width: 500px;
    padding: $spacing-xl;
    background-color: white;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-md;
  }
  
  &__title {
    text-align: center;
    margin-bottom: $spacing-lg;
  }
  
  &__form {
    .form-group {
      margin-bottom: $spacing-md;
    }
    
    .form-actions {
      margin-top: $spacing-lg;
      display: flex;
      justify-content: center;
    }
  }
  
  &__success {
    text-align: center;
    
    p {
      margin-bottom: $spacing-md;
    }
  }
  
  &__credentials {
    background-color: $light-color;
    border-radius: $border-radius-md;
    padding: $spacing-md;
    margin-bottom: $spacing-lg;
    text-align: left;
    
    p {
      margin-bottom: $spacing-sm;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
