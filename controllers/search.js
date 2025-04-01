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

export default router;
