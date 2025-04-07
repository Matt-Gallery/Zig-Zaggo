
![ZigZaggo logo](public\static-assets\ZigZaggoHorizRectLogo.jpg)
## Application Description

#### ZigZaggo is a travel booking aggregator that is unique in that it optimizes searches based on how many days you want to spend in each location you want to visit instead of searching for individual trip legs one-by-one based on specific dates.

https://zig-zaggo-production.up.railway.app/search

The point of the application is to make it easy for travelers who want to visit multiple destinations in a single trip and who don't require a specific itinerary to find the optimally priced trip based on how many days they want to spend at each destination and the class of flights and hotels they desire.  Until now this sort of optimization could only be done manually by searching every possible permutaion of trip legs manually one by one in a legacy traval booking aggregator.

## Functionality
- **Create Account**
    - As a user you can create your own account with:
        * Username
        * Password
        * Full Name
        * Email Address
- **Log In**
    -As a user you can log into your account and book travel, see all your bookings and cancel bookings.
- **Account Details**
    - As a user you can see your profile and make edits to it or delete your account.
- **View Search Landing Page & Enter Search Criteria**
    - As a user you can enter and submit search criteria for multi-leg trips with up to 5 total stops using this seach criteria:
        * Initial departure city
        * Initial departure date
        * Cabin class (Economy or Business)
        * Minimum hotel class (out of 5 stars)
        * City stops (max of 4, min of 2)
        * Number of days in each city
        * Final arrival city
- **Search Results**
 - As a user you can see your search results and adjust your searches to get new results on the same page.
- **Request a Booking**
    - As a user you can request to book complete itineraries.
- **View and Cancel Bookings**
    - As a user you can view a list of your bookings that includes pending anc cancelled bookings and you can cancel pending bookings.


## Technology Used

## Artificial Intelligence Technologies
1. ChatGPT for functionality and styling and logo design
2. Cursor with ChatGPT and Claude for adding advanced functionality and styling

### Backend Technologies
1. Node.js - Runtime environment for executing JavaScript on the server
2. Express.js - Web application framework for Node.js
* express-session for session management
* method-override for HTTP method overriding
* morgan for HTTP request logging
3. MongoDB - NoSQL database
* Mongoose as the ODM (Object Document Mapper)
4. Authentication & Security
* bcrypt for password hashing
* express-session for session management
* dotenv for environment variable management
* jsonwebtoken for JWT handling

### Frontend Technologies
1. EJS (Embedded JavaScript) - Template engine for server-side rendering
2. HTML5 - Structure and content
3. CSS3 - Styling
* Flexbox for layout
* Media queries for responsive design
* Custom CSS variables
4. JavaScript (Client-side)
* Vanilla JavaScript (ES6+)
* DOM manipulation
* Event handling
* Local Storage API
* Fetch API for AJAX requests

### Development Tools & Utilities
1. Git - Version control
2. npm - Package management
3. Environment Variables (.env) - Configuration management

### Features & APIs
1. Airport Search System
* Custom autocomplete implementation
* City-Airport mapping
* Search result caching
2. Booking System
* Multi-city trip planning
* Hotel rating system
* Flight class selection
* Date handling
3. Form Handling
* Client-side validation
* Server-side validation
* Form state persistence

### Architecture & Patterns
1. MVC Architecture
* Models (Mongoose schemas)
* Views (EJS templates)
* Controllers (Route handlers)
2. RESTful API Design
* Structured routing
* HTTP methods (GET, POST, etc.)
* JSON data exchange
4. Middleware Pattern
* Authentication middleware
* Session handling
* Error handling

### Database Schema
1. Collections
* Users
* Flights
* Hotels
* Booking Requests

### Security Features
1. Password hashing (bcrypt)
2. Session-based authentication
3. Environment variable protection
4. Input validation and sanitization

### Browser APIs Used
1. localStorage
2. Fetch API
3. DOM API
4. History API
5. Event handling

## Next Steps
1. Add more realistic mock data and refactor search functionality to ensure it can perform under more realistic conditions
2. Connect to APIs for real travel booking data
3. Add train, bus, ferry and rental car coverage to allow true optimization of travel options