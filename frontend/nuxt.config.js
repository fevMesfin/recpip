// import colors from 'vuetify/es5/util/colors'

// export default {
  
//   ssr: false, 
//   target: 'static', 
  
//   head: {
//     titleTemplate: '%s - ' + process.env.npm_package_name,
//     title: process.env.npm_package_name || '',
//     meta: [
//       { charset: 'utf-8' },
//       { name: 'viewport', content: 'width=device-width, initial-scale=1' },
//       { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
//     ],
//     link: [
//       { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      
//       { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css' }
//     ]
//   },
  
  
//   loading: { color: '#fff' },
  
//   /*
//   ** Global CSS
//   */
//   css: [
//   ],
  
//   /*
//   ** Plugins to load before mounting the App
//   */
//   plugins: [
//     '~/plugins/apollo.js'  // ✅ Correct!
//   ],
  
//   /*
//   ** Nuxt.js dev-modules
//   */
//   buildModules: [
//     '@nuxtjs/vuetify',
//   ],
  
//   /*
//   ** Nuxt.js modules
//   */
//   modules: [
//     '@nuxtjs/axios',
//   ],
  
//   /*
//   ** Axios module configuration
//   */
//   axios: {
//     baseURL: process.env.BASE_URL || 'http://localhost:3000'
//   },
  
//   /*
//   ** vuetify module configuration
//   */
//   vuetify: {
//     customVariables: ['~/assets/variables.scss'],
//     theme: {
//       dark: true,
//       themes: {
//         dark: {
//           primary: colors.blue.darken2,
//           accent: colors.grey.darken3,
//           secondary: colors.amber.darken3,
//           info: colors.teal.lighten1,
//           warning: colors.amber.base,
//           error: colors.deepOrange.accent4,
//           success: colors.green.accent3
//         }
//       }
//     },
//     icons: {
//       iconfont: 'mdi', // Use Material Design Icons
//     }
//   },
  
//   /*
//   ** Environment variables
//   */
//   env: {
//     hasuraUrl: process.env.HASURA_URL || 'http://localhost:8080/v1/graphql',
//     hasuraSecret: process.env.HASURA_SECRET || 'myadminsecretkey'
//   },
  
//   /*
//   ** Build configuration
//   */
//   build: {
//     // Transpile Apollo packages
//     transpile: [
//       'vue-apollo',
//       'apollo-boost',
//       'apollo-cache-inmemory',
//       'apollo-link-http',
//       'graphql-tag'
//     ],
    
//     extend (config, ctx) {
//       // Add any webpack extensions here
//     }
//   }
// }

//22

// 

import colors from 'vuetify/es5/util/colors'

export default {
  ssr: false,
  target: 'static',
    server: {
    port: 3000, // Fixed port
    host: '0.0.0.0'
  },

  head: {
    titleTemplate: '%s - Recipl',
    title: 'Recipl - Recipe Dashboard',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'Your personal recipe dashboard'
      }
    ]
  },

  loading: { color: '#FF6B6B' },

  css: [
    '@mdi/font/css/materialdesignicons.css'
  ],

  plugins: [
    '~/plugins/apollo.js'
  ],

  buildModules: [
    '@nuxtjs/vuetify'
  ],

  modules: [
    '@nuxtjs/axios'
  ],

  axios: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000'
  },

  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#FF6B6B',
          secondary: '#4ECDC4',
          accent: '#FFE66D',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          background: '#f8f9fa'
        },
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    },
    icons: {
      iconfont: 'mdi'
    }
  },

  env: {
    hasuraUrl: process.env.HASURA_URL || 'http://localhost:8030/v1/graphql',
    hasuraSecret: process.env.HASURA_SECRET || process.env.HASURA_GRAPHQL_ADMIN_SECRET || 'orbithealth'
  },

  build: {
    transpile: [
      'vue-apollo',
      'apollo-boost',
      'apollo-cache-inmemory',
      'apollo-link-http',
      'apollo-link',           

      'graphql-tag'
    ],
    extend (config, ctx) {}
  }
}
