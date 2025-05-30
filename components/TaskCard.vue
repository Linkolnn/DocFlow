<template>
  <div class="task-card" @click="navigateToTask" :class="{ 'clickable': true }">
    <div class="task-card__header">
      <h3 class="task-card__title">{{ task.title }}</h3>
      <span 
        class="task-card__status" 
        :class="`task-card__status--${task.status}`"
      >
        {{ formatStatus(task.status) }}
      </span>
    </div>
    
    <p class="task-card__description">{{ task.description }}</p>
    
    <div class="task-card__meta">
      <div 
        class="task-card__deadline" 
        :class="{ 'task-card__deadline--overdue': isOverdue }"
      >
        <span class="task-card__deadline-icon">🗓️</span>
        {{ formatDeadline(task.deadline) }}
      </div>
      
      <div class="task-card__assignee" v-if="task.assignee">
        <img 
          v-if="task.assignee.avatar" 
          :src="task.assignee.avatar" 
          class="task-card__assignee-avatar" 
          :alt="task.assignee.name"
        />
        <span v-else class="task-card__assignee-avatar">👤</span>
        {{ task.assignee.name }}
      </div>
    </div>
    
    <div class="task-card__actions">
      <Button 
        v-if="task.status === 'не начато'" 
        @click.stop="updateStatus('в процессе')" 
        variant="primary" 
        size="small"
      >
        Начать
      </Button>
      
      <Button   
        v-if="task.status === 'в процессе'" 
        @click.stop="updateStatus('завершено')" 
        variant="secondary" 
        size="small"
      >
        Завершить
      </Button>
      
      <Button 
        @click.stop="$emit('edit', task.id)" 
        variant="outline" 
        size="small"
      >
        Редактировать
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTasksStore } from '~/stores/tasks';

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'status-change', 'view']);

const router = useRouter();
const tasksStore = useTasksStore();

const isOverdue = computed(() => {
  if (props.task.status === 'completed') return false;
  const deadline = new Date(props.task.deadline);
  return deadline < new Date();
});

function formatStatus(status) {
  // Перевод статусов на русский
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
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function formatDeadline(dateString) {
  // Проверка на корректность даты
  if (!dateString) {
    return 'Не указано';
  }
  
  // Проверка на валидность даты
  const deadline = new Date(dateString);
  if (isNaN(deadline.getTime())) {
    return 'Некорректная дата';
  }
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if deadline is today or tomorrow
  if (deadline.toDateString() === today.toDateString()) {
    return 'Сегодня';
  } else if (deadline.toDateString() === tomorrow.toDateString()) {
    return 'Завтра';
  }
  
  // Format date
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: deadline.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  }).format(deadline);
}

async function updateStatus(newStatus) {
  // Обновляем статус задачи
  await tasksStore.updateTask(props.task.id, { status: newStatus });
  emit('status-change', { taskId: props.task.id, newStatus });
}

function navigateToTask() {
  emit('view', props.task.id);
  router.push(`/tasks/${props.task.id}`);
}
</script>

<style lang="scss" scoped>
.task-card {
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  transition: all $transition-fast;
  
  &.clickable {
    cursor: pointer;
    
    &:hover {
      box-shadow: $shadow-md;
      transform: translateY(-2px);
    }
  }
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-sm;
  }
  
  &__title {
    margin: 0;
    font-size: $font-size-large;
    font-weight: $font-weight-medium;
  }
  
  &__status {
    display: inline-block;
    padding: 4px 8px;
    border-radius: $border-radius-sm;
    font-size: $font-size-small;
    font-weight: $font-weight-medium;
    
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
  
  &__description {
    margin-bottom: $spacing-md;
    color: $text-color;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  &__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
    font-size: $font-size-small;
  }
  
  &__deadline {
    display: flex;
    align-items: center;
    
    &-icon {
      margin-right: $spacing-xs;
    }
    
    &--overdue {
      color: $error-color;
      font-weight: $font-weight-medium;
    }
  }
  
  &__assignee {
    display: flex;
    align-items: center;
    
    &-avatar {
      width: 24px;
      height: 24px;
      border-radius: $border-radius-circle;
      margin-right: $spacing-xs;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: $light-color;
    }
  }
  
  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
  }
  
  @media (max-width: $breakpoint-sm) {
    padding: $spacing-sm;
    
    &__title {
      font-size: $font-size-base;
    }
    
    &__description {
      -webkit-line-clamp: 1;
      margin-bottom: $spacing-sm;
    }
    
    &__meta {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-xs;
    }
  }
  
  @media (max-width: 320px) {
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
