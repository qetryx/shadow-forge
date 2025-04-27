<template>
  <div class="verify-email">
    <div class="container">
      <div class="verify-card">
        <h1 class="title">Verify Your Email</h1>
        <div v-if="verifying" class="verifying">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Verifying your email...</p>
        </div>
        <div v-else-if="verified" class="verified">
          <i class="fas fa-check-circle"></i>
          <p>Email verified successfully!</p>
          <router-link to="/login" class="btn btn-primary">
            Proceed to Login
          </router-link>
        </div>
        <div v-else class="error">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ errorMessage }}</p>
          <button @click="resendVerification" class="btn btn-secondary" :disabled="isResending">
            <i class="fas fa-redo"></i>
            {{ isResending ? 'Resending...' : 'Resend Verification Email' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, inject, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'VerifyEmail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const supabase = inject('supabase')
    const verifying = ref(true)
    const verified = ref(false)
    const errorMessage = ref('')
    const isResending = ref(false)

    const verifyEmail = async () => {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: route.query.token_hash,
          type: 'email'
        })

        if (error) throw error

        // Update profile to mark email as verified
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('profiles')
            .update({ email_verified: true })
            .eq('id', user.id)
        }

        verified.value = true
      } catch (error) {
        console.error('Verification error:', error)
        errorMessage.value = error.message || 'Failed to verify email. Please try again.'
      } finally {
        verifying.value = false
      }
    }

    const resendVerification = async () => {
      isResending.value = true
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: route.query.email,
          options: {
            emailRedirectTo: `${window.location.origin}/verify-email`
          }
        })

        if (error) throw error
        alert('Verification email has been resent. Please check your inbox.')
      } catch (error) {
        console.error('Resend error:', error)
        errorMessage.value = error.message || 'Failed to resend verification email.'
      } finally {
        isResending.value = false
      }
    }

    onMounted(() => {
      if (route.query.token_hash) {
        verifyEmail()
      } else {
        verifying.value = false
        errorMessage.value = 'Invalid verification link'
      }
    })

    return {
      verifying,
      verified,
      errorMessage,
      isResending,
      resendVerification
    }
  }
}
</script>

<style scoped>
.verify-email {
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

.verify-card {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid var(--glow-color);
  box-shadow: var(--glow-shadow);
  text-align: center;
  animation: fadeIn 0.5s ease;
}

.title {
  margin-bottom: 2rem;
  font-size: 2rem;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.verifying,
.verified,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.verifying i,
.verified i,
.error i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.verifying i {
  color: var(--primary-color);
}

.verified i {
  color: var(--success-color);
}

.error i {
  color: var(--error-color);
}

.btn {
  margin-top: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .verify-card {
    padding: 1.5rem;
  }

  .title {
    font-size: 1.75rem;
  }
}
</style> 