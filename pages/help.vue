<template>
  <div class="help-center">
    <div class="container">
      <h1 class="page-title">Центр помощи</h1>
      
      <div class="help-section">
        <h2>Начало работы</h2>
        <div class="help-card">
          <h3>Настройка аккаунта</h3>
          <p>Чтобы начать работу с DocFlow, вам необходимо создать аккаунт. Нажмите кнопку "Регистрация" на главной странице и заполните свои данные. После регистрации вы можете войти в систему и получить доступ ко всем функциям.</p>
        </div>
        
        <div class="help-card">
          <h3>Навигация по панели управления</h3>
          <p>После входа в систему вы будете перенаправлены на панель управления. Здесь вы можете увидеть обзор ваших документов, задач и последних действий. Используйте боковую панель для навигации по различным разделам приложения.</p>
        </div>
      </div>
      
      <div class="help-section">
        <h2>Управление документами</h2>
        <div class="help-card">
          <h3>Создание документов</h3>
          <p>Чтобы создать новый документ, перейдите в раздел "Документы" и нажмите кнопку "Создать документ". Заполните необходимые данные и загрузите нужные файлы.</p>
        </div>
        
        <div class="help-card">
          <h3>Статусы документов</h3>
          <p>Документы в DocFlow могут иметь следующие статусы:</p>
          <ul>
            <li><strong>Черновик:</strong> Документ находится в процессе подготовки и еще не отправлен на рассмотрение.</li>
            <li><strong>На рассмотрении:</strong> Документ отправлен и ожидает рассмотрения.</li>
            <li><strong>Утверждено:</strong> Документ рассмотрен и утвержден.</li>
            <li><strong>Отклонено:</strong> Документ рассмотрен и отклонен.</li>
          </ul>
        </div>
      </div>
      
      <div class="help-section">
        <h2>Управление задачами</h2>
        <div class="help-card">
          <h3>Создание задач</h3>
          <p>Задачи можно создавать с панели управления или непосредственно из документа. Нажмите "Создать задачу", заполните детали и назначьте ее соответствующему члену команды.</p>
        </div>
        
        <div class="help-card">
          <h3>Отслеживание задач</h3>
          <p>Отслеживайте прогресс задач через индикаторы статуса. Вы можете фильтровать задачи по статусу, исполнителю или сроку выполнения для лучшего управления рабочим процессом.</p>
        </div>
      </div>
      
      <div class="help-section">
        <h2>Аналитика</h2>
        <div class="help-card">
          <h3>Понимание ваших данных</h3>
          <p>Раздел аналитики предоставляет визуальное представление метрик обработки документов. Используйте фильтры для анализа данных по временному диапазону, типу документа или статусу.</p>
        </div>
      </div>
      
      <div class="help-section">
        <h2>Нужна дополнительная помощь?</h2>
        <div class="help-card">
          <p>Если вы не можете найти ответ на свой вопрос, пожалуйста, проверьте наши <NuxtLink to="/faq">Часто задаваемые вопросы</NuxtLink> или <NuxtLink to="/contact">свяжитесь с нашей службой поддержки</NuxtLink>.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLanguageStore } from '~/stores/language';

const languageStore = useLanguageStore();
const $t = (key) => languageStore.t(key);
</script>

<style scoped>
.help-center {
  padding: 2rem 0;
}

.page-title {
  margin-bottom: 2rem;
  color: #2c3e50;
  text-align: center;
}

.help-section {
  margin-bottom: 3rem;
}

.help-section h2 {
  margin-bottom: 1.5rem;
  color: #3498db;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.help-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.help-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.help-card ul {
  padding-left: 1.5rem;
  margin-top: 0.5rem;
}

.help-card li {
  margin-bottom: 0.5rem;
}
</style>
