<template>
  <div class="leaderboard">
    <div class="container">
      <h1>Top Contributors</h1>
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="leaderboard-table">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Total Likes</th>
              <th>Uploads</th>
              <th>Top App</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in topUploaders" :key="user.id">
              <td class="rank">
                <span :class="['rank-number', {
                  'gold': index === 0,
                  'silver': index === 1,
                  'bronze': index === 2
                }]">
                  {{ index + 1 }}
                </span>
              </td>
              <td class="user">
                <img :src="user.avatar_url || 'https://via.placeholder.com/40'" :alt="user.username" class="avatar">
                <div class="user-details">
                  <span class="name">{{ user.username || user.full_name }}</span>
                  <span class="join-date">Joined {{ formatDate(user.created_at) }}</span>
                </div>
              </td>
              <td class="likes">
                <i class="fas fa-heart"></i>
                {{ user.total_likes }}
              </td>
              <td>{{ user.total_uploads }}</td>
              <td class="top-app">
                <router-link v-if="user.top_app" :to="'/apps/' + user.top_app.id" class="app-link">
                  {{ user.top_app.title }}
                  <span class="app-likes">
                    <i class="fas fa-heart"></i>
                    {{ user.top_app.likes }}
                  </span>
                </router-link>
                <span v-else>No apps yet</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button 
          v-for="page in totalPages" 
          :key="page"
          :class="['page-btn', { active: currentPage === page }]"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue'

export default {
  name: 'Leaderboard',
  setup() {
    const supabase = inject('supabase')
    const activeTab = ref('all')
    const currentPage = ref(1)
    const totalPages = ref(5)
    const topUploaders = ref([])

    const tabs = [
      { id: 'all', label: 'All Time' },
      { id: 'month', label: 'This Month' },
      { id: 'week', label: 'This Week' }
    ]

    const fetchTopUploaders = async () => {
      try {
        // Get all apps with their likes count
        const { data: apps, error: appsError } = await supabase
          .from('apps')
          .select('id, title, user_id, created_at')

        if (appsError) {
          console.error('Error fetching apps:', appsError)
          return
        }

        // Get all users
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, created_at')

        if (usersError) {
          console.error('Error fetching users:', usersError)
          return
        }

        // Calculate total likes and uploads per user
        const userStats = await Promise.all(users.map(async user => {
          const userApps = apps.filter(app => app.user_id === user.id)
          
          // Get total likes for each app
          const appLikesPromises = userApps.map(async app => {
            const { count: likesCount } = await supabase
              .from('likes')
              .select('*', { count: 'exact' })
              .eq('app_id', app.id)
            return { ...app, likes: likesCount || 0 }
          })
          
          const appsWithLikes = await Promise.all(appLikesPromises)
          const totalLikes = appsWithLikes.reduce((sum, app) => sum + app.likes, 0)
          const topApp = appsWithLikes.reduce((top, app) => {
            return (!top || app.likes > top.likes) ? app : top
          }, null)

          // Get the avatar URL from the avatars bucket
          let avatarUrl = 'https://via.placeholder.com/40'
          if (user.avatar_url) {
            try {
              const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(user.avatar_url)
              avatarUrl = publicUrl
            } catch (storageError) {
              console.error('Error getting avatar URL:', storageError)
            }
          }

          return {
            ...user,
            avatar_url: avatarUrl,
            total_likes: totalLikes,
            total_uploads: userApps.length,
            top_app: topApp
          }
        }))

        // Sort by total likes
        topUploaders.value = userStats
          .sort((a, b) => b.total_likes - a.total_likes)
          .slice(0, 10) // Get top 10
      } catch (error) {
        console.error('Error fetching top uploaders:', error)
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString()
    }

    onMounted(() => {
      fetchTopUploaders()
    })

    return {
      activeTab,
      currentPage,
      totalPages,
      tabs,
      topUploaders,
      formatDate
    }
  }
}
</script>

<style scoped>
.leaderboard {
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

.tabs {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}

.tab {
  padding: 10px 20px;
  border-radius: 25px;
  border: 2px solid var(--glow-color);
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab:hover {
  background: var(--glow-color);
}

.tab.active {
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  border-color: transparent;
}

.leaderboard-table {
  background: var(--card-bg);
  border-radius: 15px;
  border: 1px solid var(--glow-color);
  overflow: hidden;
  margin-bottom: 40px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid var(--glow-color);
}

th {
  background: rgba(0, 0, 0, 0.2);
  color: var(--accent-color);
}

.rank {
  text-align: center;
  width: 60px;
}

.rank-number {
  display: inline-block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  border-radius: 50%;
  background: var(--bg-dark);
  color: var(--text-color);
}

.rank-number.gold {
  background: linear-gradient(45deg, #FFD700, #FFA500);
  color: #000;
}

.rank-number.silver {
  background: linear-gradient(45deg, #C0C0C0, #A9A9A9);
  color: #000;
}

.rank-number.bronze {
  background: linear-gradient(45deg, #CD7F32, #8B4513);
  color: #000;
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-weight: bold;
}

.join-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.likes {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--error-color);
}

.top-app {
  max-width: 200px;
}

.app-link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--text-color);
  text-decoration: none;
  transition: color var(--transition-normal);
}

.app-link:hover {
  color: var(--primary-color);
}

.app-likes {
  font-size: 0.9rem;
  color: var(--error-color);
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.page-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--glow-color);
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover {
  background: var(--glow-color);
}

.page-btn.active {
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  border-color: transparent;
}

@media (max-width: 768px) {
  .leaderboard-table {
    overflow-x: auto;
  }

  table {
    min-width: 600px;
  }

  .tabs {
    flex-wrap: wrap;
  }
}
</style> 