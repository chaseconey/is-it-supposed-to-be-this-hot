import axios from "axios";
import { getFromCache, saveToCache, createCacheKey } from "./storageService.js";

// Open-Meteo API base URL
const BASE_URL = "https://historical-forecast-api.open-meteo.com/v1/forecast";

// Hard-coded coordinates for 78633
const DEFAULT_LATITUDE = 30.7;
const DEFAULT_LONGITUDE = -97.7;

/**
 * Helper function to fetch weather data for a specific date range
 * @param {Date} startDate - The start date for the data
 * @param {Date} endDate - The end date for the data
 * @returns {Promise<Object>} - The API response data
 */
async function fetchHistoricalData(startDate, endDate) {
  // Format dates in YYYY-MM-DD format
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Check cache first
  const cacheKey = createCacheKey(startDate, endDate);
  const cachedData = getFromCache(cacheKey);

  if (cachedData) {
    console.log(
      `Using cached data for ${formatDate(startDate)} to ${formatDate(endDate)}`
    );
    return cachedData;
  }

  // If not in cache, fetch from API
  const response = await axios.get(BASE_URL, {
    params: {
      latitude: DEFAULT_LATITUDE,
      longitude: DEFAULT_LONGITUDE,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      hourly: "temperature_2m",
      temperature_unit: "fahrenheit",
    },
  });

  // Save to cache before returning
  saveToCache(cacheKey, response.data);
  return response.data;
}

/**
 * Fetches weather data using hard-coded coordinates
 * @param {string} zipCode - The zip code for display purposes only
 * @returns {Promise<Object>} - The processed weather data
 */
export async function fetchWeatherData(zipCode) {
  try {
    // Get current date (May 16, 2025)
    const currentDate = new Date();

    // Calculate date ranges for the last 7 days
    const endDate = new Date(currentDate);
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 7); // Last 7 days

    // For last year's data (same 7-day period, but from last year)
    const lastYearStart = new Date(startDate);
    lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
    const lastYearEnd = new Date(endDate);
    lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1);

    // For 5 years ago data (same 7-day period, but from 5 years ago)
    const fiveYearsStart = new Date(startDate);
    fiveYearsStart.setFullYear(fiveYearsStart.getFullYear() - 5);
    const fiveYearsEnd = new Date(endDate);
    fiveYearsEnd.setFullYear(fiveYearsEnd.getFullYear() - 5);

    // Fetch data for all three time periods using the helper function
    const [currentData, lastYearData, fiveYearsData] = await Promise.all([
      fetchHistoricalData(startDate, endDate),
      fetchHistoricalData(lastYearStart, lastYearEnd),
      fetchHistoricalData(fiveYearsStart, fiveYearsEnd),
    ]);

    // Process the data from all API calls
    return processWeatherData(
      zipCode,
      currentData,
      lastYearData,
      fiveYearsData
    );
  } catch (error) {
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

  return {
    zipCode,
    timeLabels,
    currentTemps,
    lastYearTemps,
    fiveYearsTemps,
  };
}
