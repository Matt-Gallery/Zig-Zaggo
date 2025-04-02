// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import { Flights } from './models/resOptions.js';
// import { readFile } from 'fs/promises';
// import path from 'path';
// import { fileURLToPath } from 'url';

// dotenv.config();

// // Resolve __dirname in ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // List of JSON files to seed
// const flightFiles = [
//   'JFK_All_Routes_flights.json',
//   'LHR_All_Routes_flights.json',
//   'FCO_All_Routes_flights.json',
//   'CDG_All_Routes_flights.json',
//   'NCE_GVE_flights.json',
// ];

// // MongoDB URI from .env
// const mongoURI = process.env.MONGODB_URI;

// async function seedFlights() {
//   try {
//     await mongoose.connect(mongoURI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('✅ MongoDB connected');

//     await Flights.deleteMany({});
//     console.log('🧹 Cleared existing Flights collection');

//     // Loop through and seed each file
//     for (const file of flightFiles) {
//       const filePath = path.join(__dirname, 'public', file);
//       const flightData = JSON.parse(await readFile(filePath, 'utf-8'));
//       await Flights.insertMany(flightData);
//       console.log(`📦 Seeded ${flightData.length} flights from ${file}`);
//     }

//     console.log('✈️ All flights seeded successfully');
//     await mongoose.disconnect();
//     console.log('🔌 MongoDB disconnected');
//   } catch (err) {
//     console.error('❌ Error seeding flights:', err);
//     process.exit(1);
//   }
// }

// seedFlights();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Hotels } from './models/resOptions.js';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to hotel data JSON
const hotelFilePath = path.join(__dirname, 'public', 'hotels_aug_sep_2025_final_named.json');

// MongoDB URI from .env
const mongoURI = process.env.MONGODB_URI;

async function seedHotels() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    const hotelData = JSON.parse(await readFile(hotelFilePath, 'utf-8'));

    await Hotels.deleteMany({});
    console.log('🧹 Cleared existing Hotels collection');

    await Hotels.insertMany(hotelData);
    console.log(`🏨 Seeded ${hotelData.length} hotels from ${hotelFilePath}`);

    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  } catch (err) {
    console.error('❌ Error seeding hotels:', err);
    process.exit(1);
  }
}

seedHotels();
