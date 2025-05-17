<template>
  <div class="filter-panel">
    <div class="filter-panel__header">
      <h3 class="filter-panel__title">{{ title }}</h3>
      <button @click="resetFilters" class="filter-panel__reset">Reset</button>
    </div>
    
    <div class="filter-panel__content">
      <div v-if="showDateRange" class="filter-panel__group">
        <div class="filter-panel__date-range">
          <div class="filter-panel__date-field">
            <label class="filter-panel__date-label">От</label>
            <input 
              type="date" 
              v-model="dateRange.start" 
              class="form-control" 
              @change="onDateRangeChange"
            />
          </div>
          <div class="filter-panel__date-field">
            <label class="filter-panel__date-label">До</label>
            <input 
              type="date" 
              v-model="dateRange.end" 
              class="form-control"
              @change="onDateRangeChange"
            />
          </div>
        </div>
      </div>
      
      <div v-if="showDocumentTypes" class="filter-panel__group">
        <label class="filter-panel__label">Document Type</label>
        <select 
          v-model="selectedDocumentType" 
          class="form-control"
          @change="onDocumentTypeChange"
        >
          <option value="">All Types</option>
          <option value="contract">Contract</option>
          <option value="invoice">Invoice</option>
          <option value="report">Report</option>
          <option value="proposal">Proposal</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div v-if="showDocumentStatus" class="filter-panel__group">
        <label class="filter-panel__label">Document Status</label>
        <select 
          v-model="selectedDocumentStatus" 
          class="form-control"
          @change="onDocumentStatusChange"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      <div v-if="showTaskStatus" class="filter-panel__group">
        <label class="filter-panel__label">Task Status</label>
        <select 
          v-model="selectedTaskStatus" 
          class="form-control"
          @change="onTaskStatusChange"
        >
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Filters'
  },
  showDateRange: {
    type: Boolean,
    default: true
  },
  showDocumentTypes: {
    type: Boolean,
    default: false
  },
  showDocumentStatus: {
    type: Boolean,
    default: false
  },
  showTaskStatus: {
    type: Boolean,
    default: false
  },
  initialDateRange: {
    type: Object,
    default: () => ({
      start: '',
      end: ''
    })
  }
});

const emit = defineEmits([
  'date-range-change', 
  'document-type-change', 
  'document-status-change', 
  'task-status-change',
  'reset'
]);

// Initialize date range with one month ago to today if not provided
const dateRange = ref({
  start: props.initialDateRange.start || formatDateForInput(new Date(new Date().setMonth(new Date().getMonth() - 1))),
  end: props.initialDateRange.end || formatDateForInput(new Date())
});

const selectedDocumentType = ref('');
const selectedDocumentStatus = ref('');
const selectedTaskStatus = ref('');

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(date) {
  return date.toISOString().split('T')[0];
}

// Event handlers
function onDateRangeChange() {
  emit('date-range-change', {
    start: dateRange.value.start ? new Date(dateRange.value.start) : null,
    end: dateRange.value.end ? new Date(dateRange.value.end) : null
  });
}

function onDocumentTypeChange() {
  emit('document-type-change', selectedDocumentType.value);
}

function onDocumentStatusChange() {
  emit('document-status-change', selectedDocumentStatus.value);
}

function onTaskStatusChange() {
  emit('task-status-change', selectedTaskStatus.value);
}

function resetFilters() {
  // Reset date range to one month ago to today
  dateRange.value = {
    start: formatDateForInput(new Date(new Date().setMonth(new Date().getMonth() - 1))),
    end: formatDateForInput(new Date())
  };
  
  selectedDocumentType.value = '';
  selectedDocumentStatus.value = '';
  selectedTaskStatus.value = '';
  
  // Emit events
  onDateRangeChange();
  onDocumentTypeChange();
  onDocumentStatusChange();
  onTaskStatusChange();
  
  emit('reset');
}
</script>

<style lang="scss" scoped>
.filter-panel {
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;
  padding: $spacing-md;
  margin-bottom: $spacing-lg;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid $border-color;
  }
  
  &__title {
    margin: 0;
    font-size: $font-size-large;
  }
  
  &__reset {
    background: none;
    border: none;
    color: $primary-color;
    cursor: pointer;
    font-size: $font-size-small;
    font-weight: $font-weight-medium;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
  
  &__group {
    margin-bottom: $spacing-sm;
  }
  
  &__label {
    display: block;
    margin-bottom: $spacing-xs;
    font-weight: $font-weight-medium;
  }
  
  &__date-range {
    display: flex;
    gap: $spacing-md;
    @media (max-width: $breakpoint-md){
      flex-direction: column;
    }
  }
  
  &__date-field {
    flex: 1;
  }
  
  &__date-label {
    display: block;
    font-size: $font-size-small;
    margin-bottom: $spacing-xs;
    color: rgba($text-color, 0.7);
  }
}
</style>
