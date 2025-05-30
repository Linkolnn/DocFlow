import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', {
  state: () => ({
    isSidebarOpen: false
  }),
  
  actions: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
      
      // Блокируем прокрутку страницы, когда сайдбар открыт
      if (this.isSidebarOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    
    closeSidebar() {
      this.isSidebarOpen = false;
      document.body.style.overflow = '';
    }
  }
});
