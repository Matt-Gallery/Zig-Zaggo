// public/js/autocomplete.js

document.addEventListener('DOMContentLoaded', () => {
  setupAutocomplete('departureAirport', 'departure-suggestions');
  setupAutocomplete('returnAirport', 'return-suggestions');
});

async function setupAutocomplete(inputId, listId) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.getElementById(listId);

  // Exit if elements not found
  if (!input || !suggestionBox) {
    console.warn(`Autocomplete setup skipped: ${inputId} or ${listId} not found.`);
    return;
  }

  input.addEventListener('input', async () => {
    const term = input.value.trim();

    if (term.length < 1) {
      suggestionBox.innerHTML = '';
      return;
    }

    try {
      const res = await fetch(`/search/autocomplete-airports?term=${term}`);
      const suggestions = await res.json();

      suggestionBox.innerHTML = ''; // clear old suggestions

      suggestions.forEach(code => {
        const li = document.createElement('li');
        li.textContent = code;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
          input.value = code;
          suggestionBox.innerHTML = '';
        });
        suggestionBox.appendChild(li);
      });

      suggestionBox.style.display = suggestions.length ? 'block' : 'none';
    } catch (err) {
      console.error('Autocomplete fetch failed:', err);
    }
  });

  // Close dropdown if user clicks elsewhere
  document.addEventListener('click', (e) => {
    if (!suggestionBox.contains(e.target) && e.target !== input) {
      suggestionBox.innerHTML = '';
    }
  });
}
