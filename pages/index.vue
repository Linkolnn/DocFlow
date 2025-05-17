<template>
  <div>
    <section class="hero">
      <div class="container">
        <div class="hero__content">
          <h1 class="hero__title">Оптимизируйте работу с документами</h1>
          <p class="hero__subtitle">
            DocFlow помогает компаниям управлять, отслеживать и оптимизировать процессы документооборота с помощью современного и интуитивно понятного интерфейса.
          </p>
          <div class="hero__actions">
            <NuxtLink v-if="!isAuthenticated" to="/register" class="btn btn-primary hero__btn">Начать работу</NuxtLink>
            <NuxtLink v-else to="/dashboard" class="btn btn-primary hero__btn">Перейти в дашборд</NuxtLink>
            <NuxtLink to="#features" class="btn btn-outline hero__btn">Узнать больше</NuxtLink>
          </div>
        </div>
        <div class="hero__image">
          <img src="/images/hero-illustration.svg" alt="Управление документами" />
        </div>
      </div>
    </section>

    <section id="features" class="features">
      <div class="container">
        <h2 class="section-title">Почему стоит выбрать DocFlow?</h2>
        <div class="features__grid">
          <div class="feature-card">
            <div class="feature-card__icon">📄</div>
            <h3 class="feature-card__title">Управление документами</h3>
            <p class="feature-card__description">
              Легко загружайте, организуйте и отслеживайте все ваши бизнес-документы в одном безопасном месте.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-card__icon">✓</div>
            <h3 class="feature-card__title">Автоматизация задач</h3>
            <p class="feature-card__description">
              Автоматизируйте рутинные задачи и рабочие процессы с документами, чтобы сэкономить время и уменьшить количество ошибок.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-card__icon">📊</div>
            <h3 class="feature-card__title">Аналитика и отчетность</h3>
            <p class="feature-card__description">
              Получайте аналитические данные о ваших процессах документооборота с помощью детальной аналитики и настраиваемых отчетов.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-card__icon">🔒</div>
            <h3 class="feature-card__title">Безопасность и соответствие</h3>
            <p class="feature-card__description">
              Обеспечьте безопасность ваших документов с помощью функций корпоративного уровня защиты и соответствия нормативным требованиям.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <div class="cta__content">
          <h2 class="cta__title">Готовы трансформировать ваш документооборот?</h2>
          <p class="cta__description">
            Присоединяйтесь к тысячам компаний, которые используют DocFlow для оптимизации своих процессов работы с документами.
          </p>
          <NuxtLink v-if="!isAuthenticated" to="/register" class="btn btn-primary cta__btn">Начать сегодня</NuxtLink>
          <NuxtLink v-else to="/dashboard" class="btn btn-primary cta__btn">Перейти в дашборд</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'default'
});

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Initialize auth store
onMounted(() => {
  authStore.initialize();
});
</script>

<style lang="scss" scoped>
.hero {
  padding: $spacing-xxl 0;
  background-color: rgba($primary-color, 0.05);
  
  .container {
    display: flex;
    align-items: center;
    gap: $spacing-xl;
    
    @media (max-width: $breakpoint-md) {
      flex-direction: column;
      text-align: center;
    }
  }
  
  &__content {
    flex: 1;
  }
  
  &__title {
    font-size: 3rem;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-md;
    color: $dark-color;
    
    @media (max-width: $breakpoint-md) {
      font-size: 2.5rem;
    }
    
    @media (max-width: $breakpoint-sm) {
      font-size: 2rem;
    }
    
    @media (max-width: 320px) {
      font-size: 1.5rem;
      margin-bottom: $spacing-sm;
      line-height: 1.3;
    }
  }
  
  &__subtitle {
    font-size: $font-size-large;
    margin-bottom: $spacing-lg;
    color: rgba($text-color, 0.8);
    line-height: 1.6;
    
    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-base;
      margin-bottom: $spacing-md;
    }
    
    @media (max-width: 320px) {
      font-size: $font-size-small;
      margin-bottom: $spacing-sm;
      line-height: 1.4;
    }
  }
  
  &__actions {
    display: flex;
    gap: $spacing-md;
    
    @media (max-width: $breakpoint-sm) {
      flex-direction: column;
      gap: $spacing-sm;
    }
    
    @media (max-width: 320px) {
      gap: $spacing-xs;
    }
  }
  
  &__btn {
    padding: $spacing-md $spacing-xl;
  }
  
  &__image {
    flex: 1;
    max-width: 500px;
    
    img {
      width: 100%;
      height: auto;
    }
    
    @media (max-width: $breakpoint-md) {
      max-width: 400px;
    }
  }
}

.section-title {
  text-align: center;
  font-size: $font-size-xxlarge;
  margin-bottom: $spacing-xl;
}

.features {
  padding: $spacing-xxl 0;
  
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: $spacing-lg;
  }
}

.feature-card {
  background-color: white;
  border-radius: $border-radius-md;
  padding: $spacing-lg;
  box-shadow: $shadow-sm;
  transition: transform $transition-normal, box-shadow $transition-normal;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-md;
  }
  
  &__icon {
    font-size: 2.5rem;
    margin-bottom: $spacing-md;
  }
  
  &__title {
    margin-bottom: $spacing-sm;
  }
  
  &__description {
    color: rgba($text-color, 0.8);
    line-height: 1.6;
  }
}

.cta {
  padding: $spacing-xxl 0;
  background-color: $dark-color;
  color: white;
  
  &__content {
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
  }
  
  &__title {
    font-size: $font-size-xxlarge;
    margin-bottom: $spacing-md;
  }
  
  &__description {
    font-size: $font-size-large;
    margin-bottom: $spacing-lg;
    opacity: 0.9;
  }
  
  &__btn {
    padding: $spacing-md $spacing-xl;
  }
}
</style>
