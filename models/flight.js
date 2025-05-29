import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
  airline: {
    type: String,
    required: true
  },
  flightNumber: {
    type: String,
    required: true
  },
  departureAirport: {
    type: String,
    required: true
  },
  arrivalAirport: {
    type: String,
    required: true
  },
  aircraft: {
    type: String,
    required: true
  },
  class: {
    type: String,
    enum: ['economy', 'business', 'first'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  seatsAvailable: {
    type: Number,
    required: true,
    min: 0
  }
});

const Flight = mongoose.model('Flight', flightSchema);

export default Flight; 