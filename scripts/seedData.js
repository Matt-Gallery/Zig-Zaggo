import mongoose from 'mongoose';
import Flight from '../models/flight.js';
import Hotel from '../models/hotel.js';
import dotenv from 'dotenv';

dotenv.config();

const airlines = ['American Airlines', 'British Airways', 'Air France', 'Delta', 'United'];
const aircraft = ['Boeing 777', 'Airbus A380', 'Boeing 787', 'Airbus A350'];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zigzaggo';
    console.log('Connecting to MongoDB at:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Flight.deleteMany({});
    await Hotel.deleteMany({});
    console.log('Existing data cleared');

    // Create flights
    const flights = [];
    const airports = ['JFK', 'LHR', 'CDG'];
    const classes = ['economy', 'business', 'first'];

    console.log('Generating flight data...');
    for (const from of airports) {
      for (const to of airports) {
        if (from !== to) {
          for (const flightClass of classes) {
            const basePrice = flightClass === 'economy' ? 500 : (flightClass === 'business' ? 2000 : 5000);
            
            flights.push({
              airline: airlines[Math.floor(Math.random() * airlines.length)],
              flightNumber: `${airlines[0].substring(0, 2)}${Math.floor(Math.random() * 1000)}`,
              departureAirport: from,
              arrivalAirport: to,
              aircraft: aircraft[Math.floor(Math.random() * aircraft.length)],
              class: flightClass,
              price: basePrice + Math.floor(Math.random() * 500),
              seatsAvailable: Math.floor(Math.random() * 50) + 10
            });
          }
        }
      }
    }

    console.log(`Generated ${flights.length} flights`);
    console.log('Sample flight:', flights[0]);

    const insertedFlights = await Flight.insertMany(flights);
    console.log(`${insertedFlights.length} flights seeded successfully`);

    // Create hotels
    const hotels = [
      {
        name: 'The Ritz London',
        city: 'LHR',
        address: '150 Piccadilly, St. James\'s, London W1J 9BR, UK',
        rating: 5,
        pricePerNight: 800,
        amenities: ['Spa', 'Restaurant', 'Bar', 'Gym', 'Pool'],
        roomsAvailable: 20,
        images: ['https://example.com/ritz1.jpg'],
        description: 'Luxury hotel in the heart of London'
      },
      {
        name: 'London Hilton',
        city: 'LHR',
        address: '22 Park Lane, London W1K 1BE, UK',
        rating: 4,
        pricePerNight: 400,
        amenities: ['Restaurant', 'Bar', 'Gym'],
        roomsAvailable: 30,
        images: ['https://example.com/hilton1.jpg'],
        description: 'Modern hotel with great city views'
      },
      {
        name: 'Ritz Paris',
        city: 'CDG',
        address: '15 Place Vendôme, 75001 Paris, France',
        rating: 5,
        pricePerNight: 1000,
        amenities: ['Spa', 'Restaurant', 'Bar', 'Gym', 'Pool'],
        roomsAvailable: 15,
        images: ['https://example.com/ritzparis1.jpg'],
        description: 'Iconic luxury hotel in Paris'
      },
      {
        name: 'Mercure Paris',
        city: 'CDG',
        address: '20 Rue de la Paix, 75002 Paris, France',
        rating: 3,
        pricePerNight: 200,
        amenities: ['Restaurant', 'Bar'],
        roomsAvailable: 40,
        images: ['https://example.com/mercure1.jpg'],
        description: 'Comfortable hotel in central Paris'
      }
    ];

    console.log('Inserting hotels...');
    const insertedHotels = await Hotel.insertMany(hotels);
    console.log(`${insertedHotels.length} hotels seeded successfully`);

    // Verify the data
    const flightCount = await Flight.countDocuments();
    const hotelCount = await Hotel.countDocuments();
    console.log('Database seeded successfully');
    console.log(`Final count - Flights: ${flightCount}, Hotels: ${hotelCount}`);

    // Sample queries to verify searchability
    const sampleFlights = await Flight.find({
      departureAirport: 'JFK',
      arrivalAirport: 'LHR',
      class: 'economy'
    }).limit(1);
    
    console.log('Sample JFK->LHR economy flight:', sampleFlights[0] || 'None found');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error. Make sure MongoDB is running and accessible.');
    }
    if (error.name === 'MongoNetworkError') {
      console.error('MongoDB Network Error. Check your connection and MongoDB URI.');
    }
    process.exit(1);
  }
};

seedDatabase(); 