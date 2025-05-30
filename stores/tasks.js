import { defineStore } from 'pinia';

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
    filters: {
      status: null,
      search: '',
      assignee: null
    },
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    }
  }),
  
  getters: {
    filteredTasks: (state) => {
      let filtered = [...state.tasks];
      
      // Apply status filter
      if (state.filters.status) {
        filtered = filtered.filter(task => task.status === state.filters.status);
      }
      
      // Apply search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(searchLower) || 
          task.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply assignee filter
      if (state.filters.assignee) {
        filtered = filtered.filter(task => task.assigneeId === state.filters.assignee);
      }
      
      // Update total for pagination
      state.pagination.totalItems = filtered.length;
      
      // Apply pagination
      const { currentPage, itemsPerPage } = state.pagination;
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filtered.slice(startIndex, startIndex + itemsPerPage);
    },
    
    tasksByStatus: (state) => {
      const result = {
        todo: 0,
        'in-progress': 0,
        completed: 0,
        overdue: 0
      };
      
      state.tasks.forEach(task => {
        // Check if task is overdue
        if (task.status !== 'completed' && new Date(task.deadline) < new Date()) {
          result.overdue++;
        } else if (result[task.status] !== undefined) {
          result[task.status]++;
        }
      });
      
      return result;
    },
    
    totalPages: (state) => {
      return Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage);
    }
  },
  
  actions: {
    async fetchTasks() {
      this.loading = true;
      this.error = null;
      
      try {
        // In a real app, this would be an API call
        // For now, we'll use localStorage
        const storedTasks = localStorage.getItem('tasks');
        this.tasks = storedTasks ? JSON.parse(storedTasks) : [];
        
        // Sort by deadline (closest first)
        this.tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        
        return this.tasks;
      } catch (error) {
        this.error = 'Failed to fetch tasks: ' + error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async fetchTaskById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        // In a real app, this would be an API call
        // For now, we'll use localStorage
        const storedTasks = localStorage.getItem('tasks');
        const tasks = storedTasks ? JSON.parse(storedTasks) : [];
        
        const task = tasks.find(task => task.id === id);
        
        if (!task) {
          throw new Error('Task not found');
        }
        
        this.currentTask = task;
        return task;
      } catch (error) {
        this.error = 'Failed to fetch task: ' + error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async createTask(taskData) {
      this.loading = true;
      this.error = null;
      
      try {
        // In a real app, this would be an API call
        // For now, we'll use localStorage
        const storedTasks = localStorage.getItem('tasks');
        const tasks = storedTasks ? JSON.parse(storedTasks) : [];
        
        const newTask = {
          id: Date.now().toString(),
          ...taskData,
          status: taskData.status || 'todo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Update local state
        this.tasks.push(newTask);
        
        return newTask;
      } catch (error) {
        this.error = 'Failed to create task: ' + error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async updateTask(id, updates) {
      this.loading = true;
      this.error = null;
      
      try {
        // In a real app, this would be an API call
        // For now, we'll use localStorage
        const storedTasks = localStorage.getItem('tasks');
        const tasks = storedTasks ? JSON.parse(storedTasks) : [];
        
        const index = tasks.findIndex(task => task.id === id);
        
        if (index === -1) {
          throw new Error('Task not found');
        }
        
        // Update task
        const updatedTask = {
          ...tasks[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        tasks[index] = updatedTask;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Update local state
        const stateIndex = this.tasks.findIndex(task => task.id === id);
        if (stateIndex !== -1) {
          this.tasks[stateIndex] = updatedTask;
        }
        
        if (this.currentTask && this.currentTask.id === id) {
          this.currentTask = updatedTask;
        }
        
        return updatedTask;
      } catch (error) {
        this.error = 'Не удалось обновить задачу: ' + error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteTask(id) {
      this.loading = true;
      this.error = null;
      
      try {
        // In a real app, this would be an API call
        // For now, we'll use localStorage
        const storedTasks = localStorage.getItem('tasks');
        const tasks = storedTasks ? JSON.parse(storedTasks) : [];
        
        const index = tasks.findIndex(task => task.id === id);
        
        if (index === -1) {
          throw new Error('Task not found');
        }
        
        // Remove task
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Update local state
        this.tasks = this.tasks.filter(task => task.id !== id);
        
        if (this.currentTask && this.currentTask.id === id) {
          this.currentTask = null;
        }
        
        return true;
      } catch (error) {
        this.error = 'Failed to delete task: ' + error.message;
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
        assignee: null
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
