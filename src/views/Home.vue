<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Welcome to ShadowForge</h1>
          <p class="hero-subtitle">Discover and share premium apps and themes</p>
          <div class="hero-buttons">
            <router-link to="/apps" class="btn btn-primary">
              <i class="fas fa-search"></i> Browse Apps
            </router-link>
            <router-link v-if="isAuthenticated" to="/upload" class="btn btn-secondary">
              <i class="fas fa-upload"></i> Upload App
            </router-link>
            <router-link to="/users" class="btn btn-secondary">
              <i class="fas fa-users"></i> Users
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="trending">
      <div class="container">
        <h2 class="section-title">Trending Apps</h2>
        <div class="app-grid">
          <div v-for="app in trendingApps" :key="app.id" class="app-card">
            <div class="app-image">
              <img :src="app.image" :alt="app.title">
              <div class="app-badge">
                <i class="fas fa-fire"></i> Trending
              </div>
            </div>
            <div class="app-content">
              <h3>{{ app.title }}</h3>
              <p class="description">{{ app.description }}</p>
              <div class="app-stats">
                <span class="stat">
                  <i class="fas fa-download"></i>
                  {{ app.downloads }}
                </span>
                <span class="stat">
                  <i class="fas fa-heart"></i>
                  {{ app.likes }}
                </span>
              </div>
              <div class="app-footer">
                <div class="author">
                  <img :src="app.author.avatar" :alt="app.author.name" class="avatar">
                  <span>{{ app.author.name }}</span>
                </div>
                <a :href="app.downloadUrl" class="btn-download">
                  <i class="fas fa-download"></i> Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="categories">
      <div class="container">
        <h2 class="section-title">Featured Categories</h2>
        <div class="category-grid">
          <div v-for="category in categories" :key="category.id" class="category-card">
            <div class="category-icon">
              <i :class="category.icon"></i>
            </div>
            <h3>{{ category.name }}</h3>
            <p>{{ category.count }} apps</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, inject, onMounted } from 'vue'

export default {
  name: 'Home',
  setup() {
    const supabase = inject('supabase')
    const isAuthenticated = ref(false)
    const trendingApps = ref([
      {
        id: 1,
        title: 'Dark Theme Pack',
        description: 'A collection of premium dark themes for your favorite apps',
        image: 'https://via.placeholder.com/300x200',
        downloads: '1.2k',
        likes: '856',
        author: {
          name: 'ThemeMaster',
          avatar: 'https://via.placeholder.com/40'
        },
        downloadUrl: '#'
      },
      {
        id: 2,
        title: 'System Optimizer',
        description: 'Optimize your system performance with this powerful tool',
        image: 'https://via.placeholder.com/300x200',
        downloads: '2.5k',
        likes: '1.2k',
        author: {
          name: 'TechWizard',
          avatar: 'https://via.placeholder.com/40'
        },
        downloadUrl: '#'
      },
      {
        id: 3,
        title: 'Game Booster',
        description: 'Enhance your gaming experience with this performance booster',
        image: 'https://via.placeholder.com/300x200',
        downloads: '3.1k',
        likes: '1.8k',
        author: {
          name: 'GameMaster',
          avatar: 'https://via.placeholder.com/40'
        },
        downloadUrl: '#'
      }
    ])
    const categories = ref([])

    // Dummy data for demonstration
    const dummyData = {
      categories: [
        {
          id: 1,
          name: 'Utilities',
          icon: 'fas fa-tools',
          count: '45'
        },
        {
          id: 2,
          name: 'Games',
          icon: 'fas fa-gamepad',
          count: '32'
        },
        {
          id: 3,
          name: 'Themes',
          icon: 'fas fa-palette',
          count: '28'
        },
        {
          id: 4,
          name: 'Productivity',
          icon: 'fas fa-tasks',
          count: '21'
        }
      ]
    }

    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      isAuthenticated.value = !!session
    })

    onMounted(() => {
      trendingApps.value = dummyData.trendingApps
      categories.value = dummyData.categories
    })

    return {
      isAuthenticated,
      trendingApps,
      categories
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.hero {
  position: relative;
  padding: 100px 0;
  background: linear-gradient(135deg, var(--bg-dark), var(--bg-darker));
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="none"/><path d="M0,0 L100,100 M100,0 L0,100" stroke="rgba(108, 92, 231, 0.1)" stroke-width="1"/></svg>');
  opacity: 0.1;
}

.hero-content {
  position: relative;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  z-index: 1;
}

.hero-title {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: fadeIn 1s ease;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
  animation: slideUp 1s ease;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  animation: slideUp 1s ease 0.2s backwards;
}

.section-title {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.trending {
  padding: 80px 0;
  background: var(--bg-darker);
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.app-card {
  background: var(--card-bg);
  border-radius: 15px;
  overflow: hidden;
  transition: all var(--transition-normal);
  border: 1px solid var(--glow-color);
  animation: fadeIn 0.5s ease backwards;
}

.app-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--glow-shadow);
}

.app-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.app-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.app-card:hover .app-image img {
  transform: scale(1.1);
}

.app-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  padding: 5px 15px;
  border-radius: 20px;
  color: var(--text-color);
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 5px;
}

.app-content {
  padding: 20px;
}

.app-content h3 {
  color: var(--accent-color);
  margin-bottom: 10px;
}

.description {
  color: var(--text-muted);
  margin-bottom: 15px;
  line-height: 1.6;
}

.app-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-muted);
}

.app-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
}

.btn-download {
  padding: 8px 15px;
  border-radius: 8px;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  color: var(--text-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all var(--transition-normal);
}

.btn-download:hover {
  transform: translateY(-2px);
  box-shadow: var(--glow-shadow);
}

.categories {
  padding: 80px 0;
  background: var(--bg-dark);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}

.category-card {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  transition: all var(--transition-normal);
  border: 1px solid var(--glow-color);
  animation: fadeIn 0.5s ease backwards;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--glow-shadow);
}

.category-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--text-color);
}

.category-card h3 {
  color: var(--accent-color);
  margin-bottom: 10px;
}

.category-card p {
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .app-grid,
  .category-grid {
    grid-template-columns: 1fr;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style> 