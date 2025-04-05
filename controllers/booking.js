import express from 'express';
import { BookingRequest } from '../models/bookingRequests.js';

const router = express.Router();

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  console.log('Checking if user is logged in...');
  console.log('Session:', req.session);
  
  if (!req.session.user) {
    console.log('User is not logged in. Redirecting to login page.');
    // For API routes, return JSON error
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ error: 'User must be logged in to book a trip' });
    }
    // For regular routes, redirect to login page
    return res.redirect('/auth/login?redirect=/booking/my-bookings');
  }
  
  console.log('User is logged in:', req.session.user._id);
  next();
};

// Create a new booking request
router.post('/create', isLoggedIn, async (req, res) => {
  try {
    console.log('Booking request received. Raw body:', req.body);
    
    // Parse the city stops and itinerary data from the form
    let cityStops = [];
    let itinerary = [];
    
    // Parse city stops if they exist
    if (req.body.cityStopsData) {
      try {
        // Handle both string and object formats
        if (typeof req.body.cityStopsData === 'string') {
          cityStops = JSON.parse(req.body.cityStopsData);
        } else {
          cityStops = req.body.cityStopsData;
        }
        console.log('Parsed city stops:', cityStops);
      } catch (error) {
        console.error('Error parsing city stops:', error);
        console.error('Raw cityStopsData:', req.body.cityStopsData);
      }
    }
    
    // Parse itinerary data
    if (req.body.itineraryData) {
      try {
        // Handle both string and object formats
        if (typeof req.body.itineraryData === 'string') {
          itinerary = JSON.parse(req.body.itineraryData);
        } else {
          itinerary = req.body.itineraryData;
        }
        console.log('Parsed itinerary:', itinerary);
      } catch (error) {
        console.error('Error parsing itinerary:', error);
        console.error('Raw itineraryData:', req.body.itineraryData);
        return res.status(400).json({
          success: false,
          error: 'Invalid itinerary data format',
          details: error.message
        });
      }
    }
    
    // Validate required fields
    if (!req.body.departureAirport || !req.body.returnAirport || !req.body.departureDate || !req.body.returnFlightClass || !req.body.totalPrice) {
      console.error('Missing required fields:', {
        departureAirport: req.body.departureAirport,
        returnAirport: req.body.returnAirport,
        departureDate: req.body.departureDate,
        returnFlightClass: req.body.returnFlightClass,
        totalPrice: req.body.totalPrice
      });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for booking request'
      });
    }
    
    // Validate itinerary
    if (!itinerary || itinerary.length === 0) {
      console.error('Invalid itinerary data');
      return res.status(400).json({
        success: false,
        error: 'Invalid itinerary data'
      });
    }
    
    // Create a new booking request
    const bookingRequest = new BookingRequest({
      user: req.session.user._id,
      departureAirport: req.body.departureAirport,
      returnAirport: req.body.returnAirport,
      departureDate: new Date(req.body.departureDate),
      returnFlightClass: req.body.returnFlightClass,
      cityStops: cityStops,
      itinerary: itinerary,
      totalPrice: parseFloat(req.body.totalPrice)
    });
    
    console.log('Booking request object before save:', bookingRequest);
    
    // Save the booking request to the database
    const savedBooking = await bookingRequest.save();
    console.log('Booking request saved successfully:', savedBooking);
    
    // Return success response
    res.status(200).json({ 
      success: true, 
      message: 'Booking request created successfully',
      bookingId: savedBooking._id
    });
  } catch (error) {
    console.error('Error creating booking request:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create booking request. Please try again.';
    if (error.name === 'ValidationError') {
      errorMessage = `Validation error: ${Object.values(error.errors).map(err => err.message).join(', ')}`;
    } else if (error.name === 'CastError') {
      errorMessage = `Invalid data format: ${error.message}`;
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: error.message
    });
  }
});

// View a specific booking
router.get('/view/:id', isLoggedIn, async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Find the booking by ID
    const booking = await BookingRequest.findById(bookingId);
    
    // Check if booking exists and belongs to the current user
    if (!booking) {
      return res.render('search/booking', { 
        booking: null,
        errorMessage: 'Booking not found'
      });
    }
    
    // Check if the booking belongs to the current user
    if (booking.user.toString() !== req.session.user._id.toString()) {
      return res.render('search/booking', { 
        booking: null,
        errorMessage: 'You do not have permission to view this booking'
      });
    }
    
    // Render the booking view
    res.render('search/booking', { booking });
  } catch (error) {
    console.error('Error viewing booking:', error);
    res.render('search/booking', { 
      booking: null,
      errorMessage: 'An error occurred while retrieving the booking'
    });
  }
});

// Cancel a booking
router.post('/cancel/:id', isLoggedIn, async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Find the booking by ID
    const booking = await BookingRequest.findById(bookingId);
    
    // Check if booking exists
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Check if the booking belongs to the current user
    if (booking.user.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to cancel this booking'
      });
    }
    
    // Check if the booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'This booking is already cancelled'
      });
    }
    
    // Update the booking status to cancelled
    booking.status = 'cancelled';
    await booking.save();
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while cancelling the booking'
    });
  }
});

// List all bookings for the current user
router.get('/my-bookings', isLoggedIn, async (req, res) => {
  try {
    console.log('Fetching bookings for user:', req.session.user._id);
    
    // Find all bookings for the current user
    const bookings = await BookingRequest.find({ user: req.session.user._id })
      .sort({ bookingDate: -1 }); // Sort by booking date, newest first
    
    console.log(`Found ${bookings.length} bookings for user`);
    
    // Log each booking ID for debugging
    bookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}: ID=${booking._id}, Status=${booking.status}, Date=${booking.bookingDate}`);
    });
    
    // Render the bookings list view
    res.render('search/my-bookings', { bookings });
  } catch (error) {
    console.error('Error listing bookings:', error);
    res.render('search/my-bookings', { 
      bookings: [],
      errorMessage: 'An error occurred while retrieving your bookings'
    });
  }
});

export default router; 