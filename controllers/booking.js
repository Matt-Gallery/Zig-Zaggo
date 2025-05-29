// ChatGPT and Cursor used extensively throughout

import express from 'express';
import { BookingRequest } from '../models/bookingRequests.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required',
      redirect: '/login'
    });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired',
        redirect: '/login'
      });
    }
    return res.status(401).json({ 
      success: false,
      error: 'Invalid token',
      redirect: '/login'
    });
  }
};

// Create a new booking request
router.post('/create', isLoggedIn, async (req, res) => {
  try {
    console.log('Booking request received. Raw body:', req.body);
    console.log('User from token:', req.user);
    
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
    if (!req.body.itinerary || !Array.isArray(req.body.itinerary) || req.body.itinerary.length === 0) {
      console.error('Invalid itinerary data');
      return res.status(400).json({
        success: false,
        error: 'Invalid itinerary data'
      });
    }

    // Create a new booking request
    const bookingRequest = new BookingRequest({
      user: req.user.userId,
      departureAirport: req.body.departureAirport,
      returnAirport: req.body.returnAirport,
      departureDate: new Date(req.body.departureDate),
      returnFlightClass: req.body.returnFlightClass.toLowerCase(),
      cityStops: req.body.cityStops || [],
      itinerary: req.body.itinerary,
      totalPrice: parseFloat(req.body.totalPrice),
      status: 'pending'
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
      return res.status(404).json({ 
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Check if the booking belongs to the current user
    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to view this booking'
      });
    }
    
    // Return the booking data
    res.json(booking);
  } catch (error) {
    console.error('Error viewing booking:', error);
    res.status(500).json({ 
      success: false,
      error: 'An error occurred while retrieving the booking'
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
    if (booking.user.toString() !== req.user.userId) {
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
    console.log('Fetching bookings for user:', req.user.userId);
    
    // Find all bookings for the current user
    const bookings = await BookingRequest.find({ user: req.user.userId })
      .sort({ bookingDate: -1 }); // Sort by booking date, newest first
    
    console.log(`Found ${bookings.length} bookings for user`);
    
    // Log each booking ID for debugging
    bookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}: ID=${booking._id}, Status=${booking.status}, Date=${booking.bookingDate}`);
    });
    
    // Return the bookings data
    res.json(bookings);
  } catch (error) {
    console.error('Error listing bookings:', error);
    res.status(500).json({ 
      success: false,
      error: 'An error occurred while retrieving your bookings'
    });
  }
});

export default router; 