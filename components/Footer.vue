<template>
  <footer class="footer">
    <div class="container footer__container">
      <div class="footer__section">
        <h3 class="footer__section-title">DocFlow</h3>
        <div class="footer__section-content">
          Современная система управления документами, разработанная для оптимизации бизнес-процессов и повышения производительности.
        </div>
      </div>
      
      <div class="footer__section">
        <h3 class="footer__section-title">Быстрые ссылки</h3>
        <ul class="footer__links">
          <li><NuxtLink to="/">Главная</NuxtLink></li>
          <li><NuxtLink to="/dashboard">Панель управления</NuxtLink></li>
          <li><NuxtLink to="/documents">Документы</NuxtLink></li>
          <li><NuxtLink to="/analytics">Аналитика</NuxtLink></li>
        </ul>
      </div>
      
      <div class="footer__section">
        <h3 class="footer__section-title">Ресурсы</h3>
        <ul class="footer__links">
          <li><NuxtLink to="/help">Центр помощи</NuxtLink></li>
          <li><NuxtLink to="/faq">Часто задаваемые вопросы</NuxtLink></li>
          <li><NuxtLink to="/contact">Связаться с нами</NuxtLink></li>
        </ul>
      </div>
      
      <div class="footer__section">
        <h3 class="footer__section-title">Контакты</h3>
        <div class="footer__section-content">
          <p>Email: info@docflow.com</p>
          <p>Телефон: +1 (555) 123-4567</p>
          <p>Адрес: 123 Document Street, Digital City</p>
        </div>
      </div>
    </div>
    
    <div class="container footer__bottom">
      <p>&copy; {{ currentYear }} DocFlow. Все права защищены.</p>
    </div>
  </footer>
</template>

<script setup>
import { useLanguageStore } from '~/stores/language';

const languageStore = useLanguageStore();
const $t = (key) => languageStore.t(key);
const currentYear = new Date().getFullYear();
</script>
