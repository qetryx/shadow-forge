<template>
  <div class="avatar-upload">
    <div class="upload-container">
      <input
        type="file"
        ref="fileInput"
        accept="image/*"
        @change="handleFileChange"
        class="file-input"
      >
      <div class="preview-container" @click="triggerFileInput">
        <img v-if="previewUrl" :src="previewUrl" alt="Avatar preview" class="preview-image">
        <div v-else class="upload-placeholder">
          <i class="fas fa-user"></i>
          <span>Click to upload avatar</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue'

export default {
  name: 'AvatarUpload',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const supabase = inject('supabase')
    const fileInput = ref(null)
    const previewUrl = ref(null)
    const isUploading = ref(false)

    const loadAvatar = async () => {
      const exts = ['jpg', 'png', 'jpeg', 'webp']
      for (const ext of exts) {
        const fileName = `${props.userId}/avatar.${ext}`
        const { data } = await supabase
          .storage
          .from('avatars')
          .getPublicUrl(fileName)
        if (data && data.publicUrl) {
          try {
            const res = await fetch(data.publicUrl, { method: 'HEAD' })
            if (res.ok) {
              previewUrl.value = data.publicUrl
              break
            }
          } catch (e) {}
        }
      }
    }

    const triggerFileInput = () => {
      fileInput.value.click()
    }

    const handleFileChange = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      isUploading.value = true
      try {
        // Create a preview URL
        previewUrl.value = URL.createObjectURL(file)

        // Upload to Supabase storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${props.userId}/avatar.${fileExt}`
        
        const { error: uploadError } = await supabase
          .storage
          .from('avatars')
          .upload(fileName, file, {
            upsert: true
          })

        if (uploadError) throw uploadError

        // Get the public URL
        const { data } = await supabase
          .storage
          .from('avatars')
          .getPublicUrl(fileName)

        previewUrl.value = data.publicUrl
      } catch (error) {
        console.error('Error uploading avatar:', error)
        alert('Failed to upload avatar. Please try again.')
      } finally {
        isUploading.value = false
      }
    }

    onMounted(() => {
      loadAvatar()
    })

    return {
      fileInput,
      previewUrl,
      isUploading,
      triggerFileInput,
      handleFileChange
    }
  }
}
</script>

<style scoped>
.avatar-upload {
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-container {
  position: relative;
  width: 60px;
  height: 60px;
}

.file-input {
  display: none;
}

.preview-container {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.preview-container:hover {
  border-color: #00f2fe;
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: rgba(255, 255, 255, 0.5);
}

.upload-placeholder i {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.upload-placeholder span {
  font-size: 0.7rem;
  text-align: center;
}
</style> 