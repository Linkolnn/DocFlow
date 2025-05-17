<template>
  <div class="analytics-page">
    <h1 class="analytics-page__title">Аналитика</h1>
    
    <FilterPanel 
      title="Фильтры аналитики"
      @date-range-change="handleDateRangeChange"
      @document-type-change="handleDocumentTypeChange"
      @reset="handleFilterReset"
    />

    <div class="analytics-card">
      <h3 class="analytics-card__title">Статистика документов</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-item__value">{{ documentStats.total }}</div>
          <div class="stat-item__label">Всего документов</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-item__value">{{ documentStats.approved }}</div>
          <div class="stat-item__label">Одобрено</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-item__value">{{ documentStats.rejected }}</div>
          <div class="stat-item__label">Отклонено</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-item__value">{{ documentStats.pending }}</div>
          <div class="stat-item__label">Ожидает</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-item__value">{{ averageProcessingTime }}</div>
          <div class="stat-item__label">Ср. время обработки (часы)</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-item__value">{{ approvalRate }}%</div>
          <div class="stat-item__label">Уровень одобрения</div>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="analytics-page__loading">
      Загрузка данных аналитики...
    </div>
    
    <div v-else class="analytics-grid">
      <div class="analytics-card">
        <h3 class="analytics-card__title">Документы по статусу</h3>
        <ChartComponent 
          type="doughnut" 
          :data="documentStatusData" 
          :options="pieChartOptions"
        />
      </div>
      
      <div class="analytics-card">
        <h3 class="analytics-card__title">Время обработки документов</h3>
        <ChartComponent 
          type="bar" 
          :data="processingTimeData" 
          :options="barChartOptions"
        />
      </div>
      
      <div class="analytics-card analytics-card--full">
        <h3 class="analytics-card__title">Тенденция активности документов</h3>
        <ChartComponent 
          type="line" 
          :data="documentTrendData" 
          :options="lineChartOptions"
        />
      </div>
      
      <div class="analytics-card">
        <h3 class="analytics-card__title">Задачи по статусу</h3>
        <ChartComponent 
          type="doughnut" 
          :data="taskStatusData" 
          :options="pieChartOptions"
        />
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAnalyticsStore } from '~/stores/analytics';
import { useDocumentsStore } from '~/stores/documents';
import { useTasksStore } from '~/stores/tasks';

definePageMeta({
  layout: 'dashboard'
});

const analyticsStore = useAnalyticsStore();
const documentsStore = useDocumentsStore();
const tasksStore = useTasksStore();

const loading = ref(true);
const selectedDocumentType = ref('');

// Chart options
const pieChartOptions = {
  plugins: {
    legend: {
      position: 'right'
    }
  }
};

const barChartOptions = {
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Часы'
      }
    }
  }
};

const lineChartOptions = {
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Документы'
      }
    }
  }
};

// Initialize data
onMounted(async () => {
  try {
    // Load documents and tasks if not already loaded
    if (documentsStore.documents.length === 0) {
      await documentsStore.fetchDocuments();
    }
    
    if (tasksStore.tasks.length === 0) {
      await tasksStore.fetchTasks();
    }
    
    // Generate analytics
    await analyticsStore.generateAnalytics();
  } catch (error) {
    console.error('Error loading analytics data:', error);
  } finally {
    loading.value = false;
  }
});

// Chart data from analytics store
const documentStatusData = computed(() => analyticsStore.documentStatusData);
const documentTrendData = computed(() => analyticsStore.documentTrendData);
const taskStatusData = computed(() => analyticsStore.taskStatusData);
const processingTimeData = computed(() => analyticsStore.processingTimeData);

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

// Calculate average processing time (in hours)
const averageProcessingTime = computed(() => {
  const docs = documentsStore.documents.filter(
    d => d.status === 'approved' || d.status === 'rejected'
  );
  
  if (docs.length === 0) return '0';
  
  const totalHours = docs.reduce((sum, doc) => {
    const created = new Date(doc.createdAt);
    const updated = new Date(doc.updatedAt);
    const hours = (updated - created) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);
  
  return (totalHours / docs.length).toFixed(1);
});

// Calculate approval rate
const approvalRate = computed(() => {
  const approved = documentStats.value.approved;
  const total = approved + documentStats.value.rejected;
  
  if (total === 0) return '0';
  
  return Math.round((approved / total) * 100);
});

// Event handlers
function handleDateRangeChange(range) {
  analyticsStore.setDateRange(range.start, range.end);
  refreshAnalytics();
}

function handleDocumentTypeChange(type) {
  selectedDocumentType.value = type;
  refreshAnalytics();
}

function handleFilterReset() {
  selectedDocumentType.value = '';
  refreshAnalytics();
}

async function refreshAnalytics() {
  loading.value = true;
  
  try {
    // Clear cached data and regenerate
    analyticsStore.clearCache();
    await analyticsStore.generateAnalytics();
  } catch (error) {
    console.error('Error refreshing analytics:', error);
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.analytics-page {
  &__title {
    margin-bottom: $spacing-lg;
  }
  
  &__loading {
    text-align: center;
    padding: $spacing-xl;
    background-color: white;
    border-radius: $border-radius-md;
    box-shadow: $shadow-sm;
  }
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-lg;
  
  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
    gap: $spacing-md;
  }
  
  @media (max-width: 320px) {
    gap: $spacing-sm;
  }
}

.analytics-card {
  margin-bottom: 24px;
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;
  padding: $spacing-lg;
  
  @media (max-width: $breakpoint-md) {
    padding: $spacing-md;
  }
  
  @media (max-width: 320px) {
    padding: $spacing-sm;
    border-radius: $border-radius-sm;
  }
  
  &--full {
    grid-column: 1 / -1;
  }
  
  &__title {
    margin-top: 0;
    margin-bottom: $spacing-md;
    font-size: $font-size-large;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-base;
      margin-bottom: $spacing-sm;
    }
    
    @media (max-width: 320px) {
      font-size: 1rem;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
  
  @media (max-width: $breakpoint-sm) {
    gap: $spacing-sm;
  }
  
  @media (max-width: 320px) {
    grid-template-columns: 1fr;
  }
}

.stat-item {
  text-align: center;
  padding: $spacing-md;
  background-color: rgba($light-color, 0.5);
  border-radius: $border-radius-sm;
  
  @media (max-width: $breakpoint-sm) {
    padding: $spacing-sm;
  }
  
  @media (max-width: 320px) {
    padding: $spacing-xs;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
  }
  
  &__value {
    font-size: $font-size-xxlarge;
    font-weight: $font-weight-bold;
    color: $primary-color;
    line-height: 1;
    margin-bottom: $spacing-xs;
    
    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-xlarge;
    }
    
    @media (max-width: 320px) {
      font-size: $font-size-large;
      margin-bottom: 0;
      margin-right: $spacing-sm;
    }
  }
  
  &__label {
    font-size: $font-size-small;
    color: rgba($text-color, 0.7);
    
    @media (max-width: 320px) {
      font-size: 0.8rem;
    }
  }
}
</style>
