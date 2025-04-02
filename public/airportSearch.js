const input = document.getElementById('airport-search');
const results = document.getElementById('airport-results');

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
});

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

const fetchAirports = async () => {
  const query = input.value.trim();
  results.innerHTML = '';

  if (query.length <= 2) return;

  try {
    const res = await fetch(`https://api.api-ninjas.com/v1/airportlist?access_key=${"wVYxOxSq73yh/M6yKMDLfA==jQLX9HtGFJQS6Jsr"}&search=${query}`);
    const data = await res.json();

    if (data.data) {
      data.data.forEach(airport => {
        const li = document.createElement('li');
        li.textContent = `${airport.iata_code} - ${airport.airport_name}, ${airport.city}`;
        results.appendChild(li);
      });
    }
  } catch (err) {
    console.error('Client fetch failed:', err);
  }
};

input.addEventListener('input', debounce(fetchAirports, 300));
