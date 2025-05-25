<script setup>
import { ref, computed, onMounted } from "vue";
import WeatherChart from "./components/WeatherChart.vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import { fetchWeatherData } from "./services/weatherService";

const weatherData = ref(null);
const isLoading = ref(false);
const error = ref(null);

const hasData = computed(() => weatherData.value !== null);

// Add computed properties to format the date ranges
const dateRanges = computed(() => {
  if (!weatherData.value) return null;

  // Get first and last dates from timeLabels (which uses the hourly timestamps)
  const firstTimeLabel = weatherData.value.timeLabels[0];
  const lastTimeLabel =
    weatherData.value.timeLabels[weatherData.value.timeLabels.length - 1];

  // Extract date portions from timeLabels
  const startDate = firstTimeLabel.split(",")[0];
  const endDate = lastTimeLabel.split(",")[0];

  return {
    current: `${startDate} - ${endDate}, ${new Date().getFullYear()}`,
  };
});

async function loadWeatherData() {
  isLoading.value = true;
  error.value = null;

  try {
    weatherData.value = await fetchWeatherData();
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
      <!-- Header with logo -->
      <div class="text-center mb-8">
        <img 
          src="/logo-small.svg" 
          alt="App Logo" 
          class="w-12 h-12 mx-auto mb-4 opacity-80 hover:opacity-100 transition-opacity"
        >
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">
          Weather Patterns Visualization
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          Is it supposed to be this hot? Let's find out with historical data.
        </p>
      </div>

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

        <div v-else-if="hasData">
          <!-- Add date range information -->
          <div
            class="mb-6 text-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-md p-3"
          >
            <p>
              <span class="font-medium">For Period:</span>
              {{ dateRanges.current }}
            </p>
          </div>

          <WeatherChart :weatherData="weatherData" />
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Loading weather data...</p>
        </div>
      </div>

      <footer class="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 space-y-2">
        <p>
          Weather data provided by 
          <a 
            href="https://open-meteo.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Open-Meteo
          </a>
        </p>
        <p class="text-xs">
          Historical weather data for Austin, TX (78633) • 
          <a 
            href="https://github.com/chaseconey/is-it-supposed-to-be-this-hot" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:underline"
          >
            View on GitHub
          </a>
        </p>
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
