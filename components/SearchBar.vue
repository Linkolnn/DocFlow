<template>
  <div class="search-bar" :class="{ 'search-bar--focused': isFocused }">
    <div class="search-bar__input-wrapper">
      <span class="search-bar__icon">🔍</span>
      <input
        type="text"
        class="search-bar__input"
        :placeholder="placeholder"
        v-model="searchQuery"
        @input="onInput"
        @focus="isFocused = true"
        @blur="onBlur"
      />
      <button
        v-if="searchQuery"
        class="search-bar__clear"
        @click="clearSearch"
      >
        ✕
      </button>
    </div>
    
    <div v-if="showResults && filteredResults.length > 0" class="search-bar__results">
      <div
        v-for="(result, index) in filteredResults"
        :key="index"
        class="search-bar__result"
        :class="{ 'search-bar__result--active': activeIndex === index }"
        @mousedown="selectResult(result)"
        @mouseover="activeIndex = index"
      >
        <div class="search-bar__result-icon">
          <span v-if="result.type === 'document'">📄</span>
          <span v-else-if="result.type === 'task'">✓</span>
          <span v-else>🔍</span>
        </div>
        <div class="search-bar__result-content">
          <div class="search-bar__result-title">{{ result.title }}</div>
          <div class="search-bar__result-subtitle">{{ result.subtitle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useDocumentsStore } from '~/stores/documents';
import { useTasksStore } from '~/stores/tasks';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search...'
  },
  searchTypes: {
    type: Array,
    default: () => ['document', 'task'],
    validator: (value) => {
      return value.every(type => ['document', 'task'].includes(type));
    }
  },
  maxResults: {
    type: Number,
    default: 5
  }
});

const emit = defineEmits(['search', 'select']);

const documentsStore = useDocumentsStore();
const tasksStore = useTasksStore();

const searchQuery = ref('');
const isFocused = ref(false);
const showResults = ref(false);
const activeIndex = ref(-1);
const searchResults = ref([]);

// Watch for search query changes
watch(searchQuery, (newValue) => {
  if (newValue.length >= 2) {
    performSearch();
  } else {
    searchResults.value = [];
  }
});

const filteredResults = computed(() => {
  return searchResults.value.slice(0, props.maxResults);
});

function onInput() {
  emit('search', searchQuery.value);
}

function onBlur() {
  // Delay hiding results to allow for mousedown on result
  setTimeout(() => {
    isFocused.value = false;
    showResults.value = false;
  }, 200);
}

function clearSearch() {
  searchQuery.value = '';
  searchResults.value = [];
  emit('search', '');
}

function performSearch() {
  const results = [];
  
  // Search documents
  if (props.searchTypes.includes('document')) {
    const documents = documentsStore.documents;
    const query = searchQuery.value.toLowerCase();
    
    documents.forEach(doc => {
      if (
        doc.title.toLowerCase().includes(query) ||
        (doc.description && doc.description.toLowerCase().includes(query))
      ) {
        results.push({
          id: doc.id,
          type: 'document',
          title: doc.title,
          subtitle: `Document • ${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}`,
          data: doc
        });
      }
    });
  }
  
  // Search tasks
  if (props.searchTypes.includes('task')) {
    const tasks = tasksStore.tasks;
    const query = searchQuery.value.toLowerCase();
    
    tasks.forEach(task => {
      if (
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      ) {
        results.push({
          id: task.id,
          type: 'task',
          title: task.title,
          subtitle: `Task • ${formatStatus(task.status)}`,
          data: task
        });
      }
    });
  }
  
  searchResults.value = results;
  showResults.value = true;
}

function selectResult(result) {
  emit('select', result);
  searchQuery.value = '';
  searchResults.value = [];
  showResults.value = false;
}

function formatStatus(status) {
  return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Keyboard navigation
function handleKeyDown(e) {
  if (!showResults.value || filteredResults.value.length === 0) return;
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      activeIndex.value = (activeIndex.value + 1) % filteredResults.value.length;
      break;
    case 'ArrowUp':
      e.preventDefault();
      activeIndex.value = activeIndex.value <= 0 ? filteredResults.value.length - 1 : activeIndex.value - 1;
      break;
    case 'Enter':
      if (activeIndex.value >= 0) {
        selectResult(filteredResults.value[activeIndex.value]);
      }
      break;
    case 'Escape':
      showResults.value = false;
      break;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style lang="scss" scoped>
.search-bar {
  position: relative;
  width: 100%;
  
  &--focused {
    .search-bar__input-wrapper {
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
    }
  }
  
  &__input-wrapper {
    display: flex;
    align-items: center;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    padding: 0 $spacing-sm;
    transition: all $transition-fast;
    background-color: white;
  }
  
  &__icon {
    margin-right: $spacing-xs;
    color: rgba($text-color, 0.5);
  }
  
  &__input {
    flex: 1;
    border: none;
    padding: $spacing-sm;
    font-size: $font-size-base;
    background: transparent;
    
    &:focus {
      outline: none;
    }
  }
  
  &__clear {
    background: none;
    border: none;
    color: rgba($text-color, 0.5);
    cursor: pointer;
    padding: 0;
    font-size: $font-size-large;
    
    &:hover {
      color: $text-color;
    }
  }
  
  &__results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    border-radius: $border-radius-md;
    box-shadow: $shadow-md;
    margin-top: $spacing-xs;
    z-index: $z-index-dropdown;
    max-height: 300px;
    overflow-y: auto;
  }
  
  &__result {
    display: flex;
    align-items: center;
    padding: $spacing-sm $spacing-md;
    cursor: pointer;
    transition: background-color $transition-fast;
    
    &:hover,
    &--active {
      background-color: rgba($primary-color, 0.05);
    }
    
    &-icon {
      margin-right: $spacing-sm;
      font-size: $font-size-large;
    }
    
    &-content {
      flex: 1;
    }
    
    &-title {
      font-weight: $font-weight-medium;
    }
    
    &-subtitle {
      font-size: $font-size-small;
      color: rgba($text-color, 0.7);
    }
  }
}
</style>
