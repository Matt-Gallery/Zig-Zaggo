import express from "express";
import { Flights, Hotels } from "../models/resOptions.js";
import mongoose from "mongoose";

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

// Route to render the search form
router.get("/", (req, res) => {
  // Get data from session
  const searchResults = req.session.searchResults || [];
  const errorMessage = req.session.searchError || null;
  const requestBody = req.session.searchData || {};
  const hasSearched = req.session.hasSearched || false;
  
  // Clear session data after retrieving it
  delete req.session.searchResults;
  delete req.session.searchError;
  delete req.session.searchData;
  delete req.session.hasSearched;
  
  // Render the page with the data
  res.render("search/index", { 
    searchResults, 
    errorMessage: hasSearched ? errorMessage : null,
    requestBody,
    clearForm: false
  });
});

router.get("/flights", async (req, res) => {
  try {
    const flights = await Flights.find({});
    res.json(flights);
  } catch (error) {
    console.error("Error fetching flights:", error);
    res.status(500).send("Internal Server Error");
  }
})

// Route to get all airport codes for preloading
router.get("/airport-codes", async (req, res) => {
  try {
    const flights = await Flights.find({}, 'departureAirport');
    const airportCodes = [...new Set(flights.map(flight => flight.departureAirport))];
    res.json(airportCodes);
  } catch (err) {
    console.error('Error fetching airport codes:', err);
    res.status(500).json({ error: 'Failed to fetch airport codes' });
  }
});

// Route to handle search submissions
router.post("/", async (req, res) => {
  try {
    const {
      departureAirport,
      departureDate,
      returnAirport,
      returnFlightClass,
      "cityStops[]": rawCityStops = [],
      "days[]": rawDays = [],
      "flightClass[]": rawFlightClass = [],
    } = req.body;

    // Validate return airport
    if (!returnAirport || returnAirport.trim() === '') {
      req.session.searchError = "Please choose a return airport";
      req.session.searchData = req.body;
      req.session.hasSearched = true;
      return res.redirect("/search");
    }

    // Extract hotel ratings
    const hotelRatings = [];
    for (let i = 0; i < 4; i++) {
      hotelRatings.push(req.body[`hotelRatings[${i}]`] || "1");
    }

    const startDate = new Date(departureDate);
    if (isNaN(startDate)) {
      console.error("Invalid departure date provided.");
      // Store error in session and redirect
      req.session.searchError = "Invalid departure date.";
      req.session.searchData = req.body;
      req.session.hasSearched = true;
      return res.redirect("/search");
    }

    // Construct city stops array - this contains how many days you want to stay in each city
    //  based on the airport code and contains the flight class and hotel stars
    const cityStops = rawCityStops
      .map((city, i) => ({
        city,
        days: parseInt(rawDays[i], 10) || 1,
        minHotelStars: parseInt(hotelRatings[i], 10) || 1,
        flightClass: rawFlightClass[i] || "economy",
      }))
      .filter((stop) => stop.city && stop.city.trim() !== "");

    // Step 1: Determine all possible trip leg permutations
    const permutations = getPermutations(cityStops);

    // Step 2: Determine the dates on which each flight between cities can occur
    const flightDates = determineFlightDates(
      permutations,
      startDate,
      departureAirport,
      returnAirport
    );

    // Step 3: Fetch only the flights between those cities for those dates
    const flightMap = await fetchFlights(flightDates);

    // Step 4: Determine all the dates that a hotel stay can occur in each city
    const hotelDates = determineHotelDates(permutations, startDate);

    // Step 5: Fetch only the hotel information for those dates and star ratings
    const hotelCriteria = cityStops
      .map((stop) => {
        const cityName = airportToCityMap[stop.city];
        const dates = hotelDates[stop.city];
        return {
          city: cityName,
          minHotelStars: stop.minHotelStars,
          hotelDates: dates ? dates[0] : null // Use the first date range for this city
        };
      })
      .filter((criteria) => criteria.city && criteria.hotelDates);

    const hotelMap = await fetchHotels(hotelCriteria);

    // Step 6: Use the fetched flight and hotel information to create all possible trip combinations
    const allResults = buildItineraries(
      permutations,
      flightMap,
      hotelMap,
      departureAirport,
      returnAirport,
      returnFlightClass,
      startDate
    );

    // Step 7: Store search results in session and redirect to GET route
    req.session.searchResults = allResults;
    req.session.searchData = req.body;
    req.session.hasSearched = true;
    req.session.searchError = allResults.length === 0
      ? "No matching trip options found. Try adjusting your dates or city stops."
      : null;
    
    return res.redirect("/search");
  } catch (error) {
    console.error("Error during search processing:", error);
    // Store error in session and redirect
    req.session.searchError = "An error occurred during the search. Please try again.";
    req.session.searchData = req.body;
    req.session.hasSearched = true;
    return res.redirect("/search");
  }
});

export default router;

// Helper function to generate permutations
function getPermutations(arr) {
  if (arr.length <= 1) return [arr];
  const results = [];

  function permute(current, remaining) {
    if (remaining.length === 0) {
      results.push(current);
    } else {
      for (let i = 0; i < remaining.length; i++) {
        const next = [...current, remaining[i]];
        const rest = remaining.slice(0, i).concat(remaining.slice(i + 1));
        permute(next, rest);
      }
    }
  }

  permute([], arr);
  return results;
}

// Step 2: Determine flight dates
function determineFlightDates(
  permutations,
  startDate,
  departureAirport,
  returnAirport
) {
  const flightDates = {};
  permutations.forEach((stops) => {
    let currentDate = new Date(startDate);
    let prev = departureAirport;
    stops.forEach((stop) => {
      const route = `${prev}->${stop.city}`;
      if (!flightDates[route]) {
        flightDates[route] = [];
      }
      flightDates[route].push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + stop.days);
      prev = stop.city;
    });
    const returnRoute = `${prev}->${returnAirport}`;
    if (!flightDates[returnRoute]) {
      flightDates[returnRoute] = [];
    }
    flightDates[returnRoute].push(new Date(currentDate));
  });
  return flightDates;
}

// Step 3: Fetch flights for specific dates
async function fetchFlights(flightDates) {
  const flightMap = {};
  for (const [route, dates] of Object.entries(flightDates)) {
    const [from, to] = route.split("->");
    flightMap[route] = [];

    for (const date of dates) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const flights = await Flights.find({
        departureAirport: from,
        arrivalAirport: to,
        departureDateTime: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }).sort({ price: 1 });

      flightMap[route].push(...flights);
    }
  }
  return flightMap;
}

// Step 4: Determine hotel dates
function determineHotelDates(permutations, startDate) {
  const hotelDates = {};
  permutations.forEach((stops) => {
    let currentDate = new Date(startDate);
    stops.forEach((stop) => {
      if (!hotelDates[stop.city]) {
        hotelDates[stop.city] = [];
      }
      hotelDates[stop.city].push({
        startDate: new Date(currentDate),
        endDate: new Date(
          currentDate.setDate(currentDate.getDate() + stop.days)
        ),
        minHotelStars: stop.minHotelStars,
      });
    });
  });
  return hotelDates;
}

// Step 5: Fetch hotels for specific dates and star ratings
async function fetchHotels(hotelCriteria) {
  const hotelMap = {};
  for (const criteria of hotelCriteria) {
    const { city, minHotelStars, hotelDates } = criteria;
    if (!city || !hotelDates) continue;
    
    // Convert hotelDates to Date objects if they're strings
    const startDate = new Date(hotelDates.startDate);
    const endDate = new Date(hotelDates.endDate);
    
    // Find hotels that match the city, star rating, and have availability for all dates in the range
    const hotels = await Hotels.find({
      hotelCity: city,
      hotelStars: { $gte: minHotelStars },
      'availability': {
        $all: [
          {
            $elemMatch: {
              date: {
                $gte: startDate,
                $lte: endDate
              }
            }
          }
        ]
      }
    })
      .select("hotelName availability")
      .sort({ 'availability.priceForDate': 1 })
      .exec();
    
    // Calculate average price for the stay
    const hotelsWithPrices = hotels.map(hotel => {
      // Get all availability entries for the date range
      const relevantAvailability = hotel.availability.filter(a => {
        const date = new Date(a.date);
        return date >= startDate && date <= endDate;
      });
      
      // Calculate average price for the stay
      const totalPrice = relevantAvailability.reduce((sum, a) => sum + a.priceForDate, 0);
      const averagePrice = totalPrice / relevantAvailability.length;
      
      return {
        ...hotel.toObject(),
        averagePricePerNight: Math.round(averagePrice)
      };
    });
    
    hotelMap[city] = hotelsWithPrices;
  }
  return hotelMap;
}

// Step 6: Build itineraries

// Function to calculate flight duration
function calculateDuration(departureTime, arrivalTime) {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  const durationMs = arrival - departure;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function buildItineraries(
  permutations,
  flightMap,
  hotelMap,
  departureAirport,
  returnAirport,
  returnFlightClass,
  startDate
) {
  const allResults = [];
  
  permutations.forEach((stops) => {
    let currentDate = new Date(startDate);
    let prev = departureAirport;
    const itinerary = [];
    let totalPrice = 0;
    let isValidItinerary = true;
    
    stops.forEach((stop) => {
      const route = `${prev}->${stop.city}`;
      const flights = (flightMap[route] || []).filter(
        (f) => f.class.toLowerCase() === stop.flightClass.toLowerCase()
      );
      
      if (flights.length > 0) {
        const selectedFlight = flights[0];
        
        // Select hotel
        const cityName = airportToCityMap[stop.city];
        const hotels = hotelMap[cityName] || [];
        
        // Check if any hotels are available for the entire stay
        let selectedHotel = null;
        let hotelPrice = 0;
        
        if (hotels.length > 0) {
          // Find a hotel that's available for the entire stay
          for (const hotel of hotels) {
            // Check if hotel has availability for all dates in the stay
            const stayStartDate = new Date(currentDate);
            const stayEndDate = new Date(currentDate);
            stayEndDate.setDate(stayEndDate.getDate() + stop.days - 1); // -1 because we count the first day
            
            // Create a set of all dates in the stay
            const stayDates = new Set();
            let checkDate = new Date(stayStartDate);
            while (checkDate <= stayEndDate) {
              stayDates.add(checkDate.toISOString().split('T')[0]);
              checkDate.setDate(checkDate.getDate() + 1);
            }
            
            // Check if hotel has availability for all dates
            const hotelAvailableDates = new Set(
              hotel.availability.map(a => new Date(a.date).toISOString().split('T')[0])
            );
            
            const isAvailableForEntireStay = Array.from(stayDates).every(
              date => hotelAvailableDates.has(date)
            );
            
            if (isAvailableForEntireStay) {
              selectedHotel = hotel;
              hotelPrice = hotel.averagePricePerNight * stop.days;
              break;
            }
          }
          
          // If no hotel is available for the entire stay, mark this itinerary as invalid
          if (!selectedHotel) {
            isValidItinerary = false;
          }
        }
        
        // Calculate flight duration
        const flightDuration = calculateDuration(
          selectedFlight.departureDateTime,
          selectedFlight.arrivalDateTime
        );
        
        // Continue building each itinerary leg
        const leg = {
          departureAirport: prev, // Previous stop or initial departure point
          arrivalAirport: stop.city, // Current stop's airport code
          departureTime: selectedFlight.departureDateTime,
          arrivalTime: selectedFlight.arrivalDateTime,
          airline: selectedFlight.airline,
          flightDuration: flightDuration,
          flightTime: flightDuration, // Add this to match the property name in results.ejs
          flightPrice: selectedFlight.price,
          hotelName: selectedHotel ? selectedHotel.hotelName : null,
          hotelPrice: hotelPrice,
        };
        
        itinerary.push(leg);
        totalPrice += leg.flightPrice + leg.hotelPrice;
        currentDate.setDate(currentDate.getDate() + stop.days);
      } else {
        // If no flights are available, mark this itinerary as invalid
        isValidItinerary = false;
      }
      
      prev = stop.city;
    });
    
    // Only add the itinerary if it's valid (has flights and hotels for all stops)
    if (isValidItinerary) {
      // Handle the return flight
      const returnRoute = `${prev}->${returnAirport}`;
      const returnFlights = (flightMap[returnRoute] || []).filter(
        (f) => f.class.toLowerCase() === returnFlightClass.toLowerCase()
      );
      
      if (returnFlights.length > 0) {
        const selectedReturnFlight = returnFlights[0];
        
        // Calculate return flight duration
        const returnFlightDuration = calculateDuration(
          selectedReturnFlight.departureDateTime,
          selectedReturnFlight.arrivalDateTime
        );
        
        const returnLeg = {
          departureAirport: selectedReturnFlight.departureAirport,
          arrivalAirport: selectedReturnFlight.arrivalAirport,
          departureTime: selectedReturnFlight.departureDateTime,
          arrivalTime: selectedReturnFlight.arrivalDateTime,
          airline: selectedReturnFlight.airline,
          flightDuration: returnFlightDuration,
          flightTime: returnFlightDuration, // Add this to match the property name in results.ejs
          flightPrice: selectedReturnFlight.price,
          hotelName: null,
          hotelPrice: 0,
        };
        
        itinerary.push(returnLeg);
        totalPrice += returnLeg.flightPrice;
        allResults.push({ itinerary, totalPrice });
      }
    }
  });
  
  // Sort the results by totalPrice in ascending order
  allResults.sort((a, b) => a.totalPrice - b.totalPrice);
  return allResults;
}