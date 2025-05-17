<template>
  <div class="admin-page">
    <h1 class="admin-page__title">Admin Dashboard</h1>
    
    <div v-if="!isAdmin" class="admin-page__unauthorized">
      <h2>Access Denied</h2>
      <p>You do not have permission to access the admin area.</p>
      <Button @click="router.push('/dashboard')" variant="primary">Back to Dashboard</Button>
    </div>
    
    <template v-else>
      <div class="admin-tabs">
        <button 
          class="admin-tabs__tab" 
          :class="{ 'admin-tabs__tab--active': activeTab === 'users' }"
          @click="activeTab = 'users'"
        >
          Users
        </button>
        <button 
          class="admin-tabs__tab" 
          :class="{ 'admin-tabs__tab--active': activeTab === 'settings' }"
          @click="activeTab = 'settings'"
        >
          Settings
        </button>
      </div>
      
      <div class="admin-content">
        <!-- Users Tab -->
        <div v-if="activeTab === 'users'" class="admin-users">
          <div class="admin-panel__header">
            <h2 class="admin-panel__title">User Management</h2>
            <Button @click="showAddUserModal = true" variant="primary">Add User</Button>
          </div>
          
          <div v-if="loading.users" class="admin-panel__loading">
            Loading users...
          </div>
          
          <div v-else-if="users.length === 0" class="admin-panel__empty">
            No users found.
          </div>
          
          <table v-else class="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Company</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="admin-table__row">
                <td>{{ user.firstName }} {{ user.lastName }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span 
                    class="user-role" 
                    :class="`user-role--${user.role}`"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td>{{ user.company || '-' }}</td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td class="admin-table__actions">
                  <button @click="editUser(user)" title="Edit">✏️</button>
                  <button @click="confirmDeleteUser(user)" title="Delete">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="admin-settings">
          <div class="admin-panel__header">
            <h2 class="admin-panel__title">System Settings</h2>
          </div>
          
          <div class="settings-form">
            <div class="form-group">
              <label class="form-label">Company Name</label>
              <input type="text" v-model="settings.companyName" class="form-control" />
            </div>
            
            <div class="form-group">
              <label class="form-label">Document Approval Flow</label>
              <select v-model="settings.approvalFlow" class="form-control">
                <option value="single">Single Approver</option>
                <option value="multi">Multiple Approvers</option>
                <option value="hierarchical">Hierarchical Approval</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Document Retention Period (days)</label>
              <input type="number" v-model="settings.retentionPeriod" class="form-control" min="1" />
            </div>
            
            <div class="form-group">
              <label class="form-label">Email Notifications</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="settings.notifications.documentCreated" />
                  <span>Document Created</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="settings.notifications.documentUpdated" />
                  <span>Document Updated</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="settings.notifications.documentApproved" />
                  <span>Document Approved/Rejected</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="settings.notifications.taskAssigned" />
                  <span>Task Assigned</span>
                </label>
              </div>
            </div>
            
            <div class="form-actions">
              <Button @click="saveSettings" :loading="loading.settings" variant="primary">Save Settings</Button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Add/Edit User Modal -->
      <div v-if="showUserModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingUser ? 'Edit User' : 'Add User' }}</h3>
            <button @click="closeUserModal" class="modal-close">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label for="firstName" class="form-label">First Name <span class="required">*</span></label>
              <input
                id="firstName"
                v-model="userForm.firstName"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': userErrors.firstName }"
                required
              />
              <div v-if="userErrors.firstName" class="form-error">{{ userErrors.firstName }}</div>
            </div>
            
            <div class="form-group">
              <label for="lastName" class="form-label">Last Name <span class="required">*</span></label>
              <input
                id="lastName"
                v-model="userForm.lastName"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': userErrors.lastName }"
                required
              />
              <div v-if="userErrors.lastName" class="form-error">{{ userErrors.lastName }}</div>
            </div>
            
            <div class="form-group">
              <label for="email" class="form-label">Email <span class="required">*</span></label>
              <input
                id="email"
                v-model="userForm.email"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': userErrors.email }"
                required
              />
              <div v-if="userErrors.email" class="form-error">{{ userErrors.email }}</div>
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">
                Password <span v-if="!editingUser" class="required">*</span>
                <span v-else class="form-hint">(Leave blank to keep current password)</span>
              </label>
              <input
                id="password"
                v-model="userForm.password"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': userErrors.password }"
                :required="!editingUser"
              />
              <div v-if="userErrors.password" class="form-error">{{ userErrors.password }}</div>
            </div>
            
            <div class="form-group">
              <label for="role" class="form-label">Role <span class="required">*</span></label>
              <select
                id="role"
                v-model="userForm.role"
                class="form-control"
                :class="{ 'is-invalid': userErrors.role }"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div v-if="userErrors.role" class="form-error">{{ userErrors.role }}</div>
            </div>
            
            <div class="form-group">
              <label for="company" class="form-label">Company</label>
              <input
                id="company"
                v-model="userForm.company"
                type="text"
                class="form-control"
              />
            </div>
          </div>
          
          <div class="modal-footer">
            <Button @click="closeUserModal" variant="outline">Cancel</Button>
            <Button @click="saveUser" :loading="loading.userSave" variant="primary">
              {{ editingUser ? 'Update User' : 'Add User' }}
            </Button>
          </div>
        </div>
      </div>
      
      <!-- Delete User Confirmation Modal -->
      <div v-if="showDeleteUserModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Confirm Delete</h3>
            <button @click="showDeleteUserModal = false" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete the user "{{ userToDelete?.firstName }} {{ userToDelete?.lastName }}"?</p>
            <p>This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <Button @click="showDeleteUserModal = false" variant="outline">Cancel</Button>
            <Button @click="deleteUser" :loading="loading.userDelete" variant="primary">Delete</Button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'dashboard'
});

const router = useRouter();
const authStore = useAuthStore();

// Check if user is admin
const isAdmin = computed(() => authStore.isAdmin);

// Tab state
const activeTab = ref('users');

// Loading states
const loading = reactive({
  users: true,
  settings: false,
  userSave: false,
  userDelete: false
});

// Users state
const users = ref([]);
const showUserModal = ref(false);
const showAddUserModal = ref(false);
const editingUser = ref(null);
const userToDelete = ref(null);
const showDeleteUserModal = ref(false);

// User form
const userForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'user',
  company: ''
});

// User form errors
const userErrors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: ''
});

// Settings state
const settings = reactive({
  companyName: 'DocFlow Inc.',
  approvalFlow: 'single',
  retentionPeriod: 365,
  notifications: {
    documentCreated: true,
    documentUpdated: true,
    documentApproved: true,
    taskAssigned: true
  }
});

// Initialize data
onMounted(async () => {
  if (!isAdmin.value) {
    return;
  }
  
  // Load users
  await loadUsers();
  
  // Load settings
  loadSettings();
});

// Load users from localStorage
async function loadUsers() {
  loading.users = true;
  
  try {
    // In a real app, this would be an API call
    const storedUsers = localStorage.getItem('users');
    users.value = storedUsers ? JSON.parse(storedUsers) : [];
    
    // If no users exist, create a default admin user
    if (users.value.length === 0) {
      const defaultAdmin = {
        id: Date.now().toString(),
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@docflow.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      
      users.value.push(defaultAdmin);
      localStorage.setItem('users', JSON.stringify(users.value));
    }
  } catch (error) {
    console.error('Error loading users:', error);
  } finally {
    loading.users = false;
  }
}

// Load settings from localStorage
function loadSettings() {
  try {
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      Object.assign(settings, parsedSettings);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Save settings to localStorage
async function saveSettings() {
  loading.settings = true;
  
  try {
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Failed to save settings');
  } finally {
    loading.settings = false;
  }
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

// User modal functions
function openUserModal() {
  resetUserForm();
  showUserModal.value = true;
}

function closeUserModal() {
  showUserModal.value = false;
  editingUser.value = null;
  resetUserForm();
}

function resetUserForm() {
  userForm.firstName = '';
  userForm.lastName = '';
  userForm.email = '';
  userForm.password = '';
  userForm.role = 'user';
  userForm.company = '';
  
  // Reset errors
  userErrors.firstName = '';
  userErrors.lastName = '';
  userErrors.email = '';
  userErrors.password = '';
  userErrors.role = '';
}

function editUser(user) {
  editingUser.value = user;
  
  // Fill form with user data
  userForm.firstName = user.firstName;
  userForm.lastName = user.lastName;
  userForm.email = user.email;
  userForm.password = ''; // Don't show password
  userForm.role = user.role;
  userForm.company = user.company || '';
  
  showUserModal.value = true;
}

function validateUserForm() {
  let isValid = true;
  
  // Reset errors
  userErrors.firstName = '';
  userErrors.lastName = '';
  userErrors.email = '';
  userErrors.password = '';
  userErrors.role = '';
  
  // Validate first name
  if (!userForm.firstName.trim()) {
    userErrors.firstName = 'First name is required';
    isValid = false;
  }
  
  // Validate last name
  if (!userForm.lastName.trim()) {
    userErrors.lastName = 'Last name is required';
    isValid = false;
  }
  
  // Validate email
  if (!userForm.email.trim()) {
    userErrors.email = 'Email is required';
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
    userErrors.email = 'Please enter a valid email address';
    isValid = false;
  }
  
  // Validate password (only required for new users)
  if (!editingUser.value && !userForm.password) {
    userErrors.password = 'Password is required';
    isValid = false;
  } else if (userForm.password && userForm.password.length < 6) {
    userErrors.password = 'Password must be at least 6 characters';
    isValid = false;
  }
  
  // Validate role
  if (!userForm.role) {
    userErrors.role = 'Role is required';
    isValid = false;
  }
  
  return isValid;
}

async function saveUser() {
  if (!validateUserForm()) {
    return;
  }
  
  loading.userSave = true;
  
  try {
    if (editingUser.value) {
      // Update existing user
      const index = users.value.findIndex(u => u.id === editingUser.value.id);
      
      if (index !== -1) {
        // Create updated user object
        const updatedUser = {
          ...users.value[index],
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          email: userForm.email,
          role: userForm.role,
          company: userForm.company
        };
        
        // Update password if provided
        if (userForm.password) {
          updatedUser.password = userForm.password;
        }
        
        // Update user in array
        users.value[index] = updatedUser;
      }
    } else {
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        company: userForm.company,
        createdAt: new Date().toISOString()
      };
      
      users.value.push(newUser);
    }
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users.value));
    
    // Close modal
    closeUserModal();
  } catch (error) {
    console.error('Error saving user:', error);
    alert('Failed to save user');
  } finally {
    loading.userSave = false;
  }
}

function confirmDeleteUser(user) {
  userToDelete.value = user;
  showDeleteUserModal.value = true;
}

async function deleteUser() {
  if (!userToDelete.value) return;
  
  loading.userDelete = true;
  
  try {
    // Remove user from array
    users.value = users.value.filter(u => u.id !== userToDelete.value.id);
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users.value));
    
    // Close modal
    showDeleteUserModal.value = false;
    userToDelete.value = null;
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Failed to delete user');
  } finally {
    loading.userDelete = false;
  }
}

// Watch for add user button click
watch(showAddUserModal, (newVal) => {
  if (newVal) {
    resetUserForm();
    editingUser.value = null;
    showUserModal.value = true;
    showAddUserModal.value = false;
  }
});
</script>

<style lang="scss" scoped>
.admin-page {
  &__title {
    margin-bottom: $spacing-lg;
  }
  
  &__unauthorized {
    text-align: center;
    padding: $spacing-xl;
    background-color: white;
    border-radius: $border-radius-md;
    box-shadow: $shadow-sm;
    
    .btn {
      margin-top: $spacing-md;
    }
  }
}

.admin-tabs {
  display: flex;
  margin-bottom: $spacing-lg;
  border-bottom: 1px solid $border-color;
  
  &__tab {
    padding: $spacing-md $spacing-lg;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-weight: $font-weight-medium;
    transition: all $transition-fast;
    
    &:hover {
      color: $primary-color;
    }
    
    &--active {
      color: $primary-color;
      border-bottom-color: $primary-color;
    }
  }
}

.admin-content {
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;
  padding: $spacing-lg;
}

.admin-panel {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
  }
  
  &__title {
    margin: 0;
  }
  
  &__loading,
  &__empty {
    text-align: center;
    padding: $spacing-xl;
    color: rgba($text-color, 0.7);
  }
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: $spacing-md;
    border-bottom: 2px solid $border-color;
    font-weight: $font-weight-medium;
  }
  
  td {
    padding: $spacing-md;
    border-bottom: 1px solid $border-color;
  }
  
  &__row {
    transition: background-color $transition-fast;
    
    &:hover {
      background-color: rgba($primary-color, 0.05);
    }
  }
  
  &__actions {
    display: flex;
    gap: $spacing-sm;
    
    button {
      background: none;
      border: none;
      cursor: pointer;
      color: $primary-color;
      transition: color $transition-fast;
      
      &:hover {
        color: darken($primary-color, 10%);
      }
    }
  }
}

.user-role {
  display: inline-block;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-sm;
  font-size: $font-size-small;
  font-weight: $font-weight-medium;
  
  &--admin {
    background-color: rgba($primary-color, 0.1);
    color: $primary-color;
  }
  
  &--user {
    background-color: rgba($secondary-color, 0.1);
    color: $secondary-color;
  }
}

.settings-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: $spacing-md;
}

.form-label {
  display: block;
  margin-bottom: $spacing-xs;
  font-weight: $font-weight-medium;
  
  .required {
    color: $error-color;
  }
  
  .form-hint {
    font-weight: normal;
    font-size: $font-size-small;
    color: rgba($text-color, 0.7);
  }
}

.form-control {
  width: 100%;
  padding: $spacing-sm;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  font-family: $font-family-primary;
  font-size: $font-size-base;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
  }
  
  &.is-invalid {
    border-color: $error-color;
  }
}

.form-error {
  color: $error-color;
  font-size: $font-size-small;
  margin-top: $spacing-xs;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  
  input {
    margin-right: $spacing-xs;
  }
}

.form-actions {
  margin-top: $spacing-lg;
  display: flex;
  justify-content: flex-end;
}

// Modal styles
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-index-modal;
}

.modal-content {
  background-color: white;
  border-radius: $border-radius-md;
  width: 100%;
  max-width: 500px;
  box-shadow: $shadow-lg;
}

.modal-header {
  padding: $spacing-md;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $border-color;
  
  h3 {
    margin: 0;
  }
}

.modal-body {
  padding: $spacing-md;
}

.modal-footer {
  padding: $spacing-md;
  border-top: 1px solid $border-color;
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
}

.modal-close {
  background: none;
  border: none;
  font-size: $font-size-xlarge;
  cursor: pointer;
  color: rgba($text-color, 0.7);
  
  &:hover {
    color: $text-color;
  }
}
</style>
