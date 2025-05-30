<template>
  <div class="admin-users">
    <div class="admin-users__header">
      <h1 class="admin-users__title">Управление пользователями</h1>
      <Button @click="showAddUserModal = true" variant="primary">
        Добавить пользователя
      </Button>
    </div>
    
    <div class="admin-users__filters">
      <div class="filter-group">
        <label for="role-filter">Роль:</label>
        <select id="role-filter" v-model="filters.role" class="form-select">
          <option value="">Все</option>
          <option value="admin">Администратор</option>
          <option value="user">Пользователь</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="department-filter">Отдел:</label>
        <select id="department-filter" v-model="filters.department" class="form-select">
          <option value="">Все</option>
          <option v-for="department in departments" :key="department" :value="department">
            {{ department }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="search-filter">Поиск:</label>
        <input 
          type="text" 
          id="search-filter" 
          v-model="filters.search" 
          placeholder="Поиск по имени или email" 
          class="form-control"
        />
      </div>
    </div>
    
    <div v-if="loading" class="admin-users__loading">
      <div class="spinner"></div>
      <p>Загрузка пользователей...</p>
    </div>
    
    <div v-else-if="filteredUsers.length === 0" class="admin-users__empty">
      <p>Пользователи не найдены.</p>
    </div>
    
    <div v-else class="admin-users__list">
      <table class="admin-users__table">
        <thead>
          <tr>
            <th @click="sortBy('firstName')">
              Имя
              <span v-if="sortField === 'firstName'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('email')">
              Email
              <span v-if="sortField === 'email'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('department')">
              Отдел
              <span v-if="sortField === 'department'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('position')">
              Должность
              <span v-if="sortField === 'position'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('role')">
              Роль
              <span v-if="sortField === 'role'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="admin-users__row">
            <td>
              <div class="user-info">
                <div class="user-avatar" v-if="user.avatar">
                  <img :src="user.avatar" :alt="user.firstName">
                </div>
                <div class="user-avatar" v-else>
                  {{ getUserInitials(user) }}
                </div>
                <div>
                  {{ user.firstName }} {{ user.lastName }}
                </div>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ user.department || 'Не указан' }}</td>
            <td>{{ user.position || 'Не указана' }}</td>
            <td>
              <span class="user-role" :class="`user-role--${user.role}`">
                {{ formatRole(user.role) }}
              </span>
            </td>
            <td class="admin-users__actions">
              <Button @click="editUser(user)" variant="outline" size="small">
                Редактировать
              </Button>
              <Button 
                @click="confirmDeleteUser(user)" 
                variant="outline" 
                size="small"
                class="delete-btn"
                :disabled="user.id === currentUserId"
              >
                Удалить
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Модальное окно добавления/редактирования пользователя -->
    <div v-if="showAddUserModal || showEditUserModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ showEditUserModal ? 'Редактировать пользователя' : 'Добавить пользователя' }}</h3>
          <button class="modal-close" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="firstName" class="form-label">Имя <span class="required">*</span></label>
            <input 
              type="text" 
              id="firstName" 
              v-model="userForm.firstName" 
              class="form-control"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="lastName" class="form-label">Фамилия <span class="required">*</span></label>
            <input 
              type="text" 
              id="lastName" 
              v-model="userForm.lastName" 
              class="form-control"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="email" class="form-label">Email <span class="required">*</span></label>
            <input 
              type="email" 
              id="email" 
              v-model="userForm.email" 
              class="form-control"
              required
              :disabled="showEditUserModal"
            />
          </div>
          
          <div class="form-group" v-if="!showEditUserModal">
            <label for="password" class="form-label">Пароль <span class="required">*</span></label>
            <input 
              type="password" 
              id="password" 
              v-model="userForm.password" 
              class="form-control"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="department" class="form-label">Отдел</label>
            <input 
              type="text" 
              id="department" 
              v-model="userForm.department" 
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="position" class="form-label">Должность</label>
            <input 
              type="text" 
              id="position" 
              v-model="userForm.position" 
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="role" class="form-label">Роль <span class="required">*</span></label>
            <select id="role" v-model="userForm.role" class="form-select" required>
              <option value="user">Пользователь</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <Button @click="closeModals" variant="outline">Отмена</Button>
          <Button @click="saveUser" variant="primary" :disabled="!isFormValid">Сохранить</Button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content modal-content--small">
        <div class="modal-header">
          <h3>Подтверждение удаления</h3>
          <button class="modal-close" @click="showDeleteModal = false">×</button>
        </div>
        <div class="modal-body">
          <p>Вы действительно хотите удалить пользователя <strong>{{ userToDelete?.firstName }} {{ userToDelete?.lastName }}</strong>?</p>
          <p class="warning">Это действие нельзя отменить.</p>
        </div>
        <div class="modal-footer">
          <Button @click="showDeleteModal = false" variant="outline">Отмена</Button>
          <Button @click="deleteUser" variant="danger">Удалить</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin']
});

const authStore = useAuthStore();
const currentUserId = computed(() => authStore.user?.id);

// Состояние
const loading = ref(true);
const users = ref([]);
const filters = ref({
  role: '',
  department: '',
  search: ''
});
const sortField = ref('firstName');
const sortDirection = ref('asc');

// Модальные окна
const showAddUserModal = ref(false);
const showEditUserModal = ref(false);
const showDeleteModal = ref(false);
const userToDelete = ref(null);
const userForm = ref({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  department: '',
  position: '',
  role: 'user'
});

// Вычисляемые свойства
const departments = computed(() => {
  const depts = new Set();
  users.value.forEach(user => {
    if (user.department) {
      depts.add(user.department);
    }
  });
  return [...depts].sort();
});

const isFormValid = computed(() => {
  if (showEditUserModal.value) {
    return userForm.value.firstName && 
           userForm.value.lastName && 
           userForm.value.role;
  } else {
    return userForm.value.firstName && 
           userForm.value.lastName && 
           userForm.value.email && 
           userForm.value.password && 
           userForm.value.role;
  }
});

const filteredUsers = computed(() => {
  let result = [...users.value];
  
  // Фильтр по роли
  if (filters.value.role) {
    result = result.filter(user => user.role === filters.value.role);
  }
  
  // Фильтр по отделу
  if (filters.value.department) {
    result = result.filter(user => user.department === filters.value.department);
  }
  
  // Поиск
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase();
    result = result.filter(user => 
      user.firstName.toLowerCase().includes(searchLower) || 
      user.lastName.toLowerCase().includes(searchLower) || 
      user.email.toLowerCase().includes(searchLower)
    );
  }
  
  // Сортировка
  result.sort((a, b) => {
    let valA = a[sortField.value] || '';
    let valB = b[sortField.value] || '';
    
    if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
  
  return result;
});

// Методы
function formatRole(role) {
  switch(role) {
    case 'admin':
      return 'Администратор';
    case 'user':
      return 'Пользователь';
    default:
      return role;
  }
}

function getUserInitials(user) {
  return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
}

function sortBy(field) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
}

function editUser(user) {
  // Копируем данные пользователя в форму
  userForm.value = { ...user, password: '' };
  showEditUserModal.value = true;
}

function confirmDeleteUser(user) {
  userToDelete.value = user;
  showDeleteModal.value = true;
}

function closeModals() {
  showAddUserModal.value = false;
  showEditUserModal.value = false;
  resetForm();
}

function resetForm() {
  userForm.value = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    position: '',
    role: 'user'
  };
}

async function saveUser() {
  try {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (showEditUserModal.value) {
      // Обновление существующего пользователя
      const index = allUsers.findIndex(u => u.id === userForm.value.id);
      if (index !== -1) {
        // Сохраняем пароль существующего пользователя
        const existingPassword = allUsers[index].password;
        
        // Обновляем пользователя
        allUsers[index] = {
          ...userForm.value,
          password: existingPassword,
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('users', JSON.stringify(allUsers));
        
        // Обновляем локальный список
        const userIndex = users.value.findIndex(u => u.id === userForm.value.id);
        if (userIndex !== -1) {
          users.value[userIndex] = { ...userForm.value, password: undefined };
        }
      }
    } else {
      // Проверка на существующий email
      if (allUsers.some(u => u.email === userForm.value.email)) {
        alert('Пользователь с таким email уже существует');
        return;
      }
      
      // Создание нового пользователя
      const newUser = {
        ...userForm.value,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      allUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(allUsers));
      
      // Добавляем в локальный список без пароля
      const { password, ...userWithoutPassword } = newUser;
      users.value.push(userWithoutPassword);
    }
    
    closeModals();
  } catch (error) {
    console.error('Ошибка при сохранении пользователя:', error);
    alert('Произошла ошибка при сохранении пользователя');
  }
}

async function deleteUser() {
  if (!userToDelete.value) return;
  
  try {
    // Нельзя удалить текущего пользователя
    if (userToDelete.value.id === currentUserId.value) {
      alert('Вы не можете удалить свою учетную запись');
      return;
    }
    
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = allUsers.filter(u => u.id !== userToDelete.value.id);
    
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    
    // Обновляем локальный список
    users.value = users.value.filter(u => u.id !== userToDelete.value.id);
    
    showDeleteModal.value = false;
    userToDelete.value = null;
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    alert('Произошла ошибка при удалении пользователя');
  }
}

// Загрузка данных
onMounted(async () => {
  loading.value = true;
  
  try {
    // Загрузка пользователей
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      // Удаляем пароли из объектов пользователей
      users.value = JSON.parse(storedUsers).map(({ password, ...user }) => user);
    } else {
      users.value = [];
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.admin-users {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
    
    @media (max-width: $breakpoint-sm) {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-md;
    }
  }
  
  &__title {
    margin: 0;
  }
  
  &__filters {
    display: flex;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
    flex-wrap: wrap;
    
    .filter-group {
      flex: 1;
      min-width: 200px;
      
      @media (max-width: $breakpoint-sm) {
        flex: 0 0 100%;
      }
      
      label {
        display: block;
        margin-bottom: $spacing-xs;
        font-weight: $font-weight-medium;
      }
    }
  }
  
  &__loading,
  &__empty {
    text-align: center;
    padding: $spacing-xl 0;
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba($primary-color, 0.1);
      border-left-color: $primary-color;
      border-radius: 50%;
      margin: 0 auto $spacing-md;
      animation: spin 1s linear infinite;
    }
    
    p {
      margin-bottom: $spacing-md;
    }
  }
  
  &__table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    border-radius: $border-radius-md;
    box-shadow: $shadow-sm;
    overflow: hidden;
    
    th, td {
      padding: $spacing-md;
      text-align: left;
      border-bottom: 1px solid $border-color;
    }
    
    th {
      background-color: $light-color;
      font-weight: $font-weight-medium;
      cursor: pointer;
      user-select: none;
      
      &:hover {
        background-color: darken($light-color, 5%);
      }
      
      .sort-icon {
        margin-left: $spacing-xs;
      }
    }
  }
  
  &__actions {
    display: flex;
    gap: $spacing-sm;
    
    .delete-btn {
      color: $error-color;
      border-color: $error-color;
      
      &:hover:not(:disabled) {
        background-color: rgba($error-color, 0.1);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
  
  @media (max-width: $breakpoint-md) {
    &__table {
      th, td {
        padding: $spacing-sm;
      }
    }
    
    &__actions {
      flex-direction: column;
      
      button {
        width: 100%;
      }
    }
  }
  
  @media (max-width: 320px) {
    &__table {
      font-size: $font-size-small;
      
      th, td {
        padding: $spacing-xs;
      }
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: $primary-color;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: $font-weight-bold;
  font-size: $font-size-small;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-role {
  display: inline-block;
  padding: 4px 8px;
  border-radius: $border-radius-sm;
  font-size: $font-size-small;
  
  &--admin {
    background-color: rgba($primary-color, 0.1);
    color: $primary-color;
  }
  
  &--user {
    background-color: rgba($text-color, 0.1);
    color: $text-color;
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-index-modal;
  
  &-content {
    background-color: white;
    border-radius: $border-radius-md;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: $shadow-lg;
    
    &--small {
      max-width: 400px;
    }
  }
  
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md;
    border-bottom: 1px solid $border-color;
    
    h3 {
      margin: 0;
    }
    
    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: $text-color;
      
      &:hover {
        color: $error-color;
      }
    }
  }
  
  &-body {
    padding: $spacing-md;
    
    .form-group {
      margin-bottom: $spacing-md;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .warning {
      color: $error-color;
      font-weight: $font-weight-medium;
    }
    
    .required {
      color: $error-color;
    }
  }
  
  &-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
    padding: $spacing-md;
    border-top: 1px solid $border-color;
  }
  
  @media (max-width: $breakpoint-sm) {
    &-content {
      width: 90%;
    }
    
    &-footer {
      flex-direction: column;
      
      button {
        width: 100%;
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
