<template>
  <div class="login">
    <div class="container">
      <div class="login-card">
        <h1>Login</h1>
        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="form.email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="form.password" required>
          </div>

          <div class="form-footer">
            <button type="submit" class="btn-login" :disabled="isSubmitting">
              {{ isSubmitting ? 'Logging in...' : 'Login' }}
            </button>
            <router-link to="/register" class="btn-register">Create Account</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const supabase = inject('supabase')
    const form = ref({
      email: '',
      password: ''
    })
    const isSubmitting = ref(false)

    const handleSubmit = async () => {
      isSubmitting.value = true
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.value.email,
          password: form.value.password
        })

        if (error) throw error

        // Redirect to home page after successful login
        router.push('/')
      } catch (error) {
        console.error('Login error:', error.message)
        alert('Login failed: ' + error.message)
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      form,
      isSubmitting,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, var(--bg-dark), var(--bg-darker));
}

.container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: var(--card-bg);
  padding: 40px;
  border-radius: 15px;
  border: 1px solid var(--glow-color);
  box-shadow: 0 0 20px var(--glow-color);
}

h1 {
  text-align: center;
  font-size: 2.5em;
  margin-bottom: 30px;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-color);
}

input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid var(--glow-color);
  background: var(--bg-dark);
  color: var(--text-color);
  font-size: 1em;
}

.form-footer {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
}

.btn-login {
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  color: var(--text-color);
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px var(--glow-color);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-register {
  text-align: center;
  color: var(--accent-color);
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-register:hover {
  color: var(--secondary-color);
}

@media (max-width: 768px) {
  .login-card {
    padding: 30px 20px;
  }
}
</style> 