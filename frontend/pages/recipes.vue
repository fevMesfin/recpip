<template>
  <div class="dashboard-container">
    <!-- Modern Header -->
    <v-app-bar color="white" elevation="2" class="modern-header" clipped-left app>
      <!-- Logo Section -->
      <div class="d-flex align-center ml-2">
        <div class="logo-container">
          <v-icon color="primary" size="32">mdi-chef-hat</v-icon>
        </div>
        <div class="ml-3">
          <div class="app-title primary--text">RecipeMaster</div>
          <div class="app-subtitle text--secondary">Dashboard</div>
        </div>
      </div>

      <!-- Search Bar -->
      <v-text-field
        v-model="search"
        placeholder="Search recipes..."
        solo
        flat
        dense
        prepend-inner-icon="mdi-magnify"
        hide-details
        class="search-field ml-8"
        style="max-width: 450px;"
        background-color="#f8f9fa"
        rounded
      ></v-text-field>

      <v-spacer></v-spacer>

      <!-- User Actions -->
      <div class="d-flex align-center mr-4">
        <!-- Notification Icon -->
        <v-btn icon class="mr-2">
          <v-badge color="red" dot>
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>
        
        <!-- Add Recipe Button -->
        <v-btn
          color="primary"
          class="add-btn mr-3"
          @click="showAddDialog = true"
          rounded
          elevation="0"
        >
          <v-icon left>mdi-plus</v-icon>
          Add Recipe
        </v-btn>
        
        <!-- User Avatar with Menu -->
        <v-menu bottom left offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-avatar color="primary" size="40">
                <span class="white--text text-h6">{{ userInitial }}</span>
              </v-avatar>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-avatar>
                <v-avatar color="primary" size="36">
                  <span class="white--text">{{ userInitial }}</span>
                </v-avatar>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{ userName }}</v-list-item-title>
                <v-list-item-subtitle>{{ userEmail }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="$router.push('/profile')">
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-list-item @click="$router.push('/settings')">
              <v-list-item-icon>
                <v-icon>mdi-cog</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="logout">
              <v-list-item-icon>
                <v-icon color="error">mdi-logout</v-icon>
              </v-list-item-icon>
              <v-list-item-title class="error--text">Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="main-content">
      <!-- Welcome card removed as requested -->

      <!-- Stats Cards removed as requested -->

      <!-- Recipes Section -->
      <v-container class="recipes-container">
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h2 class="text-h4 font-weight-bold">Your Recipes</h2>
            <p class="text-body-1 text--secondary">Manage and organize your recipe collection</p>
          </div>
          <div class="d-flex align-center">
            <v-btn-toggle v-model="viewMode" rounded>
              <v-btn small value="grid">
                <v-icon>mdi-view-grid</v-icon>
              </v-btn>
              <v-btn small value="list">
                <v-icon>mdi-view-list</v-icon>
              </v-btn>
            </v-btn-toggle>
            <v-menu offset-y class="ml-4">
              <template v-slot:activator="{ on, attrs }">
                <v-btn outlined v-bind="attrs" v-on="on">
                  <v-icon left>mdi-sort</v-icon>
                  Sort by: {{ sortOptions.find(s => s.value === sortBy)?.text }}
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-for="option in sortOptions" :key="option.value" @click="sortBy = option.value">
                  <v-list-item-title>{{ option.text }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <!-- Recipe Cards Grid -->
        <v-row v-if="viewMode === 'grid'">
          <v-col
            v-for="recipe in sortedRecipes"
            :key="recipe.id"
            cols="12"
            sm="6"
            md="4"
            lg="4"
          >
            <v-card class="recipe-card" elevation="2" hover rounded="lg">
              <!-- Recipe Image with Favorite Button -->
              <div class="image-container">
                <v-img
                  :src="recipe.image_url"
                  height="200px"
                  class="recipe-image"
                  gradient="to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5)"
                >
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-icon size="64" color="grey lighten-1">mdi-food</v-icon>
                    </v-row>
                  </template>
                  <v-card-title class="text-h6 font-weight-bold white--text">
                    {{ recipe.title }}
                  </v-card-title>
                  <v-btn
                    icon
                    absolute
                    top
                    right
                    class="favorite-btn"
                    @click.stop="toggleFavorite(recipe.id)"
                  >
                    <v-icon :color="recipe.favorite ? 'red' : 'white'">
                      {{ recipe.favorite ? 'mdi-heart' : 'mdi-heart-outline' }}
                    </v-icon>
                  </v-btn>
                </v-img>
              </div>

              <!-- Recipe Details -->
              <v-card-text class="pa-4">
                <p class="text-body-1 mb-3 recipe-description">{{ recipe.description }}</p>
                
                <!-- Price and Actions -->
                <div class="d-flex justify-space-between align-center mt-4">
                  <div class="price-tag">
                    <v-icon small color="green" class="mr-1">mdi-currency-usd</v-icon>
                    <span class="text-h6 font-weight-bold">{{ recipe.price }}</span>
                    <span class="text-caption text--secondary ml-1">ETB</span>
                  </div>
                  <!-- serving time removed as requested -->
                </div>
              </v-card-text>

              <!-- Card Actions -->
              <v-card-actions class="pa-3">
                <v-btn
                  text
                  color="primary"
                  small
                  @click="viewRecipe(recipe)"
                  class="action-btn"
                >
                  <v-icon left small>mdi-eye</v-icon>
                  View
                </v-btn>
                <v-btn
                  text
                  color="primary"
                  small
                  @click="editRecipe(recipe)"
                  class="action-btn"
                >
                  <v-icon left small>mdi-pencil</v-icon>
                  Edit
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  icon
                  small
                  @click.stop="deleteRecipe(recipe.id)"
                  class="delete-btn"
                >
                  <v-icon color="grey">mdi-delete</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- List View (Alternative) -->
        <div v-else class="list-view">
          <v-card v-for="recipe in sortedRecipes" :key="recipe.id" class="mb-4" elevation="1" rounded="lg">
            <v-row no-gutters>
              <v-col cols="4" md="3">
                <v-img
                  :src="recipe.image_url"
                  height="140"
                  class="list-image"
                ></v-img>
              </v-col>
              <v-col cols="8" md="9" class="pa-4">
                <div class="d-flex justify-space-between align-start">
                  <div>
                    <h3 class="text-h6 font-weight-bold">{{ recipe.title }}</h3>
                    <p class="text-body-2 text--secondary mb-2">{{ recipe.description }}</p>
                    <div class="d-flex align-center">
                      <v-icon small color="green" class="mr-1">mdi-currency-usd</v-icon>
                      <span class="font-weight-bold">{{ recipe.price }} ETB</span>
                      <!-- serving time removed as requested -->
                    </div>
                  </div>
                  <div class="d-flex flex-column">
                    <v-btn icon small @click="toggleFavorite(recipe.id)">
                      <v-icon :color="recipe.favorite ? 'red' : 'grey'">
                        {{ recipe.favorite ? 'mdi-heart' : 'mdi-heart-outline' }}
                      </v-icon>
                    </v-btn>
                    <v-menu bottom left>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn icon small v-bind="attrs" v-on="on">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list dense>
                        <v-list-item @click="viewRecipe(recipe)">
                          <v-list-item-title>View</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="editRecipe(recipe)">
                          <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteRecipe(recipe.id)" class="error--text">
                          <v-list-item-title>Delete</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </div>

        <!-- Empty State -->
        <v-card v-if="recipes.length === 0" class="empty-state" elevation="0" rounded="lg">
          <v-card-text class="text-center pa-8">
            <v-icon size="64" color="grey lighten-1" class="mb-4">mdi-food-off</v-icon>
            <h3 class="text-h5 mb-2">No recipes yet</h3>
            <p class="text-body-1 text--secondary mb-4">Start by adding your first recipe to your collection</p>
            <v-btn color="primary" @click="showAddDialog = true" rounded>
              <v-icon left>mdi-plus</v-icon>
              Add Your First Recipe
            </v-btn>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <!-- Add/Edit Recipe Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h6">{{ editingRecipe ? 'Edit Recipe' : 'Add Recipe' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="recipeForm" v-model="formValid">
            <v-text-field
              v-model="newRecipe.title"
              label="Title"
              :rules="[(v) => !!v || 'Title is required']"
              required
            />
            <v-textarea
              v-model="newRecipe.description"
              label="Description"
              :rules="[(v) => !!v || 'Description is required']"
              required
            />
            <v-text-field
              v-model="newRecipe.price"
              label="Price"
              type="number"
              :rules="[(v) => !!v || 'Price is required']"
              required
            />
            <v-text-field
              v-model="newRecipe.image_url"
              label="Image URL"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveRecipe">{{ editingRecipe ? 'Update' : 'Create' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Recipe Dialog -->
    <v-dialog v-model="showViewDialog" max-width="600px">
      <v-card v-if="viewingRecipe">
        <v-card-title>
          <span class="text-h6">{{ viewingRecipe.title }}</span>
        </v-card-title>
        <v-card-text>
          <v-img :src="viewingRecipe.image_url" height="200" class="mb-4" />
          <p>{{ viewingRecipe.description }}</p>
          <div class="mt-4">
            <strong>Price:</strong> {{ viewingRecipe.price }} ETB
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showViewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Quick Actions FAB -->
    <v-btn
      fab
      dark
      large
      color="primary"
      fixed
      bottom
      right
      class="mr-4 mb-4"
      @click="showAddDialog = true"
      elevation="6"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'DashboardPage',
  apollo: {
    recipes: {
      // Only fetch recipes that belong to the currently logged-in user
      query: gql`
        query MyQuery($user_id: uuid) {
          recipes(where: { user_id: { _eq: $user_id } }) {
            description
            id
            title
            image_url
            price
          }
        }
      `,
      // Provide the user id from localStorage as a variable for the query
      variables() {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}')
        return { user_id: localUser && localUser.id ? localUser.id : null }
      },
      // Ensure fresh data when actions complete
      fetchPolicy: 'network-only',
      result({ data }) {
        this.recipes = (data && data.recipes ? data.recipes : []).map(recipe => ({
          ...recipe,
          favorite: false,
          rating: 4.5 + Math.random() * 0.5 // Random rating for demo
        }));
        console.log('recipes data:', this.recipes)
      },
    },
  },
  data() {
    return {
      search: '',
      showAddDialog: false,
      showViewDialog: false,
      formValid: false,
      saving: false,
      editingRecipe: null,
      viewingRecipe: null,
      newRecipe: {
        title: '',
        description: '',
        price: '',
        image_url: ''
      },
      recipes: [],
      viewMode: 'grid',
      sortBy: 'title',
      sortOptions: [
        { text: 'Title A-Z', value: 'title' },
        { text: 'Price Low-High', value: 'price_asc' },
        { text: 'Price High-Low', value: 'price_desc' },
        { text: 'Recently Added', value: 'recent' }
      ]
    }
  },
  computed: {
    filteredRecipes() {
      if (!this.search) return this.recipes
      
      const searchTerm = this.search.toLowerCase()
      return this.recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm)
      )
    },
    sortedRecipes() {
      const recipes = this.filteredRecipes.slice()
      
      switch (this.sortBy) {
        case 'title':
          return recipes.sort((a, b) => a.title.localeCompare(b.title))
        case 'price_asc':
          return recipes.sort((a, b) => {
            const priceA = parseFloat(a.price.replace(' ETB', '')) || 0
            const priceB = parseFloat(b.price.replace(' ETB', '')) || 0
            return priceA - priceB
          })
        case 'price_desc':
          return recipes.sort((a, b) => {
            const priceA = parseFloat(a.price.replace(' ETB', '')) || 0
            const priceB = parseFloat(b.price.replace(' ETB', '')) || 0
            return priceB - priceA
          })
        case 'recent':
          return recipes.reverse()
        default:
          return recipes
      }
    },
    userName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.name || 'Chef'
    },
    userEmail() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.email || 'user@example.com'
    },
    userInitial() {
      return this.userName.charAt(0).toUpperCase()
    },
    averagePrice() {
      if (this.recipes.length === 0) return '0 ETB'
      const total = this.recipes.reduce((sum, recipe) => {
        const price = parseFloat(recipe.price.replace(' ETB', '')) || 0
        return sum + price
      }, 0)
      return `${Math.round(total / this.recipes.length)} ETB`
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    },
    
    deleteRecipe(recipeId) {
      if (confirm('Are you sure you want to delete this recipe?')) {
        this.$apollo.mutate({
          mutation: gql`
            mutation DeleteRecipe($id: uuid!) {
              delete_recipes_by_pk(id: $id) {
                id
              }
            }
          `,
          variables: {
            id: recipeId
          }
        }).then(response => {
          console.log('Recipe deleted:', response.data.delete_recipes_by_pk)
          // Refetch user recipes to reflect server state
          if (this.$apollo && this.$apollo.queries && this.$apollo.queries.recipes) {
            this.$apollo.queries.recipes.refetch()
          } else {
            this.recipes = this.recipes.filter(recipe => recipe.id !== recipeId)
          }
        }).catch(error => {
          console.error('Error deleting recipe:', error)
          alert('Failed to delete recipe. Please try again.')
        })
      }
    },
    
    viewRecipe(recipe) {
      this.viewingRecipe = recipe
      this.showViewDialog = true
    },
    
    editRecipe(recipe) {
      this.editingRecipe = recipe
      this.newRecipe = {
        title: recipe.title,
        description: recipe.description,
        price: recipe.price.replace(' ETB', ''),
        image_url: recipe.image_url
      }
      this.showAddDialog = true
    },
    
    saveRecipe() {
      if (this.$refs.recipeForm && !this.$refs.recipeForm.validate()) return

      this.saving = true

      const localUser = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = localUser.id || null

      if (this.editingRecipe) {
        // Update existing recipe
        this.$apollo.mutate({
          mutation: gql`
            mutation UpdateRecipe($id: uuid!, $title: String!, $description: String!, $price: String!, $image_url: String!) {
              update_recipes_by_pk(pk_columns: {id: $id}, _set: {title: $title, description: $description, price: $price, image_url: $image_url}) {
                id
                title
                description
                price
                image_url
              }
            }
          `,
          variables: {
            id: this.editingRecipe.id,
            title: this.newRecipe.title,
            description: this.newRecipe.description,
            price: this.newRecipe.price,
            image_url: this.newRecipe.image_url
          }
        }).then(response => {
          console.log('Recipe updated:', response.data.update_recipes_by_pk)
          if (this.$apollo && this.$apollo.queries && this.$apollo.queries.recipes) {
            this.$apollo.queries.recipes.refetch()
          }
          this.saving = false
          this.closeDialog()
        }).catch(error => {
          console.error('Error updating recipe:', error)
          if (error && error.graphQLErrors) console.error('GraphQL errors:', error.graphQLErrors)
          if (error && error.networkError) console.error('Network error:', error.networkError)
          this.saving = false
        })
      } else {
        // If there's no user id, the user may not be logged in properly or the user
        // record wasn't saved. Prompt to login again to obtain a proper user id.
        if (!userId) {
          alert('Unable to create recipe: user not found. Please login again.')
          window.location.href = '/login'
          this.saving = false
          return
        }
        // Insert new recipe
        this.$apollo.mutate({
          mutation: gql`
            mutation AddRecipe($title: String!, $description: String!, $price: String!, $image_url: String!, $user_id: uuid) {
              insert_recipes_one(object: {title: $title, description: $description, price: $price, image_url: $image_url, user_id: $user_id}) {
                id
                title
                description
                price
                image_url
              }
            }
          `,
          variables: {
            title: this.newRecipe.title,
            description: this.newRecipe.description,
            price: this.newRecipe.price,
            image_url: this.newRecipe.image_url,
            user_id: userId
          }
        }).then(response => {
          console.log('Recipe added:', response.data.insert_recipes_one)
          if (this.$apollo && this.$apollo.queries && this.$apollo.queries.recipes) {
            this.$apollo.queries.recipes.refetch()
          }
          this.saving = false
          this.closeDialog()
        }).catch(error => {
          // Better error visibility for GraphQL / network errors
          console.error('Error adding recipe:', error)
          if (error && error.graphQLErrors) console.error('GraphQL errors:', error.graphQLErrors)
          if (error && error.networkError) console.error('Network error:', error.networkError)
          this.saving = false
        })
      }
    },
    
    toggleFavorite(recipeId) {
      const recipe = this.recipes.find(r => r.id === recipeId)
      if (recipe) {
        recipe.favorite = !recipe.favorite
        // Here you would typically make an API call to save favorite status
      }
    },
    
    closeDialog() {
      this.showAddDialog = false
      this.resetNewRecipe()
      this.editingRecipe = null
      if (this.$refs.recipeForm) {
        this.$refs.recipeForm.resetValidation()
      }
    },
    
    resetNewRecipe() {
      this.newRecipe = {
        title: '',
        description: '',
        price: '',
        image_url: ''
      }
    }
  },
  mounted() {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
    }
  }
}
</script>

<style scoped>
/* Modern Dashboard Styling */
.dashboard-container {
  background: #f8fafc;
  min-height: 100vh;
}

/* Header */
.modern-header {
  border-bottom: 1px solid #e2e8f0 !important;
}

.logo-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.app-subtitle {
  font-size: 0.875rem;
  opacity: 0.7;
}

.search-field {
  border-radius: 50px !important;
}

.add-btn {
  text-transform: none;
  font-weight: 600;
  padding: 8px 20px;
}

/* Welcome Card */
.welcome-container {
  padding-top: 24px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
}

.opacity-70 {
  opacity: 0.7;
}

.opacity-20 {
  opacity: 0.2;
}

/* Stats Cards */
.stats-container {
  padding-top: 0;
  padding-bottom: 24px;
}

.stat-card {
  transition: transform 0.3s ease;
  border-radius: 16px;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
}

/* Recipe Cards */
.recipes-container {
  padding-top: 0;
}

.recipe-card {
  border-radius: 16px !important;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.recipe-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
  border-color: #667eea;
}

.image-container {
  position: relative;
  overflow: hidden;
}

.recipe-image {
  transition: transform 0.5s ease;
}

.recipe-card:hover .recipe-image {
  transform: scale(1.05);
}

.favorite-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.recipe-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 48px;
}

.price-tag {
  display: flex;
  align-items: center;
}

.action-btn {
  text-transform: none;
  font-weight: 500;
  border-radius: 8px;
}

.delete-btn:hover {
  background: #fee2e2;
}

/* List View */
.list-view {
  background: transparent;
}

.list-image {
  border-radius: 12px 0 0 12px;
}

/* Empty State */
.empty-state {
  background: #f8fafc;
  border: 2px dashed #cbd5e0;
}

/* FAB Button */
.v-btn--fab.v-btn--fixed {
  z-index: 1000;
}

/* Responsive */
@media (max-width: 960px) {
  .search-field {
    max-width: 300px !important;
  }
}

@media (max-width: 600px) {
  .modern-header {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
  
  .app-title, .app-subtitle {
    display: none;
  }
  
  .search-field {
    max-width: 200px !important;
    margin-left: 8px !important;
  }
  
  .add-btn span {
    display: none;
  }
  
  .add-btn .v-icon {
    margin: 0 !important;
  }
  
  .welcome-card .v-icon {
    display: none;
  }
}
</style>