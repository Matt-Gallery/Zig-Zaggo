import express from 'express';
const router = express.Router();

// Route: GET /search
router.get('/', (req, res) => {
    res.render('search/index'); // res.locals.user is available in the view
  });

// Route: POST /search
router.post('/', async (req, res) => {
  try {
    // You can extract search data here
    const {
      departureAirport,
      departureDate,
      cityStops,
      days,
      hotelRatings,
      returnAirport,
    } = req.body;

    // Eventually: perform search logic here (API calls, DB lookups, etc.)
    console.log('Search request received:', req.body);

    // Redirect to results for now (placeholder)
    res.redirect('/search/results');
  } catch (error) {
    console.error('Error handling search:', error);
    res.status(500).send('Something went wrong. Please try again.');
  }
});

export default router;
