import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Train from '../models/train.js';
import Ferry from '../models/ferry.js';
import Bus from '../models/bus.js';

dotenv.config();

// Define realistic city pairs for each mode of transport
const TRAVEL_ROUTES = {
  train: [
    // Eurostar and TGV routes
    ['London', 'Paris'],
    ['Paris', 'Geneva'],
    ['Paris', 'Nice'],
    ['Geneva', 'Nice'],
    ['Paris', 'Rome'] // Via TGV and connecting services
  ],
  ferry: [
    // Cross-channel and Mediterranean routes
    ['London', 'Paris'], // Via Dover-Calais
    ['Nice', 'Rome']  // Mediterranean route
  ],
  bus: [
    // Coach services
    ['London', 'Paris'],
    ['Paris', 'Geneva'],
    ['Geneva', 'Nice'],
    ['Nice', 'Rome'],
    ['Paris', 'Nice']
  ]
};

// Carrier information
const CARRIERS = {
  train: ['Eurostar', 'TGV', 'SNCF', 'Trenitalia', 'Swiss Railways'],
  ferry: ['P&O Ferries', 'DFDS Seaways', 'Corsica Ferries', 'Grimaldi Lines'],
  bus: ['FlixBus', 'Eurolines', 'BlaBlaBus', 'National Express']
};

// Price ranges for each mode (in USD)
const PRICE_RANGES = {
  train: { min: 50, max: 250 },
  ferry: { min: 30, max: 150 },
  bus: { min: 20, max: 100 }
};

// Duration ranges for each route and mode (in minutes)
const DURATION_RANGES = {
  train: {
    'London-Paris': { min: 135, max: 150 },
    'Paris-Geneva': { min: 180, max: 210 },
    'Paris-Nice': { min: 330, max: 360 },
    'Geneva-Nice': { min: 300, max: 330 },
    'Paris-Rome': { min: 600, max: 660 }
  },
  ferry: {
    'London-Paris': { min: 510, max: 540 }, // Including transfer time
    'Nice-Rome': { min: 600, max: 720 }
  },
  bus: {
    'London-Paris': { min: 420, max: 480 },
    'Paris-Geneva': { min: 360, max: 420 },
    'Geneva-Nice': { min: 480, max: 540 },
    'Nice-Rome': { min: 540, max: 600 },
    'Paris-Nice': { min: 720, max: 780 }
  }
};

// Helper function to generate random number within range
const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to format route key
const getRouteKey = (from, to) => `${from}-${to}`;

// Helper function to generate departure times throughout the day
const generateDepartureTimes = (date) => {
  const times = [];
  const startHour = 6; // Start at 6 AM
  const endHour = 20; // End at 8 PM
  
  for (let i = 0; i < 5; i++) {
    const hour = randomInRange(startHour, endHour);
    const minute = randomInRange(0, 59);
    const departureTime = new Date(date);
    departureTime.setHours(hour, minute, 0, 0);
    times.push(departureTime);
  }
  
  return times.sort((a, b) => a - b);
};

// Generate a single travel record
const generateTravelRecord = (mode, from, to, departureTime) => {
  const routeKey = getRouteKey(from, to);
  const duration = DURATION_RANGES[mode][routeKey] 
    ? randomInRange(DURATION_RANGES[mode][routeKey].min, DURATION_RANGES[mode][routeKey].max)
    : randomInRange(180, 720); // fallback duration

  const arrivalTime = new Date(departureTime.getTime() + duration * 60000);
  const price = randomInRange(PRICE_RANGES[mode].min, PRICE_RANGES[mode].max);
  const carrier = CARRIERS[mode][randomInRange(0, CARRIERS[mode].length - 1)];
  
  return {
    departureLocation: from,
    arrivalLocation: to,
    departureDateAndTime: departureTime,
    arrivalDateAndTime: arrivalTime,
    durationInMinutes: duration,
    numberOfStops: randomInRange(0, 2),
    carrier,
    price,
    currency: 'USD',
    travelMode: mode
  };
};

// Main function to generate all travel data
async function generateAllTravelData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zigzaggo');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Train.deleteMany({}),
      Ferry.deleteMany({}),
      Bus.deleteMany({})
    ]);
    console.log('Cleared existing data');

    const startDate = new Date('2025-05-29');
    const endDate = new Date('2025-12-31');
    
    // Generate data for each day
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      for (const mode of Object.keys(TRAVEL_ROUTES)) {
        for (const [from, to] of TRAVEL_ROUTES[mode]) {
          // Generate routes in both directions
          const departureTimes = generateDepartureTimes(date);
          const returnDepartureTimes = generateDepartureTimes(date);
          
          // Forward direction
          const forwardRoutes = departureTimes.map(time => 
            generateTravelRecord(mode, from, to, time)
          );
          
          // Return direction
          const returnRoutes = returnDepartureTimes.map(time =>
            generateTravelRecord(mode, to, from, time)
          );

          // Save the records using the appropriate model
          const Model = {
            train: Train,
            ferry: Ferry,
            bus: Bus
          }[mode];

          await Model.insertMany([...forwardRoutes, ...returnRoutes]);
        }
      }
      
      console.log(`Generated data for ${date.toISOString().split('T')[0]}`);
    }

    console.log('Data generation completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error generating data:', error);
    process.exit(1);
  }
}

// Run the generator
generateAllTravelData(); 