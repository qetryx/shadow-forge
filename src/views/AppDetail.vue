<template>
  <div class="app-detail-page" v-if="app">
    <div class="container">
      <div class="app-detail-card">
        <div class="app-detail-image">
          <img :src="app.screenshot_url" :alt="app.title" />
        </div>
        <div class="app-detail-content">
          <h1>{{ app.title }}</h1>
          <div class="app-meta">
            <span class="category">Category: {{ app.category }}</span>
            <span class="version">Version: {{ app.version }}</span>
            <span class="tags" v-if="app.tags && app.tags.length">Tags: {{ app.tags.join(', ') }}</span>
            <span class="website" v-if="app.website"><a :href="app.website" target="_blank">Website</a></span>
          </div>
          <p class="description">{{ app.description }}</p>
          <div class="app-uploaded-by">
            <span>Uploaded by: <b>{{ uploaderName || app.user_id }}</b></span>
            <span>Uploaded on: {{ formatDate(app.created_at) }}</span>
          </div>
          <div class="app-actions">
            <a :href="app.app_url" class="btn btn-primary" target="_blank">
              <i class="fas fa-download"></i> Download
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-container">
    <div class="loader"></div>
    <p>Loading app details...</p>
  </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'AppDetail',
  setup() {
    const supabase = inject('supabase')
    const route = useRoute()
    const app = ref(null)
    const uploaderName = ref('')

    const fetchApp = async () => {
      const { data, error } = await supabase.from('apps').select('*').eq('id', route.params.id).single()
      if (!error && data) {
        app.value = data
        // Fetch uploader's username from profiles table
        if (data.user_id) {
          const { data: profile } = await supabase.from('profiles').select('username, full_name').eq('id', data.user_id).single()
          if (profile && profile.username) {
            uploaderName.value = profile.username
          } else if (profile && profile.full_name) {
            uploaderName.value = profile.full_name
          }
        }
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }

    onMounted(() => {
      fetchApp()
    })

    return {
      app,
      uploaderName,
      formatDate
    }
  }
}
</script>

<style scoped>
.app-detail-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-dark), var(--bg-darker));
}
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}
.app-detail-card {
  display: flex;
  flex-wrap: wrap;
  background: var(--card-bg);
  border-radius: 18px;
  box-shadow: var(--glow-shadow);
  padding: 2.5rem 2rem;
  gap: 2rem;
  align-items: flex-start;
}
.app-detail-image {
  flex: 1 1 300px;
  min-width: 300px;
  max-width: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.app-detail-image img {
  width: 100%;
  max-width: 320px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}
.app-detail-content {
  flex: 2 1 400px;
  min-width: 300px;
}
.app-detail-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.app-meta {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  color: var(--text-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.description {
  font-size: 1.15rem;
  color: var(--text-color);
  margin-bottom: 2rem;
}
.app-uploaded-by {
  margin-bottom: 1.5rem;
  font-size: 1.05rem;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.app-actions {
  margin-top: 1.5rem;
}
.btn {
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.loading-container {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.loader {
  border: 4px solid var(--bg-dark);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@media (max-width: 900px) {
  .app-detail-card {
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem;
  }
  .app-detail-image, .app-detail-content {
    min-width: 0;
    max-width: 100%;
  }
}
</style> 