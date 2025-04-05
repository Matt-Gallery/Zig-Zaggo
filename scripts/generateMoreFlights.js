import fs from 'fs';
import path from 'path';

// Read existing flight data
const lhrFcoFlights = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/seedData/LHR_FCO_flights.json'), 'utf8'));
const fcoAllRoutesFlights = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/seedData/FCO_All_Routes_flights.json'), 'utf8'));
const jfkFcoFlights = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/seedData/JFK_FCO_flights.json'), 'utf8'));

// Function to generate First Class flights from existing ones
function generateFirstClassFlights(flights) {
    const firstClassFlights = flights.map(flight => {
        // Create a deep copy of the flight
        const firstClassFlight = JSON.parse(JSON.stringify(flight));
        
        // Modify for First Class
        firstClassFlight.class = "First";
        
        // Adjust price - First Class is typically 2.5-3x Business Class price
        const priceMultiplier = 2.5 + (Math.random() * 0.5); // Random multiplier between 2.5 and 3
        firstClassFlight.price = Math.round(flight.price * priceMultiplier);
        
        // Slightly adjust departure and arrival times (15-30 minutes later)
        const departureDate = new Date(firstClassFlight.departureDateTime);
        const arrivalDate = new Date(firstClassFlight.arrivalDateTime);
        
        const timeAdjustment = 15 + Math.floor(Math.random() * 15); // Random minutes between 15-30
        departureDate.setMinutes(departureDate.getMinutes() + timeAdjustment);
        arrivalDate.setMinutes(arrivalDate.getMinutes() + timeAdjustment);
        
        firstClassFlight.departureDateTime = departureDate.toISOString();
        firstClassFlight.arrivalDateTime = arrivalDate.toISOString();
        
        return firstClassFlight;
    });
    
    return firstClassFlights;
}

// Generate First Class flights for each route
const lhrFcoFirstClass = generateFirstClassFlights(lhrFcoFlights);
const fcoAllRoutesFirstClass = generateFirstClassFlights(fcoAllRoutesFlights);
const jfkFcoFirstClass = generateFirstClassFlights(jfkFcoFlights);

// Combine original and First Class flights
const allLhrFcoFlights = [...lhrFcoFlights, ...lhrFcoFirstClass];
const allFcoAllRoutesFlights = [...fcoAllRoutesFlights, ...fcoAllRoutesFirstClass];
const allJfkFcoFlights = [...jfkFcoFlights, ...jfkFcoFirstClass];

// Write the combined data back to files
fs.writeFileSync(
    path.join(process.cwd(), 'public/seedData/LHR_FCO_flights.json'),
    JSON.stringify(allLhrFcoFlights, null, 2)
);

fs.writeFileSync(
    path.join(process.cwd(), 'public/seedData/FCO_All_Routes_flights.json'),
    JSON.stringify(allFcoAllRoutesFlights, null, 2)
);

fs.writeFileSync(
    path.join(process.cwd(), 'public/seedData/JFK_FCO_flights.json'),
    JSON.stringify(allJfkFcoFlights, null, 2)
);

console.log('Successfully generated and added First Class flights to all routes.'); 