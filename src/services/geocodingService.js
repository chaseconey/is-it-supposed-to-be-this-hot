import axios from "axios";
import { getFromCache, saveToCache } from "./storageService.js";

// Open-Meteo Geocoding API base URL
const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

/**
 * Geocodes a city name to latitude and longitude coordinates
 * @param {string} cityName - The city name to geocode
 * @returns {Promise<Object>} - Object containing lat, lng, and formatted city name
 */
export async function geocodeCity(cityName) {
  if (!cityName || typeof cityName !== "string" || cityName.trim() === "") {
    throw new Error("Please enter a valid city name.");
  }

  const trimmedCity = cityName.trim();
  const cacheKey = `geocode_${trimmedCity.toLowerCase()}`;

  // Check cache first
  const cachedCoords = getFromCache(cacheKey);
  if (cachedCoords) {
    console.log(`Using cached coordinates for ${trimmedCity}`);
    return cachedCoords;
  }

  try {
    // Fetch from geocoding API
    const response = await axios.get(GEOCODING_BASE_URL, {
      params: {
        name: trimmedCity,
        count: 1, // Only get the best match
        language: "en",
        format: "json",
      },
    });

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error(
        `City "${trimmedCity}" not found. Please check the spelling and try again.`
      );
    }

    const result = response.data.results[0];
    const coordinates = {
      lat: result.latitude,
      lng: result.longitude,
      city: result.name,
      country: result.country,
      formattedName: `${result.name}${
        result.admin1 ? ", " + result.admin1 : ""
      }${result.country ? ", " + result.country : ""}`,
    };

    // Cache the result permanently since coordinates don't change
    saveToCache(cacheKey, coordinates);
    console.log(`Geocoded ${trimmedCity} to coordinates:`, coordinates);

    return coordinates;
  } catch (error) {
    if (error.response) {
      throw new Error(
        "Geocoding service is temporarily unavailable. Please try again later."
      );
    }
    throw error;
  }
}

/**
 * Searches for cities based on partial input for autocomplete
 * @param {string} searchTerm - The partial city name to search for
 * @returns {Promise<Array>} - Array of city suggestions
 */
export async function searchCities(searchTerm) {
  if (
    !searchTerm ||
    typeof searchTerm !== "string" ||
    searchTerm.trim().length < 2
  ) {
    return [];
  }

  const trimmedSearch = searchTerm.trim();
  const cacheKey = `city_search_${trimmedSearch.toLowerCase()}`;

  // Check cache first
  const cachedResults = getFromCache(cacheKey);
  if (cachedResults) {
    console.log(`Using cached city search results for ${trimmedSearch}`);
    return cachedResults;
  }

  try {
    // Fetch from geocoding API
    const response = await axios.get(GEOCODING_BASE_URL, {
      params: {
        name: trimmedSearch,
        count: 8, // Get up to 8 suggestions
        language: "en",
        format: "json",
      },
    });

    if (!response.data.results || response.data.results.length === 0) {
      return [];
    }

    const suggestions = response.data.results.map((result) => ({
      id: `${result.latitude}_${result.longitude}`,
      name: result.name,
      country: result.country,
      admin1: result.admin1,
      formattedName: `${result.name}${
        result.admin1 ? ", " + result.admin1 : ""
      }${result.country ? ", " + result.country : ""}`,
      lat: result.latitude,
      lng: result.longitude,
    }));

    // Cache the results for a short time (since search results can be cached briefly)
    saveToCache(cacheKey, suggestions);

    return suggestions;
  } catch (error) {
    console.warn("Error fetching city suggestions:", error);
    return [];
  }
}
