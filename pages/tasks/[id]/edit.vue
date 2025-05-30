<template>
  <div>
    <!-- Этот компонент только для перенаправления -->
  </div>
</template>

<script setup>
// Создаем редирект с /tasks/[id]/edit на /tasks/create?edit=[id]
const route = useRoute();
const router = useRouter();

onMounted(() => {
  const taskId = route.params.id;
  router.replace(`/tasks/create?edit=${taskId}`);
});

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
});
</script>
