<template>
  <div class="max-w-2xl mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-2xl mb-4">Get Queue Number</h2>
    <div class="mb-4">
      <label class="block mb-1">Select Doctor</label>
      <select v-model="doctorId" class="w-full border p-2 rounded" @change="getSchedule">
        <option value="">Select a doctor</option>
        <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
          {{ doctor.name }} ({{ doctor.specialty }})
        </option>
      </select>
    </div>
    <div v-if="schedule" class="mb-4">
      <p><strong>Schedule:</strong> {{ schedule }}</p>
      <button @click="getQueue" class="bg-blue-600 text-white px-4 py-2 rounded">Get Queue</button>
    </div>
    <div v-if="queue">
      <p><strong>Your Queue Number:</strong> {{ queue.queue_number }}</p>
      <p><strong>Estimated Time:</strong> {{ queue.estimated_time }}</p>
      <p><strong>Notification Sent to:</strong> {{ queue.phone }}</p>
      <router-link :to="`/payment/${queue.id}`" class="bg-green-600 text-white px-4 py-2 rounded inline-block mt-4">
        Proceed to Payment
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      doctors: [],
      doctorId: '',
      schedule: '',
      queue: null,
    };
  },
  async created() {
    const response = await axios.get('/doctors');
    this.doctors = response.data;
  },
  methods: {
    async getSchedule() {
      if (this.doctorId) {
        const response = await axios.get(`/doctors/${this.doctorId}/schedule`);
        this.schedule = response.data.schedule;
      }
    },
    async getQueue() {
      try {
        const response = await axios.post('/queues', { doctor_id: this.doctorId });
        this.queue = response.data;
      } catch (error) {
        alert('Failed to get queue');
      }
    },
  },
};
</script>