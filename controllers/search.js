// ChatGPT and Cursor used extensively throughout

import express from "express";
import { Flights, Hotels } from "../models/resOptions.js";
import mongoose from "mongoose";
import Flight from '../models/flight.js';
import Hotel from '../models/hotel.js';

const router = express.Router();

const airportToCityMap = {
  LHR: "London",
  FCO: "Rome",
  NCE: "Nice",
  GVE: "Geneva",
  JFK: "New York",
  CDG: "Paris",
  // Add other mappings as needed
};

// Get available airports
router.get("/airports", async (req, res) => {
  try {
    const flights = await Flights.find({}, 'departureAirport arrivalAirport');
    const airportCodes = [...new Set([
      ...flights.map(flight => flight.departureAirport),
      ...flights.map(flight => flight.arrivalAirport)
    ])];
    res.json(airportCodes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch airport codes' });
  }
});

// Get available flights
router.get("/flights", async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const query = {};
    
    if (from) query.departureAirport = from;
    if (to) query.arrivalAirport = to;
    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      query.departureDateTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const flights = await Flights.find(query).sort({ price: 1 });
    res.json(flights);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch flights" });
  }
});

// Helper function to get dates for each city stay
const getStayDates = (departureDate, days) => {
  let currentDate = new Date(departureDate);
  const dates = [];
  
  for (const stayDuration of days) {
    const startDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + stayDuration);
    const endDate = new Date(currentDate);
    dates.push({ startDate, endDate });
  }
  
  return dates;
};

// Helper function to calculate flight duration
const calculateFlightDuration = (departure, arrival) => {
  const hours = Math.floor(Math.random() * 4) + 6; // Random duration between 6-10 hours
  const minutes = Math.floor(Math.random() * 60);
  return `${hours}h ${minutes}m`;
};

// Helper function to format flight time
const formatFlightTime = (date, offsetHours) => {
  const flightTime = new Date(date);
  flightTime.setHours(flightTime.getHours() + offsetHours);
  return flightTime.toISOString();
};

router.post('/', async (req, res) => {
  try {
    const {
      departureAirport,
      cityStops,
      returnAirport,
      departureDate,
      days,
      flightClass,
      returnFlightClass,
      hotelRatings
    } = req.body;

    // Normalize airport codes to uppercase
    const normalizedDepartureAirport = departureAirport.toUpperCase();
    const normalizedCityStops = cityStops.map(stop => stop.toUpperCase());
    const normalizedReturnAirport = returnAirport.toUpperCase();

    // Validate input
    if (!normalizedDepartureAirport || !normalizedCityStops || !normalizedReturnAirport || !departureDate || !days || !flightClass || !hotelRatings) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Calculate stay dates for each city
    const stayDates = getStayDates(departureDate, days);

    // Build complete route including departure and return
    const fullRoute = [normalizedDepartureAirport, ...normalizedCityStops, normalizedReturnAirport];

    const itineraries = [];

    // Generate multiple itinerary options
    for (let option = 0; option < 3; option++) {
      const legs = [];
      let currentDate = new Date(departureDate);
      let totalPrice = 0;

      // Process each leg of the journey
      for (let i = 0; i < fullRoute.length - 1; i++) {
        const from = fullRoute[i];
        const to = fullRoute[i + 1];
        const isLastLeg = i === fullRoute.length - 2;
        const currentClass = isLastLeg ? returnFlightClass : flightClass[i];

        // Find available flights with case-insensitive search
        const flights = await Flight.find({
          departureAirport: { $regex: new RegExp(`^${from}$`, 'i') },
          arrivalAirport: { $regex: new RegExp(`^${to}$`, 'i') },
          class: currentClass
        }).lean();

        if (flights.length === 0) {
          continue;
        }

        // Select a random flight
        const flight = flights[Math.floor(Math.random() * flights.length)];
        const flightPrice = flight.price * (1 + (option * 0.1)); // Vary price by option

        // Generate flight times
        const departureTime = formatFlightTime(currentDate, 8); // Flights start at 8 AM
        const duration = calculateFlightDuration(from, to);
        const arrivalTime = formatFlightTime(currentDate, 16); // Flights land at 4 PM

        // If not the last leg, find a hotel
        let hotel = null;
        let hotelPrice = 0;

        if (!isLastLeg) {
          // Find hotels in the destination city with the required rating
          const hotels = await Hotel.find({
            city: { $regex: new RegExp(`^${to}$`, 'i') },
            rating: { $gte: hotelRatings[i] }
          }).lean();
        
          if (hotels.length > 0) {
            hotel = hotels[Math.floor(Math.random() * hotels.length)];
            hotelPrice = hotel.pricePerNight * days[i];
          }
        }

        // Add leg to itinerary
        legs.push({
          departureAirport: from,
          arrivalAirport: to,
          departureTime,
          arrivalTime,
          duration,
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          aircraft: flight.aircraft,
          class: currentClass,
          flightPrice: Math.round(flightPrice),
          hotelName: hotel?.name || null,
          hotelRating: hotel?.rating || null,
          hotelPrice: Math.round(hotelPrice),
          stayDuration: isLastLeg ? 0 : days[i]
        });

        totalPrice += flightPrice + hotelPrice;

        // Update current date for next leg
        if (!isLastLeg) {
          currentDate.setDate(currentDate.getDate() + days[i]);
        }
      }

      // Add complete itinerary only if all legs were found
      if (legs.length === fullRoute.length - 1) {
        itineraries.push({
          totalPrice: Math.round(totalPrice),
          departureDate: new Date(departureDate).toISOString(),
          returnDate: legs[legs.length - 1].arrivalTime,
          stops: normalizedCityStops.length,
          itinerary: legs
        });
      }
    }

    // Sort itineraries by price
    itineraries.sort((a, b) => a.totalPrice - b.totalPrice);

    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug route to check database contents
router.get("/debug", async (req, res) => {
  try {
    const flights = await Flight.find().lean();
    const hotels = await Hotel.find().lean();
    
    res.json({
      flightCount: flights.length,
      hotelCount: hotels.length,
      sampleFlight: flights[0],
      sampleHotel: hotels[0],
      flightAirports: [...new Set(flights.map(f => f.departureAirport).concat(flights.map(f => f.arrivalAirport)))],
      flightClasses: [...new Set(flights.map(f => f.class))],
      cities: [...new Set(hotels.map(h => h.city))]
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch debug data" });
  }
});

export default router;