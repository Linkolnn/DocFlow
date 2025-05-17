import { defineStore } from 'pinia';
import { useDocumentsStore } from './documents';
import { useTasksStore } from './tasks';

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    loading: false,
    error: null,
    dateRange: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last month
      end: new Date()
    },
    cachedData: {
      documentsByStatus: null,
      documentsByDate: null,
      tasksByStatus: null,
      tasksByDate: null,
      processingTimes: null
    }
  }),
  
  getters: {
    documentStatusData: (state) => {
      if (state.cachedData.documentsByStatus) {
        return state.cachedData.documentsByStatus;
      }
      
      const documentsStore = useDocumentsStore();
      const statusCounts = documentsStore.documentsByStatus;
      
      return {
        labels: Object.keys(statusCounts).map(status => status.charAt(0).toUpperCase() + status.slice(1)),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#3498db', '#f39c12', '#2ecc71', '#e74c3c']
        }]
      };
    },
    
    documentTrendData: (state) => {
      if (state.cachedData.documentsByDate) {
        return state.cachedData.documentsByDate;
      }
      
      const documentsStore = useDocumentsStore();
      const documents = documentsStore.documents;
      
      // Group documents by date (daily)
      const dateMap = {};
      const startDate = new Date(state.dateRange.start);
      const endDate = new Date(state.dateRange.end);
      
      // Initialize all dates in range
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dateMap[dateStr] = { created: 0, approved: 0, rejected: 0 };
      }
      
      // Fill in actual data
      documents.forEach(doc => {
        const createdDate = new Date(doc.createdAt).toISOString().split('T')[0];
        const updatedDate = new Date(doc.updatedAt).toISOString().split('T')[0];
        
        // Only count if within date range
        if (new Date(createdDate) >= startDate && new Date(createdDate) <= endDate) {
          if (dateMap[createdDate]) {
            dateMap[createdDate].created++;
          }
        }
        
        if (doc.status === 'approved' && new Date(updatedDate) >= startDate && new Date(updatedDate) <= endDate) {
          if (dateMap[updatedDate]) {
            dateMap[updatedDate].approved++;
          }
        }
        
        if (doc.status === 'rejected' && new Date(updatedDate) >= startDate && new Date(updatedDate) <= endDate) {
          if (dateMap[updatedDate]) {
            dateMap[updatedDate].rejected++;
          }
        }
      });
      
      // Convert to chart data
      const dates = Object.keys(dateMap).sort();
      
      return {
        labels: dates,
        datasets: [
          {
            label: 'Created',
            data: dates.map(date => dateMap[date].created),
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            tension: 0.4
          },
          {
            label: 'Approved',
            data: dates.map(date => dateMap[date].approved),
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            tension: 0.4
          },
          {
            label: 'Rejected',
            data: dates.map(date => dateMap[date].rejected),
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            tension: 0.4
          }
        ]
      };
    },
    
    taskStatusData: (state) => {
      if (state.cachedData.tasksByStatus) {
        return state.cachedData.tasksByStatus;
      }
      
      const tasksStore = useTasksStore();
      const statusCounts = tasksStore.tasksByStatus;
      
      return {
        labels: Object.keys(statusCounts).map(status => {
          // Convert kebab case to title case
          return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#3498db', '#f39c12', '#2ecc71', '#e74c3c']
        }]
      };
    },
    
    processingTimeData: (state) => {
      if (state.cachedData.processingTimes) {
        return state.cachedData.processingTimes;
      }
      
      const documentsStore = useDocumentsStore();
      const documents = documentsStore.documents;
      
      // Calculate processing times for completed documents
      const completedDocs = documents.filter(doc => 
        doc.status === 'approved' || doc.status === 'rejected'
      );
      
      // Group by document type
      const typeMap = {};
      
      completedDocs.forEach(doc => {
        if (!doc.type) return;
        
        const created = new Date(doc.createdAt);
        const updated = new Date(doc.updatedAt);
        const processingHours = (updated - created) / (1000 * 60 * 60); // in hours
        
        if (!typeMap[doc.type]) {
          typeMap[doc.type] = [];
        }
        
        typeMap[doc.type].push(processingHours);
      });
      
      // Calculate averages
      const types = Object.keys(typeMap);
      const averages = types.map(type => {
        const times = typeMap[type];
        const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
        return Math.round(avg * 10) / 10; // Round to 1 decimal place
      });
      
      return {
        labels: types,
        datasets: [{
          label: 'Average Processing Time (hours)',
          data: averages,
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
          borderColor: '#3498db',
          borderWidth: 1
        }]
      };
    }
  },
  
  actions: {
    setDateRange(start, end) {
      this.dateRange = { start, end };
      // Clear cached data that depends on date range
      this.cachedData.documentsByDate = null;
      this.cachedData.tasksByDate = null;
    },
    
    async generateAnalytics() {
      this.loading = true;
      this.error = null;
      
      try {
        // In a real app, this might be a complex API call
        // For now, we'll just use the getters to calculate analytics
        
        // Force recalculation by clearing cache
        this.cachedData = {
          documentsByStatus: this.documentStatusData,
          documentsByDate: this.documentTrendData,
          tasksByStatus: this.taskStatusData,
          processingTimes: this.processingTimeData,
          tasksByDate: null // Not implemented yet
        };
        
        return true;
      } catch (error) {
        this.error = 'Failed to generate analytics: ' + error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    clearCache() {
      this.cachedData = {
        documentsByStatus: null,
        documentsByDate: null,
        tasksByStatus: null,
        tasksByDate: null,
        processingTimes: null
      };
    }
  }
});
