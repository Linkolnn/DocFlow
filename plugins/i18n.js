import { useLanguageStore } from '~/stores/language';

export default defineNuxtPlugin(nuxtApp => {
  const languageStore = useLanguageStore();
  
  // Initialize language from localStorage or default
  languageStore.initLanguage();
  
  // Add translation helper to the app
  nuxtApp.provide('t', (key) => languageStore.t(key));
  
  // Add language switcher to the app
  nuxtApp.provide('setLanguage', (lang) => languageStore.setLanguage(lang));
  
  // Add current language getter
  nuxtApp.provide('currentLang', () => languageStore.currentLang);
});
