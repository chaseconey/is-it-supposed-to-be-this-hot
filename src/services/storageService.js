/**
 * Storage service to handle caching data in localStorage
 */

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

/**
 * Gets a value from localStorage cache
 * @param {string} key - The cache key
 * @returns {Object|null} - The cached data or null if not found/expired
 */
export function getFromCache(key) {
  try {
    const cacheItem = localStorage.getItem(key);
    if (!cacheItem) return null;

    const { timestamp, data } = JSON.parse(cacheItem);
    const now = new Date().getTime();

    // Check if the cache has expired (30 minutes)
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key); // Remove expired item
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Error reading from cache:", error);
    return null;
  }
}

/**
 * Saves a value to localStorage cache
 * @param {string} key - The cache key
 * @param {Object} data - The data to cache
 */
export function saveToCache(key, data) {
  try {
    const cacheItem = {
      timestamp: new Date().getTime(),
      data,
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn("Error saving to cache:", error);
  }
}

/**
 * Creates a cache key for the historical data request
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @param {string} cityName - The city name for location-specific caching
 * @returns {string} - The cache key
 */
export function createCacheKey(startDate, endDate, cityName) {
  const formatDate = (date) => date.toISOString().split("T")[0];
  const normalizedCity = cityName.toLowerCase().replace(/\s+/g, "_");
  return `weather_data_${normalizedCity}_${formatDate(startDate)}_${formatDate(
    endDate
  )}`;
}
