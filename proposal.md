# Plpak
![palm trees](./static%20assets/tropical-sea-beach-palms-and-sunny-5120x3200.jpg)


## Project Description

#### My application if called ZigZaggo. It is a travel booking aggregator that is unique in that it optimizes searches based on how many days you want to spend in each location you want to visit instead of searching for individual trip legs one-by-one based on specific dates.

## Application Description

### Game Setup:

1. 4 players are required
2. The game is played with reqular playing cards with cards numbered 2 - 6 of each suit removed from the deck (no jokers)
3. The remaining 32 cards are all dealt out to the players for each hand - 8 per player
4. Each player deals 5 consecutive hands and then the deal rotates to the player to the left, for a total of 20 hands in the game

### Objective of the Game

* The objectvie is to end up with the fewest points
* Points are awarded based on the outcome of each hand

### Defenitions

* **Round of Play** - Each cycle of each player playing 1 card
* **Trick** - In each **round of play** the group of 4 cards played is a `Trick`
* **Lead Suit** - The suit of the first card played in each round of play

### Rules of Play:

#### MVP
* Each of the 5 hands that each player deals has its own rules and objective:
1. Don't take any `Tricks`- the objective is to avoid taking any tricks
        * Each `trick` is worth *1 point*
        * The player to the left of the dealer leads off play
        * Each subsequent player must play a card of the **lead suit** if they have a card of that suit in their hand
        * If a player doesn't have a card of the **lead suit** they may play a card of any suit
        * Whichever player plays the highest card of the **lead suit** takes the `trick`
        * Whichever player took the `trick` leads of the next **round of play**
        * The round is scored by assigning *1 point* per `trick` taken by each player
        * After all 8 rounds have been played the dealer deals the next hand

#### Stretch Goals
2. Don't take any `Hearts` - the objective is to avoid taking any cards in the heart suit
        * Each `heart` is worth *1 point*
        * The player to the left of the dealer leads off play
        * Each subsequent player must play a card of the **lead suit** if they have a card of that suit in their hand
        * If a player doesn't have a card of the **lead suit** they may play a card of any suit
        * Whichever player plays the highest card of the **lead suit** takes the `trick`
        * Whichever player took the `trick` leads of the next **round of play**
        * The round is scored by assigning *1 point* per `heart` taken by each player (taking tricks is irrelevant for scoring as long as they contain no `hearts`)
        * After all 8 rounds have been played the dealer deals the next hand
3. Don't take any `Queens` - the objective is to avoid taking any queen cards
        * Each `queen` is worth *2 points*
        * The player to the left of the dealer leads off play
        * Each subsequent player must play a card of the **lead suit** if they have a card of that suit in their hand
        * If a player doesn't have a card of the **lead suit** they may play a card of any suit
        * Whichever player plays the highest card of the **lead suit** takes the `trick`
        * Whichever player took the `trick` leads of the next **round of play**
        * The round is scored by assigning *2 points* per `queen` taken by each player (taking tricks is irrelevant for scoring as long as they contain no `queens`)
        * After all 8 rounds have been played the dealer deals the next hand
4. Don't take the `King of Hearts` - the objective is to avoid taking the `king of hearts`
        * The `king of hearts` is worth *8 points*
        * The player to the left of the dealer leads off play
        * The player leading off my not lead with a heart
        * Each subsequent player must play a card of the **lead suit** if they have a card of that suit in their hand
        * If a player doesn't have a card of the **lead suit** they may play a card of any suit
        * Whichever player plays the highest card of the **lead suit** takes the `trick`
        * Whichever player took the `trick` leads of the next **round of play**
        * The hand ends after a **round of play** where the `king of hearts` is played is complete
        * The round is scored by assigning *8 points* to the player who took the `king of hearts` (taking tricks is irrelevant for scoring as long as they don't contain the `king of hearts`)
        * After the **round of play** where the `king of hearts` is played is complete the dealer deals the next hand
5. `Solitaire` - the objective is to get rid of all the cards in your hand as quickly as possible
        * The player with the jack of spades leads off play
        * Play rotates to the left
        * The next player can play another one of the jacks (laid out next to the jack of spades), a 10 of spades or a queen of spades (build down/up from the jack of spades)
        * Each subsequent player can play a jack or can build up or down on the 4 sets of suited cards already played (ultimately building each complete suit up and down from the 4 jacks until all cards are played)
        * A player who is unable to play (because they have no jack and are blocked from building on the cards that have been played) is skipped
        * The round is scored by:
            * Subtracting 5 points from the player who got rid of all their cards first
            * Subtracting 3 points from the player who got rid of all their cards second
            * Subtracting 1 points from the player who got rid of all their cards third

* The game ends after all 20 hands have been played.  The winner is the the player with the fewest points

## User Stories

### MVP Goals
- Create Account
    - As a user, I want to be able to create an account, so that I can save my searches and ultimately book travel.
    - This should include:
        * First Name
        * Last Name
        * Email Address
        * Phone Number
        * Mailing Address
        * Preferred Home Airport
        * Preferred Class of Hotel
- Log In
    -As a user, I want to be able to log in to my account, so that I can save my searches and ultimately book travel.
- View Account Details
    - As a user, I want to be able to view my account details, so that I can know that my account information is accurate.
    - This page can be the same as the create account page, but the fields will be populated with the users saved information and they can edit and resave each field.
- Edit Account Details
    - As a user, I want to be able to edit my account details, so that I can update any details if they change or fix any errors.
- Delete Account
    - As a user, I want to be able to delete my account, so that I can protect my data and reduce spam communications if I choose to no longer use this application.
    - This feature will be included on the edit account page, it just adds a delete button.
- View Search Landing Page & Enter Search Criteria
    - As a user, I want to be able to see a search landing page and enter and submit my search criteria , so that I can see fetch search results to give me options for trips to book.
    - Search options should include:
        * Initial departure city
        * Initial departure date
        * Cabin class (Economy or Business)
        * Minimum hotel class (out of 5 stars)
        * City stops (max of 4, min of 2)
        * Number of days in each city
        * Final arrival city
- Receive Search Results
- Edit the Current Search and Re-Submit
- Drill Down of Each Search Result Trip Detail

### Stretch Goals
- Stretch - Allow Flexible Total Trip Length
    - As a user, I want to be able to search for trips with a fixed total length and variable numbers of days in each city, so that I can find better deals when I have flexibility in my plans and don’t care exactly how many days I spend in each city.
    - This should include:
        * An option to set the total trip length
- Stretch - Allow Flexible Search Days
    - As a user, I want to be able to search for trips with a flexible total length in addition to a variable numbers of days in each city, so that I can find better deals when I have flexibility in my plans and don’t care exactly how long my trip is.
    - This should include:
        * An option to choose earliest and latest trip start dates
        * An option to set a minimum and maximum total trip length
        * Options to set the minimum and maximum number of days in each city

## Wire Frames
### Application Web Pages

![Landing/Login Page](./static%20assets/WireFrame1.png)

![Search Page](./static%20assets/WireFrame2.png)

![Search Results/Search Update Page](./static%20assets/WireFrame3.png)

![Show Trip Detail Page](./static%20assets/WireFrame4.png)

![Create/Edit/Delete Account Page](./static%20assets/WireFrame5.png)

[Link to Mockflow Wireframe](https://app.mockflow.com/view/MG0tpEREQrb/)

## Entity Relationship Diagrams (ERDs)




## Pseudocode
```js
/*-------------------------------- Constants --------------------------------*/
// all 32 cards

/*---------------------------- Variables (state) ----------------------------*/
// What cards are remaining in each player's hand
// What cards are currently in play
// Each trick and which player took it (or discard after it's been scored?)
// The current score for each player
// which player's turn is it?
// Is it time to deal a new hand?
// is the game complete?
// Display result message? - either who won or who tied

/*-------------------------------- Functions --------------------------------*/
// Handle player clicking deal and starting the game
// Handle player clicking a card to play
// Logic to determine what card the 3 computer players play
// Display messages to prompt player to play their turn and the result message - either who won or who tied

/*----------------------------- Event Listeners -----------------------------*/
// Player clicks the start/restart button
// Player clicks a card to be played

```

## Timeline

| Day        |   | Task                               | Blockers | Notes/ Thoughts |
|------------|---|------------------------------------|----------|-----------------|
| Monday     |   | Create and present proposal        |          |                 |
| Tuesday    |   | Create HTML & CSS                  |          |                 |
| Wedenesday |   | Work on JavaScript                 |          |                 |
| Thursday   |   | Work on JavaScript                 |          |                 |
| Friday     |   | Test and finalize MVP              |          |                 |
| Saturday   |   | Work on stretch goals              |          |                 |
| Sunday     |   | Final testing and styling          |          |                 |
| Monday     |   | Present                            |          |                 |