<template>
  <div class="upload-app-page">
    <div class="upload-card">
      <h2>Upload a New App</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">App Title</label>
          <input v-model="form.title" id="title" type="text" required placeholder="Enter app title" />
        </div>
        <div class="form-group">
          <label for="category">Category</label>
          <select v-model="form.category" id="category" required>
            <option value="">Select category</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="version">Version</label>
          <input v-model="form.version" id="version" type="text" required placeholder="e.g. 1.0.0" />
        </div>
        <div class="form-group">
          <label for="website">Website/URL</label>
          <input v-model="form.website" id="website" type="url" placeholder="https://yourapp.com" />
        </div>
        <div class="form-group">
          <label for="tags">Tags</label>
          <input v-model="form.tags" id="tags" type="text" placeholder="Comma separated (e.g. productivity, dark, free)" />
        </div>
        <div class="form-group">
          <label for="description">Description</label>
          <textarea v-model="form.description" id="description" rows="4" required placeholder="Describe your app..."></textarea>
        </div>
        <div class="form-group">
          <label>App File</label>
          <div class="custom-file-input">
            <button type="button" class="btn btn-secondary" @click="triggerAppFileInput">
              <i class="fas fa-upload"></i> Choose App File
            </button>
            <span class="file-name">{{ appFile?.name || 'No file chosen' }}</span>
            <input ref="appFileInput" type="file" @change="onAppFileChange" accept=".zip,.exe,.apk,.rar,.7z,.tar,.gz,.dmg,.app,.msi" required hidden />
          </div>
        </div>
        <div class="form-group">
          <label>Screenshot</label>
          <div class="custom-file-input">
            <button type="button" class="btn btn-secondary" @click="triggerScreenshotInput">
              <i class="fas fa-image"></i> Choose Screenshot
            </button>
            <span class="file-name">{{ screenshotFile?.name || 'No file chosen' }}</span>
            <input ref="screenshotInput" type="file" @change="onScreenshotChange" accept="image/*" required hidden />
          </div>
          <div v-if="screenshotPreview" class="screenshot-preview">
            <img :src="screenshotPreview" alt="Screenshot preview" />
          </div>
        </div>
        <button class="btn btn-primary" :disabled="isUploading">
          <span v-if="isUploading">Uploading...</span>
          <span v-else>Upload App</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Upload',
  setup() {
    const supabase = inject('supabase')
    const router = useRouter()
    const isUploading = ref(false)
    const screenshotPreview = ref(null)
    const appFile = ref(null)
    const screenshotFile = ref(null)
    const appFileInput = ref(null)
    const screenshotInput = ref(null)
    const categories = [
      'Utilities', 'Games', 'Themes', 'Productivity', 'Education', 'Entertainment', 'Security', 'Other'
    ]
    const form = ref({
      title: '',
      category: '',
      description: '',
      version: '',
      website: '',
      tags: '',
    })

    const triggerAppFileInput = () => {
      appFileInput.value.click()
    }
    const triggerScreenshotInput = () => {
      screenshotInput.value.click()
    }
    const onAppFileChange = (e) => {
      appFile.value = e.target.files[0]
    }
    const onScreenshotChange = (e) => {
      screenshotFile.value = e.target.files[0]
      if (screenshotFile.value) {
        screenshotPreview.value = URL.createObjectURL(screenshotFile.value)
      }
    }

    const handleSubmit = async () => {
      if (!appFile.value || !screenshotFile.value) {
        alert('Please select both an app file and a screenshot.')
        return
      }
      isUploading.value = true
      try {
        // Upload app file
        const appExt = appFile.value.name.split('.').pop()
        const appPath = `${Date.now()}_${appFile.value.name}`
        const { data: appUpload, error: appError } = await supabase.storage.from('apps').upload(appPath, appFile.value)
        if (appError) throw appError
        const { data: appUrlData } = await supabase.storage.from('apps').getPublicUrl(appPath)
        const appUrl = appUrlData.publicUrl

        // Upload screenshot
        const screenshotExt = screenshotFile.value.name.split('.').pop()
        const screenshotPath = `${Date.now()}_${screenshotFile.value.name}`
        const { data: screenshotUpload, error: screenshotError } = await supabase.storage.from('screenshots').upload(screenshotPath, screenshotFile.value)
        if (screenshotError) throw screenshotError
        const { data: screenshotUrlData } = await supabase.storage.from('screenshots').getPublicUrl(screenshotPath)
        const screenshotUrl = screenshotUrlData.publicUrl

        // Insert app details into Supabase table
        const user = (await supabase.auth.getUser()).data.user
        const { error: insertError } = await supabase.from('apps').insert([
          {
            title: form.value.title,
            category: form.value.category,
            description: form.value.description,
            version: form.value.version,
            website: form.value.website,
            tags: form.value.tags.split(',').map(tag => tag.trim()),
            app_url: appUrl,
            screenshot_url: screenshotUrl,
            user_id: user.id,
          }
        ])
        if (insertError) throw insertError
        alert('App uploaded successfully!')
        router.push('/apps')
      } catch (err) {
        alert('Upload failed: ' + err.message)
      } finally {
        isUploading.value = false
      }
    }

    return {
      form,
      categories,
      isUploading,
      screenshotPreview,
      appFile,
      screenshotFile,
      appFileInput,
      screenshotInput,
      triggerAppFileInput,
      triggerScreenshotInput,
      onAppFileChange,
      onScreenshotChange,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.upload-app-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-dark), var(--bg-darker));
}
.upload-card {
  background: var(--card-bg);
  border-radius: 18px;
  box-shadow: var(--glow-shadow);
  padding: 2.5rem 2rem 2rem 2rem;
  max-width: 500px;
  width: 100%;
  margin: 2rem 0;
  animation: fadeIn 0.7s;
}
.upload-card h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.2rem;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.form-group {
  margin-bottom: 1.5rem;
}
label {
  color: var(--text-color);
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
}
input, select, textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid var(--glow-color);
  background: var(--bg-dark);
  color: var(--text-color);
  font-size: 1rem;
  margin-top: 0.2rem;
  margin-bottom: 0.2rem;
  transition: all var(--transition-normal);
}
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: var(--glow-shadow);
}
.custom-file-input {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.file-name {
  color: var(--text-muted);
  font-size: 0.95rem;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}
.screenshot-preview {
  margin-top: 0.5rem;
  text-align: center;
}
.screenshot-preview img {
  max-width: 100%;
  max-height: 180px;
  border-radius: 10px;
  box-shadow: var(--shadow-md);
}
.btn {
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 1rem;
}
</style> 