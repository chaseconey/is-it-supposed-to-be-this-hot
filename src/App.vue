<script setup>
import { ref, computed, onMounted } from "vue";
import WeatherChart from "./components/WeatherChart.vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import { fetchWeatherData } from "./services/weatherService";

const weatherData = ref(null);
const isLoading = ref(false);
const error = ref(null);

const hasData = computed(() => weatherData.value !== null);

// Hard-coded zip code for display purposes
const hardcodedZipCode = "78717";

async function loadWeatherData() {
  isLoading.value = true;
  error.value = null;

  try {
    weatherData.value = await fetchWeatherData(hardcodedZipCode);
  } catch (err) {
    error.value = err.message || "Failed to fetch weather data";
    weatherData.value = null;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadWeatherData();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <h1
        class="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8"
      >
        Weather Patterns Visualization
      </h1>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div v-if="isLoading" class="flex justify-center my-12">
          <LoadingSpinner />
        </div>

        <div
          v-else-if="error"
          class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 my-6"
        >
          <p class="text-red-700 dark:text-red-400">{{ error }}</p>
        </div>

        <WeatherChart v-else-if="hasData" :weatherData="weatherData" />

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Loading weather data...</p>
        </div>
      </div>

      <footer class="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        <p>Weather data powered by OpenWeatherMap API</p>
      </footer>
    </div>
  </div>
</template>

<style>
#app {
  width: 100%;
  margin: 0;
  padding: 0;
  text-align: left;
}
</style>
