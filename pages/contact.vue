<template>
  <div class="contact-page">
    <div class="container">
      <h1 class="page-title">Связаться с нами</h1>
      
      <div class="contact-container">
        <div class="contact-info">
          <h2>Свяжитесь с нами</h2>
          <p>Мы здесь, чтобы помочь вам! Если у вас есть вопросы, отзывы или вам нужна помощь с DocFlow, не стесняйтесь обращаться к нам.</p>
          
          <div class="contact-details">
            <div class="contact-item">
              <i class="fas fa-envelope"></i>
              <div>
                <h3>Электронная почта</h3>
                <p>support@docflow.com</p>
                <p>info@docflow.com</p>
              </div>
            </div>
            
            <div class="contact-item">
              <i class="fas fa-phone-alt"></i>
              <div>
                <h3>Телефон</h3>
                <p>+1 (555) 123-4567</p>
                <p>Пн-Пт: 9:00 - 17:00 МСК</p>
              </div>
            </div>
            
            <div class="contact-item">
              <i class="fas fa-map-marker-alt"></i>
              <div>
                <h3>Адрес</h3>
                <p>ул. Документная, 123</p>
                <p>Цифровой город, 10101</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="contact-form">
          <h2>Отправить нам сообщение</h2>
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="name">Имя</label>
              <input 
                type="text" 
                id="name" 
                v-model="formData.name" 
                required
                placeholder="Ваше имя"
              />
            </div>
            
            <div class="form-group">
              <label for="email">Электронная почта</label>
              <input 
                type="email" 
                id="email" 
                v-model="formData.email" 
                required
                placeholder="Ваш адрес электронной почты"
              />
            </div>
            
            <div class="form-group">
              <label for="subject">Тема</label>
              <input 
                type="text" 
                id="subject" 
                v-model="formData.subject" 
                required
                placeholder="Тема сообщения"
              />
            </div>
            
            <div class="form-group">
              <label for="message">Сообщение</label>
              <textarea 
                id="message" 
                v-model="formData.message" 
                required
                placeholder="Ваше сообщение"
                rows="5"
              ></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Отправка...' : 'Отправить сообщение' }}
            </button>
            
            <div v-if="formSubmitted" class="form-success">
              Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.
            </div>
          </form>
        </div>
      </div>
      
      <div class="faq-link">
        <p>Есть вопросы? Посмотрите наш раздел <NuxtLink to="/faq">Часто задаваемые вопросы</NuxtLink> для быстрых ответов на распространенные вопросы.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const isSubmitting = ref(false);
const formSubmitted = ref(false);

function submitForm() {
  isSubmitting.value = true;
  
  // Simulate form submission
  setTimeout(() => {
    // In a real application, you would send the form data to your backend here
    console.log('Form submitted:', formData.value);
    
    // Reset form
    formData.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
    
    isSubmitting.value = false;
    formSubmitted.value = true;
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      formSubmitted.value = false;
    }, 5000);
  }, 1500);
}
</script>

<style scoped>
.contact-page {
  padding: 2rem 0;
}

.page-title {
  margin-bottom: 2rem;
  color: #2c3e50;
  text-align: center;
}

.contact-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .contact-container {
    grid-template-columns: 1fr;
  }
}

.contact-info, .contact-form {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.contact-info h2, .contact-form h2 {
  color: #3498db;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.contact-details {
  margin-top: 2rem;
}

.contact-item {
  display: flex;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.contact-item i {
  font-size: 1.5rem;
  color: #3498db;
  margin-right: 1rem;
  margin-top: 0.25rem;
}

.contact-item h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.contact-item p {
  margin: 0 0 0.25rem 0;
  color: #666;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}

.form-group input:focus, .form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #2980b9;
}

.btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.form-success {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #d4edda;
  color: #155724;
  border-radius: 4px;
  text-align: center;
}

.faq-link {
  text-align: center;
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}
</style>
