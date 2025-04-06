import mongoose from 'mongoose';
import { Flights, Hotels } from './models/resOptions.js';
import dotenv from 'dotenv';

dotenv.config();

async function runDebugChecks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Check flights
    const routes = [
      ["JFK", "FCO"],
      ["JFK", "LHR"],
      ["JFK", "CDG"],
      ["JFK", "NCE"],
      ["JFK", "GVE"],
      ["FCO", "LHR"],
      ["LHR", "CDG"],
      ["CDG", "NCE"],
      ["NCE", "GVE"],
      ["LHR", "GVE"]
    ];

    console.log("✈️  Checking flight availability...");
    for (const [from, to] of routes) {
      const count = await Flights.countDocuments({
        departureAirport: from,
        arrivalAirport: to,
        departureDateTime: { $gte: new Date("2025-08-01") },
      });
      console.log(`   ${from} → ${to}: ${count} flights`);
    }

    // Check hotels
    console.log("\n🏨 Checking hotel availability (by star rating)...");

    const cities = ["Rome", "London", "Paris", "Nice", "Geneva"];
    for (const city of cities) {
      const total = await Hotels.countDocuments({ hotelCity: city });
      const stars3 = await Hotels.countDocuments({ hotelCity: city, hotelStars: { $gte: 3 } });
      const stars4 = await Hotels.countDocuments({ hotelCity: city, hotelStars: { $gte: 4 } });
      const stars5 = await Hotels.countDocuments({ hotelCity: city, hotelStars: { $gte: 5 } });

      console.log(`   ${city}: total=${total}, ⭐️3+=${stars3}, ⭐️4+=${stars4}, ⭐️5=${stars5}`);
    }

    await mongoose.disconnect();
    console.log("\n🔌 MongoDB disconnected");
  } catch (err) {
    console.error("❌ Error during debug:", err);
  }
}

runDebugChecks();
