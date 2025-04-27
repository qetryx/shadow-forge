<template>
  <div class="app">
    <nav class="navbar">
      <div class="container">
        <router-link to="/" class="logo">
          <span class="logo-text">ShadowForge</span>
        </router-link>
        
        <div class="nav-links">
          <router-link to="/apps" class="nav-link">Apps</router-link>
          <router-link to="/leaderboard" class="nav-link">Leaderboard</router-link>
          <router-link to="/upload" class="nav-link" v-if="isAuthenticated">Upload</router-link>
        </div>

        <div class="user-menu" v-if="isAuthenticated">
          <div class="avatar-container">
            <AvatarUpload :userId="user?.id" />
            <div class="dropdown-menu">
              <button @click="logout" class="dropdown-item">
                <i class="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>

        <div class="auth-buttons" v-else>
          <router-link to="/login" class="btn btn-secondary">Login</router-link>
          <router-link to="/register" class="btn btn-primary">Register</router-link>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" class="page-content" />
        </transition>
      </router-view>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>ShadowForge</h3>
            <p>Your ultimate destination for premium apps and themes.</p>
          </div>
          <div class="footer-section">
            <h3>Quick Links</h3>
            <router-link to="/about">About</router-link>
            <router-link to="/contact">Contact</router-link>
            <router-link to="/privacy">Privacy Policy</router-link>
          </div>
          <div class="footer-section">
            <h3>Connect</h3>
            <div class="social-links">
              <a href="#" class="social-link"><i class="fab fa-discord"></i></a>
              <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-link"><i class="fab fa-github"></i></a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 ShadowForge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { inject } from 'vue'
import AvatarUpload from '@/components/AvatarUpload.vue'
import './assets/styles/global.css'

export default {
  name: 'App',
  components: {
    AvatarUpload
  },
  setup() {
    const router = useRouter()
    const supabase = inject('supabase')
    const isAuthenticated = ref(false)
    const user = ref(null)

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      isAuthenticated.value = !!session
      user.value = session?.user
    }

    const logout = async () => {
      await supabase.auth.signOut()
      isAuthenticated.value = false
      user.value = null
      router.push('/login')
    }

    onMounted(() => {
      checkAuth()
      supabase.auth.onAuthStateChange((event, session) => {
        isAuthenticated.value = !!session
        user.value = session?.user
      })
    })

    return {
      isAuthenticated,
      user,
      logout
    }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--bg-dark), var(--bg-darker));
}

.navbar {
  background: var(--card-bg);
  padding: 1rem 0;
  border-bottom: 1px solid var(--glow-color);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.navbar .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-text {
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition-normal);
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  transition: width var(--transition-normal);
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

.user-menu {
  position: relative;
}

.avatar-container {
  position: relative;
  cursor: pointer;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
  transition: all var(--transition-normal);
}

.avatar:hover {
  transform: scale(1.1);
  box-shadow: var(--glow-shadow);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--glow-color);
  border-radius: 8px;
  padding: 0.5rem;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all var(--transition-normal);
}

.avatar-container:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.dropdown-item:hover {
  background: var(--glow-color);
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.page-content {
  animation: fadeIn var(--transition-normal);
}

.footer {
  background: var(--card-bg);
  padding: 3rem 0 1rem;
  border-top: 1px solid var(--glow-color);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3 {
  color: var(--accent-color);
  margin-bottom: 1rem;
}

.footer-section a {
  display: block;
  color: var(--text-muted);
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: all var(--transition-normal);
}

.footer-section a:hover {
  color: var(--text-color);
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-dark);
  color: var(--text-color);
  transition: all var(--transition-normal);
}

.social-link:hover {
  background: var(--primary-color);
  transform: translateY(-3px);
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid var(--glow-color);
  color: var(--text-muted);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .auth-buttons {
    gap: 0.5rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
  }
}
</style> 