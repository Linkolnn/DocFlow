<template>
  <div class="admin-tasks">
    <div class="admin-tasks__header">
      <h1 class="admin-tasks__title">Управление задачами</h1>
      <div class="admin-tasks__actions">
        <Button @click="navigateTo('/tasks/create')" variant="primary">Создать задачу</Button>
      </div>
    </div>
    
    <div class="admin-tasks__filters">
      <div class="filter-group">
        <label for="status-filter">Статус:</label>
        <select id="status-filter" v-model="filters.status" class="form-select">
          <option value="">Все</option>
          <option value="не начато">Не начато</option>
          <option value="в процессе">В процессе</option>
          <option value="завершено">Завершено</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="assignee-filter">Исполнитель:</label>
        <select id="assignee-filter" v-model="filters.assignee" class="form-select">
          <option value="">Все</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.firstName }} {{ user.lastName }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="search-filter">Поиск:</label>
        <input 
          type="text" 
          id="search-filter" 
          v-model="filters.search" 
          placeholder="Поиск по названию или описанию" 
          class="form-control"
        />
      </div>
    </div>
    
    <div v-if="loading" class="admin-tasks__loading">
      <div class="spinner"></div>
      <p>Загрузка задач...</p>
    </div>
    
    <div v-else-if="filteredTasks.length === 0" class="admin-tasks__empty">
      <p>Задачи не найдены.</p>
      <Button @click="navigateTo('/tasks/create')" variant="primary">Создать задачу</Button>
    </div>
    
    <div v-else class="admin-tasks__list">
      <table class="admin-tasks__table">
        <thead>
          <tr>
            <th @click="sortBy('title')">
              Название
              <span v-if="sortField === 'title'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('status')">
              Статус
              <span v-if="sortField === 'status'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('assigneeId')">
              Исполнитель
              <span v-if="sortField === 'assigneeId'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('dueDate')">
              Срок
              <span v-if="sortField === 'dueDate'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in filteredTasks" :key="task.id" class="admin-tasks__row">
            <td>{{ task.title }}</td>
            <td>
              <span class="task-status" :class="`task-status--${task.status}`">
                {{ formatStatus(task.status) }}
              </span>
            </td>
            <td>{{ getAssigneeName(task.assigneeId) }}</td>
            <td :class="{ 'overdue': isOverdue(task.dueDate) }">{{ formatDate(task.dueDate) }}</td>
            <td class="admin-tasks__actions">
              <Button @click="navigateTo(`/tasks/${task.id}`)" variant="outline" size="small">
                Просмотр
              </Button>
              <Button @click="openAssignModal(task)" variant="outline" size="small">
                Назначить
              </Button>
              <Button @click="navigateTo(`/tasks/create?edit=${task.id}`)" variant="outline" size="small">
                Редактировать
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Модальное окно назначения исполнителя -->
    <div v-if="showAssignModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Назначить исполнителя</h3>
          <button class="modal-close" @click="showAssignModal = false">×</button>
        </div>
        <div class="modal-body">
          <p><strong>Задача:</strong> {{ selectedTask?.title }}</p>
          
          <div class="form-group">
            <label for="assignee" class="form-label">Исполнитель:</label>
            <select id="assignee" v-model="selectedAssignee" class="form-select">
              <option value="">Выберите исполнителя</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.firstName }} {{ user.lastName }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="due-date" class="form-label">Срок выполнения:</label>
            <input 
              type="date" 
              id="due-date" 
              v-model="selectedDueDate" 
              class="form-control"
              :min="minDate"
            />
          </div>
        </div>
        <div class="modal-footer">
          <Button @click="showAssignModal = false" variant="outline">Отмена</Button>
          <Button @click="assignTask" variant="primary" :disabled="!selectedAssignee">Назначить</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTasksStore } from '~/stores/tasks';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin']
});

const tasksStore = useTasksStore();
const authStore = useAuthStore();
const router = useRouter();

// Состояние
const loading = ref(true);
const tasks = ref([]);
const users = ref([]);
const filters = ref({
  status: '',
  assignee: '',
  search: ''
});
const sortField = ref('dueDate');
const sortDirection = ref('asc');

// Модальное окно назначения
const showAssignModal = ref(false);
const selectedTask = ref(null);
const selectedAssignee = ref('');
const selectedDueDate = ref('');

// Вычисляемые свойства
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const filteredTasks = computed(() => {
  let result = [...tasks.value];
  
  // Фильтр по статусу
  if (filters.value.status) {
    result = result.filter(task => task.status === filters.value.status);
  }
  
  // Фильтр по исполнителю
  if (filters.value.assignee) {
    result = result.filter(task => task.assigneeId === filters.value.assignee);
  }
  
  // Поиск
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase();
    result = result.filter(task => 
      task.title.toLowerCase().includes(searchLower) || 
      (task.description && task.description.toLowerCase().includes(searchLower))
    );
  }
  
  // Сортировка
  result.sort((a, b) => {
    let valA = a[sortField.value];
    let valB = b[sortField.value];
    
    // Специальная обработка для некоторых полей
    if (sortField.value === 'dueDate') {
      valA = valA ? new Date(valA).getTime() : 0;
      valB = valB ? new Date(valB).getTime() : 0;
    } else if (sortField.value === 'assigneeId') {
      valA = getAssigneeName(valA);
      valB = getAssigneeName(valB);
    }
    
    if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
  
  return result;
});

// Методы
function formatStatus(status) {
  switch(status) {
    case 'not_started':
      return 'Не начато';
    case 'in_progress':
      return 'В процессе';
    case 'completed':
      return 'Завершено';
    case 'не начато':
      return 'Не начато';
    case 'в процессе':
      return 'В процессе';
    case 'завершено':
      return 'Завершено';
    default:
      return status;
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Не указано';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Некорректная дата';
  
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function getAssigneeName(assigneeId) {
  if (!assigneeId) return 'Не назначен';
  
  const user = users.value.find(u => u.id === assigneeId);
  return user ? `${user.firstName} ${user.lastName}` : 'Не назначен';
}

function isOverdue(dateString) {
  if (!dateString) return false;
  
  const dueDate = new Date(dateString);
  if (isNaN(dueDate.getTime())) return false;
  
  const today = new Date();
  return dueDate < today;
}

function sortBy(field) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
}

function openAssignModal(task) {
  selectedTask.value = task;
  selectedAssignee.value = task.assigneeId || '';
  selectedDueDate.value = task.dueDate || '';
  showAssignModal.value = true;
}

async function assignTask() {
  if (!selectedTask.value || !selectedAssignee.value) return;
  
  try {
    const updates = {
      assigneeId: selectedAssignee.value,
      dueDate: selectedDueDate.value
    };
    
    await tasksStore.updateTask(selectedTask.value.id, updates);
    
    // Обновляем задачу в локальном состоянии
    const taskIndex = tasks.value.findIndex(t => t.id === selectedTask.value.id);
    if (taskIndex !== -1) {
      tasks.value[taskIndex] = {
        ...tasks.value[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    
    showAssignModal.value = false;
  } catch (error) {
    console.error('Ошибка при назначении задачи:', error);
  }
}

// Загрузка данных
onMounted(async () => {
  loading.value = true;
  
  try {
    // Загрузка пользователей
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      users.value = JSON.parse(storedUsers).map(({ password, ...user }) => user);
    } else {
      users.value = [
        { id: '1', firstName: 'Иван', lastName: 'Иванов', role: 'user' },
        { id: '2', firstName: 'Петр', lastName: 'Петров', role: 'user' },
        { id: '3', firstName: 'Анна', lastName: 'Сидорова', role: 'user' }
      ];
    }
    
    // Загрузка задач
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      tasks.value = JSON.parse(storedTasks);
    } else {
      tasks.value = [];
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.admin-tasks {
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
    
    .overdue {
      color: $error-color;
      font-weight: $font-weight-medium;
    }
  }
  
  &__actions {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
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

.task-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: $border-radius-sm;
  font-size: $font-size-small;
  
  &--not_started, &--\не\ начато {
    background-color: rgba($warning-color, 0.1);
    color: $warning-color;
  }
  
  &--in_progress, &--\в\ процессе {
    background-color: rgba($primary-color, 0.1);
    color: $primary-color;
  }
  
  &--completed, &--завершено {
    background-color: rgba($success-color, 0.1);
    color: $success-color;
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
