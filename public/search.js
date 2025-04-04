document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".search-form");
    if (!form) return;
  
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
        const selected = ratingInput.querySelector('input[type="radio"]:checked');
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
            // Handle radio button (star rating) restoration
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
  