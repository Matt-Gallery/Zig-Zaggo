// ChatGPT and Cursor used extensively throughout

// Handles airport search functionality with autocomplete for departure, return, and city stop inputs
document.addEventListener('DOMContentLoaded', () => {
  const departureInput = document.getElementById('departureAirport');
  const returnInput = document.getElementById('returnAirport');
  const departureResults = document.getElementById('departure-suggestions');
  const returnResults = document.getElementById('return-suggestions');

  if (!departureInput || !departureResults || !returnInput || !returnResults) return;

  // Cache for airport data to improve performance
  let airportCache = null;
  
  // Get the airportToCityMap from the window object
  const airportToCityMap = window.airportToCityMap || {};
  
  // Create a reverse mapping from city names to airport codes for searching
  const cityToAirportMap = {};
  for (const [code, city] of Object.entries(airportToCityMap)) {
    cityToAirportMap[city.toLowerCase()] = code;
  }
  
  // Preload airport codes when the page loads
  preloadAirportCodes();

  // Initialize autocomplete for departure and return inputs
  setupAutocomplete(departureInput, departureResults, true);
  setupAutocomplete(returnInput, returnResults, true);

  // Initialize autocomplete for city stop inputs
  setupCityStopAutocomplete();

  // Function to preload airport codes from server or use fallback
  async function preloadAirportCodes() {
    try {
      // First try to get airport codes from the server
      const res = await fetch('/search/airport-codes');
      if (res.ok) {
        airportCache = await res.json();
        console.log(`Preloaded ${airportCache.length} airport codes from server`);
      } else {
        // If server request fails, use the airportToCityMap keys as fallback
        airportCache = Object.keys(airportToCityMap);
        console.log(`Using ${airportCache.length} airport codes from airportToCityMap`);
      }
    } catch (err) {
      console.error('Failed to preload airport codes from server:', err);
      // Use the airportToCityMap keys as fallback
      airportCache = Object.keys(airportToCityMap);
      console.log(`Using ${airportCache.length} airport codes from airportToCityMap as fallback`);
    }
  }

  // Function to set up autocomplete for city stop inputs
  function setupCityStopAutocomplete() {
    // Get all city stop inputs
    const cityStopInputs = document.querySelectorAll('input[name="cityStops[]"]');
    
    cityStopInputs.forEach((input, index) => {
      // Create a suggestions container for this input
      const suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = 'autocomplete-list';
      suggestionsContainer.id = `city-stop-suggestions-${index}`;
      input.parentNode.appendChild(suggestionsContainer);

      // Setup autocomplete for this input
      setupAutocomplete(input, suggestionsContainer, true);

      // Update the corresponding days input when a city is selected
      input.addEventListener('change', () => {
        const daysInput = document.querySelector(`input[name="days[]"][data-index="${index}"]`);
        if (daysInput && !daysInput.value) {
          daysInput.placeholder = '3'; // Set placeholder to 3 instead of setting value to 1
        }
      });
    });
  }

  // Function to set up autocomplete functionality for an input
  function setupAutocomplete(input, results, showCityAndCode = false) {
    // Use a more aggressive debounce for better performance
    input.addEventListener('input', debounce(() => fetchAirports(input, results), 150));

    // Handle keyboard navigation
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      
      // Add keyboard navigation for suggestions
      const suggestions = results.querySelectorAll('li');
      const activeIndex = Array.from(suggestions).findIndex(li => li.classList.contains('active'));
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeIndex < suggestions.length - 1) {
          if (activeIndex >= 0) suggestions[activeIndex].classList.remove('active');
          suggestions[activeIndex + 1].classList.add('active');
          suggestions[activeIndex + 1].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIndex > 0) {
          suggestions[activeIndex].classList.remove('active');
          suggestions[activeIndex - 1].classList.add('active');
          suggestions[activeIndex - 1].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        const selectedItem = suggestions[activeIndex];
        const code = selectedItem.dataset.code;
        const city = airportToCityMap[code] || '';
        
        if (showCityAndCode) {
          input.value = `${city} (${code})`;
          // Store the airport code in a data attribute for form submission
          input.dataset.airportCode = code;
        } else {
          input.value = code;
        }
        
        results.innerHTML = '';
        // Trigger change event to update days input
        input.dispatchEvent(new Event('change'));
      } else if (e.key === 'Escape') {
        results.innerHTML = '';
      }
    });

    // Close dropdown if user clicks elsewhere
    document.addEventListener('click', (e) => {
      if (!results.contains(e.target) && e.target !== input) {
        results.innerHTML = '';
      }
    });
  }

  // Utility function to debounce input events
  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  // Function to fetch and display airport suggestions
  async function fetchAirports(input, results) {
    const query = input.value.trim().toLowerCase();
    
    // Clear results if query is empty
    if (!query) {
      results.innerHTML = '';
      return;
    }
    
    // Show loading indicator if cache is not yet loaded
    if (!airportCache) {
      results.innerHTML = '<li class="loading">Loading airport codes...</li>';
      return;
    }
    
    // Filter the cached data based on both airport codes and city names
    const filteredCodes = [];
    
    // First check if the query matches any airport codes
    for (const code of airportCache) {
      if (code.toLowerCase().includes(query)) {
        filteredCodes.push(code);
      }
    }
    
    // Then check if the query matches any city names
    for (const [code, city] of Object.entries(airportToCityMap)) {
      if (city.toLowerCase().includes(query) && !filteredCodes.includes(code)) {
        filteredCodes.push(code);
      }
    }
    
    // Get unique codes and limit to top 10 for better performance
    const uniqueCodes = [...new Set(filteredCodes)].slice(0, 10);
    
    // Clear results
    results.innerHTML = '';
    
    if (uniqueCodes.length) {
      uniqueCodes.forEach((code) => {
        const city = airportToCityMap[code] || '';
        const li = document.createElement('li');
        li.textContent = `${city} (${code})`;
        li.dataset.code = code;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
          if (input.id === 'departureAirport' || input.id === 'returnAirport' || input.name === 'cityStops[]') {
            input.value = `${city} (${code})`;
            // Store the airport code in a data attribute for form submission
            input.dataset.airportCode = code;
          } else {
            input.value = code;
          }
          results.innerHTML = '';
          // Trigger change event to update days input
          input.dispatchEvent(new Event('change'));
        });
        results.appendChild(li);
      });
    } else {
      results.innerHTML = '<li class="no-results">No airports found</li>';
    }
  }
  
  // Add form submit handler to ensure the correct airport code is submitted
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      // Handle departure airport
      if (departureInput.dataset.airportCode) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'departureAirport';
        hiddenInput.value = departureInput.dataset.airportCode;
        searchForm.appendChild(hiddenInput);
        departureInput.disabled = true; // Disable the visible input to prevent it from being submitted
      }
      
      // Handle return airport
      if (returnInput.dataset.airportCode) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'returnAirport';
        hiddenInput.value = returnInput.dataset.airportCode;
        searchForm.appendChild(hiddenInput);
        returnInput.disabled = true; // Disable the visible input to prevent it from being submitted
      }
      
      // Handle city stops
      const cityStopInputs = document.querySelectorAll('input[name="cityStops[]"]');
      cityStopInputs.forEach((input, index) => {
        if (input.dataset.airportCode) {
          const hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = 'cityStops[]';
          hiddenInput.value = input.dataset.airportCode;
          searchForm.appendChild(hiddenInput);
          input.disabled = true; // Disable the visible input to prevent it from being submitted
        }
      });
    });
  }
});
