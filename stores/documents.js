import { defineStore } from 'pinia';

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [],
    currentDocument: null,
    loading: false,
    error: null,
    filters: {
      status: null,
      search: '',
      dateRange: null
    },
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    }
  }),
  
  getters: {
    filteredDocuments: (state) => {
      let filtered = [...state.documents];
      
      // Apply status filter
      if (state.filters.status) {
        filtered = filtered.filter(doc => doc.status === state.filters.status);
      }
      
      // Apply search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(doc => 
          doc.title.toLowerCase().includes(searchLower) || 
          doc.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply date range filter
      if (state.filters.dateRange) {
        const { start, end } = state.filters.dateRange;
        filtered = filtered.filter(doc => {
          const docDate = new Date(doc.createdAt);
          return docDate >= start && docDate <= end;
        });
      }
      
      // Update total for pagination
      state.pagination.totalItems = filtered.length;
      
      // Apply pagination
      const { currentPage, itemsPerPage } = state.pagination;
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filtered.slice(startIndex, startIndex + itemsPerPage);
    },
    
    documentsByStatus: (state) => {
      const result = {
        draft: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      };
      
      state.documents.forEach(doc => {
        if (result[doc.status] !== undefined) {
          result[doc.status]++;
        }
      });
      
      return result;
    },
    
    totalPages: (state) => {
      return Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage);
    }
  },
  
  actions: {
    async fetchDocuments() {
      this.loading = true;
      this.error = null;
      
      try {
        // In a real app, this would be an API call
        // For now, we'll use localStorage
        const storedDocs = localStorage.getItem('documents');
        this.documents = storedDocs ? JSON.parse(storedDocs) : [];
        
        // Sort by date (newest first)
        this.documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return this.documents;
      } catch (error) {
        this.error = 'Failed to fetch documents: ' + error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async fetchDocumentById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        // In a real app, this would be an API call
        // For now, we'll use localStorage
        const storedDocs = localStorage.getItem('documents');
        const documents = storedDocs ? JSON.parse(storedDocs) : [];
        
        const document = documents.find(doc => doc.id === id);
        
        if (!document) {
          throw new Error('Document not found');
        }
        
        this.currentDocument = document;
        return document;
      } catch (error) {
        this.error = 'Failed to fetch document: ' + error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async createDocument(documentData) {
      this.loading = true;
      this.error = null;
      
      try {
        // In a real app, this would be an API call
        // For now, we'll use localStorage
        const storedDocs = localStorage.getItem('documents');
        const documents = storedDocs ? JSON.parse(storedDocs) : [];
        
        const newDocument = {
          id: Date.now().toString(),
          ...documentData,
          status: documentData.status || 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        documents.push(newDocument);
        localStorage.setItem('documents', JSON.stringify(documents));
        
        // Update local state
        this.documents.push(newDocument);
        
        return newDocument;
      } catch (error) {
        this.error = 'Failed to create document: ' + error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async updateDocument(id, updates) {
      this.loading = true;
      this.error = null;
      
      try {
        // In a real app, this would be an API call
        // For now, we'll use localStorage
        const storedDocs = localStorage.getItem('documents');
        const documents = storedDocs ? JSON.parse(storedDocs) : [];
        
        const index = documents.findIndex(doc => doc.id === id);
        
        if (index === -1) {
          throw new Error('Document not found');
        }
        
        // Update document
        const updatedDocument = {
          ...documents[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        documents[index] = updatedDocument;
        localStorage.setItem('documents', JSON.stringify(documents));
        
        // Update local state
        const stateIndex = this.documents.findIndex(doc => doc.id === id);
        if (stateIndex !== -1) {
          this.documents[stateIndex] = updatedDocument;
        }
        
        if (this.currentDocument && this.currentDocument.id === id) {
          this.currentDocument = updatedDocument;
        }
        
        return updatedDocument;
      } catch (error) {
        this.error = 'Failed to update document: ' + error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteDocument(id) {
      this.loading = true;
      this.error = null;
      
      try {
        // In a real app, this would be an API call
        // For now, we'll use localStorage
        const storedDocs = localStorage.getItem('documents');
        const documents = storedDocs ? JSON.parse(storedDocs) : [];
        
        const index = documents.findIndex(doc => doc.id === id);
        
        if (index === -1) {
          throw new Error('Document not found');
        }
        
        // Remove document
        documents.splice(index, 1);
        localStorage.setItem('documents', JSON.stringify(documents));
        
        // Update local state
        this.documents = this.documents.filter(doc => doc.id !== id);
        
        if (this.currentDocument && this.currentDocument.id === id) {
          this.currentDocument = null;
        }
        
        return true;
      } catch (error) {
        this.error = 'Failed to delete document: ' + error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    setFilter(filterName, value) {
      this.filters[filterName] = value;
      // Reset to first page when filtering
      this.pagination.currentPage = 1;
    },
    
    clearFilters() {
      this.filters = {
        status: null,
        search: '',
        dateRange: null
      };
      this.pagination.currentPage = 1;
    },
    
    setPage(page) {
      this.pagination.currentPage = page;
    },
    
    setItemsPerPage(count) {
      this.pagination.itemsPerPage = count;
      this.pagination.currentPage = 1;
    }
  }
});
