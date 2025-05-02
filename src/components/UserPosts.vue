<template>
  <div class="user-posts-container">
    <div class="header">
      <h2>Posts by {{ user?.name || 'User' }}</h2>
      <button @click="goBack" class="back-btn">
        <i class="fas fa-arrow-left"></i> Back to Users
      </button>
    </div>
    <div v-if="loading" class="loading">Loading posts...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="posts-grid">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <h3>{{ post.title }}</h3>
        <p>{{ post.body }}</p>
        <div class="post-actions">
          <button @click="viewPost(post.id)" class="view-btn">
            <i class="fas fa-eye"></i> View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiService } from '../services/api';

export default {
  name: 'UserPosts',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const posts = ref([]);
    const user = ref(null);
    const loading = ref(true);
    const error = ref(null);

    const fetchData = async () => {
      try {
        loading.value = true;
        const [postsResponse, userResponse] = await Promise.all([
          apiService.getUserPosts(route.params.userId),
          apiService.getUser(route.params.userId)
        ]);
        posts.value = postsResponse.data;
        user.value = userResponse.data;
      } catch (err) {
        error.value = 'Failed to fetch data: ' + err.message;
      } finally {
        loading.value = false;
      }
    };

    const viewPost = (postId) => {
      router.push(`/posts/${postId}`);
    };

    const goBack = () => {
      router.push('/users');
    };

    onMounted(() => {
      fetchData();
    });

    return {
      posts,
      user,
      loading,
      error,
      viewPost,
      goBack
    };
  }
};
</script>

<style scoped>
.user-posts-container {
  padding: 20px;
  max-width: 1200px;
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

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.post-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.post-card p {
  color: #666;
  margin-bottom: 15px;
}

.post-actions {
  display: flex;
  justify-content: flex-end;
}

.view-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-btn:hover {
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