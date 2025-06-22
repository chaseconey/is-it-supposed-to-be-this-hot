<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import WeatherChart from "./components/WeatherChart.vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import { fetchWeatherData } from "./services/weatherService";
import { searchCities } from "./services/geocodingService";

const weatherData = ref(null);
const isLoading = ref(false);
const error = ref(null);
const cityName = ref("");
const currentCity = ref("Austin, TX"); // Display the current city being shown
const suggestions = ref([]);
const showSuggestions = ref(false);
const searchTimeout = ref(null);
const shouldSearch = ref(true); // Flag to control when to search

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

async function loadWeatherData(city = "") {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await fetchWeatherData(city);
    weatherData.value = result;
    currentCity.value = result.zipCode; // The service now returns the formatted city name in zipCode field
  } catch (err) {
    error.value = err.message || "Failed to fetch weather data";
    weatherData.value = null;
  } finally {
    isLoading.value = false;
  }
}

function handleCitySearch() {
  if (cityName.value.trim()) {
    loadWeatherData(cityName.value.trim());
  }
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    handleCitySearch();
  } else if (event.key === "Escape") {
    hideSuggestions();
  } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    // Handle arrow key navigation if needed
  }
}

async function searchForCities() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  // Don't search if we're programmatically setting the city name
  if (!shouldSearch.value) {
    return;
  }

  if (cityName.value.trim().length < 2) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  searchTimeout.value = setTimeout(async () => {
    try {
      const results = await searchCities(cityName.value);
      suggestions.value = results;
      showSuggestions.value = results.length > 0;
    } catch (error) {
      console.warn("Error fetching city suggestions:", error);
      suggestions.value = [];
      showSuggestions.value = false;
    }
  }, 300); // Debounce for 300ms
}

function selectCity(suggestion) {
  shouldSearch.value = false; // Prevent search when setting city name programmatically
  cityName.value = suggestion.formattedName;
  hideSuggestions();
  // Use coordinates directly instead of re-geocoding
  loadWeatherDataWithCoords({
    lat: suggestion.lat,
    lng: suggestion.lng,
    displayName: suggestion.formattedName,
  });

  // Re-enable search after a short delay
  setTimeout(() => {
    shouldSearch.value = true;
  }, 100);
}

async function loadWeatherDataWithCoords(coords) {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await fetchWeatherData(coords);
    weatherData.value = result;
    currentCity.value = result.zipCode; // The service now returns the formatted city name in zipCode field
  } catch (err) {
    error.value = err.message || "Failed to fetch weather data";
    weatherData.value = null;
  } finally {
    isLoading.value = false;
  }
}

function hideSuggestions() {
  showSuggestions.value = false;
}

function handleInputBlur() {
  // Delay hiding suggestions to allow click events on suggestions to register
  setTimeout(hideSuggestions, 200);
}

function handleInputFocus() {
  shouldSearch.value = true; // Ensure search is enabled when user focuses input
  if (suggestions.value.length > 0 && cityName.value.trim().length >= 2) {
    showSuggestions.value = true;
  }
}

function handleInput() {
  shouldSearch.value = true; // Ensure search is enabled when user types
}

// Watch for changes in cityName to trigger search
watch(cityName, () => {
  searchForCities();
});

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
        />
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">
          Weather Patterns Visualization
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          Is it supposed to be this hot? Let's find out with historical data.
        </p>
      </div>

      <!-- City Search Input -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div class="max-w-md mx-auto relative">
          <label
            for="city-input"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Enter a city name to view weather data:
          </label>
          <div class="flex gap-2">
            <div class="flex-1 relative">
              <input
                id="city-input"
                v-model="cityName"
                @input="handleInput"
                @keypress="handleKeyPress"
                @focus="handleInputFocus"
                @blur="handleInputBlur"
                type="text"
                placeholder="e.g., New York, Houston, London"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                :disabled="isLoading"
                autocomplete="off"
              />

              <!-- Autocomplete Dropdown -->
              <div
                v-if="showSuggestions && suggestions.length > 0"
                class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                <div
                  v-for="suggestion in suggestions"
                  :key="suggestion.id"
                  @click="selectCity(suggestion)"
                  class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                >
                  <div
                    class="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ suggestion.name }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ suggestion.admin1 ? suggestion.admin1 + ", " : ""
                    }}{{ suggestion.country }}
                  </div>
                </div>
              </div>
            </div>
            <button
              @click="handleCitySearch"
              :disabled="isLoading || !cityName.trim()"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Search
            </button>
          </div>
        </div>
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
          <!-- Add date range and city information -->
          <div
            class="mb-6 text-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-md p-3"
          >
            <p class="mb-1">
              <span class="font-medium">Location:</span>
              {{ currentCity }}
            </p>
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

      <footer
        class="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 space-y-2"
      >
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
          Historical weather data for cities worldwide •
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
