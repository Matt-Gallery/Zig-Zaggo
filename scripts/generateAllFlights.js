import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Flights } from '../models/resOptions.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zigzaggo')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Flight Schema
const flightSchema = new mongoose.Schema({
  departureAirport: { type: String, required: true },
  arrivalAirport: { type: String, required: true },
  departureDateTime: { type: Date, required: true },
  arrivalDateTime: { type: Date, required: true },
  airline: { type: String, required: true },
  class: { type: String, required: true, enum: ['Economy', 'Business', 'First'] },
  price: { type: Number, required: true }
});

// Add compound index for unique flights
flightSchema.index({ 
  departureAirport: 1, 
  arrivalAirport: 1, 
  departureDateTime: 1, 
  airline: 1, 
  class: 1 
}, { unique: true });

const Flight = mongoose.model('Flight', flightSchema);

// Define airports and their properties
const airports = {
  LHR: { city: "London", timezone: "Europe/London" },
  FCO: { city: "Rome", timezone: "Europe/Rome" },
  NCE: { city: "Nice", timezone: "Europe/Paris" },
  GVE: { city: "Geneva", timezone: "Europe/Zurich" },
  JFK: { city: "New York", timezone: "America/New_York" },
  CDG: { city: "Paris", timezone: "Europe/Paris" }
};

// Define airlines and their typical routes
const airlines = {
  "British Airways": ["LHR", "JFK", "CDG", "FCO"],
  "Air France": ["CDG", "JFK", "LHR", "FCO"],
  "ITA Airways": ["FCO", "JFK", "LHR", "CDG"],
  "Delta Airlines": ["JFK", "LHR", "CDG", "FCO"],
  "American Airlines": ["JFK", "LHR", "CDG", "FCO"],
  "United Airlines": ["JFK", "LHR", "CDG", "FCO"],
  "Virgin Atlantic": ["LHR", "JFK"],
  "FlyItaly": ["FCO", "NCE", "GVE"],
  "SkyTaxi": ["FCO", "NCE", "GVE"]
};

// Define flight classes and their price multipliers
const flightClasses = {
  "Economy": { baseMultiplier: 1, variance: 0.2 },
  "Business": { baseMultiplier: 3, variance: 0.3 },
  "First": { baseMultiplier: 5, variance: 0.4 }
};

// Function to generate a random time between min and max hours
function getRandomTime(minHours, maxHours) {
  const hours = minHours + Math.random() * (maxHours - minHours);
  const minutes = Math.floor(Math.random() * 60);
  return { hours, minutes };
}

// Function to generate flight duration based on route
function getFlightDuration(from, to) {
  // Long-haul routes (involving JFK)
  if (from === "JFK" || to === "JFK") {
    return getRandomTime(7, 8); // 7-8 hours
  }
  // Medium-haul routes (European capitals)
  if (["LHR", "CDG", "FCO"].includes(from) && ["LHR", "CDG", "FCO"].includes(to)) {
    return getRandomTime(2, 3); // 2-3 hours
  }
  // Short-haul routes (within Italy/Switzerland)
  return getRandomTime(1, 2); // 1-2 hours
}

// Function to generate base price based on route and class
function getBasePrice(from, to, flightClass) {
  // Long-haul routes (involving JFK)
  if (from === "JFK" || to === "JFK") {
    return flightClasses[flightClass].baseMultiplier * 500;
  }
  // Medium-haul routes (European capitals)
  if (["LHR", "CDG", "FCO"].includes(from) && ["LHR", "CDG", "FCO"].includes(to)) {
    return flightClasses[flightClass].baseMultiplier * 200;
  }
  // Short-haul routes (within Italy/Switzerland)
  return flightClasses[flightClass].baseMultiplier * 100;
}

// Function to generate a flight
function generateFlight(from, to, date, airline, flightClass, flightNumber) {
  const duration = getFlightDuration(from, to);
  const basePrice = getBasePrice(from, to, flightClass);
  
  // Add some randomness to the price
  const priceVariance = flightClasses[flightClass].variance;
  const price = Math.round(basePrice * (1 + (Math.random() * priceVariance * 2 - priceVariance)));
  
  // Generate departure time based on flight number (1-4)
  // Flight 1: Early morning (6:00-9:00)
  // Flight 2: Late morning (10:00-13:00)
  // Flight 3: Afternoon (14:00-17:00)
  // Flight 4: Evening (18:00-21:00)
  const timeSlot = flightNumber - 1;
  const departureHour = 6 + (timeSlot * 4) + Math.floor(Math.random() * 3);
  const departureMinute = Math.floor(Math.random() * 60);
  
  const departureDate = new Date(date);
  departureDate.setUTCHours(departureHour, departureMinute, 0, 0);
  
  const arrivalDate = new Date(departureDate);
  arrivalDate.setUTCHours(
    departureDate.getUTCHours() + Math.floor(duration.hours),
    departureDate.getUTCMinutes() + Math.floor(duration.minutes),
    0, 0
  );
  
  return {
    departureAirport: from,
    arrivalAirport: to,
    departureDateTime: departureDate.toISOString(),
    arrivalDateTime: arrivalDate.toISOString(),
    airline: airline,
    class: flightClass,
    price: price
  };
}

// Function to generate flights for a date range
async function generateFlightsForDateRange(startDate, endDate) {
  const flights = [];
  const currentDate = new Date(startDate);
  const endDateTime = new Date(endDate);
  
  while (currentDate <= endDateTime) {
    // Generate flights for each airport pair
    for (const from of Object.keys(airports)) {
      for (const to of Object.keys(airports)) {
        if (from !== to) {
          // Find suitable airlines for this route
          const suitableAirlines = Object.entries(airlines)
            .filter(([_, routes]) => routes.includes(from) && routes.includes(to))
            .map(([airline]) => airline);
          
          if (suitableAirlines.length > 0) {
            // Generate exactly 4 flights for this route
            for (let flightNumber = 1; flightNumber <= 4; flightNumber++) {
              const airline = suitableAirlines[Math.floor(Math.random() * suitableAirlines.length)];
              
              // Generate flights for each class
              for (const flightClass of Object.keys(flightClasses)) {
                flights.push(generateFlight(from, to, currentDate, airline, flightClass, flightNumber));
              }
            }
          }
        }
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return flights;
}

// Main execution
async function main() {
  try {
    // Generate flights for the specified date range
    const startDate = new Date('2025-04-07');
    const endDate = new Date('2025-12-31');
    const allFlights = await generateFlightsForDateRange(startDate, endDate);

    // Insert flights into MongoDB in batches
    const batchSize = 1000;
    let insertedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < allFlights.length; i += batchSize) {
      const batch = allFlights.slice(i, i + batchSize);
      try {
        await Flights.insertMany(batch, { ordered: false });
        insertedCount += batch.length;
        console.log(`Inserted flights ${i + 1} to ${Math.min(i + batchSize, allFlights.length)} of ${allFlights.length}`);
      } catch (error) {
        if (error.writeErrors) {
          skippedCount += error.writeErrors.length;
          insertedCount += batch.length - error.writeErrors.length;
          console.log(`Skipped ${error.writeErrors.length} duplicate flights in batch ${i + 1} to ${Math.min(i + batchSize, allFlights.length)}`);
        } else {
          throw error;
        }
      }
    }

    console.log(`Insertion complete! Inserted ${insertedCount} new flights, skipped ${skippedCount} duplicates`);

    // Write flights to separate files by route
    const routeFiles = {};
    allFlights.forEach(flight => {
      const routeKey = `${flight.departureAirport}_${flight.arrivalAirport}`;
      if (!routeFiles[routeKey]) {
        routeFiles[routeKey] = [];
      }
      routeFiles[routeKey].push(flight);
    });

    // Write each route to its own file
    Object.entries(routeFiles).forEach(([route, flights]) => {
      const fileName = `public/seedData/${route}_flights.json`;
      fs.writeFileSync(fileName, JSON.stringify(flights, null, 2));
      console.log(`Generated ${flights.length} flights for route ${route}`);
    });

    console.log('Flight generation and database insertion complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 