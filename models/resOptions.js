import mongoose from "mongoose";

const flightSchema = mongoose.Schema({
  departureAirport: {
    type: String,
    required: true,
    maxlength: 3,
    minlength: 3,
  },
  arrivalAirport: {
    type: String,
    required: true,
    maxlength: 3,
    minlength: 3,
  },
  departureDateTime: {
    type: DateTime,
    required: true,
  },
  arrivalDateTime: {
    type: DateTime,
    required: true,
  },
  airline: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const hotelSchema = mongoose.Schema({
  hotelName: {
    type: String,
    required: true,
  },
  hotelStars: {
    type: Number,
    required: true,
    maxlength: 5,
    minlength: 1,
  },
  arrivalDate: {
    type: Date,
    required: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

export default mongoose.model("User", userSchema);
