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
            <div class="uploader-info">
              <img :src="uploaderAvatar" :alt="uploaderName" class="uploader-avatar">
              <div class="uploader-details">
                <span>Uploaded by: <b>{{ uploaderName || app.user_id }}</b></span>
                <span>Uploaded on: {{ formatDate(app.created_at) }}</span>
              </div>
            </div>
            <div class="like-section">
              <button 
                class="like-btn" 
                :class="{ 'liked': hasLiked }"
                @click="toggleLike"
              >
                <i class="fas fa-heart"></i>
                <span>{{ app.likes || 0 }}</span>
              </button>
            </div>
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
    const uploaderAvatar = ref('')
    const hasLiked = ref(false)

    const fetchApp = async () => {
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .eq('id', route.params.id)
          .single()

        if (!error && data) {
          app.value = data
          
          // Fetch uploader's profile
          if (data.user_id) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('username, full_name, avatar_url')
              .eq('id', data.user_id)
              .single()

            if (profile && !profileError) {
              uploaderName.value = profile.username || profile.full_name
              
              // Get the avatar URL from the avatars bucket
              if (profile.avatar_url) {
                try {
                  const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(profile.avatar_url)
                  uploaderAvatar.value = publicUrl
                } catch (storageError) {
                  console.error('Error getting avatar URL:', storageError)
                  uploaderAvatar.value = 'https://via.placeholder.com/40'
                }
              } else {
                uploaderAvatar.value = 'https://via.placeholder.com/40'
              }
            } else {
              console.error('Error fetching profile:', profileError)
              uploaderName.value = data.user_id
              uploaderAvatar.value = 'https://via.placeholder.com/40'
            }
          }

          // Get the total likes count
          const { count: likesCount } = await supabase
            .from('likes')
            .select('*', { count: 'exact' })
            .eq('app_id', data.id)

          app.value.likes = likesCount || 0
          
          // Check if current user has liked this app
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: like } = await supabase
              .from('likes')
              .select('*')
              .eq('app_id', data.id)
              .eq('user_id', user.id)
              .single()

            hasLiked.value = !!like
          }
        }
      } catch (error) {
        console.error('Error fetching app:', error)
      }
    }

    const toggleLike = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Redirect to login if not authenticated
        return
      }

      try {
        if (hasLiked.value) {
          // Unlike
          const { error } = await supabase
            .from('likes')
            .delete()
            .match({ app_id: app.value.id, user_id: user.id })

          if (!error) {
            // Update the app's like count
            const { error: updateError } = await supabase
              .from('apps')
              .update({ likes: (app.value.likes || 0) - 1 })
              .eq('id', app.value.id)

            if (!updateError) {
              app.value.likes = Math.max(0, (app.value.likes || 0) - 1)
              hasLiked.value = false
            }
          }
        } else {
          // Like
          const { error } = await supabase
            .from('likes')
            .insert([{ app_id: app.value.id, user_id: user.id }])

          if (!error) {
            // Update the app's like count
            const { error: updateError } = await supabase
              .from('apps')
              .update({ likes: (app.value.likes || 0) + 1 })
              .eq('id', app.value.id)

            if (!updateError) {
              app.value.likes = (app.value.likes || 0) + 1
              hasLiked.value = true
            }
          }
        }
      } catch (error) {
        console.error('Error toggling like:', error)
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
      uploaderAvatar,
      hasLiked,
      toggleLike,
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
  justify-content: space-between;
  align-items: center;
}
.uploader-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.uploader-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
}
.uploader-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.like-section {
  display: flex;
  align-items: center;
}
.like-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid var(--glow-color);
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-normal);
}
.like-btn:hover {
  background: var(--glow-color);
}
.like-btn.liked {
  background: var(--error-color);
  border-color: var(--error-color);
  color: white;
}
.like-btn i {
  font-size: 1.1rem;
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