<template>
  <div class="apps">
    <div class="container">
      <h1>All Apps</h1>
      <div class="filters">
        <div class="search">
          <input type="text" placeholder="Search apps..." v-model="searchQuery">
          <i class="fas fa-search"></i>
        </div>
        <div class="category-filter">
          <select v-model="selectedCategory">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>
      <div class="app-grid">
        <router-link v-for="app in filteredApps" :key="app.id" :to="`/apps/${app.id}`" class="app-card-link">
          <div class="app-card">
            <div class="app-image">
              <img :src="app.screenshot_url" :alt="app.title">
            </div>
            <div class="app-content">
              <h3>{{ app.title }}</h3>
              <p class="description">{{ app.description }}</p>
              <div class="app-footer">
                <div class="author">
                  <span>{{ app.user_id }}</span>
                </div>
                <div class="actions">
                  <!-- No direct download button here -->
                </div>
              </div>
              <div class="app-meta">
                <span class="category">{{ app.category }}</span>
                <span class="version">v{{ app.version }}</span>
                <span class="tags" v-if="app.tags && app.tags.length">Tags: {{ app.tags.join(', ') }}</span>
                <span class="website" v-if="app.website"><a :href="app.website" target="_blank">Website</a></span>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'

export default {
  name: 'Apps',
  setup() {
    const supabase = inject('supabase')
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const apps = ref([])
    const categories = ref([])

    const fetchApps = async () => {
      const { data, error } = await supabase.from('apps').select('*').order('created_at', { ascending: false })
      if (!error && data) {
        apps.value = data
        // Extract unique categories from the data
        categories.value = [...new Set(data.map(app => app.category).filter(Boolean))]
      }
    }

    const filteredApps = computed(() => {
      return apps.value.filter(app => {
        const matchesSearch = app.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                              app.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = !selectedCategory.value || app.category === selectedCategory.value
        return matchesSearch && matchesCategory
      })
    })

    onMounted(() => {
      fetchApps()
    })

    return {
      searchQuery,
      selectedCategory,
      categories,
      filteredApps
    }
  }
}
</script>

<style scoped>
.apps {
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  font-size: 2.5em;
  margin-bottom: 40px;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.search {
  flex: 1;
  position: relative;
}

.search input {
  width: 100%;
  padding: 12px 20px;
  padding-left: 45px;
  border-radius: 25px;
  border: 2px solid var(--glow-color);
  background: var(--card-bg);
  color: var(--text-color);
  font-size: 1em;
}

.search i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent-color);
}

.category-filter select {
  padding: 12px 20px;
  border-radius: 25px;
  border: 2px solid var(--glow-color);
  background: var(--card-bg);
  color: var(--text-color);
  font-size: 1em;
  cursor: pointer;
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
  transition: all 0.3s ease;
  border: 1px solid var(--glow-color);
}

.app-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px var(--glow-color);
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
  transition: transform 0.3s ease;
}

.app-card:hover .app-image img {
  transform: scale(1.1);
}

.app-content {
  padding: 20px;
}

.app-content h3 {
  color: var(--accent-color);
  margin-bottom: 10px;
}

.description {
  color: #888;
  margin-bottom: 20px;
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

.actions {
  display: flex;
  gap: 10px;
}

.btn-download {
  background: var(--primary-color);
  color: var(--text-color);
  padding: 5px 15px;
  border-radius: 15px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-download:hover {
  background: var(--secondary-color);
  transform: translateY(-2px);
}

.app-meta {
  margin-top: 10px;
  font-size: 0.95em;
  color: var(--text-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.app-card-link {
  text-decoration: none;
  color: inherit;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  .app-grid {
    grid-template-columns: 1fr;
  }
}
</style> 