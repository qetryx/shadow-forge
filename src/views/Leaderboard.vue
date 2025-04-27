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
              <th>Downloads</th>
              <th>Uploads</th>
              <th>Likes</th>
              <th>Achievements</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in users" :key="user.id">
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
                <img :src="user.avatar" :alt="user.name" class="avatar">
                <span class="name">{{ user.name }}</span>
              </td>
              <td>{{ user.downloads }}</td>
              <td>{{ user.uploads }}</td>
              <td>{{ user.likes }}</td>
              <td class="achievements">
                <i v-for="achievement in user.achievements" 
                   :key="achievement"
                   :class="['fas', achievement.icon]"
                   :title="achievement.name"
                ></i>
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
import { ref, computed } from 'vue'

export default {
  name: 'Leaderboard',
  setup() {
    const activeTab = ref('all')
    const currentPage = ref(1)
    const totalPages = ref(5)

    const tabs = [
      { id: 'all', label: 'All Time' },
      { id: 'month', label: 'This Month' },
      { id: 'week', label: 'This Week' }
    ]

    // Dummy data for demonstration
    const users = [
      {
        id: 1,
        name: 'TechWizard',
        avatar: 'https://via.placeholder.com/40',
        downloads: '12.5k',
        uploads: '45',
        likes: '2.3k',
        achievements: [
          { name: 'Top Contributor', icon: 'fa-trophy' },
          { name: 'Verified Developer', icon: 'fa-check-circle' }
        ]
      },
      {
        id: 2,
        name: 'ThemeMaster',
        avatar: 'https://via.placeholder.com/40',
        downloads: '8.7k',
        uploads: '32',
        likes: '1.8k',
        achievements: [
          { name: 'Verified Developer', icon: 'fa-check-circle' }
        ]
      },
      {
        id: 3,
        name: 'GamePro',
        avatar: 'https://via.placeholder.com/40',
        downloads: '15.2k',
        uploads: '28',
        likes: '3.1k',
        achievements: [
          { name: 'Top Contributor', icon: 'fa-trophy' }
        ]
      }
    ]

    return {
      activeTab,
      currentPage,
      totalPages,
      tabs,
      users
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

.name {
  font-weight: bold;
}

.achievements {
  display: flex;
  gap: 10px;
}

.achievements i {
  color: var(--accent-color);
  font-size: 1.2em;
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