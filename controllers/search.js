import express from "express";
import { Flights, Hotels } from "../models/resOptions.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      departureAirport,
      departureDate,
      returnAirport,
      returnFlightClass,
    } = req.body;

    const rawCityStops = req.body["cityStops[]"] || [];
    const rawDays = req.body["days[]"] || [];
    const rawFlightClass = req.body["flightClass[]"] || [];

    const hotelRatings = [];
    for (let i = 0; i < 4; i++) {
      hotelRatings.push(req.body[`hotelRatings[${i}]`] || "1");
    }

    const startDate = new Date(departureDate);
    if (isNaN(startDate)) {
      return res.status(400).render("search/index", {
        searchResults: [],
        errorMessage: "Please enter a valid departure date.",
      });
    }

    const stopsInput = rawCityStops
      .map((city, i) => ({
        city,
        days: parseInt(rawDays[i]) || 1,
        minHotelStars: parseInt(hotelRatings[i]) || 1,
        flightClass: rawFlightClass[i] || "economy",
      }))
      .filter((s) => s.city && s.city.trim() !== "");

    const permutations = getPermutations(stopsInput);
    console.log(`🔀 ${permutations.length} stop permutations`);

    // 📦 Flight Preload
    const uniqueRoutes = new Set();
    permutations.forEach((stops) => {
      let prev = departureAirport;
      for (const stop of stops) {
        uniqueRoutes.add(`${prev}->${stop.city}`);
        prev = stop.city;
      }
      uniqueRoutes.add(`${prev}->${returnAirport}`);
    });

    const flightMap = {};
    for (const route of uniqueRoutes) {
      const [from, to] = route.split("->");
      const flights = await Flights.find({
        departureAirport: from,
        arrivalAirport: to,
        departureDateTime: { $gte: startDate },
      })
        .sort({ price: 1 })

      flightMap[route] = flights;
    }

    // 📦 Hotel Preload by Required Star Rating
    const cityMap = {
      FCO: "Rome",
      LHR: "London",
      CDG: "Paris",
      NCE: "Nice",
      GVE: "Geneva",
    };

    const hotelMap = {};
    const uniqueCities = [...new Set(stopsInput.map((s) => s.city))];

    for (const cityCode of uniqueCities) {
      const maxStars = getMaxRequiredStars(cityCode, permutations, cityMap);
      const cityName = cityMap[cityCode] || cityCode;

      const hotels = await Hotels.find({
        hotelCity: cityName,
        hotelStars: { $gte: maxStars },
      }).sort({ pricePerNight: 1 });

      hotelMap[cityName] = hotels;
    }

    const allResults = [];

    for (const stops of permutations) {
      await buildItinerary(
        departureAirport,
        0,
        new Date(startDate),
        [],
        stops,
        allResults,
        returnAirport,
        returnFlightClass,
        flightMap,
        hotelMap,
        cityMap
      );
      if (allResults.length >= 100) break;
    }

    allResults.sort((a, b) => a.totalPrice - b.totalPrice);
    const topResults = allResults.slice(0, 30);

    res.render("search/index", { searchResults: topResults });
  } catch (error) {
    console.error("❌ Error handling search:", error);
    if (!res.headersSent) {
      res.status(500).send("Something went wrong.");
    }
  }
});

export default router;

// 🔁 Permutation helper
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

// 🧠 Hotel filtering helper
function getMaxRequiredStars(cityCode, allPermutations, cityMap) {
  const city = cityMap[cityCode] || cityCode;
  let maxStars = 1;
  for (const stops of allPermutations) {
    for (const stop of stops) {
      if ((cityMap[stop.city] || stop.city) === city) {
        maxStars = Math.max(maxStars, parseInt(stop.minHotelStars));
      }
    }
  }
  return maxStars;
}

// ⏱ Duration helper
function getFlightDuration(flight) {
  const ms = new Date(flight.arrivalDateTime) - new Date(flight.departureDateTime);
  return `${Math.round(ms / 3600000)}h`;
}

// 🧭 Main itinerary builder
async function buildItinerary(
  from,
  stopIndex,
  date,
  legs,
  stops,
  resultArray,
  returnAirport,
  returnFlightClass,
  flightMap,
  hotelMap,
  cityMap
) {
  if (resultArray.length >= 100) return;

  if (stopIndex >= stops.length) {
    const returnRoute = `${from}->${returnAirport}`;
    const returnFlights = (flightMap[returnRoute] || []).filter(
      (f) =>
        new Date(f.departureDateTime) >= date &&
        f.class.toLowerCase() === returnFlightClass.toLowerCase()
    );

    for (const flight of returnFlights) {
      const totalLegs = [
        ...legs,
        {
          departureAirport: from,
          arrivalAirport: returnAirport,
          departureTime: flight.departureDateTime,
          arrivalTime: flight.arrivalDateTime,
          airline: flight.airline,
          flightTime: getFlightDuration(flight),
          hotelName: "-",
          flightPrice: flight.price,
          hotelPrice: 0,
        },
      ];
      const totalPrice = totalLegs.reduce(
        (sum, leg) => sum + leg.flightPrice + leg.hotelPrice,
        0
      );
      resultArray.push({ itinerary: totalLegs, totalPrice });
    }
    return;
  }

  const stop = stops[stopIndex];
  const to = stop.city;
  const route = `${from}->${to}`;
  const cityName = cityMap[to] || to;
  const cityHotels = hotelMap[cityName] || [];

  const flights = (flightMap[route] || []).filter((f) => {
    const dep = new Date(f.departureDateTime);
    return (
      dep >= date &&
      f.class.toLowerCase() === stop.flightClass.toLowerCase()
    );
  });

  for (const flight of flights) {
    const arrival = new Date(flight.arrivalDateTime);
    if (isNaN(arrival)) continue;

    for (const hotel of cityHotels) {
      const nextDate = new Date(arrival);
      nextDate.setDate(nextDate.getDate() + stop.days);
      nextDate.setHours(0, 0, 0, 0);

      await buildItinerary(
        to,
        stopIndex + 1,
        nextDate,
        [
          ...legs,
          {
            departureAirport: from,
            arrivalAirport: to,
            departureTime: flight.departureDateTime,
            arrivalTime: flight.arrivalDateTime,
            airline: flight.airline,
            flightTime: getFlightDuration(flight),
            hotelName: hotel.hotelName,
            flightPrice: flight.price,
            hotelPrice: hotel.pricePerNight * stop.days,
          },
        ],
        stops,
        resultArray,
        returnAirport,
        returnFlightClass,
        flightMap,
        hotelMap,
        cityMap
      );

      if (resultArray.length >= 100) return;
    }
  }
}
