<template>
  <div class="admin-page">
    <div class="container">
      <h1>Admin Dashboard</h1>
      
      <div class="admin-stats">
        <div class="stat-card">
          <h3>Total Mods</h3>
          <p>{{ totalMods }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Users</h3>
          <p>{{ totalUsers }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Downloads</h3>
          <p>{{ totalDownloads }}</p>
        </div>
      </div>

      <div class="avatar-upload-section">
        <h2>Upload Avatar</h2>
        <div class="avatar-upload">
          <div class="avatar-preview">
            <img 
              v-if="currentAvatar" 
              :src="currentAvatar" 
              alt="Current Avatar"
              class="current-avatar"
            >
            <div v-else class="avatar-placeholder">
              <i class="fas fa-user"></i>
            </div>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            @change="handleAvatarUpload" 
            ref="avatarInput"
            style="display: none"
          >
          <button class="btn btn-primary" @click="$refs.avatarInput.click()">
            <i class="fas fa-upload"></i> Change Avatar
          </button>
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
            <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div v-if="uploadError" class="error-message">{{ uploadError }}</div>
        </div>
      </div>

      <div class="mods-table">
        <div class="table-header">
          <h2>Manage Mods</h2>
          <button class="btn btn-primary" @click="showAddModal = true">
            <i class="fas fa-plus"></i> Add New Mod
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Downloads</th>
              <th>Likes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mod in mods" :key="mod.id">
              <td>{{ mod.title }}</td>
              <td>{{ mod.author_name }}</td>
              <td>{{ mod.downloads }}</td>
              <td>{{ mod.likes }}</td>
              <td>
                <span :class="['status-badge', mod.status]">
                  {{ mod.status }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-icon" @click="editMod(mod)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon danger" @click="deleteMod(mod)">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingMod ? 'Edit Mod' : 'Add New Mod' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveMod">
            <div class="form-group">
              <label>Title</label>
              <input v-model="form.title" type="text" required>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="form.description" required></textarea>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Admin',
  setup() {
    const supabase = inject('supabase')
    const router = useRouter()
    const mods = ref([])
    const totalMods = ref(0)
    const totalUsers = ref(0)
    const totalDownloads = ref(0)
    const showAddModal = ref(false)
    const editingMod = ref(null)
    const uploadProgress = ref(0)
    const uploadError = ref('')
    const currentAvatar = ref('')
    const form = ref({
      title: '',
      description: '',
      status: 'active'
    })

    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== 'aryan.ali.king.master@gmail.com') {
        router.push('/')
      }
    }

    const fetchMods = async () => {
      const { data, error } = await supabase
        .from('apps')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (!error && data) {
        mods.value = data.map(mod => ({
          ...mod,
          author_name: mod.profiles?.username || mod.profiles?.full_name || 'Unknown'
        }))
        totalMods.value = data.length
      }
    }

    const fetchStats = async () => {
      // Get total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
      totalUsers.value = usersCount || 0

      // Get total downloads
      const { data: downloadsData } = await supabase
        .from('apps')
        .select('downloads')
      totalDownloads.value = downloadsData?.reduce((sum, app) => sum + (app.downloads || 0), 0) || 0
    }

    const fetchCurrentAvatar = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
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
            .getPublicUrl(`${user.id}/${avatarPath}`)
          
          // Update the current avatar with the public URL
          currentAvatar.value = publicUrl
        }
      } catch (error) {
        console.error('Error in fetchCurrentAvatar:', error)
      }
    }

    const editMod = (mod) => {
      editingMod.value = mod
      form.value = {
        title: mod.title,
        description: mod.description,
        status: mod.status
      }
      showAddModal.value = true
    }

    const deleteMod = async (mod) => {
      if (confirm('Are you sure you want to delete this mod?')) {
        const { error } = await supabase
          .from('apps')
          .delete()
          .eq('id', mod.id)

        if (!error) {
          await fetchMods()
        }
      }
    }

    const saveMod = async () => {
      if (editingMod.value) {
        // Update existing mod
        const { error } = await supabase
          .from('apps')
          .update({
            title: form.value.title,
            description: form.value.description,
            status: form.value.status
          })
          .eq('id', editingMod.value.id)

        if (!error) {
          await fetchMods()
          closeModal()
        }
      } else {
        // Create new mod
        const { error } = await supabase
          .from('apps')
          .insert([{
            title: form.value.title,
            description: form.value.description,
            status: form.value.status,
            user_id: (await supabase.auth.getUser()).data.user.id
          }])

        if (!error) {
          await fetchMods()
          closeModal()
        }
      }
    }

    const closeModal = () => {
      showAddModal.value = false
      editingMod.value = null
      form.value = {
        title: '',
        description: '',
        status: 'active'
      }
    }

    const handleAvatarUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      // Reset states
      uploadProgress.value = 0
      uploadError.value = ''

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Check if bucket exists
        const { data: buckets } = await supabase.storage.listBuckets()
        const avatarBucket = buckets?.find(b => b.name === 'avatars')
        
        if (!avatarBucket) {
          throw new Error('Avatars bucket not found. Please create the bucket first.')
        }

        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/gif']
        if (!validTypes.includes(file.type)) {
          throw new Error('Please upload a valid image file (JPEG, PNG, or GIF)')
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('File size should be less than 5MB')
        }

        // First, delete the old avatar if it exists
        if (currentAvatar.value) {
          try {
            const oldPath = currentAvatar.value.split('/').pop()
            await supabase.storage
              .from('avatars')
              .remove([`${user.id}/${oldPath}`])
          } catch (error) {
            console.warn('Error deleting old avatar:', error)
          }
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        // Upload the file to avatars bucket
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // Get the public URL from avatars bucket
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        // Update or create profile with the new avatar URL
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          console.error('Profile update error:', profileError)
          throw new Error(`Profile update failed: ${profileError.message}`)
        }

        // Update current avatar preview
        currentAvatar.value = publicUrl

        // Reset progress after successful upload
        uploadProgress.value = 100
        setTimeout(() => {
          uploadProgress.value = 0
        }, 2000)

      } catch (error) {
        console.error('Error in handleAvatarUpload:', error)
        uploadError.value = error.message || 'An unexpected error occurred. Please try again.'
      }
    }

    const deleteUser = async (userId) => {
      if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return
      }

      try {
        // First delete the user's avatar from storage if it exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', userId)
          .single()

        if (profile?.avatar_url) {
          const avatarPath = profile.avatar_url.split('/').pop()
          await supabase.storage
            .from('avatars')
            .remove([`${userId}/${avatarPath}`])
        }

        // Delete user's profile data
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId)

        if (profileError) {
          throw new Error(`Failed to delete profile: ${profileError.message}`)
        }

        // Delete user's auth data
        const { error: authError } = await supabase.auth.admin.deleteUser(userId)

        if (authError) {
          throw new Error(`Failed to delete auth user: ${authError.message}`)
        }

        // Refresh the user list
        await fetchStats()
      } catch (error) {
        console.error('Error deleting user:', error)
        alert(`Failed to delete user: ${error.message}`)
      }
    }

    // Add a listener for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        fetchCurrentAvatar()
      }
    })

    onMounted(async () => {
      await checkAdminAccess()
      await fetchMods()
      await fetchStats()
      await fetchCurrentAvatar()
    })

    return {
      mods,
      totalMods,
      totalUsers,
      totalDownloads,
      showAddModal,
      editingMod,
      form,
      uploadProgress,
      uploadError,
      currentAvatar,
      editMod,
      deleteMod,
      saveMod,
      closeModal,
      handleAvatarUpload,
      deleteUser
    }
  }
}
</script>

<style scoped>
.admin-page {
  padding: 40px 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-dark), var(--bg-darker));
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

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  border: 1px solid var(--glow-color);
}

.stat-card h3 {
  color: var(--text-muted);
  margin-bottom: 10px;
}

.stat-card p {
  font-size: 2em;
  font-weight: bold;
  color: var(--text-color);
}

.avatar-upload-section {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 40px;
  border: 1px solid var(--glow-color);
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20px;
  border: 3px solid var(--glow-color);
  background: var(--bg-dark);
}

.current-avatar {
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
  font-size: 3em;
  color: var(--text-muted);
}

.upload-progress {
  width: 100%;
  background: var(--bg-dark);
  border-radius: 8px;
  padding: 5px;
  position: relative;
}

.progress-bar {
  height: 20px;
  background: var(--primary-color);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.upload-progress span {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
}

.error-message {
  color: var(--error-color);
  font-size: 0.9em;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9em;
  font-weight: 500;
}

.status-badge.active {
  background: var(--success-color);
  color: white;
}

.status-badge.pending {
  background: var(--warning-color);
  color: black;
}

.status-badge.rejected {
  background: var(--error-color);
  color: white;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: transparent;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all var(--transition-normal);
}

.btn-icon:hover {
  background: var(--glow-color);
}

.btn-icon.danger:hover {
  background: var(--error-color);
  color: white;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--glow-color);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-color);
  font-size: 1.5em;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-color);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid var(--glow-color);
  background: var(--bg-dark);
  color: var(--text-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .admin-stats {
    grid-template-columns: 1fr;
  }

  .mods-table {
    overflow-x: auto;
  }

  table {
    min-width: 600px;
  }
}
</style> 