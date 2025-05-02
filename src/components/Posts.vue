<template>
  <div class="posts-container">
    <h2>Posts</h2>
    <div v-if="loading" class="loading">Loading posts...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="posts-grid">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <h3>{{ post.title }}</h3>
        <p>{{ post.body }}</p>
        <div class="post-meta">
          <span>User ID: {{ post.userId }}</span>
          <button @click="viewPost(post.id)">View Details</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { apiService } from '../services/api';

export default {
  name: 'Posts',
  setup() {
    const posts = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchPosts = async () => {
      try {
        loading.value = true;
        const response = await apiService.getPosts();
        posts.value = response.data;
      } catch (err) {
        error.value = 'Failed to fetch posts: ' + err.message;
      } finally {
        loading.value = false;
      }
    };

    const viewPost = (postId) => {
      // Navigate to post details
      router.push(`/posts/${postId}`);
    };

    onMounted(() => {
      fetchPosts();
    });

    return {
      posts,
      loading,
      error,
      viewPost
    };
  }
};
</script>

<style scoped>
.posts-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
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

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
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