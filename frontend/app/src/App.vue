<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-blue-600 p-4 text-white">
      <div class="container mx-auto flex justify-between">
        <h1 class="text-lg font-bold">Hospital Queue App</h1>
        <div v-if="isAuthenticated">
          <span>Welcome, {{ user.name }}</span>
          <button @click="logout" class="ml-4 bg-red-500 px-4 py-2 rounded">Logout</button>
        </div>
      </div>
    </nav>
    <div class="container mx-auto p-4">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState(['isAuthenticated', 'user']),
  },
  methods: {
    ...mapActions(['logout']),
  },
};
</script>