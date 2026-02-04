import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
// Remove this: import { from } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import gql from 'graphql-tag'

console.log('🚀 Apollo plugin starting...')

Vue.use(VueApollo)

export default function (context, inject) {
  console.log('💉 Injecting Apollo into Nuxt app...')

  const uri = context.env.hasuraUrl || process.env.HASURA_URL || 'http://localhost:8030/v1/graphql'
  const secret = context.env.hasuraSecret || process.env.HASURA_GRAPHQL_ADMIN_SECRET || 'orbithealth'

  const httpLink = new HttpLink({ uri })

  const authLink = setContext((_, { headers }) => {
    let token = null
    try {
      token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null
    } catch (e) {
      token = null
    }

    const authHeaders = {
      'Content-Type': 'application/json'
    }

    if (token) {
      authHeaders['Authorization'] = `Bearer ${token}`
    } else if (secret) {
      authHeaders['x-hasura-admin-secret'] = secret
    }

    // DEV-FRIENDLY: always include admin secret when available so mutations
    // work during local development even when the client sends a JWT.
    // Remove this in production for security.
    if (secret) {
      authHeaders['x-hasura-admin-secret'] = secret
    }

    return {
      headers: {
        ...headers,
        ...authHeaders
      }
    }
  })

  const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink), // Changed: removed from()
    cache: new InMemoryCache(),
    connectToDevTools: true
  })

  const apolloProvider = new VueApollo({
    defaultClient: apolloClient
  })

  context.app.apolloProvider = apolloProvider
  inject('apollo', apolloProvider)
  //inject('apolloProvider', apolloProvider)
  // Vue.prototype.$apolloProvider = apolloProvider
  // Vue.prototype.$apolloClient = apolloClient

  console.log('✅ Apollo injected')

  // Test connection
  setTimeout(async () => {
    try {
      console.log('🔍 Testing Hasura connection...', uri)
      const result = await apolloClient.query({
        query: gql`{ __typename }`
      })
      console.log('🎉 Hasura connection SUCCESS!', result.data)
    } catch (error) {
      // Print full error for debugging
      console.error('💥 Hasura connection FAILED:', error && (error.message || error.toString()))
      if (error && error.networkError) console.error('Network error details:', error.networkError)
      if (error && error.graphQLErrors) console.error('GraphQL errors:', error.graphQLErrors)
    }
  }, 1000)
}