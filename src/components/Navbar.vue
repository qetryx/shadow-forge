<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="logo">Shadow Forge</router-link>
      <div class="hamburger" @click="toggleMobileMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    <div class="navbar-links" :class="{ 'active': isMobileMenuOpen }">
      <div class="nav-section">
        <router-link to="/" class="nav-link" @click="closeMobileMenu">Home</router-link>
        <router-link to="/mods" class="nav-link" @click="closeMobileMenu">Mods</router-link>
        <router-link to="/apps" class="nav-link" @click="closeMobileMenu">Apps</router-link>
        <router-link v-if="isAdmin" to="/admin" class="nav-link" @click="closeMobileMenu">Admin</router-link>
      </div>
      
      <div class="auth-section">
        <div class="auth-buttons">
          <router-link to="/login" class="nav-link btn-login" @click="closeMobileMenu">Login</router-link>
          <router-link to="/register" class="nav-link btn-register" @click="closeMobileMenu">Register</router-link>
        </div>
        <template v-if="user">
          <div class="user-info">
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
            <router-link to="/profile" class="nav-link" @click="closeMobileMenu">Profile</router-link>
            <button @click="handleLogout" class="logout-button">Logout</button>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, inject } from 'vue'
import { supabase } from '@/supabase'

export default {
  name: 'Navbar',
  setup() {
    const user = ref(null)
    const isAdmin = ref(false)
    const userAvatar = ref('')
    const isMobileMenuOpen = ref(false)

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false
    }

    const fetchUserAvatar = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) return

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', currentUser.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          return
        }

        if (profile?.avatar_url) {
          // Get the public URL from avatars bucket
          const avatarPath = profile.avatar_url.split('/').pop()
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(`${currentUser.id}/${avatarPath}`)
          
          userAvatar.value = publicUrl
        }
      } catch (error) {
        console.error('Error fetching avatar:', error)
      }
    }

    onMounted(async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user.value = currentUser
      isAdmin.value = currentUser?.email === 'aryan.ali.king.master@gmail.com'
      
      if (currentUser) {
        await fetchUserAvatar()
      }
    })

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user
      isAdmin.value = session?.user?.email === 'aryan.ali.king.master@gmail.com'
      
      if (event === 'SIGNED_IN') {
        await fetchUserAvatar()
      } else if (event === 'SIGNED_OUT') {
        userAvatar.value = ''
      }
    })

    const handleLogout = async () => {
      await supabase.auth.signOut()
      window.location.href = '/'
    }

    return {
      user,
      isAdmin,
      userAvatar,
      handleLogout,
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu
    }
  }
}
</script>

<style scoped>
.navbar {
  background: var(--card-bg);
  padding: 1rem;
  position: relative;
}

.navbar-brand {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-color);
  text-decoration: none;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  cursor: pointer;
}

.hamburger span {
  display: block;
  height: 3px;
  width: 100%;
  background-color: var(--text-color);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-section {
  display: flex;
  gap: 1.5rem;
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: var(--primary-color);
}

.btn-login {
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
}

.btn-login:hover {
  background: var(--primary-color-dark);
  color: white;
}

.btn-register {
  background: var(--secondary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
}

.btn-register:hover {
  background: var(--secondary-color-dark);
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--glow-color);
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
}

.logout-button {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.logout-button:hover {
  color: var(--error-color);
}

.auth-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .navbar-links {
    position: fixed;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100vh;
    background: var(--card-bg);
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 2rem;
    transition: left 0.3s ease;
    z-index: 1000;
    padding-top: 80px;
    overflow-y: auto;
  }

  .navbar-links.active {
    left: 0;
  }

  .nav-section {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .auth-section {
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    align-items: center;
    padding: 1rem;
  }

  .user-info {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    align-items: center;
    padding: 1rem;
    border-top: 1px solid var(--border-color);
  }

  .auth-buttons {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    align-items: center;
    padding: 1rem;
  }

  .nav-link {
    font-size: 1.2rem;
    width: 100%;
    text-align: center;
    padding: 1rem;
    display: block;
  }

  .btn-login,
  .btn-register {
    width: 80px;
    text-align: center;
    padding: 0.3rem;
    font-size: 0.8rem;
    display: block;
    margin: 0.3rem auto;
    border-radius: 4px;
  }

  .btn-login {
    background: var(--primary-color);
    color: white;
  }

  .btn-register {
    background: var(--secondary-color);
    color: white;
  }

  .avatar-container {
    width: 80px;
    height: 80px;
    margin-bottom: 1rem;
  }

  .logout-button {
    width: 100%;
    max-width: 300px;
    padding: 1rem;
    font-size: 1.1rem;
    text-align: center;
    border: 1px solid var(--error-color);
    border-radius: 8px;
    margin-top: 1rem;
    background: none;
    color: var(--error-color);
  }

  .logout-button:hover {
    background: var(--error-color);
    color: white;
  }
}
</style> 