<template>
  <div class="register">
    <div class="container">
      <div class="register-card">
        <h1 class="title">Create Account</h1>
        <form @submit.prevent="handleSubmit" class="register-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              required
              placeholder="Enter your email"
            >
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              v-model="formData.username"
              required
              placeholder="Choose a username"
            >
          </div>

          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              v-model="formData.fullName"
              required
              placeholder="Enter your full name"
            >
          </div>

          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea
              id="bio"
              v-model="formData.bio"
              placeholder="Tell us about yourself"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              required
              placeholder="Create a password"
            >
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="formData.confirmPassword"
              required
              placeholder="Confirm your password"
            >
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="formData.termsAccepted"
                required
              >
              <span>I agree to the <a href="#" class="link">Terms of Service</a> and <a href="#" class="link">Privacy Policy</a></span>
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="formData.newsletter"
              >
              <span>Subscribe to our newsletter for updates</span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <i class="fas fa-user-plus"></i>
            {{ isSubmitting ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <div class="login-link">
          Already have an account? <router-link to="/login" class="link">Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const supabase = inject('supabase')
    const isSubmitting = ref(false)
    const formData = ref({
      email: '',
      username: '',
      fullName: '',
      bio: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
      newsletter: false
    })

    const validateForm = () => {
      if (formData.value.password !== formData.value.confirmPassword) {
        alert('Passwords do not match')
        return false
      }

      if (formData.value.password.length < 8) {
        alert('Password must be at least 8 characters long')
        return false
      }

      if (!formData.value.termsAccepted) {
        alert('Please accept the Terms of Service')
        return false
      }

      return true
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      isSubmitting.value = true

      try {
        // First check if username is already taken
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', formData.value.username)
          .single()

        if (existingUser) {
          throw new Error('Username is already taken')
        }

        // Register user with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.value.email,
          password: formData.value.password,
          options: {
            data: {
              username: formData.value.username,
              full_name: formData.value.fullName,
              bio: formData.value.bio,
              newsletter: formData.value.newsletter
            },
            emailRedirectTo: `${window.location.origin}/verify-email`
          }
        })

        if (error) throw error

        // Generate verification token
        const verificationToken = Math.random().toString(36).substring(2, 15)
        
        // Update profile with verification token
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            verification_token: verificationToken,
            email_verified: false
          })
          .eq('id', data.user.id)

        if (updateError) throw updateError

        // Send verification email
        const { error: emailError } = await supabase.auth.signInWithOtp({
          email: formData.value.email,
          options: {
            emailRedirectTo: `${window.location.origin}/verify-email`
          }
        })

        if (emailError) throw emailError

        alert('Registration successful! Please check your email to verify your account.')
        router.push('/login')
      } catch (error) {
        console.error('Registration error:', error)
        alert(error.message)
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      formData,
      isSubmitting,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.register {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  background: linear-gradient(135deg, var(--bg-dark), var(--bg-darker));
}

.container {
  width: 100%;
  max-width: 500px;
  padding: 0 1rem;
}

.register-card {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid var(--glow-color);
  box-shadow: var(--glow-shadow);
  animation: fadeIn 0.5s ease;
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: var(--text-color);
  font-weight: 500;
}

input, textarea {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 2px solid var(--glow-color);
  background: var(--bg-dark);
  color: var(--text-color);
  transition: all var(--transition-normal);
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: var(--glow-shadow);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.link {
  color: var(--primary-color);
  text-decoration: none;
  transition: all var(--transition-normal);
}

.link:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-muted);
}

.btn-primary {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .register-card {
    padding: 1.5rem;
  }

  .title {
    font-size: 1.75rem;
  }
}
</style> 