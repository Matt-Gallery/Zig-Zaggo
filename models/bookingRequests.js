import mongoose from "mongoose";

// Define the booking request schema
const bookingRequestSchema = new mongoose.Schema({
  // User information - reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // User must be logged in to book a trip
  },
  
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  
  // Booking date
  bookingDate: {
    type: Date,
    default: Date.now
  },
  
  // Basic itinerary information
  departureAirport: {
    type: String,
    required: true
  },
  returnAirport: {
    type: String,
    required: true
  },
  departureDate: {
    type: Date,
    required: true
  },
  returnFlightClass: {
    type: String,
    enum: ['economy', 'business', 'first'],
    required: true
  },
  
  // City stops information
  cityStops: [{
    city: {
      type: String,
      required: true
    },
    days: {
      type: Number,
      required: true
    },
    minHotelStars: {
      type: Number,
      required: true
    },
    flightClass: {
      type: String,
      enum: ['economy', 'business', 'first'],
      required: true
    }
  }],
  
  // Complete itinerary with all flight and hotel details
  itinerary: [{
    departureAirport: {
      type: String,
      required: true
    },
    arrivalAirport: {
      type: String,
      required: true
    },
    departureTime: {
      type: Date,
      required: true
    },
    arrivalTime: {
      type: Date,
      required: true
    },
    airline: {
      type: String,
      required: true
    },
    flightDuration: {
      type: String,
      required: true
    },
    flightPrice: {
      type: Number,
      required: true
    },
    hotelName: {
      type: String,
      required: false
    },
    hotelPrice: {
      type: Number,
      required: false
    }
  }],
  
  // Total price
  totalPrice: {
    type: Number,
    required: true
  }
});

// Create and export the model with a unique name to avoid conflicts
const BookingRequest = mongoose.model('BookingRequest', bookingRequestSchema);

export { BookingRequest };

