<template>
  <div class="document-list-container">
    <div class="document-list-header">
      <h2 class="document-list-title">{{ title }}</h2>
      
      <div class="document-list-actions">
        <div class="document-list-filter">
          <select v-model="selectedStatus" @change="onStatusChange" class="form-control">
            <option value="">Все статусы</option>
            <option value="draft">Черновик</option>
            <option value="pending">На рассмотрении</option>
            <option value="approved">Одобрен</option>
            <option value="rejected">Отклонен</option>
          </select>
        </div>
        
        <div class="document-list-search">
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="onSearch" 
            placeholder="Поиск документов..." 
            class="form-control"
          />
        </div>
        
        <Button @click="$emit('create')" variant="primary">
          <span>Создать документ</span>
        </Button>
      </div>
    </div>
    
    <div v-if="loading" class="document-list-loading">
      Загрузка документов...
    </div>
    
    <div v-else-if="documents.length === 0" class="document-list__empty">
      <p>Документы не найдены.</p>
      <Button @click="$emit('create')" variant="primary">Создать документ</Button>
    </div>
    
    <table v-else class="document-list">
      <thead class="document-list__header">
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
          <th @click="sortBy('createdAt')" class="hide-md">
            Создан
            <span v-if="sortField === 'createdAt'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortBy('updatedAt')">
            Обновлен
            <span v-if="sortField === 'updatedAt'" class="sort-icon">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th>Действия</th>
        </tr>
      </thead>
      
      <tbody>
        <tr v-for="doc in documents" :key="doc.id" class="document-list__row">
          <td class="document-list__title">{{ doc.title }}</td>
          <td>
            <span 
              class="document-list__status" 
              :class="`document-list__status--${doc.status}`"
            >
              {{ formatStatus(doc.status) }}
            </span>
          </td>
          <td class="document-list__date hide-md">{{ formatDate(doc.createdAt) }}</td>
          <td class="document-list__date">{{ formatDate(doc.updatedAt) }}</td>
          <td class="document-list__actions">
            <button @click="$emit('view', doc.id)" title="Просмотр">👁️</button>
            <button @click="$emit('edit', doc.id)" title="Редактировать">✏️</button>
            <button @click="confirmDelete(doc)" title="Удалить">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="totalPages > 1" class="document-list__pagination">
      <div 
        class="document-list__pagination-item" 
        @click="changePage(currentPage - 1)" 
        :class="{ disabled: currentPage === 1 }"
      >
        &lt;
      </div>
      
      <div 
        v-for="page in paginationRange" 
        :key="page" 
        class="document-list__pagination-item" 
        :class="{ active: page === currentPage }"
        @click="changePage(page)"
      >
        {{ page }}
      </div>
      
      <div 
        class="document-list__pagination-item" 
        @click="changePage(currentPage + 1)" 
        :class="{ disabled: currentPage === totalPages }"
      >
        &gt;
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Подтвердите удаление</h3>
          <button class="modal-close" @click="showDeleteModal = false">×</button>
        </div>
        <div class="modal-body">
          <p>Вы уверены, что хотите удалить "{{ documentToDelete?.title }}"?</p>
          <p>Это действие нельзя отменить.</p>
        </div>
        <div class="modal-footer">
          <Button @click="showDeleteModal = false" variant="outline">Отмена</Button>
          <Button @click="deleteDocument" variant="primary">Удалить</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useDocumentsStore } from '~/stores/documents';

const props = defineProps({
  title: {
    type: String,
    default: 'Документы'
  },
  filter: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['view', 'edit', 'create', 'delete']);

const documentsStore = useDocumentsStore();
const loading = computed(() => documentsStore.loading);
const documents = computed(() => documentsStore.filteredDocuments);
const currentPage = computed(() => documentsStore.pagination.currentPage);
const totalPages = computed(() => documentsStore.totalPages);

const searchQuery = ref('');
const selectedStatus = ref('');
const sortField = ref('updatedAt');
const sortDirection = ref('desc');
const showDeleteModal = ref(false);
const documentToDelete = ref(null);

// Calculate pagination range
const paginationRange = computed(() => {
  const range = [];
  const maxVisiblePages = 5;
  
  if (totalPages.value <= maxVisiblePages) {
    // Show all pages
    for (let i = 1; i <= totalPages.value; i++) {
      range.push(i);
    }
  } else {
    // Show limited pages with ellipsis
    const leftSide = Math.floor(maxVisiblePages / 2);
    const rightSide = maxVisiblePages - leftSide - 1;
    
    if (currentPage.value <= leftSide + 1) {
      // Near start
      for (let i = 1; i <= maxVisiblePages - 1; i++) {
        range.push(i);
      }
      range.push('...');
      range.push(totalPages.value);
    } else if (currentPage.value >= totalPages.value - rightSide) {
      // Near end
      range.push(1);
      range.push('...');
      for (let i = totalPages.value - maxVisiblePages + 2; i <= totalPages.value; i++) {
        range.push(i);
      }
    } else {
      // Middle
      range.push(1);
      range.push('...');
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
        range.push(i);
      }
      range.push('...');
      range.push(totalPages.value);
    }
  }
  
  return range;
});

// Initialize documents
onMounted(async () => {
  await documentsStore.fetchDocuments();
  
  // Apply initial filters if provided
  if (props.filter) {
    if (props.filter.status) {
      selectedStatus.value = props.filter.status;
      documentsStore.setFilter('status', props.filter.status);
    }
    
    if (props.filter.search) {
      searchQuery.value = props.filter.search;
      documentsStore.setFilter('search', props.filter.search);
    }
  }
});

// Methods
function formatStatus(status) {
  switch(status) {
    case 'draft': return 'Черновик';
    case 'pending': return 'На рассмотрении';
    case 'approved': return 'Одобрен';
    case 'rejected': return 'Отклонен';
    default: return status;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function onStatusChange() {
  documentsStore.setFilter('status', selectedStatus.value);
}

function onSearch() {
  documentsStore.setFilter('search', searchQuery.value);
}

function sortBy(field) {
  if (sortField.value === field) {
    // Toggle direction
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
  
  // Apply sorting
  documentsStore.documents.sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    // Handle dates
    if (field === 'createdAt' || field === 'updatedAt') {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }
    
    if (sortDirection.value === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
}

function changePage(page) {
  if (page < 1 || page > totalPages.value || page === '...') {
    return;
  }
  
  documentsStore.setPage(page);
}

function confirmDelete(document) {
  documentToDelete.value = document;
  showDeleteModal.value = true;
}

async function deleteDocument() {
  if (documentToDelete.value) {
    await documentsStore.deleteDocument(documentToDelete.value.id);
    emit('delete', documentToDelete.value.id);
    showDeleteModal.value = false;
    documentToDelete.value = null;
  }
}
</script>

<style lang="scss" scoped>
.document-list-container {
  width: 100%;
}

.document-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
  flex-wrap: wrap;
  gap: $spacing-md;
}

.document-list-title {
  margin: 0;
}

.document-list-actions {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  flex-wrap: wrap;
}

.document-list-filter,
.document-list-search {
  min-width: 200px;
}

.document-list-loading {
  text-align: center;
  padding: $spacing-xl;
  color: rgba($text-color, 0.7);
}

.sort-icon {
  margin-left: $spacing-xs;
  font-size: $font-size-small;
}

// Modal styles
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-index-modal;
}

.modal-content {
  background-color: white;
  border-radius: $border-radius-md;
  width: 100%;
  max-width: 500px;
  box-shadow: $shadow-lg;
}

.modal-header {
  padding: $spacing-md;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $border-color;
  
  h3 {
    margin: 0;
  }
}

.modal-body {
  padding: $spacing-md;
}

.modal-footer {
  padding: $spacing-md;
  border-top: 1px solid $border-color;
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
}

.modal-close {
  background: none;
  border: none;
  font-size: $font-size-xlarge;
  cursor: pointer;
  color: rgba($text-color, 0.7);
  
  &:hover {
    color: $text-color;
  }
}

@media (max-width: $breakpoint-md) {
  .document-list-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .document-list-actions {
    width: 100%;
  }
}
</style>
