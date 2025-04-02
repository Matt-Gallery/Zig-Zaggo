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
    type: Date,
    required: true,
  },
  arrivalDateTime: {
    type: Date,
    required: true,
  },
  airline: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
    enum: ["Economy", "Business"]
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
  hotelCity :
  {
    type: String,
    required: true,
  },
  hotelStars: {
    type: Number,
    required: true,
    maxlength: 5,
    minlength: 1,
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
});

export const Flights = mongoose.model("Flights", flightSchema);
export const Hotels = mongoose.model("Hotels", hotelSchema);

