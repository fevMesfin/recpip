<!-- <template>
  <div>
    <nuxt />
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout'
}
</script>

<style>
/* EMPTY - no CSS at all */
</style> -->
<!-- layouts/default.vue -->
<template>
  <!-- Use <v-app> as the Vuetify root. This ensures v-app-bar, v-dialog, v-btn and other
       components render and style correctly. The v-app element also provides the
       internal element with the data-app attribute Vuetify looks for. -->
  <v-app id="default-layout">
    <Nuxt />
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout'
}
</script>

<style>
#default-layout {
  min-height: 100vh;
}
</style>