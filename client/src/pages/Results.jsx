import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Results.css';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const searchResults = location.state?.results || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleBooking = (itinerary) => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { 
          from: location.pathname,
          booking: itinerary
        }
      });
      return;
    }

    // Create the booking data from the itinerary
    const bookingData = {
      departureAirport: itinerary.itinerary[0].departureAirport,
      returnAirport: itinerary.itinerary[itinerary.itinerary.length - 1].arrivalAirport,
      departureDate: itinerary.itinerary[0].departureTime,
      returnFlightClass: itinerary.itinerary[itinerary.itinerary.length - 1].class || 'economy',
      totalPrice: itinerary.totalPrice,
      itineraryData: itinerary.itinerary,
      cityStopsData: itinerary.itinerary.slice(0, -1).map(leg => ({
        city: leg.arrivalAirport,
        days: leg.stayDuration || 0,
        minHotelStars: leg.hotelRating || 3,
        flightClass: leg.class || 'economy'
      }))
    };

    navigate('/booking/new', {
      state: { itinerary: bookingData }
    });
  };

  if (searchResults.length === 0) {
    return (
      <div className="results-page">
        <div className="container">
          <div className="search-results-empty">
            <h2>No Results Found</h2>
            <p>Try adjusting your search criteria</p>
            <button onClick={() => navigate('/search')}>
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="container">
        <div className="results-summary">
          Found {searchResults.length} itineraries
        </div>
        <div className="search-results">
          {searchResults.map((result, index) => (
            <div key={index} className="result-card">
              <div className="result-header">
                <h3>
                  <span>Itinerary Option {index + 1}</span>
                  <span className="total-price">{formatPrice(result.totalPrice)}</span>
                </h3>
              </div>
              <div className="itinerary-container">
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Leg</th>
                      <th>Flight Details</th>
                      <th>Stay Details</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.itinerary.map((leg, legIndex) => (
                      <tr key={legIndex}>
                        <td className="leg-label">
                          {legIndex + 1}
                        </td>
                        <td className="flight-details">
                          <div className="flight-route">
                            {leg.departureAirport} → {leg.arrivalAirport}
                          </div>
                          <div className="flight-schedule">
                            {formatDate(leg.departureTime)} - {formatDate(leg.arrivalTime)} ({leg.duration})
                          </div>
                          <div className="flight-info">
                            {leg.airline} {leg.flightNumber} · {leg.class}
                          </div>
                        </td>
                        <td className="stay-details">
                          {leg.hotelName ? (
                            <>
                              <div className="hotel-name">{leg.hotelName}</div>
                              <div className="hotel-rating">{'★'.repeat(leg.hotelRating)}</div>
                              <div className="stay-duration">{leg.stayDuration} nights</div>
                            </>
                          ) : (
                            <span className="no-stay">No stay</span>
                          )}
                        </td>
                        <td className="price-cell">
                          <div>Flight: {formatPrice(leg.flightPrice)}</div>
                          {leg.hotelPrice > 0 && (
                            <div>Hotel: {formatPrice(leg.hotelPrice)}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="booking-button-container">
                <button 
                  className="book-button"
                  onClick={() => handleBooking(result)}
                >
                  {isAuthenticated ? 'Book This Trip' : 'Sign in to Book'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results; 