import { defineStore } from 'pinia';
import ru from '~/locales/ru';

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: 'ru', // Только русский язык
    translations: {
      ru
    }
  }),
  
  getters: {
    t: (state) => (key) => {
      // Get the translation for the current language
      const translation = state.translations[state.currentLanguage][key];
      
      // If translation doesn't exist, return the key
      if (!translation) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      
      return translation;
    },
    
    currentLang: (state) => state.currentLanguage
  },
  
  actions: {
    // Метод оставлен для совместимости, но всегда устанавливает русский язык
    setLanguage() {
      this.currentLanguage = 'ru';
      // Проверяем, что мы на клиентской стороне перед использованием localStorage
      if (process.client) {
        localStorage.setItem('docflow_language', 'ru');
      }
    },
    
    initLanguage() {
      // Всегда используем русский язык
      this.currentLanguage = 'ru';
      
      // Проверяем, что мы на клиентской стороне
      if (process.client) {
        localStorage.setItem('docflow_language', 'ru');
      }
    }
  }
});
