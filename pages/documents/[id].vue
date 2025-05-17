<template>
  <div class="document-detail-page">
    <div v-if="loading" class="document-detail-page__loading">
      Загрузка документа...
    </div>
    
    <div v-else-if="!document" class="document-detail-page__not-found">
      <h2>Документ не найден</h2>
      <p>Документ, который вы ищете, не существует или был удален.</p>
      <Button @click="router.push('/documents')" variant="primary">Вернуться к документам</Button>
    </div>
    
    <template v-else>
      <div class="document-detail-page__header">
        <div class="document-detail-page__title-section">
          <h1 class="document-detail-page__title">{{ document.title }}</h1>
          <span 
            class="document-status" 
            :class="`document-status--${document.status}`"
          >
            {{ formatStatus(document.status) }}
          </span>
        </div>
        
        <div class="document-detail-page__actions">
          <Button @click="router.push('/documents')" variant="outline">Назад</Button>
          <Button @click="router.push(`/documents/${document.id}/edit`)" variant="primary">Редактировать</Button>
        </div>
      </div>
      
      <div class="document-detail">
        <div class="document-detail__meta">
          <div class="document-detail__meta-item">
            <span class="document-detail__meta-label">Тип документа:</span>
            <span class="document-detail__meta-value">{{ formatDocumentType(document.type) }}</span>
          </div>
          
          <div class="document-detail__meta-item">
            <span class="document-detail__meta-label">Создан:</span>
            <span class="document-detail__meta-value">{{ formatDate(document.createdAt) }}</span>
          </div>
          
          <div class="document-detail__meta-item">
            <span class="document-detail__meta-label">Последнее обновление:</span>
            <span class="document-detail__meta-value">{{ formatDate(document.updatedAt) }}</span>
          </div>
        </div>
        
        <div v-if="document.description" class="document-detail__description">
          <h3 class="document-detail__section-title">Описание</h3>
          <p>{{ document.description }}</p>
        </div>
        
        <div class="document-detail__content">
          <h3 class="document-detail__section-title">Содержание</h3>
          <div class="document-detail__content-box">
            {{ document.content }}
          </div>
        </div>
        
        <div class="document-detail__actions">
          <div v-if="document.status === 'pending'" class="document-approval-actions">
            <Button @click="updateStatus('approved')" variant="secondary">Одобрить</Button>
            <Button @click="updateStatus('rejected')" variant="outline">Отклонить</Button>
          </div>
          
          <Button @click="downloadDocument" variant="outline">Скачать</Button>
        </div>
        
        <div class="document-detail__comments">
          <h3 class="document-detail__section-title">Комментарии</h3>
          
          <div v-if="!document.comments || document.comments.length === 0" class="document-detail__no-comments">
            Пока нет комментариев.
          </div>
          
          <div v-else class="comment-list">
            <div v-for="(comment, index) in document.comments" :key="index" class="comment">
              <div class="comment__header">
                <div class="comment__author">{{ comment.author }}</div>
                <div class="comment__date">{{ formatDate(comment.createdAt) }}</div>
              </div>
              <div class="comment__content">{{ comment.content }}</div>
            </div>
          </div>
          
          <div class="comment-form">
            <h4 class="comment-form__title">Добавить комментарий</h4>
            <textarea 
              v-model="newComment" 
              class="form-control" 
              rows="3" 
              placeholder="Напишите ваш комментарий здесь..."
            ></textarea>
            <Button 
              @click="addComment" 
              :disabled="!newComment.trim()" 
              variant="primary" 
              class="comment-form__submit"
            >
              Отправить комментарий
            </Button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDocumentsStore } from '~/stores/documents';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'dashboard'
});

const route = useRoute();
const router = useRouter();
const documentsStore = useDocumentsStore();
const authStore = useAuthStore();

const documentId = computed(() => route.params.id);
const loading = ref(true);
const newComment = ref('');

// Fetch document data
onMounted(async () => {
  try {
    await documentsStore.fetchDocumentById(documentId.value);
  } catch (error) {
    console.error('Error fetching document:', error);
  } finally {
    loading.value = false;
  }
});

// Get document from store
const document = computed(() => documentsStore.currentDocument);

// Format document status
function formatStatus(status) {
  switch(status) {
    case 'draft': return 'Черновик';
    case 'pending': return 'На рассмотрении';
    case 'approved': return 'Одобрен';
    case 'rejected': return 'Отклонен';
    default: return status;
  }
}

// Format document type
function formatDocumentType(type) {
  switch(type) {
    case 'contract': return 'Договор';
    case 'invoice': return 'Счет';
    case 'report': return 'Отчет';
    default: return 'Неизвестный тип';
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Update document status
async function updateStatus(newStatus) {
  if (!document.value) return;
  
  try {
    await documentsStore.updateDocument(documentId.value, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating document status:', error);
  }
}

// Add a comment
async function addComment() {
  if (!document.value || !newComment.value.trim()) return;
  
  const comment = {
    author: authStore.userFullName || 'Anonymous',
    content: newComment.value.trim(),
    createdAt: new Date().toISOString()
  };
  
  try {
    // Get existing comments or initialize empty array
    const comments = document.value.comments || [];
    
    await documentsStore.updateDocument(documentId.value, {
      comments: [...comments, comment],
      updatedAt: new Date().toISOString()
    });
    
    // Clear comment input
    newComment.value = '';
  } catch (error) {
    console.error('Error adding comment:', error);
  }
}

// Download document
function downloadDocument() {
  if (!document.value) return;
  
  // Create a blob with the document content
  const blob = new Blob([document.value.content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Create a link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `${document.value.title}.txt`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
</script>

<style lang="scss" scoped>
.document-detail-page {
  &__loading,
  &__not-found {
    text-align: center;
    padding: $spacing-xl;
    
    .btn {
      margin-top: $spacing-md;
    }
  }
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
    flex-wrap: wrap;
    gap: $spacing-md;
  }
  
  &__title-section {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex-wrap: wrap;
  }
  
  &__title {
    margin: 0;
  }
  
  &__actions {
    display: flex;
    gap: $spacing-sm;
  }
}

.document-status {
  display: inline-block;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-sm;
  font-size: $font-size-small;
  font-weight: $font-weight-medium;
  
  &--draft {
    background-color: $light-color;
    color: $dark-color;
  }
  
  &--pending {
    background-color: $warning-color;
    color: white;
  }
  
  &--approved {
    background-color: $success-color;
    color: white;
  }
  
  &--rejected {
    background-color: $error-color;
    color: white;
  }
}

.document-detail {
  background-color: white;
  border-radius: $border-radius-md;
  padding: $spacing-lg;
  box-shadow: $shadow-sm;
  
  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-lg;
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-lg;
    border-bottom: 1px solid $border-color;
  }
  
  &__meta-item {
    display: flex;
    flex-direction: column;
  }
  
  &__meta-label {
    font-size: $font-size-small;
    color: rgba($text-color, 0.7);
    margin-bottom: $spacing-xs;
  }
  
  &__meta-value {
    font-weight: $font-weight-medium;
  }
  
  &__section-title {
    margin-bottom: $spacing-md;
  }
  
  &__description {
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-lg;
    border-bottom: 1px solid $border-color;
  }
  
  &__content {
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-lg;
    border-bottom: 1px solid $border-color;
  }
  
  &__content-box {
    background-color: rgba($light-color, 0.5);
    padding: $spacing-md;
    border-radius: $border-radius-sm;
    white-space: pre-wrap;
    font-family: monospace;
  }
  
  &__actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-lg;
    border-bottom: 1px solid $border-color;
  }
  
  &__no-comments {
    color: rgba($text-color, 0.7);
    font-style: italic;
    margin-bottom: $spacing-lg;
  }
}

.document-approval-actions {
  display: flex;
  gap: $spacing-sm;
}

.comment-list {
  margin-bottom: $spacing-lg;
}

.comment {
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid rgba($border-color, 0.5);
  
  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: $spacing-xs;
  }
  
  &__author {
    font-weight: $font-weight-medium;
  }
  
  &__date {
    font-size: $font-size-small;
    color: rgba($text-color, 0.7);
  }
  
  &__content {
    white-space: pre-wrap;
  }
}

.comment-form {
  &__title {
    margin-bottom: $spacing-sm;
  }
  
  &__submit {
    margin-top: $spacing-sm;
  }
}
</style>
