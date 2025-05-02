<template>
  <div class="profile">
    <div class="container">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-container">
            <img 
              v-if="userAvatar" 
              :src="userAvatar" 
              alt="User Avatar" 
              class="user-avatar"
            >
            <div v-else class="avatar-placeholder">
              <i class="fas fa-user"></i>
            </div>
          </div>
          <h1 class="username">{{ userProfile?.username }}</h1>
          <p class="email">{{ userProfile?.email }}</p>
        </div>

        <div class="profile-info">
          <div class="info-section">
            <h2>Personal Information</h2>
            <div class="info-group">
              <label>Full Name</label>
              <p>{{ userProfile?.full_name || 'Not set' }}</p>
            </div>
            <div class="info-group">
              <label>Bio</label>
              <p>{{ userProfile?.bio || 'No bio yet' }}</p>
            </div>
          </div>

          <div class="info-section">
            <h2>Account Settings</h2>
            <div class="info-group">
              <label>Email</label>
              <p>{{ userProfile?.email }}</p>
            </div>
            <div class="info-group">
              <label>Member Since</label>
              <p>{{ formatDate(userProfile?.created_at) }}</p>
            </div>
          </div>
        </div>

        <div class="profile-actions">
          <button @click="handleLogout" class="btn btn-danger">
            <i class="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Profile',
  setup() {
    const router = useRouter()
    const supabase = inject('supabase')
    const userProfile = ref(null)
    const userAvatar = ref('')

    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        userProfile.value = {
          ...profile,
          email: user.email
        }

        if (profile?.avatar_url) {
          const avatarPath = profile.avatar_url.split('/').pop()
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(`${user.id}/${avatarPath}`)
          userAvatar.value = publicUrl
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        alert('Failed to load profile')
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const handleLogout = async () => {
      await supabase.auth.signOut()
      router.push('/')
    }

    onMounted(() => {
      fetchUserProfile()
    })

    return {
      userProfile,
      userAvatar,
      formatDate,
      handleLogout
    }
  }
}
</script>

<style scoped>
.profile {
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, var(--bg-dark), var(--bg-darker));
}

.container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.profile-card {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid var(--glow-color);
  box-shadow: var(--glow-shadow);
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar-container {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--glow-color);
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-dark);
  color: var(--text-muted);
  font-size: 3rem;
}

.username {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.email {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.profile-info {
  display: grid;
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-section {
  background: var(--bg-dark);
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.info-section h2 {
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  font-size: 1.5rem;
}

.info-group {
  margin-bottom: 1rem;
}

.info-group label {
  display: block;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.info-group p {
  color: var(--text-color);
  font-size: 1.1rem;
}

.profile-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-danger {
  background: var(--error-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: var(--error-color-dark);
}

@media (max-width: 768px) {
  .profile-card {
    padding: 1.5rem;
  }

  .avatar-container {
    width: 100px;
    height: 100px;
  }

  .username {
    font-size: 1.75rem;
  }

  .profile-info {
    gap: 1.5rem;
  }
}
</style> 