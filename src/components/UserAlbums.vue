<template>
  <div class="user-albums-container">
    <div class="header">
      <h2>Albums by {{ user?.name || 'User' }}</h2>
      <button @click="goBack" class="back-btn">
        <i class="fas fa-arrow-left"></i> Back to Users
      </button>
    </div>
    <div v-if="loading" class="loading">Loading albums...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="albums-grid">
      <div v-for="album in albums" :key="album.id" class="album-card">
        <div class="album-header">
          <h3>{{ album.title }}</h3>
          <span class="photo-count">{{ albumPhotos[album.id]?.length || 0 }} photos</span>
        </div>
        <div class="album-preview">
          <div v-if="albumPhotos[album.id]?.length" class="preview-grid">
            <img v-for="photo in albumPhotos[album.id].slice(0, 4)" 
                 :key="photo.id" 
                 :src="photo.thumbnailUrl" 
                 :alt="photo.title"
                 class="preview-photo">
          </div>
          <div v-else class="no-photos">
            No photos in this album
          </div>
        </div>
        <button @click="viewAlbum(album.id)" class="view-album-btn">
          <i class="fas fa-images"></i> View Album
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiService } from '../services/api';

export default {
  name: 'UserAlbums',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const albums = ref([]);
    const albumPhotos = ref({});
    const user = ref(null);
    const loading = ref(true);
    const error = ref(null);

    const fetchData = async () => {
      try {
        loading.value = true;
        const [albumsResponse, userResponse] = await Promise.all([
          apiService.getUserAlbums(route.params.userId),
          apiService.getUser(route.params.userId)
        ]);
        albums.value = albumsResponse.data;
        user.value = userResponse.data;

        // Fetch photos for each album
        for (const album of albums.value) {
          const photosResponse = await apiService.getAlbumPhotos(album.id);
          albumPhotos.value[album.id] = photosResponse.data;
        }
      } catch (err) {
        error.value = 'Failed to fetch data: ' + err.message;
      } finally {
        loading.value = false;
      }
    };

    const viewAlbum = (albumId) => {
      router.push(`/albums/${albumId}`);
    };

    const goBack = () => {
      router.push('/users');
    };

    onMounted(() => {
      fetchData();
    });

    return {
      albums,
      albumPhotos,
      user,
      loading,
      error,
      viewAlbum,
      goBack
    };
  }
};
</script>

<style scoped>
.user-albums-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.back-btn {
  background: #666;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background: #555;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.album-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.album-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.album-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1em;
}

.photo-count {
  font-size: 0.9em;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.album-preview {
  margin: 15px 0;
  min-height: 200px;
  background: #f9f9f9;
  border-radius: 4px;
  overflow: hidden;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
}

.preview-photo {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.no-photos {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.view-album-btn {
  width: 100%;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
}

.view-album-btn:hover {
  background: #45a049;
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