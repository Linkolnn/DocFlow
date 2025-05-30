<template>
  <div class="overview">
    <div class="overview__header">
      <h1 class="overview__title">Информационная панель</h1>
      <div class="overview__actions">
        <SearchBar 
          placeholder="Поиск документов и задач..." 
          @select="handleSearchSelect"
        />
      </div>
    </div>
    
    <div class="overview__stats">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--blue">📄</div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ documentStats.total }}</div>
          <div class="stat-card__label">Всего документов</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--orange">⏳</div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ documentStats.pending }}</div>
          <div class="stat-card__label">Ожидают подтверждения</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--green">✓</div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ taskStats.completed }}</div>
          <div class="stat-card__label">Завершенные задачи</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--red">⚠️</div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ taskStats.overdue }}</div>
          <div class="stat-card__label">Просроченные задачи</div>
        </div>
      </div>
    </div>
    
    <div class="overview__sections">
      <div class="dashboard__section">
        <div class="dashboard__section-header">
          <h2 class="overview__section-title">Недавние документы</h2>
          <NuxtLink to="/documents" class="overview__section-link">Посмотреть все</NuxtLink>
        </div>
        
        <div v-if="loading.documents" class="overview__loading">
          Загрузка документов...
        </div>
        
        <div v-else-if="recentDocuments.length === 0" class="overview__empty">
          <p>Документы не найдены.</p>
          <NuxtLink to="/documents/create" class="btn btn-primary">Создать документ</NuxtLink>
        </div>
        
        <div v-else class="overview__documents">
          <div class="table-responsive">
            <table class="document-list">
              <thead class="document-list__header">
                <tr>
                  <th>Название</th>
                  <th>Статус</th>
                  <th class="hide-sm">Обновлено</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in recentDocuments" :key="doc.id" class="document-list__row">
                  <td class="document-list__title">{{ doc.title }}</td>
                  <td>
                    <span 
                      class="document-list__status" 
                      :class="`document-list__status--${doc.status}`"
                    >
                      {{ formatStatus(doc.status) }}
                    </span>
                  </td>
                  <td class="document-list__date hide-sm">{{ formatDate(doc.updatedAt) }}</td>
                  <td class="document-list__actions">
                    <button @click="navigateTo(`/documents/${doc.id}`)" title="Просмотр">👁️</button>
                    <button @click="navigateTo(`/documents/${doc.id}/edit`)" title="Редактировать">✏️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="overview__section">
        <div class="overview__section-header">
          <h2 class="overview__section-title">Мои задачи</h2>
          <NuxtLink to="/tasks" class="overview__section-link">Посмотреть все</NuxtLink>
        </div>
        
        <div v-if="loading.tasks" class="overview__loading">
          Загрузка задач...
        </div>
        
        <div v-else-if="recentTasks.length === 0" class="overview__empty">
          <p>Задачи не найдены.</p>
          <NuxtLink to="/tasks/create" class="btn btn-primary">Создать задачу</NuxtLink>
        </div>
        
        <div v-else class="overview__tasks">
          <TaskCard 
            v-for="task in recentTasks" 
            :key="task.id" 
            :task="task"
            @edit="navigateTo(`/tasks/create?edit=${task.id}`)"
            @view="navigateTo(`/tasks/${$event}`)"
            @status-change="handleTaskStatusChange"
            class="overview__task-card"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDocumentsStore } from '~/stores/documents';
import { useTasksStore } from '~/stores/tasks';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'dashboard'
});

const documentsStore = useDocumentsStore();
const tasksStore = useTasksStore();
const authStore = useAuthStore();

const loading = ref({
  documents: true,
  tasks: true
});

// Initialize data
onMounted(async () => {
  // Check authentication
  if (!authStore.isAuthenticated) {
    await authStore.initialize();
    if (!authStore.isAuthenticated) {
      return navigateTo('/login');
    }
  }
  
  // Load documents
  try {
    await documentsStore.fetchDocuments();
  } finally {
    loading.value.documents = false;
  }
  
  // Load tasks
  try {
    await tasksStore.fetchTasks();
  } finally {
    loading.value.tasks = false;
  }
});

// Get recent documents (5 most recently updated)
const recentDocuments = computed(() => {
  return [...documentsStore.documents]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);
});

// Get recent tasks (5 most urgent tasks that are not completed)
const recentTasks = computed(() => {
  return [...tasksStore.tasks]
    .filter(task => task.status !== 'completed')
    .sort((a, b) => {
      // Sort by overdue first, then by deadline
      const aOverdue = new Date(a.deadline) < new Date();
      const bOverdue = new Date(b.deadline) < new Date();
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      return new Date(a.deadline) - new Date(b.deadline);
    })
    .slice(0, 5);
});

// Document statistics
const documentStats = computed(() => {
  const docs = documentsStore.documents;
  
  return {
    total: docs.length,
    draft: docs.filter(d => d.status === 'draft').length,
    pending: docs.filter(d => d.status === 'pending').length,
    approved: docs.filter(d => d.status === 'approved').length,
    rejected: docs.filter(d => d.status === 'rejected').length
  };
});

// Task statistics
const taskStats = computed(() => {
  const tasks = tasksStore.tasks;
  const now = new Date();
  
  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => 
      t.status !== 'completed' && new Date(t.deadline) < now
    ).length
  };
});

// Format status for display
function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

// Handle search result selection
function handleSearchSelect(result) {
  if (result.type === 'document') {
    navigateTo(`/documents/${result.id}`);
  } else if (result.type === 'task') {
    navigateTo(`/tasks/${result.id}`);
  }
}

// Handle task status change
function handleTaskStatusChange({ taskId, newStatus }) {
  tasksStore.updateTaskStatus(taskId, newStatus);
  // Refresh data after status change
  fetchRecentTasks();
}

// Fetch recent tasks
function fetchRecentTasks() {
  tasksStore.fetchTasks();
}
</script>

<style lang="scss" scoped>
.overview {
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
  
  &__tasks {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: $spacing-md;
    
    @media (max-width: $breakpoint-md) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
    
    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }
  }
  
  &__task-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    @media (max-width: 320px) {
      margin-bottom: $spacing-sm;
    }
  }
  
  &__actions {
    width: 300px;
    
    @media (max-width: $breakpoint-md) {
      width: 100%;
    }
  }
  
  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-md;
    margin-bottom: $spacing-xl;
    
    @media (max-width: $breakpoint-sm) {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    
    @media (max-width: 320px) {
      grid-template-columns: 1fr;
      gap: $spacing-sm;
      margin-bottom: $spacing-lg;
    }
  }
  
  &__sections {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-xl;
  }
  
  &__section {
    background-color: white;
    border-radius: $border-radius-md;
    box-shadow: $shadow-sm;
    padding: $spacing-lg;
    
    @media (max-width: $breakpoint-sm) {
      padding: $spacing-md;
    }
    
    @media (max-width: 320px) {
      padding: $spacing-sm;
    }
  }
  
  &__section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
    flex-wrap: wrap;
    gap: $spacing-sm;
    
    @media (max-width: 320px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }
  
  &__section-title {
    margin: 0;
    
    @media (max-width: 320px) {
      margin-bottom: $spacing-xs;
      font-size: 1.1rem;
    }
  }
  
  &__section-link {
    color: $primary-color;
    font-weight: $font-weight-medium;
    white-space: nowrap;
    
    @media (max-width: 320px) {
      font-size: 0.9rem;
    }
  }
  
  &__loading,
  &__empty {
    padding: $spacing-lg;
    text-align: center;
    color: rgba($text-color, 0.7);
  }
  
  &__empty {
    .btn {
      margin-top: $spacing-md;
    }
  }
  
  &__tasks {
    display: grid;
    gap: $spacing-md;
  }
  
  &__documents {
    overflow-x: auto;
    
    @media (max-width: $breakpoint-sm) {
      margin: 0 -#{$spacing-sm};
    }
    
    @media (max-width: 320px) {
      margin: 0 -#{$spacing-xs};
    }
  }
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.document-list {
  width: 100%;
  border-collapse: collapse;
  
  &__header {
    background-color: rgba($primary-color, 0.05);
    
    th {
      padding: $spacing-sm;
      text-align: left;
      font-weight: $font-weight-medium;
      color: $text-color;
      
      @media (max-width: $breakpoint-sm) {
        padding: $spacing-xs;
        font-size: 0.9rem;
      }
    }
  }
  
  &__row {
    border-bottom: 1px solid $border-color;
    
    &:hover {
      background-color: rgba($primary-color, 0.02);
    }
    
    td {
      padding: $spacing-sm;
      
      @media (max-width: $breakpoint-sm) {
        padding: $spacing-xs;
        font-size: 0.9rem;
      }
    }
  }
  
  &__title {
    font-weight: $font-weight-medium;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    @media (max-width: $breakpoint-sm) {
      max-width: 120px;
    }
    
    @media (max-width: 320px) {
      max-width: 100px;
    }
  }
  
  &__status {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-sm;
    font-size: 0.8rem;
    
    @media (max-width: $breakpoint-sm) {
      padding: 2px 6px;
      font-size: 0.75rem;
    }
    
    &--draft {
      background-color: rgba($text-color, 0.1);
      color: $text-color;
    }
    
    &--pending {
      background-color: rgba($warning-color, 0.1);
      color: $warning-color;
    }
    
    &--approved {
      background-color: rgba($success-color, 0.1);
      color: $success-color;
    }
    
    &--rejected {
      background-color: rgba($error-color, 0.1);
      color: $error-color;
    }
  }
  
  &__actions {
    white-space: nowrap;
    
    button {
      background: none;
      border: none;
      cursor: pointer;
      padding: $spacing-xs;
      font-size: 1rem;
      opacity: 0.7;
      transition: opacity $transition-fast;
      
      &:hover {
        opacity: 1;
      }
      
      @media (max-width: $breakpoint-sm) {
        padding: 2px;
        font-size: 0.9rem;
      }
    }
  }
}

.hide-sm {
  @media (max-width: $breakpoint-sm) {
    display: none;
  }
}

.stat-card {
  background-color: white;
  border-radius: $border-radius-md;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
  display: flex;
  align-items: center;
  
  @media (max-width: $breakpoint-sm) {
    padding: $spacing-sm;
  }
  
  @media (max-width: 320px) {
    padding: $spacing-sm;
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  
  &__icon {
    font-size: 2rem;
    margin-right: $spacing-md;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-circle;
    
    @media (max-width: $breakpoint-sm) {
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      margin-right: $spacing-sm;
    }
    
    @media (max-width: 320px) {
      margin-right: 0;
      margin-bottom: $spacing-sm;
    }
    
    &--blue {
      background-color: rgba($primary-color, 0.1);
      color: $primary-color;
    }
    
    &--green {
      background-color: rgba($success-color, 0.1);
      color: $success-color;
    }
    
    &--orange {
      background-color: rgba($warning-color, 0.1);
      color: $warning-color;
    }
    
    &--red {
      background-color: rgba($error-color, 0.1);
      color: $error-color;
    }
  }
  
  &__content {
    flex: 1;
  }
  
  &__value {
    font-size: $font-size-xlarge;
    font-weight: $font-weight-bold;
    line-height: 1;
    
    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-large;
    }
  }
  
  &__label {
    font-size: $font-size-small;
    color: rgba($text-color, 0.7);
    margin-top: $spacing-xs;
    
    @media (max-width: 320px) {
      font-size: 0.8rem;
    }
  }
}
</style>
