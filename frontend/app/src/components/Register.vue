<template>
  <div class="max-w-md mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-2xl mb-4">Register</h2>
    <form @submit.prevent="register">
      <div class="mb-4">
        <label class="block mb-1">Name</label>
        <input v-model="name" type="text" class="w-full border p-2 rounded" required />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Email</label>
        <input v-model="email" type="email" class="w-full border p-2 rounded" required />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Password</label>
        <input v-model="password" type="password" class="w-full border p-2 rounded" required />
      </div>
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Register</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
    };
  },
  methods: {
    async register() {
      try {
        await axios.post('/auth/register', {
          name: this.name,
          email: this.email,
          password: this.password,
        });
        alert('Registration successful! Please login.');
        this.$router.push('/login');
      } catch (error) {
        alert('Registration failed');
      }
    },
  },
};
</script>