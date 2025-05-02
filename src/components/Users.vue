<template>
  <div class="users-container">
    <h2>Users</h2>
    <div v-if="loading" class="loading">Loading users...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="users-grid">
      <div v-for="user in users" :key="user.id" class="user-card">
        <div class="user-header">
          <h3>{{ user.name }}</h3>
          <span class="username">@{{ user.username }}</span>
        </div>
        <div class="user-info">
          <p><i class="fas fa-envelope"></i> {{ user.email }}</p>
          <p><i class="fas fa-phone"></i> {{ user.phone }}</p>
          <p><i class="fas fa-globe"></i> {{ user.website }}</p>
        </div>
        <div class="user-stats">
          <div class="stat">
            <span class="stat-number">{{ userStats[user.id]?.posts || 0 }}</span>
            <span class="stat-label">Posts</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ userStats[user.id]?.todos || 0 }}</span>
            <span class="stat-label">Todos</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ userStats[user.id]?.albums || 0 }}</span>
            <span class="stat-label">Albums</span>
          </div>
        </div>
        <div class="user-actions">
          <button @click="viewUserPosts(user.id)" class="action-btn">
            <i class="fas fa-list"></i> View Posts
          </button>
          <button @click="viewUserTodos(user.id)" class="action-btn">
            <i class="fas fa-tasks"></i> View Todos
          </button>
          <button @click="viewUserAlbums(user.id)" class="action-btn">
            <i class="fas fa-images"></i> View Albums
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '../services/api';

export default {
  name: 'Users',
  setup() {
    const router = useRouter();
    const users = ref([]);
    const userStats = ref({});
    const loading = ref(true);
    const error = ref(null);

    const fetchUsers = async () => {
      try {
        loading.value = true;
        const response = await apiService.getUsers();
        users.value = response.data;
        
        // Fetch stats for each user
        for (const user of users.value) {
          const [posts, todos, albums] = await Promise.all([
            apiService.getUserPosts(user.id),
            apiService.getUserTodos(user.id),
            apiService.getUserAlbums(user.id)
          ]);
          
          userStats.value[user.id] = {
            posts: posts.data.length,
            todos: todos.data.length,
            albums: albums.data.length
          };
        }
      } catch (err) {
        error.value = 'Failed to fetch users: ' + err.message;
      } finally {
        loading.value = false;
      }
    };

    const viewUserPosts = (userId) => {
      router.push(`/users/${userId}/posts`);
    };

    const viewUserTodos = (userId) => {
      router.push(`/users/${userId}/todos`);
    };

    const viewUserAlbums = (userId) => {
      router.push(`/users/${userId}/albums`);
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      userStats,
      loading,
      error,
      viewUserPosts,
      viewUserTodos,
      viewUserAlbums
    };
  }
};
</script>

<style scoped>
.users-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.user-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.user-card:hover {
  transform: translateY(-5px);
}

.user-header {
  margin-bottom: 15px;
}

.user-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2em;
}

.username {
  color: #666;
  font-size: 0.9em;
}

.user-info {
  margin: 15px 0;
  color: #555;
}

.user-info p {
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5em;
  font-weight: bold;
  color: #4CAF50;
}

.stat-label {
  font-size: 0.8em;
  color: #666;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s ease;
}

.action-btn:hover {
  background: #45a049;
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