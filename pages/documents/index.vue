<template>
  <div class="documents-page">
    <h1 class="documents-page__title">Документы</h1>
    
    <DocumentList 
      title="Все документы"
      @view="viewDocument"
      @edit="editDocument"
      @create="createDocument"
      @delete="handleDocumentDeleted"
    />
  </div>
</template>

<script setup>
import { useDocumentsStore } from '~/stores/documents';

definePageMeta({
  layout: 'dashboard'
});

const documentsStore = useDocumentsStore();
const router = useRouter();

// Initialize documents
onMounted(async () => {
  await documentsStore.fetchDocuments();
});

function viewDocument(id) {
  router.push(`/documents/${id}`);
}

function editDocument(id) {
  router.push(`/documents/${id}/edit`);
}

function createDocument() {
  router.push('/documents/create');
}

function handleDocumentDeleted(id) {
  // Document is already deleted from the store
  // This is just a hook for any additional actions needed
  console.log(`Document ${id} deleted`);
}
</script>

<style lang="scss" scoped>
.documents-page {
  &__title {
    margin-bottom: $spacing-lg;
  }
}
</style>
