<template>
  <div class="task-card">
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
        v-if="task.status === 'todo'" 
        @click="updateStatus('in-progress')" 
        variant="primary" 
        size="small"
      >
        Start Task
      </Button>
      
      <Button 
        v-if="task.status === 'in-progress'" 
        @click="updateStatus('completed')" 
        variant="secondary" 
        size="small"
      >
        Complete
      </Button>
      
      <Button 
        @click="$emit('edit', task.id)" 
        variant="outline" 
        size="small"
      >
        Edit
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTasksStore } from '~/stores/tasks';

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'status-change']);

const tasksStore = useTasksStore();

const isOverdue = computed(() => {
  if (props.task.status === 'completed') return false;
  const deadline = new Date(props.task.deadline);
  return deadline < new Date();
});

function formatStatus(status) {
  // Convert kebab case to title case
  return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatDeadline(dateString) {
  const deadline = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if deadline is today or tomorrow
  if (deadline.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (deadline.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  // Format date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: deadline.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  }).format(deadline);
}

async function updateStatus(newStatus) {
  await tasksStore.updateTask(props.task.id, { status: newStatus });
  emit('status-change', { id: props.task.id, status: newStatus });
}
</script>
