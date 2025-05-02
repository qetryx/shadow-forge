<template>
  <div class="post-details">
    <div v-if="loading" class="loading">Loading post details...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="post-content">
        <h2>{{ post.title }}</h2>
        <p>{{ post.body }}</p>
        <div class="post-meta">
          <span>User ID: {{ post.userId }}</span>
          <span>Post ID: {{ post.id }}</span>
        </div>
      </div>

      <div class="comments-section">
        <h3>Comments</h3>
        <div v-if="commentsLoading" class="loading">Loading comments...</div>
        <div v-else-if="commentsError" class="error">{{ commentsError }}</div>
        <div v-else class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment">
            <h4>{{ comment.name }}</h4>
            <p class="comment-email">{{ comment.email }}</p>
            <p class="comment-body">{{ comment.body }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { apiService } from '../services/api';

export default {
  name: 'PostDetails',
  setup() {
    const route = useRoute();
    const post = ref(null);
    const comments = ref([]);
    const loading = ref(true);
    const commentsLoading = ref(true);
    const error = ref(null);
    const commentsError = ref(null);

    const fetchPost = async () => {
      try {
        loading.value = true;
        const response = await apiService.getPost(route.params.id);
        post.value = response.data;
      } catch (err) {
        error.value = 'Failed to fetch post: ' + err.message;
      } finally {
        loading.value = false;
      }
    };

    const fetchComments = async () => {
      try {
        commentsLoading.value = true;
        const response = await apiService.getPostComments(route.params.id);
        comments.value = response.data;
      } catch (err) {
        commentsError.value = 'Failed to fetch comments: ' + err.message;
      } finally {
        commentsLoading.value = false;
      }
    };

    onMounted(() => {
      fetchPost();
      fetchComments();
    });

    return {
      post,
      comments,
      loading,
      commentsLoading,
      error,
      commentsError
    };
  }
};
</script>

<style scoped>
.post-details {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.post-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-content h2 {
  margin: 0 0 15px 0;
  color: #333;
}

.post-meta {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  color: #666;
}

.comments-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comments-section h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.comment {
  border-bottom: 1px solid #eee;
  padding: 15px 0;
}

.comment:last-child {
  border-bottom: none;
}

.comment h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.comment-email {
  color: #666;
  font-size: 0.9em;
  margin: 0 0 10px 0;
}

.comment-body {
  color: #444;
  line-height: 1.5;
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