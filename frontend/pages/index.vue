<template>
  <div class="signup-container">
    <!-- Signup Card -->
    <div class="signup-card">
      <!-- Header -->
      <div class="header">
        <div class="logo">
          <v-icon size="48" color="primary">mdi-chef-hat</v-icon>
        </div>
        <h1 class="app-name">Recipe Hub</h1>
        <h2 class="subtitle">Create Your Account</h2>
        <p class="description">Join to save and share recipes</p>
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

      <v-form ref="form" v-model="valid" @submit.prevent="handleSignup">
        <!-- Name -->
        <v-text-field
          v-model="name"
          label="Full Name"
          outlined
          dense
          :rules="nameRules"
          prepend-inner-icon="mdi-account"
          class="mb-4"
        />

        <!-- Email -->
        <v-text-field
          v-model="email"
          label="Email"
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
        >
          <span class="font-weight-bold">Sign Up</span>
        </v-btn>

        <!-- Go to login -->
        <div class="text-center mt-6">
          <span class="text-body-2 text--secondary">
            Already have an account?
          </span>
          <v-btn text color="primary" small class="ml-2" @click="goToLogin">
            Sign in
          </v-btn>
        </div>
      </v-form>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'SignupPage',
  layout: 'empty',

  data() {
    return {
      valid: false,
      name: '',
      email: '',
      password: '',
      showPassword: false,
      loading: false,
      message: '',
      messageType: 'info',

      nameRules: [
        v => !!v || 'Name is required',
        v => v.length >= 2 || 'Minimum 2 characters',
      ],
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid',
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Minimum 6 characters',
      ],
    }
  },

  mounted() {
    console.log('Signup page loaded')
    // Clear any existing auth data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('user_id')
  },

  methods: {
    async handleSignup() {
      if (!this.$refs.form.validate()) return

      this.loading = true
      this.message = ''

      try {
        console.log('🔄 Creating account via Hasura Action...')
        console.log('Name:', this.name)
        console.log('Email:', this.email)
        console.log('Password length:', this.password.length)
        
        // Use GraphQL mutation with Hasura Actions
        const response = await this.$apollo.mutate({
          mutation: gql`
            mutation RegisterUser(
              $name: String!
              $email: String!
              $password: String!
            ) {
              register(
                name: $name
                email: $email
                password: $password
              ) {
                    success
                    message
                    user_id
                    user_name
                    user_email
                    user_created_at
                  }
            }
          `,
          variables: {
            name: this.name,
            email: this.email,
            password: this.password
          }
        })

          const data = response.data.register
        console.log('Signup response:', data)

        if (data.success) {
          this.message = '✅ Account created successfully! Redirecting to login...'
          this.messageType = 'success'
          
          // Store user data temporarily (optional, for auto-login)
          if (data.user_id) {
            localStorage.setItem('user_id', data.user_id)
            console.log('✅ User ID stored:', data.user_id)
          }
          // Build a user object from flat fields if present
          if (data.user_name || data.user_email) {
            const userObj = {
              id: data.user_id || null,
              name: data.user_name || null,
              email: data.user_email || null,
              created_at: data.user_created_at || null
            }
            localStorage.setItem('user', JSON.stringify(userObj))
            console.log('✅ User data stored:', userObj)
          }
          
          // Clear form
          this.name = ''
          this.email = ''
          this.password = ''
          
          // Reset form validation
          if (this.$refs.form) {
            this.$refs.form.resetValidation()
          }
          
          // Wait 2 seconds then go to login
          setTimeout(() => {
            this.goToLogin()
          }, 2000)
          
        } else {
          // Handle error from backend
          this.message = data.message || 'Signup failed. Please try again.'
          this.messageType = 'error'
          console.error('Signup failed:', data.message)
        }
        
      } catch (error) {
        console.error('❌ Signup error:', error)
        
        // Handle different types of errors
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          // GraphQL errors from Hasura
          const gqlError = error.graphQLErrors[0]
          this.message = `❌ ${gqlError.message || 'GraphQL error occurred'}`
          
          // Check if it's an Action execution error
          if (gqlError.extensions && gqlError.extensions.code === 'action-execution-error') {
            this.message = '❌ Authentication service is not responding. Please check backend server.'
          }
          
        } else if (error.networkError) {
          // Network errors
          console.error('Network error details:', error.networkError)
          
          if (error.networkError.message.includes('Failed to fetch')) {
            this.message = '❌ Cannot connect to Hasura. Please check:'
            this.message += '\n1. Hasura is running on http://localhost:8080'
            this.message += '\n2. Backend server is running on http://localhost:4000'
            this.message += '\n3. CORS is properly configured'
          } else {
            this.message = `❌ Network error: ${error.networkError.message}`
          }
        } else {
          // Other errors
          this.message = `❌ Error: ${error.message || 'Unknown error occurred'}`
        }
        
        this.messageType = 'error'
      } finally {
        this.loading = false
      }
    },

    goToLogin() {
      console.log('Navigating to login page...')
      
      // Clear any auth data before going to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Navigate to login page
      // Use $router if available, otherwise fallback to window.location
      if (this.$router) {
        this.$router.push('/login')
      } else {
        window.location.href = '/login'
      }
    }
  }
}
</script>

<style scoped>
.signup-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* Match recipes page background */
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.signup-card {
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
  /* use recipes primary red accents to match theme */
  background: linear-gradient(135deg, #FF6B6B, #e85a5a);
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
  color: #FF6B6B; /* match Vuetify primary */
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

/* Make primary buttons match recipes primary color */
.signup-card .v-btn--is-elevated.v-btn--large,
.signup-card .v-btn.primary {
  background-color: #FF6B6B !important;
  color: white !important;
}

/* Alert styling for multi-line messages */
.v-alert {
  white-space: pre-line;
}

/* Responsive */
@media (max-width: 600px) {
  .signup-card {
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
  
  .subtitle {
    font-size: 18px;
  }
  
  .description {
    font-size: 14px;
  }
}
</style>