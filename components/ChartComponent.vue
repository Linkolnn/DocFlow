<template>
  <div class="chart-container" :class="{ 'chart-container--mobile': isMobile }" :style="{ height: height }">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const props = defineProps({
  type: {
    type: String,
    default: 'bar',
    validator: (value) => ['bar', 'line', 'pie', 'doughnut'].includes(value)
  },
  data: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  },
  height: {
    type: String,
    default: '300px'
  }
});

const chartCanvas = ref(null);
let chartInstance = null;

// Определяем, является ли устройство мобильным
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
});

// Определяем, является ли устройство очень маленьким (320px)
const isSmallMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 320;
});

// Create or update chart
function renderChart() {
  if (!chartCanvas.value) return;
  
  // Destroy previous chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Create default options based on chart type
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile.value ? 'bottom' : 'top',
        labels: {
          boxWidth: isMobile.value ? 10 : 40,
          font: {
            size: isMobile.value ? (isSmallMobile.value ? 10 : 12) : 14
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        titleFont: {
          size: isMobile.value ? 12 : 14
        },
        bodyFont: {
          size: isMobile.value ? 11 : 13
        },
        padding: isMobile.value ? 6 : 10
      }
    },
    scales: props.type !== 'pie' && props.type !== 'doughnut' ? {
      x: {
        ticks: {
          font: {
            size: isMobile.value ? (isSmallMobile.value ? 9 : 10) : 12
          },
          maxRotation: isMobile.value ? 45 : 0
        },
        grid: {
          display: !isSmallMobile.value
        }
      },
      y: {
        ticks: {
          font: {
            size: isMobile.value ? (isSmallMobile.value ? 9 : 10) : 12
          }
        },
        grid: {
          display: !isSmallMobile.value
        }
      }
    } : undefined
  };
  
  // Create chart
  chartInstance = new Chart(chartCanvas.value, {
    type: props.type,
    data: props.data,
    options: { ...defaultOptions, ...props.options }
  });
}

// Initialize chart
onMounted(() => {
  renderChart();
});

// Update chart when data changes
watch(() => props.data, () => {
  renderChart();
}, { deep: true });

// Update chart when type changes
watch(() => props.type, () => {
  renderChart();
});

// Clean up on unmount
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style lang="scss" scoped>
.chart-container {
  position: relative;
  width: 100%;
  
  &--mobile {
    height: auto !important;
    min-height: 250px;
    
    @media (max-width: 320px) {
      min-height: 200px;
    }
  }
}
</style>
