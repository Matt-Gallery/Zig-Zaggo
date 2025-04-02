import express from 'express';
const router = express.Router();

// Route: GET /search
router.get('/', (req, res) => {
    res.render('search/index'); 
  });

// Route: POST /searc
router.post('/', async (req, res) => {
  try {
    const {
      departureAirport,
      departureDate,
      cityStops,
      days,
      hotelRatings,
      returnAirport,
    } = req.body;

    console.log('Search request received:', req.body);

    res.redirect('/search/results');
  } catch (error) {
    console.error('Error handling search:', error);
    res.status(500).send('Something went wrong. Please try again.');
  }
});

const API_KEY = process.env.AVIATIONSTACK_API_KEY;

router.get('/airports', async (req, res) => {
  const query = req.query.search;
  if (!query) return res.status(400).json({ error: 'Missing search query' });

  try {
    const apiRes = await fetch(`http://api.aviationstack.com/v1/airports?access_key=${API_KEY}&search=${query}`);
    const data = await apiRes.json();
    res.json(data);
  } catch (err) {
    console.error('Airport API fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch airport data' });
  }
});

export default router;
