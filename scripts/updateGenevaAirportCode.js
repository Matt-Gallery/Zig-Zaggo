// ChatGPT and Cursor used extensively throughout

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define the Flight model
const Flight = mongoose.model('Flight', new mongoose.Schema({
  departureAirport: String,
  arrivalAirport: String,
  // Add other fields as needed
}));

async function updateGenevaAirportCode() {
  try {
    // Find all flights with GVE as departure or arrival airport
    const flightsToUpdate = await Flight.find({
      $or: [
        { departureAirport: 'GVE' },
        { arrivalAirport: 'GVE' }
      ]
    });

    console.log(`Found ${flightsToUpdate.length} flights with GVE airport code`);

    // Update each flight
    let updatedCount = 0;
    for (const flight of flightsToUpdate) {
      const updates = {};
      
      if (flight.departureAirport === 'GVE') {
        updates.departureAirport = 'GVA';
      }
      
      if (flight.arrivalAirport === 'GVE') {
        updates.arrivalAirport = 'GVA';
      }
      
      await Flight.updateOne(
        { _id: flight._id },
        { $set: updates }
      );
      
      updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} flights`);
    
    // Also update the airportToCityMap in the database if it exists
    const AirportMap = mongoose.model('AirportMap', new mongoose.Schema({
      code: String,
      city: String
    }));
    
    // Check if there's an entry for GVE
    const genevaEntry = await AirportMap.findOne({ code: 'GVE' });
    if (genevaEntry) {
      await AirportMap.updateOne(
        { code: 'GVE' },
        { $set: { code: 'GVA' } }
      );
      console.log('Updated Geneva airport code in AirportMap collection');
    }
    
    console.log('Update completed successfully');
  } catch (error) {
    console.error('Error updating Geneva airport code:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the update function
updateGenevaAirportCode(); 