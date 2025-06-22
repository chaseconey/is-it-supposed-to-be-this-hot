import { ref } from "vue";

/**
 * Composable for managing application state via URL parameters
 * Provides browser history support with pushState/popState
 */
export function useUrlState() {
  const currentState = ref({
    city: null,
    lat: null,
    lng: null,
    displayName: null,
  });

  /**
   * Parse URL parameters to extract city state
   */
  function parseUrlState() {
    const urlParams = new URLSearchParams(window.location.search);
    const city = urlParams.get("city");
    const lat = urlParams.get("lat");
    const lng = urlParams.get("lng");
    const displayName = urlParams.get("name");

    if (city && lat && lng) {
      return {
        city: decodeURIComponent(city),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        displayName: displayName ? decodeURIComponent(displayName) : city,
      };
    }
    return null;
  }

  /**
   * Update URL with current city state
   */
  function updateUrl(cityData, replace = false) {
    if (!cityData) {
      // Clear the URL params when no city is selected
      const url = new URL(window.location);
      url.search = "";
      const method = replace ? "replaceState" : "pushState";
      window.history[method]({}, "", url.toString());
      currentState.value = {
        city: null,
        lat: null,
        lng: null,
        displayName: null,
      };
      return;
    }

    const url = new URL(window.location);
    url.searchParams.set(
      "city",
      encodeURIComponent(cityData.city || cityData.formattedName)
    );
    url.searchParams.set("lat", cityData.lat.toString());
    url.searchParams.set("lng", cityData.lng.toString());

    if (cityData.displayName || cityData.formattedName) {
      url.searchParams.set(
        "name",
        encodeURIComponent(cityData.displayName || cityData.formattedName)
      );
    }

    const method = replace ? "replaceState" : "pushState";
    window.history[method]({}, "", url.toString());

    currentState.value = {
      city: cityData.city || cityData.formattedName,
      lat: cityData.lat,
      lng: cityData.lng,
      displayName: cityData.displayName || cityData.formattedName,
    };
  }

  /**
   * Handle browser back/forward navigation
   */
  function handlePopState() {
    const state = parseUrlState();
    currentState.value = state || {
      city: null,
      lat: null,
      lng: null,
      displayName: null,
    };
  }

  /**
   * Initialize URL state management
   */
  function initializeUrlState() {
    // Parse initial URL state
    const initialState = parseUrlState();
    if (initialState) {
      currentState.value = initialState;
    }

    // Listen for browser navigation events
    window.addEventListener("popstate", handlePopState);
  }

  /**
   * Cleanup event listeners
   */
  function cleanupUrlState() {
    window.removeEventListener("popstate", handlePopState);
  }

  /**
   * Get coordinates object for weather service
   */
  function getCoordinates() {
    if (!currentState.value.city) {
      return null;
    }

    return {
      lat: currentState.value.lat,
      lng: currentState.value.lng,
      displayName: currentState.value.displayName || currentState.value.city,
    };
  }

  return {
    currentState,
    parseUrlState,
    updateUrl,
    handlePopState,
    initializeUrlState,
    cleanupUrlState,
    getCoordinates,
  };
}
