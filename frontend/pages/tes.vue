<!-- pages/test.vue - UPDATED FIXED VERSION -->
<template>
  <v-container>
    <h1 class="mb-4">🎉 Apollo Connection Test</h1>
    
    <!-- Status Alert -->
    <v-alert :type="alertType" class="mb-4">
      <v-icon left>{{ alertIcon }}</v-icon>
      {{ message }}
    </v-alert>
    
    <!-- Action Buttons -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-btn color="primary" block @click="checkApollo" class="mb-2">
          <v-icon left>mdi-magnify</v-icon>
          Check Apollo
        </v-btn>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-btn color="secondary" block @click="testQuery" :disabled="loading">
          <v-icon left>mdi-connection</v-icon>
          Test Hasura
        </v-btn>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-btn color="success" block @click="listTables" :disabled="loading">
          <v-icon left>mdi-database</v-icon>
          List Tables
        </v-btn>
      </v-col>
    </v-row>
    
    <!-- NEW: Direct Table Query Buttons -->
    <v-row v-if="tables.length > 0" class="mb-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left color="primary">mdi-table</v-icon>
            Query Your Tables Directly
          </v-card-title>
          <v-card-text>
            <v-chip-group>
              <v-chip 
                v-for="table in tables" 
                :key="table.name"
                color="primary" 
                @click="queryTable(table.name)"
                :loading="table.loading"
              >
                <v-icon left small>mdi-table</v-icon>
                {{ table.name }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Results Display -->
    <v-card v-if="result" class="mt-4">
      <v-card-title class="headline" :class="result.success ? 'success--text' : 'error--text'">
        <v-icon left :color="result.success ? 'success' : 'error'">
          {{ result.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        {{ result.title }}
      </v-card-title>
      
      <v-card-subtitle v-if="result.subtitle">
        {{ result.subtitle }}
      </v-card-subtitle>
      
      <v-card-text>
        <!-- Display Table Data if Available -->
        <div v-if="result.data && result.data.length > 0">
          <h3 class="mb-3">Data from {{ result.tableName }} ({{ result.data.length }} records)</h3>
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th v-for="key in Object.keys(result.data[0])" :key="key" class="text-left">
                    {{ key }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in result.data" :key="index">
                  <td v-for="(value, key) in row" :key="key">
                    {{ value }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
        
        <!-- Display Table List if Available -->
        <div v-else-if="result.tables && result.tables.length > 0">
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">#</th>
                  <th class="text-left">Table Name</th>
                  <th class="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(table, index) in result.tables" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <v-chip small color="primary" class="mr-2">
                      {{ table.name }}
                    </v-chip>
                  </td>
                  <td>
                    <v-btn x-small @click="queryTable(table.name)" color="primary">
                      Query
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
        
        <!-- Raw JSON Viewer -->
        <v-expansion-panels class="mt-4" v-if="result.raw">
          <v-expansion-panel>
            <v-expansion-panel-header>
              <v-icon left>mdi-code-json</v-icon>
              View Raw Response
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <pre class="json-viewer">{{ formattedResult }}</pre>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
      
      <v-card-actions v-if="result.tableName && result.data && result.data.length > 0">
        <v-spacer></v-spacer>
        <v-btn color="info" @click="loadMoreData" :disabled="loading">
          <v-icon left>mdi-database-plus</v-icon>
          Load More
        </v-btn>
      </v-card-actions>
    </v-card>
    
    <!-- Connection Info -->
    <v-card class="mt-4">
      <v-card-title class="subtitle-1">
        <v-icon left>mdi-information</v-icon>
        Connection Information
      </v-card-title>
      <v-card-text>
        <v-list dense>
          <v-list-item>
            <v-list-item-icon>
              <v-icon small>mdi-link</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Hasura Endpoint</v-list-item-title>
              <v-list-item-subtitle>http://localhost:8080/v1/graphql</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          
          <v-list-item>
            <v-list-item-icon>
              <v-icon small :color="connectionStatusColor">{{ connectionStatusIcon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Status</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip x-small :color="connectionStatusColor" dark>
                  {{ connectionStatus }}
                </v-chip>
                <span class="ml-2">{{ tables.length }} tables found</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          
          <v-list-item>
            <v-list-item-icon>
              <v-icon small>mdi-clock</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Last Tested</v-list-item-title>
              <v-list-item-subtitle>{{ lastTested }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'

export default {
  data() {
    return {
      message: 'Click "Check Apollo" to verify your connection',
      loading: false,
      result: null,
      lastTested: 'Never',
      tables: [],
      currentTable: null,
      currentPage: 0,
      pageSize: 10
    }
  },
  
  computed: {
    alertType() {
      if (this.message.includes('✅') || this.message.includes('Success')) return 'success'
      if (this.message.includes('❌') || this.message.includes('Failed')) return 'error'
      if (this.message.includes('⚠️') || this.message.includes('Warning')) return 'warning'
      return 'info'
    },
    
    alertIcon() {
      switch(this.alertType) {
        case 'success': return 'mdi-check-circle'
        case 'error': return 'mdi-alert-circle'
        case 'warning': return 'mdi-alert'
        default: return 'mdi-information'
      }
    },
    
    formattedResult() {
      return JSON.stringify(this.result?.raw || this.result, null, 2)
    },
    
    connectionStatus() {
      return this.result?.success ? 'Connected' : 'Not Tested'
    },
    
    connectionStatusColor() {
      return this.result?.success ? 'success' : 'warning'
    },
    
    connectionStatusIcon() {
      return this.result?.success ? 'mdi-check' : 'mdi-alert'
    }
  },
  
  methods: {
    async checkApollo() {
      console.log('=== APOLLO DEBUG ===')
      console.log('this.$apollo:', this.$apollo)
      
      if (this.$apollo) {
        this.message = '✅ Apollo is properly configured! Ready to query Hasura.'
        this.result = {
          success: true,
          title: 'Apollo is Ready',
          subtitle: 'GraphQL client is properly configured'
        }
      } else {
        this.message = '⚠️ Apollo instance not found'
        this.result = {
          success: false,
          title: 'Apollo Not Found',
          subtitle: 'Check if Apollo plugin is properly configured'
        }
      }
      
      this.updateLastTested()
    },
    
    async testQuery() {
      this.loading = true
      this.result = null
      
      try {
        // Simple connection test
        const response = await this.$apollo.query({
          query: gql`{ __typename }`
        })
        
        this.message = '✅ Hasura connection successful! Server is responding.'
        this.result = {
          success: true,
          title: 'Hasura Connection Successful',
          subtitle: 'GraphQL endpoint is responding',
          raw: response.data
        }
        
        // Also fetch tables
        await this.fetchTables()
        
      } catch (error) {
        this.message = `❌ Connection failed: ${error.message}`
        this.result = {
          success: false,
          title: 'Connection Failed',
          subtitle: error.message,
          raw: { error: error.message }
        }
        console.error('Error details:', error)
      } finally {
        this.loading = false
        this.updateLastTested()
      }
    },
    
    async fetchTables() {
      try {
        // Get ALL types from schema, not just queryType fields
        const response = await this.$apollo.query({
          query: gql`
            query GetSchemaTypes {
              __schema {
                types {
                  name
                  kind
                  fields {
                    name
                  }
                }
              }
            }
          `
        })
        
        // Filter to find actual tables (OBJECT type and not starting with __)
        const allTypes = response.data.__schema.types || []
        const tableTypes = allTypes.filter(type => 
          type.kind === 'OBJECT' && 
          !type.name.startsWith('__') && 
          !type.name.includes('_aggregate') &&
          !type.name.includes('_mutation') &&
          type.name !== 'query_root' &&
          type.name !== 'mutation_root' &&
          type.name !== 'subscription_root'
        )
        
        this.tables = tableTypes.map(type => ({
          name: type.name,
          loading: false
        }))
        
        console.log('Found tables:', this.tables)
        
        if (this.result?.success) {
          this.result.tables = this.tables
        }
        
      } catch (error) {
        console.error('Error fetching tables:', error)
      }
    },
    
    async listTables() {
      this.loading = true
      this.result = null
      
      try {
        await this.fetchTables()
        
        this.message = `✅ Found ${this.tables.length} tables in Hasura.`
        this.result = {
          success: true,
          title: 'Tables Found',
          subtitle: `Found ${this.tables.length} tables in your database`,
          tables: this.tables,
          raw: { tables: this.tables }
        }
        
      } catch (error) {
        this.message = `❌ Failed to retrieve tables: ${error.message}`
        this.result = {
          success: false,
          title: 'Failed to Get Tables',
          subtitle: error.message
        }
        console.error('Schema error:', error)
      } finally {
        this.loading = false
        this.updateLastTested()
      }
    },
    
    async queryTable(tableName) {
      this.loading = true
      this.currentTable = tableName
      this.currentPage = 0
      
      try {
        // Try to get all columns dynamically
        const response = await this.$apollo.query({
          query: gql`
            query Get${tableName} {
              ${tableName}(limit: ${this.pageSize}, offset: ${this.currentPage * this.pageSize}) {
                id
                name
                title
                description
                email
                created_at
                updated_at
                user_id
                # Add other common fields
              }
            }
          `
        })
        
        const data = response.data[tableName] || []
        
        this.message = `✅ Successfully queried "${tableName}" (${data.length} records)`
        this.result = {
          success: true,
          title: `Data from ${tableName}`,
          subtitle: `Found ${data.length} records`,
          tableName: tableName,
          data: data,
          raw: response.data
        }
        
        // Update table loading state
        const tableIndex = this.tables.findIndex(t => t.name === tableName)
        if (tableIndex !== -1) {
          this.$set(this.tables[tableIndex], 'loading', false)
        }
        
      } catch (error) {
        this.message = `❌ Failed to query "${tableName}": ${error.message}`
        this.result = {
          success: false,
          title: `Query Failed for ${tableName}`,
          subtitle: error.message
        }
        console.error(`Error querying ${tableName}:`, error)
      } finally {
        this.loading = false
        this.updateLastTested()
      }
    },
    
    async loadMoreData() {
      if (!this.currentTable) return
      
      this.currentPage++
      this.loading = true
      
      try {
        const response = await this.$apollo.query({
          query: gql`
            query GetMore${this.currentTable} {
              ${this.currentTable}(limit: ${this.pageSize}, offset: ${this.currentPage * this.pageSize}) {
                id
                name
                title
                description
                email
                created_at
              }
            }
          `
        })
        
        const newData = response.data[this.currentTable] || []
        const allData = [...this.result.data, ...newData]
        
        this.result.data = allData
        this.result.subtitle = `Found ${allData.length} records`
        
        this.message = `✅ Loaded more data from "${this.currentTable}" (${allData.length} total records)`
        
      } catch (error) {
        this.message = `❌ Failed to load more data: ${error.message}`
        this.currentPage-- // Rollback on error
      } finally {
        this.loading = false
      }
    },
    
    updateLastTested() {
      this.lastTested = new Date().toLocaleTimeString()
    }
  },
  
  mounted() {
    console.log('🚀 Apollo Connection Test Page Loaded')
    this.checkApollo()
    
    // Auto-test connection after 2 seconds
    setTimeout(() => {
      this.testQuery()
    }, 2000)
  }
}
</script>

<style scoped>
.json-viewer {
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  overflow: auto;
  max-height: 400px;
}

.v-card {
  border-radius: 8px;
}

.v-btn {
  text-transform: none;
}

.v-chip {
  cursor: pointer;
}
</style>