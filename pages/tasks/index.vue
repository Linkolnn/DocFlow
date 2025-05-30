<template>
  <div class="tasks-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Задачи</h1>
        <div class="page-actions">
          <NuxtLink to="/tasks/create" class="btn btn-primary">
            <i class="fas fa-plus"></i> Создать задачу
          </NuxtLink>
        </div>
      </div>
      
      <div class="tasks-filters">
        <div class="filter-group">
          <label for="status-filter">Статус:</label>
          <select id="status-filter" v-model="filters.status" class="form-select">
            <option value="">Все</option>
            <option value="not_started">Не начато</option>
            <option value="in_progress">В процессе</option>
            <option value="completed">Завершено</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="priority-filter">Приоритет:</label>
          <select id="priority-filter" v-model="filters.priority" class="form-select">
            <option value="">Все</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
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
      </div>
      
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Загрузка задач...</p>
      </div>
      
      <div v-else-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <i class="fas fa-tasks"></i>
        </div>
        <h3>Нет задач</h3>
        <p>У вас пока нет задач, соответствующих выбранным фильтрам.</p>
        <NuxtLink to="/tasks/create" class="btn btn-primary">Создать задачу</NuxtLink>
      </div>
      
      <div v-else class="tasks-grid">
        <div v-for="task in paginatedTasks" :key="task.id" class="task-card">
          <div class="task-card__header">
            <span :class="['task-priority', `priority-${task.priority}`]">
              {{ getPriorityLabel(task.priority) }}
            </span>
            <span :class="['task-status', `status-${task.status}`]">
              {{ getStatusLabel(task.status) }}
            </span>
          </div>
          
          <h3 class="task-card__title">
            <NuxtLink :to="`/tasks/${task.id}`">{{ task.title }}</NuxtLink>
          </h3>
          
          <div class="task-card__description">{{ task.description }}</div>
          
          <div class="task-card__meta">
            <div class="task-card__assignee">
              <span class="meta-label">Исполнитель:</span>
              <span class="meta-value">{{ getAssigneeName(task.assigneeId) }}</span>
            </div>
            
            <div class="task-card__due-date">
              <span class="meta-label">Срок:</span>
              <span class="meta-value" :class="{ 'overdue': isOverdue(task.dueDate) }">
                {{ formatDate(task.dueDate) }}
              </span>
            </div>
          </div>
          
          <div class="task-card__actions">
            <button 
              v-if="task.status === 'not_started'" 
              @click="updateTaskStatus(task.id, 'in_progress')" 
              class="btn btn-sm btn-outline-primary"
            >
              Начать
            </button>
            
            <button 
              v-if="task.status === 'in_progress'" 
              @click="updateTaskStatus(task.id, 'completed')" 
              class="btn btn-sm btn-outline-success"
            >
              Завершить
            </button>
            
            <NuxtLink :to="`/tasks/create?edit=${task.id}`" class="btn btn-sm btn-outline-secondary">
              Редактировать
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <div v-if="filteredTasks.length > 0" class="pagination">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1" 
          class="pagination-btn"
        >
          &laquo; Назад
        </button>
        
        <span class="pagination-info">
          Страница {{ currentPage }} из {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages" 
          class="pagination-btn"
        >
          Вперед &raquo;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
});

const loading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 9;
const users = ref([]);
const tasks = ref([]);

const filters = ref({
  status: '',
  priority: '',
  assignee: ''
});

// Фильтруем задачи
const filteredTasks = computed(() => {
  let result = [...tasks.value];
  
  if (filters.value.status) {
    result = result.filter(task => task.status === filters.value.status);
  }
  
  if (filters.value.priority) {
    result = result.filter(task => task.priority === filters.value.priority);
  }
  
  if (filters.value.assignee) {
    result = result.filter(task => task.assigneeId === filters.value.assignee);
  }
  
  // Сортируем по приоритету и сроку
  result.sort((a, b) => {
    // Сначала по приоритету (высокий -> низкий)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Затем по сроку (ближайший -> дальний)
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  
  return result;
});

// Пагинация
const paginatedTasks = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredTasks.value.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  return Math.ceil(filteredTasks.value.length / itemsPerPage);
});

// Вспомогательные функции
function getPriorityLabel(priority) {
  const labels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий'
  };
  return labels[priority] || priority;
}

function getStatusLabel(status) {
  const labels = {
    not_started: 'Не начато',
    in_progress: 'В процессе',
    completed: 'Завершено'
  };
  return labels[status] || status;
}

function getAssigneeName(assigneeId) {
  const user = users.value.find(u => u.id === assigneeId);
  return user ? `${user.firstName} ${user.lastName}` : 'Не назначено';
}

function formatDate(dateString) {
  if (!dateString) return 'Не указано';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function isOverdue(dateString) {
  if (!dateString) return false;
  
  const dueDate = new Date(dateString);
  const today = new Date();
  
  // Сбрасываем время для корректного сравнения дат
  today.setHours(0, 0, 0, 0);
  
  return dueDate < today;
}

async function updateTaskStatus(taskId, newStatus) {
  try {
    // Здесь будет вызов API для обновления статуса
    const taskIndex = tasks.value.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks.value[taskIndex].status = newStatus;
    }
  } catch (error) {
    console.error('Ошибка при обновлении статуса задачи:', error);
  }
}

// Загружаем данные при монтировании компонента
onMounted(async () => {
  try {
    // Имитация загрузки данных
    setTimeout(() => {
      // Загрузка пользователей
      users.value = JSON.parse(localStorage.getItem('users') || JSON.stringify([
        { id: 1, firstName: 'Иван', lastName: 'Иванов' },
        { id: 2, firstName: 'Петр', lastName: 'Петров' },
        { id: 3, firstName: 'Анна', lastName: 'Сидорова' }
      ]));
      
      // Загрузка задач из localStorage
      const savedTasks = localStorage.getItem('tasks');
      
      if (savedTasks) {
        // Если в localStorage есть задачи, загружаем их
        tasks.value = JSON.parse(savedTasks);
      } else {
        // Если в localStorage нет задач, используем демо-данные
        const defaultTasks = [
          {
            id: 1,
            title: 'Создать макет главной страницы',
            description: 'Разработать дизайн-макет главной страницы приложения',
            status: 'completed',
            priority: 'high',
            assigneeId: 1,
            dueDate: '2023-05-15',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: []
          },
          {
            id: 2,
            title: 'Разработать API для работы с документами',
            description: 'Создать REST API для загрузки, скачивания и управления документами',
            status: 'in_progress',
            priority: 'high',
            assigneeId: 2,
            dueDate: '2023-06-20',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: []
          },
          {
            id: 3,
            title: 'Написать документацию',
            description: 'Подготовить техническую документацию по проекту',
            status: 'not_started',
            priority: 'medium',
            assigneeId: 3,
            dueDate: '2023-07-10',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: []
          }
        ];
        
        tasks.value = defaultTasks;
        localStorage.setItem('tasks', JSON.stringify(defaultTasks));
      }
      
      loading.value = false;
    }, 1000);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    loading.value = false;
  }
});
</script>

<style scoped>
.tasks-page {
  padding: 2rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  color: #2c3e50;
}

.tasks-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.filter-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-select {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.task-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.task-card__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.task-card__title {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.task-card__title a {
  color: #2c3e50;
  text-decoration: none;
}

.task-card__title a:hover {
  color: #3498db;
}

.task-card__description {
  color: rgba(44, 62, 80, 0.8);
  margin-bottom: 1.5rem;
  flex-grow: 1;
  font-size: 0.95rem;
  line-height: 1.5;
}

.task-card__meta {
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.task-card__assignee, .task-card__due-date {
  margin-bottom: 0.5rem;
}

.task-card__actions {
  display: flex;
  gap: 0.5rem;
}

.task-priority, .task-status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.priority-high {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.priority-medium {
  background-color: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.priority-low {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.status-not_started {
  background-color: rgba(44, 62, 80, 0.1);
  color: #2c3e50;
}

.status-in_progress {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.status-completed {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.meta-label {
  color: rgba(44, 62, 80, 0.6);
  margin-right: 0.5rem;
}

.overdue {
  color: #e74c3c;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.empty-state-icon {
  font-size: 3rem;
  color: rgba(44, 62, 80, 0.2);
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin-bottom: 1rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: rgba(44, 62, 80, 0.7);
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(52, 152, 219, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.pagination-info {
  color: rgba(44, 62, 80, 0.7);
}

.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  color: #fff;
  background-color: #3498db;
  border-color: #3498db;
}

.btn-primary:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.2rem;
}

.btn-outline-primary {
  color: #3498db;
  background-color: transparent;
  border-color: #3498db;
}

.btn-outline-primary:hover {
  color: #fff;
  background-color: #3498db;
  border-color: #3498db;
}

.btn-outline-success {
  color: #2ecc71;
  background-color: transparent;
  border-color: #2ecc71;
}

.btn-outline-success:hover {
  color: #fff;
  background-color: #2ecc71;
  border-color: #2ecc71;
}

.btn-outline-secondary {
  color: #7f8c8d;
  background-color: transparent;
  border-color: #7f8c8d;
}

.btn-outline-secondary:hover {
  color: #fff;
  background-color: #7f8c8d;
  border-color: #7f8c8d;
}

.container {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
}
</style>
