<template>
  <div class="max-w-md mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-2xl mb-4">Payment Simulation</h2>
    <p><strong>Queue ID:</strong> {{ queueId }}</p>
    <p><strong>Amount:</strong> $50 (Simulation)</p>
    <div class="mb-4">
      <label class="block mb-1">Payment Method</label>
      <select v-model="paymentMethod" class="w-full border p-2 rounded">
        <option value="credit_card">Credit Card</option>
        <option value="bank_transfer">Bank Transfer</option>
      </select>
    </div>
    <button @click="simulatePayment" class="bg-blue-600 text-white px-4 py-2 rounded">Pay Now</button>
    <p v-if="paymentStatus" class="mt-4">{{ paymentStatus }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      queueId: this.$route.params.queueId,
      paymentMethod: 'credit_card',
      paymentStatus: '',
    };
  },
  methods: {
    async simulatePayment() {
      try {
        const response = await axios.post('/payments', {
          queue_id: this.queueId,
          payment_method: this.paymentMethod,
          amount: 50,
        });
        this.paymentStatus = `Payment successful: ${response.data.transaction_id}`;
      } catch (error) {
        this.paymentStatus = 'Payment failed';
      }
    },
  },
};
</script>