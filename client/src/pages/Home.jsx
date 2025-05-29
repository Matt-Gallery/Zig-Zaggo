import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      <div className="container">
        <div className="hero-section">
          <h1>Welcome to ZigZaggo</h1>
          <p className="hero-description">Your one-stop solution for planning multi-city travel adventures</p>
          <Link to="/search" className="search-button">
            Plan Your Trip
          </Link>
        </div>

        <div className="features-section">
          <h2>Why Choose ZigZaggo?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✈️</div>
              <h3>Multi-City Planning</h3>
              <p>Plan complex itineraries with multiple stops easily</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Best Deals</h3>
              <p>Find the best flight and hotel combinations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Easy Booking</h3>
              <p>Book your entire trip in one place</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 