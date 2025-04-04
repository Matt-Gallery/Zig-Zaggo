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
  res.render("search/index", { searchResults: [], errorMessage: null });
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

    // Extract hotel ratings
    const hotelRatings = [];
    for (let i = 0; i < 4; i++) {
      hotelRatings.push(req.body[`hotelRatings[${i}]`] || "1");
    }

    const startDate = new Date(departureDate);
    if (isNaN(startDate)) {
      console.error("Invalid departure date provided.");
      return res.render("search/index", {
        searchResults: [],
        errorMessage: "Invalid departure date.",
      });
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

// since the mock hotels always have availability we only need to find them based on city and stars
    const hotelCriteria = cityStops
      .map((stop) => {
        const cityName = airportToCityMap[stop.city];
        return {
          city: cityName,
          minHotelStars: stop.minHotelStars,
        };
      })
      .filter((criteria) => criteria.city);

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

    // Step 7: Return the trip options to the UI
    res.render("search/index", {
      searchResults: allResults,
      errorMessage:
        allResults.length === 0
          ? "No matching trip options found. Try adjusting your dates or city stops."
          : null,
    });
  } catch (error) {
    console.error("Error during search processing:", error);
    res.status(500).render("search/index", {
      searchResults: [],
      errorMessage: "An error occurred during the search. Please try again.",
    });
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
  for (const { city, minHotelStars } of hotelCriteria) {
    if (!city) continue; // Skip if city is undefined
    const hotels = await Hotels.find({
      hotelCity: city,
      hotelStars: minHotelStars,
    })
      .select("hotelName pricePerNight")
      .sort({ pricePerNight: 1 })
      .exec();
    hotelMap[city] = hotels;
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
          let selectedHotel = null;
          let hotelPrice = 0;
          if (hotels.length > 0) {
            selectedHotel = hotels[0];
            hotelPrice = selectedHotel.pricePerNight * stop.days;
          }

          // Continue building each itinerary leg
        const leg = {
          departureAirport: prev, // Previous stop or initial departure point
          arrivalAirport: stop.city, // Current stop's airport code
          departureTime: selectedFlight.departureDateTime,
          arrivalTime: selectedFlight.arrivalDateTime,
          airline: selectedFlight.airline,
          flightDuration: calculateDuration(
            selectedFlight.departureDateTime,
            selectedFlight.arrivalDateTime
          ),
          flightPrice: selectedFlight.price,
          hotelName: selectedHotel ? selectedHotel.hotelName : null,
          hotelPrice: selectedHotel
            ? selectedHotel.pricePerNight * stop.days
            : 0,
        };
        itinerary.push(leg);
        totalPrice += leg.flightPrice + leg.hotelPrice;
        currentDate.setDate(currentDate.getDate() + stop.days);
      }
      prev = stop.city;
    });

    // Handle the return flight
    const returnRoute = `${prev}->${returnAirport}`;
    const returnFlights = (flightMap[returnRoute] || []).filter(
      (f) => f.class.toLowerCase() === returnFlightClass.toLowerCase()
    );

    if (returnFlights.length > 0) {
      const selectedReturnFlight = returnFlights[0];

      const returnLeg = {
        departureAirport: selectedReturnFlight.departureAirport,
        arrivalAirport: selectedReturnFlight.arrivalAirport,
        departureTime: selectedReturnFlight.departureDateTime,
        arrivalTime: selectedReturnFlight.arrivalDateTime,
        airline: selectedReturnFlight.airline,
        flightDuration: calculateDuration(
          selectedReturnFlight.departureDateTime,
          selectedReturnFlight.arrivalDateTime
        ),
        flightPrice: selectedReturnFlight.price,
        hotelName: null,
        hotelPrice: 0,
      };

      itinerary.push(returnLeg);
      totalPrice += returnLeg.flightPrice;
      allResults.push({ itinerary, totalPrice });
    }
  });


  // Sort the results by totalPrice in ascending order
  allResults.sort((a, b) => a.totalPrice - b.totalPrice);
  return allResults;
}