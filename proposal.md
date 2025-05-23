# ZigZaggo
![palm trees](./public/static%20assets/tropical-sea-beach-palms-and-sunny-5120x3200.jpg)

## Project Description

#### My application if called ZigZaggo. It is a travel booking aggregator that is unique in that it optimizes searches based on how many days you want to spend in each location you want to visit instead of searching for individual trip legs one-by-one based on specific dates.

![ZigZaggo logo](./public/static%20assets/ZigZaggoHorizRectLogo.jpg)
## Application Description

The point of the application is to make it easy for travelers who want to visit multiple destinations in a single trip and who don't require a specific itinerary to find the optimally priced trip based on how many days they want to spend at each destination and the class of flights and hotels they desire.  Until now this sort of optimization could only be done manually by searching every possible permutaion of trip legs manually one by one in a legacy traval booking aggregator.

## MVP Assumptions
 - User will be limited to choosing a maximum of 4 city stops in a search
 - Seach will be conducted against a mock MongoDB database containing roughly 1 month of flight and hotel data created by ChatGPT using actual sample data and following normal travel booking conventions

## User Stories

### MVP Goals
- **Create Account**
    - As a user, I want to be able to create an account, so that I can save my searches and ultimately book travel.
    - This should include:
        * Username
        * Password
        * Full Name
        * Email Address
- **Log In**
    -As a user, I want to be able to log in to my account, so that I can save my searches and ultimately book travel.
- **View Account Details**
    - As a user, I want to be able to view my account details, so that I can know that my account information is accurate.
    - This page can be the same as the create account page, but the fields will be populated with the users saved information and they can edit and resave each field.
- **Edit Account Details**
    - As a user, I want to be able to edit my account details, so that I can update any details if they change or fix any errors.
- **Delete Account**
    - As a user, I want to be able to delete my account, so that I can protect my data and reduce spam communications if I choose to no longer use this application.
    - This feature will be included on the edit account page, it just adds a delete button.
- **View Search Landing Page & Enter Search Criteria**
    - As a user, I want to be able to see a search landing page and enter and submit my search criteria , so that I can see fetch search results to give me options for trips to book.
    - Search options should include:
        * Initial departure city
        * Initial departure date
        * Cabin class (Economy or Business)
        * Minimum hotel class (out of 5 stars)
        * City stops (max of 4, min of 2)
        * Number of days in each city
        * Final arrival city
- **Receive Search Results**
 - As a user, I want to be able to view my search results, so that I can see what trip options are available and ultimately book travel.
 - The search results can return any combination of dates, cities, flights and hotels that fit the search.
- **Drill Down of Each Search Result Trip Detail**
    - As a user, I want to be able to drill down on each trip in my search results, so that I can see the details of each flight and hotel included in the itinerary.
- **Edit the Current Search and Re-Submit**
 - As a user, I want to be able to edit my current search and resubmit it, so that I can get new search results without having to create a new search from scratch.
    - This should be implemented using local storage.

### Stretch Goals
- **Save Booking Request**
    - As a user, I want my booking requests to be saved so they can be transmitted to the individual airlines and hotels to book each leg of my trip.
- **Allow Flexible Total Trip Length**
    - As a user, I want to be able to search for trips with a fixed total length and variable numbers of days in each city, so that I can find better deals when I have flexibility in my plans and don’t care exactly how many days I spend in each city.
    - This should include:
        * An option to set the total trip length
- **Allow Flexible Search Days**
    - As a user, I want to be able to search for trips with a flexible total length in addition to a variable numbers of days in each city, so that I can find better deals when I have flexibility in my plans and don’t care exactly how long my trip is.
    - This should include:
        * An option to choose earliest and latest trip start dates
        * An option to set a minimum and maximum total trip length
        * Options to set the minimum and maximum number of days in each city

## Wire Frames
### Application Web Pages

![Landing/Login Page](./public/static%20assets/WireFrame1.png)

![Search Page](./public/static%20assets/WireFrame2.png)

![Search Results/Search Update Page](./public/static%20assets/WireFrame3.png)

![Show Trip Detail Page](./public/static%20assets/WireFrame4.png)

![Create/Edit/Delete Account Page](./public/static%20assets/WireFrame5.png)

[Link to Mockflow Wireframe](https://app.mockflow.com/view/MG0tpEREQrb/)

## Entity Relationship Diagrams (ERDs)

![userERD](./public/static%20assets/userERD.jpg)

![flightERD](./public/static%20assets/flightERD.jpg)

![hotelERD](./public/static%20assets/hotelERD.jpg)

![bookingERD](./public/static%20assets/bookingERD.jpg)

## Routing Table

![Routing Table](./public/static%20assets/routingTable.jpg)

## Directory Structure

```bash
├── controllers
│   ├── auth.js
│   ├── user.js
│   ├── search.js
├── db
│   ├── connection.js
├── middleware
│   ├── isSignedIn.js
│   ├── passUserToViews.js
├── models
│   ├── user.js
│   ├── seach.js
│   ├── hotel.js
│   ├── flight.js
├── node_modules
├── views
│   ├── auth
│   │   ├── sign-in.ejs
│   │   ├── sign-up.ejs
│   ├── userAccount
│   │   ├── index.ejs
│   ├── search
│   │   ├── index.ejs
│   │   ├── results.ejs
│   │   ├── show.ejs
│   ├── partials
│   │   ├── _navbar.ejs
│   ├── index.ejs
├── seed
│   ├── data.js
├── .env
├── .gitignore
├── README.md
├── package-lock.json
├── package.json
├── server.js

```

## Pseudocode
```js
/*-------------------------------- Import --------------------------------*/
// express
// mongoose
// dotenv
// method-override
// morgan
// express-session
// bcrypt

/*------------------------------- Views -------------------------------*/
// Landing/Login
// Search
// Search Results/Edit Search
// Show Trip Details
// Create/Edit/Delete Account

/*-------------------------------- Routes --------------------------------*/
// GET Landing/Sign in
// POST Sign in
// GET Sign up
// POST Sign up
// PUT Edit Account
// DELETE Account
// GET Sign out
// GET Search
// GET Search Results
// GET Show Trip Details

```

## Timeline

| Day        |   | Task                               | Blockers | Notes/ Thoughts |
|------------|---|------------------------------------|----------|-----------------|
| Monday     |   | Create and present proposal        |          |                 |
| Tuesday    |   | Create HTML & JavaScript           |          |                 |
| Wedenesday |   | Work on JavaScript & CSS           |          |                 |
| Thursday   |   | Work on JavaScript & CSS           |          |                 |
| Friday     |   | Test and finalize MVP              |          |                 |
| Saturday   |   | Work on stretch goals              |          |                 |
| Sunday     |   | Final testing and styling          |          |                 |
| Monday     |   | Present                            |          |                 |