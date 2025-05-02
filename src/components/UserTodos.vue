<template>
  <div class="user-todos-container">
    <div class="header">
      <h2>Todos by {{ user?.name || 'User' }}</h2>
      <button @click="goBack" class="back-btn">
        <i class="fas fa-arrow-left"></i> Back to Users
      </button>
    </div>
    <div v-if="loading" class="loading">Loading todos...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="todos-list">
      <div v-for="todo in todos" :key="todo.id" class="todo-item" :class="{ completed: todo.completed }">
        <div class="todo-content">
          <input type="checkbox" :checked="todo.completed" disabled>
          <span class="todo-title">{{ todo.title }}</span>
        </div>
        <span class="todo-status">{{ todo.completed ? 'Completed' : 'Pending' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiService } from '../services/api';

export default {
  name: 'UserTodos',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const todos = ref([]);
    const user = ref(null);
    const loading = ref(true);
    const error = ref(null);

    const fetchData = async () => {
      try {
        loading.value = true;
        const [todosResponse, userResponse] = await Promise.all([
          apiService.getUserTodos(route.params.userId),
          apiService.getUser(route.params.userId)
        ]);
        todos.value = todosResponse.data;
        user.value = userResponse.data;
      } catch (err) {
        error.value = 'Failed to fetch data: ' + err.message;
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      router.push('/users');
    };

    onMounted(() => {
      fetchData();
    });

    return {
      todos,
      user,
      loading,
      error,
      goBack
    };
  }
};
</script>

<style scoped>
.user-todos-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.back-btn {
  background: #666;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background: #555;
}

.todos-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.todo-item {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.todo-item.completed {
  background: #f5f5f5;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.todo-title {
  color: #333;
}

.todo-status {
  font-size: 0.9em;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  background: #eee;
}

.completed .todo-status {
  background: #e8f5e9;
  color: #4CAF50;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #ff4444;
}
</style> 