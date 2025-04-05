import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Hotels } from '../models/resOptions.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Airport to city mapping
const airportToCityMap = {
  LHR: "London",
  FCO: "Rome",
  NCE: "Nice",
  GVE: "Geneva",
  JFK: "New York",
  CDG: "Paris"
};

// Hotel name templates for each star rating and city
const hotelNameTemplates = {
  London: {
    1: [
      "Generator London",
      "Safestay London Elephant & Castle",
      "Wombat's City Hostel London",
      "YHA London St Pancras",
      "Smart Russell Square",
      "The Walrus Hostel",
      "Clink261 Hostel",
      "Palmer's Lodge Swiss Cottage",
      "Astor Hyde Park",
      "YHA London Central"
    ],
    2: [
      "Travelodge London Central City Road",
      "Premier Inn London City (Aldgate)",
      "Ibis London City - Shoreditch",
      "Travelodge London Central Southwark",
      "Premier Inn London County Hall",
      "Ibis London Blackfriars",
      "Travelodge London Central Kings Cross",
      "Premier Inn London Southwark (Bankside)",
      "Ibis London Earls Court",
      "Travelodge London Central Marylebone"
    ],
    3: [
      "Comfort Inn Kings Cross",
      "Holiday Inn Express London - Southwark",
      "Hampton by Hilton London Waterloo",
      "Holiday Inn Express London - Greenwich",
      "Comfort Inn Victoria",
      "Holiday Inn Express London - Stratford",
      "Hampton by Hilton London Docklands",
      "Holiday Inn Express London - Royal Docks",
      "Comfort Inn Vauxhall",
      "Holiday Inn Express London - City"
    ],
    4: [
      "The Tower Hotel",
      "Park Plaza Westminster Bridge",
      "DoubleTree by Hilton London - Tower of London",
      "Park Plaza County Hall London",
      "DoubleTree by Hilton London - Docklands",
      "Park Plaza London Riverbank",
      "DoubleTree by Hilton London - Westminster",
      "Park Plaza London Waterloo",
      "DoubleTree by Hilton London - Victoria",
      "Park Plaza London Victoria"
    ],
    5: [
      "The Ritz London",
      "The Dorchester",
      "Claridge's",
      "The Savoy",
      "The Langham London",
      "The Connaught",
      "The Berkeley",
      "The Goring",
      "Brown's Hotel",
      "The Lanesborough"
    ]
  },
  Rome: {
    1: [
      "Hostel Mosaic",
      "The Yellow",
      "Hostel Trustever",
      "Hostel Roma",
      "Hostel Beautiful 2",
      "Hostel M&J",
      "Hostel Mosaic Centrale",
      "Hostel Trustever 2",
      "Hostel Beautiful",
      "Hostel M&J Centrale"
    ],
    2: [
      "Hotel Artemide",
      "Hotel Selene",
      "Hotel Nardizzi Americana",
      "Hotel Mosaic Central",
      "Hotel Artemide 2",
      "Hotel Selene Centrale",
      "Hotel Nardizzi",
      "Hotel Mosaic",
      "Hotel Artemide Centrale",
      "Hotel Selene 2"
    ],
    3: [
      "Hotel Quirinale",
      "Hotel Artemide",
      "Hotel Selene",
      "Hotel Nardizzi Americana",
      "Hotel Mosaic Central",
      "Hotel Quirinale 2",
      "Hotel Artemide 2",
      "Hotel Selene Centrale",
      "Hotel Nardizzi",
      "Hotel Mosaic"
    ],
    4: [
      "Hotel Artemide",
      "Hotel Selene",
      "Hotel Nardizzi Americana",
      "Hotel Mosaic Central",
      "Hotel Quirinale",
      "Hotel Artemide 2",
      "Hotel Selene Centrale",
      "Hotel Nardizzi",
      "Hotel Mosaic",
      "Hotel Quirinale 2"
    ],
    5: [
      "Hotel de Russie",
      "Hotel Eden",
      "Hotel Hassler Roma",
      "Hotel de la Ville",
      "Hotel Splendide Royal",
      "Hotel de Russie 2",
      "Hotel Eden 2",
      "Hotel Hassler Roma 2",
      "Hotel de la Ville 2",
      "Hotel Splendide Royal 2"
    ]
  },
  Nice: {
    1: [
      "Villa Saint Exupery Beach",
      "Villa Saint Exupery Gardens",
      "Villa Saint Exupery",
      "Villa Saint Exupery Beach 2",
      "Villa Saint Exupery Gardens 2",
      "Villa Saint Exupery 2",
      "Villa Saint Exupery Beach 3",
      "Villa Saint Exupery Gardens 3",
      "Villa Saint Exupery 3",
      "Villa Saint Exupery Beach 4"
    ],
    2: [
      "Hotel Nice Riviera",
      "Hotel Nice Riviera 2",
      "Hotel Nice Riviera 3",
      "Hotel Nice Riviera 4",
      "Hotel Nice Riviera 5",
      "Hotel Nice Riviera 6",
      "Hotel Nice Riviera 7",
      "Hotel Nice Riviera 8",
      "Hotel Nice Riviera 9",
      "Hotel Nice Riviera 10"
    ],
    3: [
      "Hotel Nice Riviera",
      "Hotel Nice Riviera 2",
      "Hotel Nice Riviera 3",
      "Hotel Nice Riviera 4",
      "Hotel Nice Riviera 5",
      "Hotel Nice Riviera 6",
      "Hotel Nice Riviera 7",
      "Hotel Nice Riviera 8",
      "Hotel Nice Riviera 9",
      "Hotel Nice Riviera 10"
    ],
    4: [
      "Hotel Nice Riviera",
      "Hotel Nice Riviera 2",
      "Hotel Nice Riviera 3",
      "Hotel Nice Riviera 4",
      "Hotel Nice Riviera 5",
      "Hotel Nice Riviera 6",
      "Hotel Nice Riviera 7",
      "Hotel Nice Riviera 8",
      "Hotel Nice Riviera 9",
      "Hotel Nice Riviera 10"
    ],
    5: [
      "Hotel Negresco",
      "Hotel Negresco 2",
      "Hotel Negresco 3",
      "Hotel Negresco 4",
      "Hotel Negresco 5",
      "Hotel Negresco 6",
      "Hotel Negresco 7",
      "Hotel Negresco 8",
      "Hotel Negresco 9",
      "Hotel Negresco 10"
    ]
  },
  Geneva: {
    1: [
      "City Hostel Geneva",
      "City Hostel Geneva 2",
      "City Hostel Geneva 3",
      "City Hostel Geneva 4",
      "City Hostel Geneva 5",
      "City Hostel Geneva 6",
      "City Hostel Geneva 7",
      "City Hostel Geneva 8",
      "City Hostel Geneva 9",
      "City Hostel Geneva 10"
    ],
    2: [
      "Hotel Geneva",
      "Hotel Geneva 2",
      "Hotel Geneva 3",
      "Hotel Geneva 4",
      "Hotel Geneva 5",
      "Hotel Geneva 6",
      "Hotel Geneva 7",
      "Hotel Geneva 8",
      "Hotel Geneva 9",
      "Hotel Geneva 10"
    ],
    3: [
      "Hotel Geneva",
      "Hotel Geneva 2",
      "Hotel Geneva 3",
      "Hotel Geneva 4",
      "Hotel Geneva 5",
      "Hotel Geneva 6",
      "Hotel Geneva 7",
      "Hotel Geneva 8",
      "Hotel Geneva 9",
      "Hotel Geneva 10"
    ],
    4: [
      "Hotel Geneva",
      "Hotel Geneva 2",
      "Hotel Geneva 3",
      "Hotel Geneva 4",
      "Hotel Geneva 5",
      "Hotel Geneva 6",
      "Hotel Geneva 7",
      "Hotel Geneva 8",
      "Hotel Geneva 9",
      "Hotel Geneva 10"
    ],
    5: [
      "Four Seasons Hotel des Bergues Geneva",
      "Four Seasons Hotel des Bergues Geneva 2",
      "Four Seasons Hotel des Bergues Geneva 3",
      "Four Seasons Hotel des Bergues Geneva 4",
      "Four Seasons Hotel des Bergues Geneva 5",
      "Four Seasons Hotel des Bergues Geneva 6",
      "Four Seasons Hotel des Bergues Geneva 7",
      "Four Seasons Hotel des Bergues Geneva 8",
      "Four Seasons Hotel des Bergues Geneva 9",
      "Four Seasons Hotel des Bergues Geneva 10"
    ]
  },
  "New York": {
    1: [
      "HI NYC Hostel",
      "HI NYC Hostel 2",
      "HI NYC Hostel 3",
      "HI NYC Hostel 4",
      "HI NYC Hostel 5",
      "HI NYC Hostel 6",
      "HI NYC Hostel 7",
      "HI NYC Hostel 8",
      "HI NYC Hostel 9",
      "HI NYC Hostel 10"
    ],
    2: [
      "Hotel New York",
      "Hotel New York 2",
      "Hotel New York 3",
      "Hotel New York 4",
      "Hotel New York 5",
      "Hotel New York 6",
      "Hotel New York 7",
      "Hotel New York 8",
      "Hotel New York 9",
      "Hotel New York 10"
    ],
    3: [
      "Hotel New York",
      "Hotel New York 2",
      "Hotel New York 3",
      "Hotel New York 4",
      "Hotel New York 5",
      "Hotel New York 6",
      "Hotel New York 7",
      "Hotel New York 8",
      "Hotel New York 9",
      "Hotel New York 10"
    ],
    4: [
      "Hotel New York",
      "Hotel New York 2",
      "Hotel New York 3",
      "Hotel New York 4",
      "Hotel New York 5",
      "Hotel New York 6",
      "Hotel New York 7",
      "Hotel New York 8",
      "Hotel New York 9",
      "Hotel New York 10"
    ],
    5: [
      "The Plaza",
      "The Plaza 2",
      "The Plaza 3",
      "The Plaza 4",
      "The Plaza 5",
      "The Plaza 6",
      "The Plaza 7",
      "The Plaza 8",
      "The Plaza 9",
      "The Plaza 10"
    ]
  },
  Paris: {
    1: [
      "Generator Paris",
      "Generator Paris 2",
      "Generator Paris 3",
      "Generator Paris 4",
      "Generator Paris 5",
      "Generator Paris 6",
      "Generator Paris 7",
      "Generator Paris 8",
      "Generator Paris 9",
      "Generator Paris 10"
    ],
    2: [
      "Hotel Paris",
      "Hotel Paris 2",
      "Hotel Paris 3",
      "Hotel Paris 4",
      "Hotel Paris 5",
      "Hotel Paris 6",
      "Hotel Paris 7",
      "Hotel Paris 8",
      "Hotel Paris 9",
      "Hotel Paris 10"
    ],
    3: [
      "Hotel Paris",
      "Hotel Paris 2",
      "Hotel Paris 3",
      "Hotel Paris 4",
      "Hotel Paris 5",
      "Hotel Paris 6",
      "Hotel Paris 7",
      "Hotel Paris 8",
      "Hotel Paris 9",
      "Hotel Paris 10"
    ],
    4: [
      "Hotel Paris",
      "Hotel Paris 2",
      "Hotel Paris 3",
      "Hotel Paris 4",
      "Hotel Paris 5",
      "Hotel Paris 6",
      "Hotel Paris 7",
      "Hotel Paris 8",
      "Hotel Paris 9",
      "Hotel Paris 10"
    ],
    5: [
      "Hotel de Paris",
      "Hotel de Paris 2",
      "Hotel de Paris 3",
      "Hotel de Paris 4",
      "Hotel de Paris 5",
      "Hotel de Paris 6",
      "Hotel de Paris 7",
      "Hotel de Paris 8",
      "Hotel de Paris 9",
      "Hotel de Paris 10"
    ]
  }
};

// Base prices for each star rating
const basePrices = {
  1: 80,
  2: 120,
  3: 200,
  4: 350,
  5: 500
};

// Function to generate availability for a date range
function generateAvailability(startDate, endDate, basePrice, stars) {
  const availability = [];
  const currentDate = new Date(startDate);
  const endDateTime = new Date(endDate);
  
  // Price multipliers based on star rating
  const starMultipliers = {
    1: 0.5,  // 50% of base price
    2: 0.75, // 75% of base price
    3: 1,    // 100% of base price
    4: 1.5,  // 150% of base price
    5: 2     // 200% of base price
  };
  
  // Seasonal price variations (higher in summer)
  const getSeasonalMultiplier = (date) => {
    const month = date.getMonth();
    // Summer months (June-August) have higher prices
    if (month >= 5 && month <= 7) return 1.3;
    // Spring and fall (March-May, September-November) have medium prices
    if ((month >= 2 && month <= 4) || (month >= 8 && month <= 10)) return 1.1;
    // Winter months have lower prices
    return 1;
  };
  
  while (currentDate <= endDateTime) {
    // 75% chance of having rooms available
    if (Math.random() < 0.75) {
      const seasonalMultiplier = getSeasonalMultiplier(currentDate);
      const starMultiplier = starMultipliers[stars] || 1; // Default to 1 if stars not found
      
      // Calculate price for this date with safeguards against NaN
      const randomVariation = 0.9 + Math.random() * 0.2; // Between 0.9 and 1.1
      const priceForDate = Math.round(
        basePrice * 
        starMultiplier * 
        seasonalMultiplier * 
        randomVariation
      );
      
      // Ensure price is a valid number and not negative
      if (!isNaN(priceForDate) && priceForDate > 0) {
        availability.push({
          date: new Date(currentDate),
          priceForDate
        });
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return availability;
}

// Generate hotels for each city and star rating
function generateHotels() {
  const hotels = [];
  
  for (const [airportCode, city] of Object.entries(airportToCityMap)) {
    // Generate 10 hotels for each star rating (1, 2, 3, 4, 5)
    for (const stars of [1, 2, 3, 4, 5]) {
      for (let i = 0; i < 10; i++) {
        const hotelName = hotelNameTemplates[city][stars][i];
        hotels.push({
          hotelName,
          hotelCity: city,
          hotelStars: stars
        });
      }
    }
  }
  
  return hotels;
}

// Main execution
async function main() {
  try {
    // Clear existing hotels
    await Hotels.deleteMany({});
    console.log('Cleared existing hotels from database');

    const startDate = new Date('2025-04-07');
    const endDate = new Date('2025-12-31');
    
    // Generate all hotels
    const allHotels = generateHotels();
    console.log(`Generated ${allHotels.length} hotels (10 hotels × 5 star ratings × ${Object.keys(airportToCityMap).length} cities)`);
    
    // Add availability to each hotel
    const hotelsWithAvailability = allHotels.map(hotel => ({
      ...hotel,
      availability: generateAvailability(startDate, endDate, basePrices[hotel.hotelStars], hotel.hotelStars)
    }));
    
    // Insert hotels into MongoDB
    await Hotels.insertMany(hotelsWithAvailability);
    console.log(`Inserted ${hotelsWithAvailability.length} hotels with availability data`);
    
    // Write to JSON file
    fs.writeFileSync(
      'public/seedData/hotels_with_availability.json',
      JSON.stringify(hotelsWithAvailability, null, 2)
    );
    console.log('Generated hotels_with_availability.json');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 