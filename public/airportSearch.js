document.addEventListener('DOMContentLoaded', () => {
  const departureInput = document.getElementById('departureAirport');
  const returnInput = document.getElementById('returnAirport');
  const departureResults = document.getElementById('departure-suggestions');
  const returnResults = document.getElementById('return-suggestions');

  if (!departureInput || !departureResults || !returnInput || !returnResults) return;

  // Initialize autocomplete for both inputs
  setupAutocomplete(departureInput, departureResults);
  setupAutocomplete(returnInput, returnResults);

  function setupAutocomplete(input, results) {
    input.addEventListener('input', debounce(() => fetchAirports(input, results), 300));

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
  }

  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  async function fetchAirports(input, results) {
    const query = input.value.trim();
    results.innerHTML = '';

    try {
      const res = await fetch(`/search/flights`);
      const data = await res.json();
      const airportCodes = data.map((airport) => airport.departureAirport);
      const filteredCodes = airportCodes.filter((code) =>
        code.toLowerCase().includes(query.toLowerCase())
      );
      const uniqueCodes = [...new Set(filteredCodes)];

      if (uniqueCodes.length) {
        uniqueCodes.forEach((code) => {
          const li = document.createElement('li');
          li.textContent = code;
          li.style.cursor = 'pointer';
          li.addEventListener('click', () => {
            input.value = code;
            results.innerHTML = '';
          });
          results.appendChild(li);
        });
      }
    } catch (err) {
      console.error('Client fetch failed:', err);
    }
  }
});
