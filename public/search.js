document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".search-form");
  if (!form) return;

  // Clear localStorage if the page is refreshed
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    localStorage.removeItem("zigzaggoSearchParams");
  }

  // Handle city stop inputs to populate days with default value
  const cityStopInputs = document.querySelectorAll('input[name="cityStops[]"]');
  const daysInputs = document.querySelectorAll('input[name="days[]"]');
  
  cityStopInputs.forEach((input, index) => {
    // Set up event listeners for input and change events
    input.addEventListener('input', function() {
      const daysInput = daysInputs[index];
      if (this.value.trim() !== '' && daysInput.value === '') {
        daysInput.value = daysInput.dataset.defaultValue || '3';
      }
    });
    
    // Check if city stop already has a value on page load
    if (input.value.trim() !== '' && daysInputs[index].value === '') {
      daysInputs[index].value = daysInputs[index].dataset.defaultValue || '3';
    }
  });

  // Handle hotel star rating checkboxes
  const ratingInputs = document.querySelectorAll('.rating-inputs');
  
  ratingInputs.forEach((ratingInput, rowIndex) => {
    const checkboxes = ratingInput.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', function() {
        // If this checkbox is being checked
        if (this.checked) {
          // Uncheck all other checkboxes in this row
          checkboxes.forEach((cb) => {
            if (cb !== this) {
              cb.checked = false;
            }
          });
        }
      });
    });
  });

  // Save all input values to localStorage on submit
  form.addEventListener("submit", () => {
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
  }
});
