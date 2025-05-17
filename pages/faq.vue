<template>
  <div class="faq-page">
    <div class="container">
      <h1 class="page-title">Часто задаваемые вопросы</h1>
      
      <div class="faq-container">
        <div class="faq-item" v-for="(item, index) in faqItems" :key="index">
          <div class="faq-question" @click="toggleFaq(index)" :class="{ 'active': item.isOpen }">
            <h3>{{ item.question }}</h3>
            <span class="faq-icon">{{ item.isOpen ? '−' : '+' }}</span>
          </div>
          <div class="faq-answer" v-show="item.isOpen">
            <p>{{ item.answer }}</p>
          </div>
        </div>
      </div>
      
      <div class="faq-footer">
        <p>Не нашли то, что искали? Посетите наш <NuxtLink to="/help">Центр помощи</NuxtLink> или <NuxtLink to="/contact">Свяжитесь с нами</NuxtLink>.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const faqItems = ref([
  {
    question: "Что такое DocFlow?",
    answer: "DocFlow - это комплексная система управления документами, разработанная для оптимизации бизнес-процессов. Она помогает эффективно управлять документами, отслеживать их и совместно работать над ними.",
    isOpen: false
  },
  {
    question: "Как создать новый документ?",
    answer: "Чтобы создать новый документ, перейдите в раздел 'Документы' из вашего дашборда и нажмите кнопку 'Создать документ'. Заполните необходимые данные и загрузите нужные файлы.",
    isOpen: false
  },
  {
    question: "Могу ли я поделиться документами с внешними пользователями?",
    answer: "Да, вы можете поделиться документами с внешними пользователями, создав защищенную ссылку. Получатель сможет просмотреть документ без необходимости создания учетной записи.",
    isOpen: false
  },
  {
    question: "Как отслеживать изменения в документах?",
    answer: "DocFlow сохраняет историю версий для всех документов. Вы можете просматривать предыдущие версии, сравнивать изменения и восстанавливать более старые версии при необходимости.",
    isOpen: false
  },
  {
    question: "Какие форматы документов поддерживаются?",
    answer: "DocFlow поддерживает широкий спектр форматов документов, включая PDF, DOCX, XLSX, PPTX, TXT и другие. Вы можете загружать, просматривать и управлять всеми этими форматами в системе.",
    isOpen: false
  },
  {
    question: "Насколько безопасен DocFlow?",
    answer: "DocFlow использует стандартные меры безопасности, включая шифрование, защищенную аутентификацию и контроль доступа на основе ролей для обеспечения защиты ваших документов.",
    isOpen: false
  },
  {
    question: "Могу ли я настроить автоматизированные рабочие процессы?",
    answer: "Да, DocFlow позволяет создавать пользовательские рабочие процессы для утверждения, проверки и обработки документов. Вы можете определять этапы, назначать ответственных и устанавливать сроки.",
    isOpen: false
  },
  {
    question: "Как восстановить удаленный документ?",
    answer: "Удаленные документы перемещаются в папку 'Корзина', где они остаются в течение 30 дней до окончательного удаления. Вы можете восстановить документы из Корзины в любое время в течение этого периода.",
    isOpen: false
  },
  {
    question: "Есть ли ограничение на количество документов, которые я могу хранить?",
    answer: "Ограничения по хранению зависят от вашего тарифного плана. Бесплатные учетные записи имеют ограничение в 5 ГБ, в то время как премиум-планы предлагают расширенные варианты хранения.",
    isOpen: false
  },
  {
    question: "Как получить помощь, если я столкнулся с проблемами?",
    answer: "Вы можете посетить наш Центр помощи для получения учебных материалов и руководств, или связаться с нашей службой поддержки через страницу Контакты. Мы обычно отвечаем в течение 24 часов.",
    isOpen: false
  }
]);

function toggleFaq(index) {
  faqItems.value[index].isOpen = !faqItems.value[index].isOpen;
}
</script>

<style scoped>
.faq-page {
  padding: 2rem 0;
}

.page-title {
  margin-bottom: 2rem;
  color: #2c3e50;
  text-align: center;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.faq-question {
  background-color: #fff;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.faq-question:hover {
  background-color: #f8f9fa;
}

.faq-question.active {
  background-color: #3498db;
  color: white;
}

.faq-question h3 {
  margin: 0;
  font-size: 1.1rem;
}

.faq-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

.faq-answer {
  background-color: #f8f9fa;
  padding: 1.25rem;
  border-top: 1px solid #eee;
}

.faq-footer {
  text-align: center;
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}
</style>
