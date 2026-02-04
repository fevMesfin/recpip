<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Header -->
      <div class="header">
        <div class="logo">
          <v-icon size="48" color="primary">mdi-chef-hat</v-icon>
        </div>
        <h1 class="app-name">Recipe Hub</h1>
        <h2 class="subtitle">Welcome Back!</h2>
        <p class="description">Sign in to access your recipes</p>
      </div>

      <!-- Error Message -->
      <v-alert
        v-if="message"
        :type="messageType"
        class="mb-6"
        dense
        dismissible
        @input="message = ''"
      >
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-alert-circle</v-icon>
          <span>{{ message }}</span>
        </div>
      </v-alert>

      <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
        <!-- Email -->
        <v-text-field
          v-model="email"
          label="Email"
          placeholder="your@email.com"
          type="email"
          outlined
          dense
          :rules="emailRules"
          prepend-inner-icon="mdi-email"
          class="mb-4"
        />

        <!-- Password -->
        <v-text-field
          v-model="password"
          label="Password"
          placeholder="Enter your password"
          :type="showPassword ? 'text' : 'password'"
          outlined
          dense
          :rules="passwordRules"
          prepend-inner-icon="mdi-lock"
          :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append="showPassword = !showPassword"
          class="mb-6"
        />

        <!-- Button -->
        <v-btn
          type="submit"
          color="primary"
          block
          large
          :loading="loading"
          :disabled="!valid"
          class="mt-2"
        >
          <span class="font-weight-bold">Sign In</span>
        </v-btn>

        <!-- Go to signup -->
        <div class="text-center mt-6">
          <span class="text-body-2 text--secondary">
            Don't have an account?
          </span>
          <v-btn text color="primary" small class="ml-2" @click="goToSignup">
            Sign up
          </v-btn>
        </div>
      </v-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  layout: 'empty',

  data() {
    return {
      valid: false,
      email: 'p@gmail.com',  // Pre-filled for testing
      password: '12345678',  // Pre-filled for testing
      showPassword: false,
      loading: false,
      message: '',
      messageType: 'info',

      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid',
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters',
      ],
    }
  },

  mounted() {
    console.log('Login page loaded')
    // Check if coming from successful signup
    const signupSuccess = localStorage.getItem('signup_success')
    if (signupSuccess) {
      this.message = '✅ Account created! Please login with your credentials.'
      this.messageType = 'success'
      localStorage.removeItem('signup_success')
    }
  },

  methods: {
    async handleLogin() {
      if (!this.$refs.form.validate()) return

      this.loading = true
      this.message = ''
      
      try {
        console.log('🔄 Attempting login...')
        console.log('Email:', this.email)
        console.log('Password length:', this.password.length)
        
        const response = await fetch(
          'http://localhost:8053/users/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: this.email,
              password: this.password
            })
          }
        )
        
        console.log('Response status:', response.status)
        console.log('Response OK?', response.ok)
        
        const data = await response.json()
        console.log('Full response data:', data)
        
        // Handle different backend response structures
        if (response.ok) {
          // Case 1: Standard { success: true, data: { token, user } }
          if (data.success && data.data) {
            console.log('✅ Login successful (format 1)')
            console.log('Token:', data.data.token)
            console.log('User:', data.data.user)
            
            localStorage.setItem('token', data.data.token)
            localStorage.setItem('user', JSON.stringify(data.data.user))
            /////////here 1
            localStorage.setItem('user_id', data.data.user.id)
            
            this.message = '✅ Login successful! Redirecting...'
            this.messageType = 'success'
            
            setTimeout(() => {
              window.location.href = '/recipes'
            }, 1500)
            
          } 
          // Case 2: Direct { token, user }
          else if (data.token) {
            console.log('✅ Login successful (format 2)')
            console.log('Token:', data.token)
            console.log('User:', data.user)
            
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            
            this.message = '✅ Login successful! Redirecting...'
            this.messageType = 'success'
            
            setTimeout(() => {
              window.location.href = '/recipes'
            }, 1500)
            
          } 
          // Case 3: Just success message
          else if (data.message && data.message.includes('success')) {
            console.log('✅ Login successful (format 3)')
            this.message = '✅ Login successful! Redirecting...'
            this.messageType = 'success'
            
            setTimeout(() => {
              window.location.href = '/recipes'
            }, 1500)
            
          } else {
            console.log('❌ Unexpected success response structure:', data)
            this.message = data.message || 'Login successful but unexpected response.'
            this.messageType = 'warning'
          }
          
        } else {
          // Handle error responses
          console.log('❌ Login failed response:', data)
          
          if (data.message) {
            this.message = `❌ ${data.message}`
          } else if (data.error) {
            this.message = `❌ ${data.error}`
          } else {
            this.message = '❌ Login failed. Please check your credentials.'
          }
          this.messageType = 'error'
        }
        
      } catch (error) {
        console.error('❌ Network error:', error)
        
        if (error.message.includes('Failed to fetch')) {
          this.message = '❌ Cannot connect to server. Make sure your backend is running on port 8053.'
        } else {
          this.message = `❌ Network error: ${error.message}`
        }
        this.messageType = 'error'
      } finally {
        this.loading = false
      }
    },

    goToSignup() {
      console.log('Going to signup page...')
      window.location.href = '/'
    }
  }
}
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.logo .v-icon {
  color: white !important;
}

.app-name {
  color: #1976d2;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 8px;
}

.description {
  color: #666;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 600px) {
  .login-card {
    padding: 24px;
    margin: 0 16px;
  }
  
  .logo {
    width: 64px;
    height: 64px;
  }
  
  .app-name {
    font-size: 28px;
  }
}
</style>