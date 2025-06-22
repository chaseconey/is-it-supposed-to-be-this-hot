import axios from "axios";
import { getFromCache, saveToCache, createCacheKey } from "./storageService.js";
import { geocodeCity } from "./geocodingService.js";

// Open-Meteo API base URL
const BASE_URL = "https://historical-forecast-api.open-meteo.com/v1/forecast";

// Default coordinates for fallback (Austin, TX - 78633)
const DEFAULT_LATITUDE = 30.69;
const DEFAULT_LONGITUDE = -97.71;
const DEFAULT_CITY = "Austin, TX";

/**
 * Helper function to fetch weather data for a specific date range
 * @param {Date} startDate - The start date for the data
 * @param {Date} endDate - The end date for the data
 * @param {number} latitude - The latitude coordinate
 * @param {number} longitude - The longitude coordinate
 * @param {string} cityName - The city name for caching purposes
 * @returns {Promise<Object>} - The API response data
 */
async function fetchHistoricalData(
  startDate,
  endDate,
  latitude,
  longitude,
  cityName
) {
  // Format dates in YYYY-MM-DD format
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
      // 'en-CA' locale forces YYYY-MM-DD
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  // Check cache first
  const cacheKey = createCacheKey(startDate, endDate, cityName);
  const cachedData = getFromCache(cacheKey);

  if (cachedData) {
    console.log(
      `Using cached data for ${cityName}: ${formatDate(
        startDate
      )} to ${formatDate(endDate)}`
    );
    return cachedData;
  }

  // If not in cache, fetch from API
  const response = await axios.get(BASE_URL, {
    params: {
      latitude: latitude,
      longitude: longitude,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      hourly: "temperature_2m",
      daily: "rain_sum",
      temperature_unit: "fahrenheit",
      precipitation_unit: "inch",
      timezone: "America/Chicago",
    },
  });

  // Save to cache before returning
  saveToCache(cacheKey, response.data);
  return response.data;
}

/**
 * Fetches weather data for a specific city
 * @param {string|Object} cityNameOrCoords - The city name to get weather data for, or coordinates object {lat, lng, displayName}
 * @returns {Promise<Object>} - The processed weather data
 */
export async function fetchWeatherData(cityNameOrCoords) {
  try {
    // Get coordinates for the city
    let coordinates;
    let displayName;

    // Check if we received coordinates directly
    if (
      cityNameOrCoords &&
      typeof cityNameOrCoords === "object" &&
      cityNameOrCoords.lat &&
      cityNameOrCoords.lng
    ) {
      coordinates = { lat: cityNameOrCoords.lat, lng: cityNameOrCoords.lng };
      displayName =
        cityNameOrCoords.displayName ||
        cityNameOrCoords.formattedName ||
        "Unknown Location";
      console.log(`Using provided coordinates for ${displayName}`);
    } else if (
      !cityNameOrCoords ||
      (typeof cityNameOrCoords === "string" && cityNameOrCoords.trim() === "")
    ) {
      // Use default coordinates if no city provided
      coordinates = { lat: DEFAULT_LATITUDE, lng: DEFAULT_LONGITUDE };
      displayName = DEFAULT_CITY;
      console.log(`No city provided, using default: ${DEFAULT_CITY}`);
    } else {
      console.log("Falling back to geocoding for city name:", cityNameOrCoords);
      // Geocode the city name
      const geocodeResult = await geocodeCity(cityNameOrCoords);
      coordinates = { lat: geocodeResult.lat, lng: geocodeResult.lng };
      displayName = geocodeResult.formattedName;
    }

    // Calculate date ranges for the last 30 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // End yesterday instead of today
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);

    // For last year's data (same 30-day period, but from last year)
    const lastYearStart = new Date(startDate);
    lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
    const lastYearEnd = new Date(endDate);
    lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1);

    // For 5 years ago data (same 30-day period, but from 5 years ago)
    const fiveYearsStart = new Date(startDate);
    fiveYearsStart.setFullYear(fiveYearsStart.getFullYear() - 5);
    const fiveYearsEnd = new Date(endDate);
    fiveYearsEnd.setFullYear(fiveYearsEnd.getFullYear() - 5);

    // Fetch data for all three time periods using the helper function
    const [currentData, lastYearData, fiveYearsData] = await Promise.all([
      fetchHistoricalData(
        startDate,
        endDate,
        coordinates.lat,
        coordinates.lng,
        displayName
      ),
      fetchHistoricalData(
        lastYearStart,
        lastYearEnd,
        coordinates.lat,
        coordinates.lng,
        displayName
      ),
      fetchHistoricalData(
        fiveYearsStart,
        fiveYearsEnd,
        coordinates.lat,
        coordinates.lng,
        displayName
      ),
    ]);

    // Process the data from all API calls
    return processWeatherData(
      displayName,
      currentData,
      lastYearData,
      fiveYearsData
    );
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("enter a valid city")
    ) {
      throw error; // Re-throw geocoding errors as-is
    }
    throw new Error("Failed to fetch weather data. Please try again later.");
  }
}

/**
 * Processes the raw weather data from the API
 * @param {string} zipCode - The zip code for display purposes
 * @param {Object} currentData - Current forecast data
 * @param {Object} lastYearData - Last year's forecast data
 * @param {Object} fiveYearsData - Five years ago forecast data
 * @returns {Object} - The processed weather data
 */
function processWeatherData(zipCode, currentData, lastYearData, fiveYearsData) {
  // Time labels based on the hourly timestamps from the API
  const timeLabels = currentData.hourly.time.map((timestamp) => {
    const date = new Date(timestamp);

    // Format date with month, day, and time
    // For May 16, 2025 at 14:00, this will give "May 16, 02:00 PM"
    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) +
      ", " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  });

  // Process current temperatures - use the actual data from the API
  const currentTemps = currentData.hourly.temperature_2m;

  // Process last year's temperatures - only use the actual data
  const lastYearTemps = lastYearData.hourly.temperature_2m.slice(
    0,
    currentTemps.length
  );

  // Process five years ago temperatures - only use the actual data
  const fiveYearsTemps = fiveYearsData.hourly.temperature_2m.slice(
    0,
    currentTemps.length
  );

  // Process daily rainfall data
  const dailyLabels = currentData.daily.time.map((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  });

  // Get rainfall data for each time period
  const currentRainfall = currentData.daily.rain_sum;
  const lastYearRainfall = lastYearData.daily.rain_sum;
  const fiveYearsRainfall = fiveYearsData.daily.rain_sum;

  return {
    zipCode,
    timeLabels,
    currentTemps,
    lastYearTemps,
    fiveYearsTemps,
    dailyLabels,
    currentRainfall,
    lastYearRainfall,
    fiveYearsRainfall,
  };
}
