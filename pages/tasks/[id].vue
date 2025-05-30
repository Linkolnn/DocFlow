<template>
  <div class="task-detail-page">
    <div v-if="loading" class="task-detail-page__loading">
      Загрузка задачи...
    </div>
    
    <div v-else-if="!task" class="task-detail-page__not-found">
      <h2>Задача не найдена</h2>
      <p>Задача, которую вы ищете, не существует или была удалена.</p>
      <Button @click="router.push('/tasks')" variant="primary">Вернуться к задачам</Button>
    </div>
    
    <template v-else>
      <div class="task-detail-page__header">
        <div class="task-detail-page__title-section">
          <h1 class="task-detail-page__title">{{ task.title }}</h1>
          <span 
            class="task-status" 
            :class="`task-status--${task.status}`"
          >
            {{ getStatusLabel(task.status) }}
          </span>
        </div>
        
        <div class="task-detail-page__actions">
          <Button @click="router.push('/tasks')" variant="outline">Назад</Button>
          <Button @click="router.push(`/tasks/create?edit=${task.id}`)" variant="primary">Редактировать</Button>
        </div>
      </div>
      
      <div class="task-detail">
        <div class="task-detail__meta">
          <div class="task-detail__meta-item">
            <span class="task-detail__meta-label">Приоритет:</span>
            <span class="task-detail__meta-value task-priority" :class="`task-priority--${task.priority}`">
              {{ getPriorityLabel(task.priority) }}
            </span>
          </div>
          
          <div class="task-detail__meta-item">
            <span class="task-detail__meta-label">Исполнитель:</span>
            <span class="task-detail__meta-value">{{ getAssigneeName(task.assigneeId) }}</span>
          </div>
          
          <div class="task-detail__meta-item">
            <span class="task-detail__meta-label">Срок выполнения:</span>
            <span class="task-detail__meta-value" :class="{ 'overdue': isOverdue(task.dueDate) }">
              {{ formatDate(task.dueDate) }}
            </span>
          </div>
          
          <div class="task-detail__meta-item">
            <span class="task-detail__meta-label">Создана:</span>
            <span class="task-detail__meta-value">{{ formatDate(task.createdAt) }}</span>
          </div>
          
          <div class="task-detail__meta-item">
            <span class="task-detail__meta-label">Последнее обновление:</span>
            <span class="task-detail__meta-value">{{ formatDate(task.updatedAt) }}</span>
          </div>
        </div>
        
        <div v-if="task.description" class="task-detail__description">
          <h3 class="task-detail__section-title">Описание</h3>
          <p>{{ task.description }}</p>
        </div>
        
        <div class="task-detail__content-box">
          {{ task.content }}
        </div>
        
        <!-- Изменение статуса задачи -->
        <div class="task-detail__status-update">
          <h3 class="task-detail__section-title">Изменить статус</h3>
          <div class="task-detail__status-buttons">
            <Button 
              v-if="task.status !== 'not_started'" 
              @click="updateTaskStatus('not_started')" 
              variant="outline"
            >
              Не начато
            </Button>
            <Button 
              v-if="task.status !== 'in_progress'" 
              @click="updateTaskStatus('in_progress')" 
              variant="outline"
            >
              В процессе
            </Button>
            <Button 
              v-if="task.status !== 'completed'" 
              @click="updateTaskStatus('completed')" 
              variant="primary"
            >
              Завершено
            </Button>
          </div>
        </div>
        
        <!-- Комментарии -->
        <div class="task-detail__comments">
          <h3 class="task-detail__section-title">Комментарии ({{ task.comments?.length || 0 }})</h3>
          
          <div class="task-detail__comment-form">
            <textarea 
              v-model="newComment" 
              placeholder="Добавить комментарий..." 
              class="form-control"
              rows="3"
            ></textarea>
            <Button @click="addComment" variant="primary" :disabled="!newComment.trim()">
              Отправить
            </Button>
          </div>
          
          <div v-if="task.comments && task.comments.length > 0" class="task-detail__comments-list">
            <div 
              v-for="comment in task.comments" 
              :key="comment.id" 
              class="task-detail__comment"
            >
              <div class="task-detail__comment-header">
                <span class="task-detail__comment-author">{{ comment.author }}</span>
                <span class="task-detail__comment-date">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <div class="task-detail__comment-content">
                {{ comment.content }}
              </div>
            </div>
          </div>
          
          <div v-else class="task-detail__no-comments">
            Нет комментариев. Будьте первым, кто оставит комментарий!
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const taskId = computed(() => route.params.id);
const loading = ref(true);
const newComment = ref('');
const task = ref(null);
const users = ref([]);

// Загрузка данных о задаче
onMounted(async () => {
  try {
    loading.value = true;
    
    // Имитация загрузки данных из API
    // В реальном приложении здесь был бы запрос к API
    setTimeout(() => {
      // Получаем задачи из localStorage (имитация API)
      const tasksData = JSON.parse(localStorage.getItem('tasks') || '[]');
      const usersData = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Находим задачу по ID
      const foundTask = tasksData.find(t => t.id === taskId.value);
      
      task.value = foundTask || null;
      users.value = usersData;
      
      loading.value = false;
    }, 500);
  } catch (error) {
    console.error('Ошибка при загрузке задачи:', error);
    loading.value = false;
  }
});

// Получение метки приоритета
function getPriorityLabel(priority) {
  switch(priority) {
    case 'low': return 'Низкий';
    case 'medium': return 'Средний';
    case 'high': return 'Высокий';
    default: return priority;
  }
}

// Получение метки статуса
function getStatusLabel(status) {
  switch(status) {
    case 'not_started': return 'Не начато';
    case 'in_progress': return 'В процессе';
    case 'completed': return 'Завершено';
    default: return status;
  }
}

// Получение имени исполнителя
function getAssigneeName(assigneeId) {
  const user = users.value.find(u => u.id === assigneeId);
  return user ? `${user.firstName} ${user.lastName}` : 'Не назначен';
}

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return 'Не указано';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Проверка, просрочена ли задача
function isOverdue(dateString) {
  if (!dateString) return false;
  
  const dueDate = new Date(dateString);
  const now = new Date();
  
  return dueDate < now && task.value.status !== 'completed';
}

// Обновление статуса задачи
async function updateTaskStatus(newStatus) {
  try {
    // Имитация запроса к API
    const tasksData = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasksData.findIndex(t => t.id === taskId.value);
    
    if (taskIndex !== -1) {
      tasksData[taskIndex].status = newStatus;
      tasksData[taskIndex].updatedAt = new Date().toISOString();
      
      localStorage.setItem('tasks', JSON.stringify(tasksData));
      
      // Обновляем локальное состояние
      task.value.status = newStatus;
      task.value.updatedAt = new Date().toISOString();
    }
  } catch (error) {
    console.error('Ошибка при обновлении статуса задачи:', error);
  }
}

// Добавление комментария
async function addComment() {
  if (!newComment.value.trim()) return;
  
  try {
    // Имитация запроса к API
    const tasksData = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasksData.findIndex(t => t.id === taskId.value);
    
    if (taskIndex !== -1) {
      // Создаем новый комментарий
      const newCommentObj = {
        id: Date.now().toString(),
        content: newComment.value.trim(),
        author: `${authStore.user.firstName} ${authStore.user.lastName}`,
        createdAt: new Date().toISOString()
      };
      
      // Добавляем комментарий к задаче
      if (!tasksData[taskIndex].comments) {
        tasksData[taskIndex].comments = [];
      }
      
      tasksData[taskIndex].comments.push(newCommentObj);
      tasksData[taskIndex].updatedAt = new Date().toISOString();
      
      localStorage.setItem('tasks', JSON.stringify(tasksData));
      
      // Обновляем локальное состояние
      if (!task.value.comments) {
        task.value.comments = [];
      }
      
      task.value.comments.push(newCommentObj);
      task.value.updatedAt = new Date().toISOString();
      
      // Очищаем поле ввода
      newComment.value = '';
    }
  } catch (error) {
    console.error('Ошибка при добавлении комментария:', error);
  }
}
</script>

<style lang="scss" scoped>
.task-detail-page {
  &__loading,
  &__not-found {
    text-align: center;
    padding: $spacing-xl 0;
    
    h2 {
      margin-bottom: $spacing-md;
    }
    
    p {
      margin-bottom: $spacing-lg;
      color: $text-color;
    }
  }
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-lg;
    flex-wrap: wrap;
    gap: $spacing-md;
    
    @media (max-width: $breakpoint-md) {
      flex-direction: column;
      align-items: stretch;
    }
  }
  
  &__title-section {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex-wrap: wrap;
  }
  
  &__title {
    margin: 0;
    font-size: $font-size-xxlarge;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-xlarge;
    }
  }
  
  &__actions {
    display: flex;
    gap: $spacing-sm;
    
    @media (max-width: $breakpoint-sm) {
      width: 100%;
      justify-content: space-between;
    }
  }
}

.task-detail {
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;
  overflow: hidden;
  
  &__meta {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: $spacing-md;
    padding: $spacing-lg;
    background-color: $light-color;
    border-bottom: 1px solid $border-color;
    
    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }
  }
  
  &__meta-item {
    display: flex;
    flex-direction: column;
  }
  
  &__meta-label {
    font-size: $font-size-small;
    color: $text-color;
    margin-bottom: $spacing-xs;
  }
  
  &__meta-value {
    font-weight: 500;
    
    &.overdue {
      color: $error-color;
    }
  }
  
  &__section-title {
    font-size: $font-size-large;
    margin-top: 0;
    margin-bottom: $spacing-md;
    color: $text-color;
  }
  
  &__description {
    padding: $spacing-lg;
    border-bottom: 1px solid $border-color;
    
    p {
      margin: 0;
      line-height: 1.6;
    }
  }
  
  &__content-box {
    padding: $spacing-lg;
    border-bottom: 1px solid $border-color;
    white-space: pre-wrap;
    line-height: 1.6;
  }
  
  &__status-update {
    padding: $spacing-lg;
    border-bottom: 1px solid $border-color;
  }
  
  &__status-buttons {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }
  
  &__comments {
    padding: $spacing-lg;
  }
  
  &__comment-form {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
    
    textarea {
      resize: vertical;
    }
    
    button {
      align-self: flex-end;
    }
  }
  
  &__comments-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
  
  &__comment {
    padding: $spacing-md;
    background-color: $light-color;
    border-radius: $border-radius-md;
    border-left: 3px solid $primary-color;
  }
  
  &__comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: $spacing-sm;
    font-size: $font-size-small;
  }
  
  &__comment-author {
    font-weight: 600;
  }
  
  &__comment-date {
    color: $text-color;
  }
  
  &__comment-content {
    line-height: 1.5;
  }
  
  &__no-comments {
    color: $text-color;
    font-style: italic;
    text-align: center;
    padding: $spacing-md;
  }
}

.task-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: $border-radius-sm;
  font-size: $font-size-small;
  font-weight: 600;
  
  &--not_started {
    background-color: rgba($warning-color, 0.1);
    color: $warning-color;
  }
  
  &--in_progress {
    background-color: rgba($primary-color, 0.1);
    color: $primary-color;
  }
  
  &--completed {
    background-color: rgba($success-color, 0.1);
    color: $success-color;
  }
}

.task-priority {
  display: inline-block;
  
  &--low {
    color: $success-color;
  }
  
  &--medium {
    color: $warning-color;
  }
  
  &--high {
    color: $error-color;
  }
}

@media (max-width: 320px) {
  .task-detail {
    &__meta {
      padding: $spacing-md;
    }
    
    &__description,
    &__content-box,
    &__status-update,
    &__comments {
      padding: $spacing-md;
    }
    
    &__status-buttons {
      flex-direction: column;
      width: 100%;
      
      button {
        width: 100%;
      }
    }
  }
  
  .task-detail-page {
    &__actions {
      flex-direction: column;
      width: 100%;
      
      button {
        width: 100%;
      }
    }
  }
}
</style>
