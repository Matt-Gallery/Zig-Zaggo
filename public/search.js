// Handles search form functionality including city stops, hotel ratings, and form validation
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".search-form");
  if (!form) return;

  // Clear localStorage if the page is refreshed
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    localStorage.removeItem("zigzaggoSearchParams");
  }

  // Initialize city stop and days inputs
  const cityStopInputs = document.querySelectorAll('input[name="cityStops[]"]');
  const daysInputs = document.querySelectorAll('input[name="days[]"]');
  
  // Reset days inputs to empty state
  daysInputs.forEach(input => {
    input.placeholder = '';
    input.value = '';
  });

  // Function to manage hotel rating checkbox state based on city stop validity
  function updateHotelRatingCheckboxes(cityStopInput) {
    const index = cityStopInput.dataset.index;
    const cityStopValue = cityStopInput.value.trim().toUpperCase();
    const hotelRatingCheckboxes = document.querySelectorAll(`.city-stop:nth-child(${parseInt(index) + 1}) .hotel-rating input[type="checkbox"]`);
    
    // Check if the city stop has a valid value
    const isValidAirport = window.airportToCityMap && 
      (window.airportToCityMap[cityStopValue] || 
       Object.values(window.airportToCityMap).includes(cityStopValue));

    // Enable/disable checkboxes based on validity
    hotelRatingCheckboxes.forEach(checkbox => {
      checkbox.disabled = !isValidAirport;
      checkbox.parentElement.style.opacity = isValidAirport ? '1' : '0.5';
      checkbox.parentElement.style.cursor = isValidAirport ? 'pointer' : 'not-allowed';
    });
  }
  
  // Set up increment buttons for days inputs
  document.querySelectorAll('.days-increment').forEach(button => {
    button.addEventListener('click', function() {
      const index = this.dataset.index;
      const daysInput = document.querySelector(`input[name="days[]"][data-index="${index}"]`);
      
      // If the input is empty, set it to the default value
      if (!daysInput.value) {
        daysInput.value = daysInput.dataset.default || '3';
      } else {
        // Otherwise increment the value
        daysInput.value = parseInt(daysInput.value) + 1;
      }
    });
  });
  
  // Set up decrement buttons for days inputs
  document.querySelectorAll('.days-decrement').forEach(button => {
    button.addEventListener('click', function() {
      const index = this.dataset.index;
      const daysInput = document.querySelector(`input[name="days[]"][data-index="${index}"]`);
      
      // If the input is empty, set it to the default value
      if (!daysInput.value) {
        daysInput.value = daysInput.dataset.default || '3';
      } else {
        // Otherwise decrement the value, but not below 1
        const newValue = Math.max(1, parseInt(daysInput.value) - 1);
        daysInput.value = newValue;
      }
    });
  });
  
  // Set up city stop input handlers
  cityStopInputs.forEach((input, index) => {
    // Initially disable hotel rating checkboxes
    updateHotelRatingCheckboxes(input);

    // Set up event listeners for input and change events
    input.addEventListener('input', function() {
      const daysInput = daysInputs[index];
      if (this.value.trim() !== '') {
        // If days input is empty, set the value to 3
        if (daysInput.value === '') {
          daysInput.value = '3';
        }
      } else {
        // If city stop is empty, clear the value
        daysInput.value = '';
      }
      
      // Update hotel rating checkboxes when input changes
      updateHotelRatingCheckboxes(this);
    });
    
    // Check if city stop already has a value on page load
    // Only set value if the city stop has a valid value
    if (input.value.trim() !== '') {
      // Check if the city stop is a valid airport code or city name
      const isValidAirport = window.airportToCityMap && 
        (window.airportToCityMap[input.value.toUpperCase()] || 
         Object.values(window.airportToCityMap).includes(input.value));
      
      if (isValidAirport) {
        daysInputs[index].value = '3';
      } else {
        daysInputs[index].value = '';
      }
    }
  });

  // Handle hotel star rating checkboxes
  const ratingInputs = document.querySelectorAll('.rating-inputs');
  
  ratingInputs.forEach((ratingInput, rowIndex) => {
    const checkboxes = ratingInput.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', function() {
        // Only handle change if checkbox is not disabled
        if (!this.disabled) {
          // If this checkbox is being checked
          if (this.checked) {
            // Uncheck all other checkboxes in this row
            checkboxes.forEach((cb) => {
              if (cb !== this) {
                cb.checked = false;
              }
            });
          }
        }
      });
    });
  });

  // Add event listeners to hotel rating checkboxes to ensure only one is selected per row
  document.querySelectorAll('.hotel-rating').forEach((ratingGroup, index) => {
    const checkboxes = ratingGroup.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          // Uncheck all other checkboxes in this group
          checkboxes.forEach(otherCheckbox => {
            if (otherCheckbox !== e.target) {
              otherCheckbox.checked = false;
            }
          });
        }
      });
    });
  });

  // Add form validation for Departure and Return Airports
  form.addEventListener("submit", (event) => {
    const departureAirportInput = document.getElementById("departureAirport");
    const returnAirportInput = document.getElementById("returnAirport");
    let hasError = false;
    
    // Create or get error message div
    let errorDiv = document.querySelector(".search-results-empty");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "search-results-empty";
      form.parentNode.insertBefore(errorDiv, form.nextSibling);
    }
    
    // Check if departure airport is empty
    if (!departureAirportInput.value.trim()) {
      event.preventDefault();
      hasError = true;
      errorDiv.innerHTML = "<p>Please choose a departure airport</p>";
      errorDiv.scrollIntoView({ behavior: "smooth", block: "start" });
      return false;
    }
    
    // Check if return airport is empty
    if (!returnAirportInput.value.trim()) {
      event.preventDefault();
      hasError = true;
      errorDiv.innerHTML = "<p>Please choose a return airport</p>";
      errorDiv.scrollIntoView({ behavior: "smooth", block: "start" });
      return false;
    }
    
    // If no errors, save form data to localStorage
    if (!hasError) {
      const formData = new FormData(form);
      const entries = {};

      for (const [key, value] of formData.entries()) {
        if (!entries[key]) {
          entries[key] = value;
        } else if (!Array.isArray(entries[key])) {
          entries[key] = [entries[key], value];
        } else {
          entries[key].push(value);
        }
      }

      // Save the hotelRatings selections manually
      document.querySelectorAll('.rating-inputs').forEach((ratingInput, index) => {
        const selected = ratingInput.querySelector('input[type="checkbox"]:checked');
        if (selected) {
          entries[`hotelRatings[${index}]`] = selected.value;
        }
      });

      localStorage.setItem("zigzaggoSearchParams", JSON.stringify(entries));
    }
  });

  // Restore input values from localStorage
  const saved = localStorage.getItem("zigzaggoSearchParams");
  if (saved) {
    const data = JSON.parse(saved);

    for (const key in data) {
      const inputs = form.querySelectorAll(`[name="${key}"]`);
      if (!inputs.length) continue;

      if (inputs.length === 1) {
        inputs[0].value = data[key];
      } else {
        const values = Array.isArray(data[key]) ? data[key] : [data[key]];

        if (key.startsWith("hotelRatings[")) {
          // Handle checkbox (star rating) restoration
          inputs.forEach((input) => {
            if (input.value === data[key]) {
              input.checked = true;
            }
          });
        } else {
          inputs.forEach((input, idx) => {
            if (values[idx]) input.value = values[idx];
          });
        }
      }
    }

    // After restoring values, update hotel rating checkboxes
    cityStopInputs.forEach(input => {
      updateHotelRatingCheckboxes(input);
    });
  }
});
