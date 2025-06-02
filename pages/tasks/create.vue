<template>
  <div class="create-task-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">{{ isEditMode ? 'Редактирование задачи' : 'Создание новой задачи' }}</h1>
        <div class="page-actions">
          <NuxtLink to="/tasks" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left"></i> К списку задач
          </NuxtLink>
        </div>
      </div>
      
      <div class="task-form-container">
        <form @submit.prevent="submitForm" class="task-form">
          <div class="form-group">
            <label for="title" class="form-label">Название задачи <span class="required">*</span></label>
            <input 
              type="text" 
              id="title" 
              v-model="taskForm.title" 
              class="form-control"
              :class="{ 'is-invalid': errors.title }"
              required
            />
            <div v-if="errors.title" class="invalid-feedback">{{ errors.title }}</div>
          </div>
          
          <div class="form-group">
            <label for="description" class="form-label">Описание задачи <span class="required">*</span></label>
            <textarea 
              id="description" 
              v-model="taskForm.description" 
              class="form-control"
              :class="{ 'is-invalid': errors.description }"
              rows="5"
              required
            ></textarea>
            <div v-if="errors.description" class="invalid-feedback">{{ errors.description }}</div>
          </div>
          
          <div class="form-row">
            <div class="form-group form-group-half">
              <label for="priority" class="form-label">Приоритет <span class="required">*</span></label>
              <select 
                id="priority" 
                v-model="taskForm.priority" 
                class="form-select"
                :class="{ 'is-invalid': errors.priority }"
                required
              >
                <option value="" disabled>Выберите приоритет</option>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
              <div v-if="errors.priority" class="invalid-feedback">{{ errors.priority }}</div>
            </div>
            
            <div class="form-group form-group-half">
              <label for="dueDate" class="form-label">Срок выполнения <span class="required">*</span></label>
              <input 
                type="date" 
                id="dueDate" 
                v-model="taskForm.dueDate" 
                class="form-control"
                :class="{ 'is-invalid': errors.dueDate }"
                :min="minDate"
                required
              />
              <div v-if="errors.dueDate" class="invalid-feedback">{{ errors.dueDate }}</div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="assignee" class="form-label">Исполнитель <span class="required">*</span></label>
            <select 
              id="assignee" 
              v-model="taskForm.assigneeId" 
              class="form-select"
              :class="{ 'is-invalid': errors.assigneeId }"
              required
            >
              <option value="" disabled>Выберите исполнителя</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.firstName }} {{ user.lastName }}
              </option>
            </select>
            <div v-if="errors.assigneeId" class="invalid-feedback">{{ errors.assigneeId }}</div>
          </div>
          
          <div class="form-group">
            <label for="attachments" class="form-label">Прикрепить файлы</label>
            <div class="file-upload-container">
              <label for="attachments" class="file-upload-label">
                <i class="fas fa-cloud-upload-alt"></i> Выберите файлы
              </label>
              <input 
                type="file" 
                id="attachments" 
                @change="handleFileUpload"
                multiple
                class="file-upload-input"
              />
              <div class="selected-files" v-if="selectedFiles.length > 0">
                <div v-for="(file, index) in selectedFiles" :key="index" class="selected-file">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">({{ formatFileSize(file.size) }})</span>
                  <button type="button" @click="removeFile(index)" class="remove-file-btn">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Дополнительные настройки</label>
            <div class="checkbox-group">
              <div class="form-check">
                <input type="checkbox" id="notify-assignee" v-model="taskForm.notifyAssignee" class="form-check-input" />
                <label for="notify-assignee" class="form-check-label">Уведомить исполнителя по email</label>
              </div>
              
              <div class="form-check">
                <input type="checkbox" id="high-visibility" v-model="taskForm.highVisibility" class="form-check-input" />
                <label for="high-visibility" class="form-check-label">Высокая видимость (отображать на дашборде)</label>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="resetForm" class="btn btn-outline-secondary">Сбросить</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting">
                <i class="fas fa-spinner fa-spin"></i> Создание...
              </span>
              <span v-else>Создать задачу</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
});

const router = useRouter();
const route = useRoute();
const isEditMode = ref(false);
const editTaskId = ref(null);
const users = ref([]);
const isSubmitting = ref(false);
const selectedFiles = ref([]);

const taskForm = ref({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  assigneeId: '',
  notifyAssignee: true,
  highVisibility: false
});

const errors = ref({
  title: '',
  description: '',
  priority: '',
  dueDate: '',
  assigneeId: ''
});

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

function validateForm() {
  let isValid = true;
  errors.value = {
    title: '',
    description: '',
    priority: '',
    dueDate: '',
    assigneeId: ''
  };

  if (!taskForm.value.title.trim()) {
    errors.value.title = 'Название задачи обязательно';
    isValid = false;
  } else if (taskForm.value.title.length < 5) {
    errors.value.title = 'Название задачи должно содержать минимум 5 символов';
    isValid = false;
  }

  if (!taskForm.value.description.trim()) {
    errors.value.description = 'Описание задачи обязательно';
    isValid = false;
  } else if (taskForm.value.description.length < 10) {
    errors.value.description = 'Описание задачи должно содержать минимум 10 символов';
    isValid = false;
  }

  if (!taskForm.value.priority) {
    errors.value.priority = 'Выберите приоритет';
    isValid = false;
  }

  if (!taskForm.value.dueDate) {
    errors.value.dueDate = 'Выберите срок выполнения';
    isValid = false;
  } else {
    const selectedDate = new Date(taskForm.value.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.value.dueDate = 'Срок выполнения не может быть в прошлом';
      isValid = false;
    }
  }

  if (!taskForm.value.assigneeId) {
    errors.value.assigneeId = 'Выберите исполнителя';
    isValid = false;
  }

  return isValid;
}

async function submitForm() {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    // Имитация отправки данных на сервер
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isEditMode.value) {
      // Обновление существующей задачи
      updateTask(editTaskId.value, taskForm.value);
      router.push(`/tasks/${editTaskId.value}`);
    } else {
      // Создание новой задачи
      const newTaskId = createTask(taskForm.value);
      router.push('/tasks');
    }
  } catch (error) {
    console.error(isEditMode.value ? 'Ошибка при обновлении задачи:' : 'Ошибка при создании задачи:', error);
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  taskForm.value = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assigneeId: '',
    notifyAssignee: true,
    highVisibility: false
  };
  selectedFiles.value = [];
  errors.value = {
    title: '',
    description: '',
    priority: '',
    dueDate: '',
    assigneeId: ''
  };
}

function handleFileUpload(event) {
  const files = event.target.files;
  if (!files.length) return;
  
  for (let i = 0; i < files.length; i++) {
    selectedFiles.value.push(files[i]);
  }
}

function removeFile(index) {
  selectedFiles.value.splice(index, 1);
}

// Загрузка данных задачи для редактирования
function loadTaskData(taskId) {
  try {
    // Имитация загрузки данных из API
    const tasksData = JSON.parse(localStorage.getItem('tasks') || '[]');
    // Преобразуем ID в строку для корректного сравнения
    const task = tasksData.find(t => String(t.id) === String(taskId));
    
    if (task) {
      // Заполняем форму данными задачи
      taskForm.value = {
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assigneeId: task.assigneeId || '',
        notifyAssignee: task.notifyAssignee !== undefined ? task.notifyAssignee : true,
        highVisibility: task.highVisibility || false
      };
    } else {
      console.error('Задача не найдена');
      router.push('/tasks');
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных задачи:', error);
    router.push('/tasks');
  }
}

// Создание новой задачи
function createTask(taskData) {
  try {
    const tasksData = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Создаем новую задачу
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      status: 'not_started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };
    
    tasksData.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasksData));
    
    return newTask.id;
  } catch (error) {
    console.error('Ошибка при создании задачи:', error);
    return null;
  }
}

// Обновление существующей задачи
function updateTask(taskId, taskData) {
  try {
    const tasksData = JSON.parse(localStorage.getItem('tasks') || '[]');
    // Преобразуем ID в строку для корректного сравнения
    const taskIndex = tasksData.findIndex(t => String(t.id) === String(taskId));
    
    if (taskIndex !== -1) {
      // Обновляем задачу, сохраняя некоторые оригинальные поля
      const updatedTask = {
        ...tasksData[taskIndex],
        ...taskData,
        updatedAt: new Date().toISOString()
      };
      
      tasksData[taskIndex] = updatedTask;
      localStorage.setItem('tasks', JSON.stringify(tasksData));
    }
  } catch (error) {
    console.error('Ошибка при обновлении задачи:', error);
  }
}

function formatFileSize(size) {
  if (size < 1024) {
    return size + ' B';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + ' KB';
  } else {
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

onMounted(() => {
  // Проверяем, есть ли параметр edit в URL
  if (route.query.edit) {
    isEditMode.value = true;
    editTaskId.value = route.query.edit;
    loadTaskData(editTaskId.value);
  }
  
  // Имитация загрузки пользователей
  users.value = [
    { id: 1, firstName: 'Иван', lastName: 'Иванов' },
    { id: 2, firstName: 'Петр', lastName: 'Петров' },
    { id: 3, firstName: 'Анна', lastName: 'Сидорова' }
  ];
  
  // Установка текущей даты как минимальной для срока выполнения
  const today = new Date();
  taskForm.value.dueDate = today.toISOString().split('T')[0];
});
</script>

<style scoped>
.create-task-page {
  padding: 2rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  color: #2c3e50;
}

.task-form-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group-half {
  width: calc(50% - 0.5rem);
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.required {
  color: #e74c3c;
}

.form-control, .form-select {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #fff;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: #3498db;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
}

.is-invalid {
  border-color: #e74c3c;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #e74c3c;
}

.checkbox-group {
  margin-top: 0.5rem;
}

.form-check {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.form-check-input {
  margin-right: 0.5rem;
}

.form-check-label {
  font-weight: normal;
}

.file-upload-container {
  margin-top: 0.5rem;
}

.file-upload-label {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.file-upload-label:hover {
  background-color: #e9ecef;
}

.file-upload-input {
  display: none;
}

.selected-files {
  margin-top: 1rem;
}

.selected-file {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.file-name {
  font-weight: 500;
  margin-right: 0.5rem;
}

.file-size {
  color: #6c757d;
  margin-right: auto;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  color: #fff;
  background-color: #3498db;
  border-color: #3498db;
}

.btn-primary:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-outline-secondary {
  color: #6c757d;
  background-color: transparent;
  border-color: #6c757d;
}

.btn-outline-secondary:hover {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.container {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

@media (min-width: 576px) {
  .container {
    max-width: 540px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}

@media (min-width: 992px) {
  .container {
    max-width: 960px;
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-group-half {
    width: 100%;
  }
}
</style>
