<script setup>
import { ref } from "vue";

const zipCode = ref("");
const emit = defineEmits(["submit"]);

function handleSubmit() {
  console.log("Form submitted with zip code:", zipCode.value);
  if (zipCode.value.trim().length === 5 && !isNaN(zipCode.value)) {
    console.log("Emitting submit event with zip code:", zipCode.value);
    emit("submit", zipCode.value);
  }
}
</script>

<template>
  <div class="mb-6">
    <form
      @submit.prevent="handleSubmit"
      class="flex flex-col sm:flex-row gap-4"
    >
      <div class="flex-grow">
        <label
          for="zipCode"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Enter Zip Code
        </label>
        <input
          id="zipCode"
          v-model="zipCode"
          type="text"
          maxlength="5"
          placeholder="e.g. 90210"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          pattern="[0-9]{5}"
          title="Please enter a valid 5-digit zip code"
        />
      </div>
      <div class="self-end">
        <button
          type="submit"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :disabled="zipCode.trim().length !== 5 || isNaN(zipCode)"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
</template>
