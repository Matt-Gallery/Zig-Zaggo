import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import './Booking.css';

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (location.pathname === '/booking/my-bookings') {
      navigate('/booking/my-bookings');
      return;
    }
    
    if (location.state?.itinerary) {
      createBooking(location.state.itinerary);
    } else {
      const bookingId = location.pathname.split('/').pop();
      if (bookingId !== 'new') {
        fetchBooking(bookingId);
      }
    }
  }, [location]);

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

  const createBooking = async (bookingData) => {
    try {
      console.log('Creating new booking with data:', bookingData);
      const response = await authService.fetchWithAuth('/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const data = await response.json();
      setBooking(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  const fetchBooking = async (bookingId) => {
    try {
      const response = await authService.fetchWithAuth(`/booking/view/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }
      
      const data = await response.json();
      setBooking(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load booking. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      const response = await authService.fetchWithAuth(`/booking/cancel/${booking._id}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }
      
      const data = await response.json();
      if (data.success) {
        setBooking(prev => ({ ...prev, status: 'cancelled' }));
        setShowCancelModal(false);
      } else {
        throw new Error(data.error || 'Failed to cancel booking');
      }
    } catch (err) {
      setError('Failed to cancel booking. Please try again.');
      console.error(err);
    }
  };

  if (loading) return <div className="booking-page"><div className="container">Loading...</div></div>;
  if (error) return <div className="booking-page"><div className="container error-message">{error}</div></div>;
  if (!booking) return <div className="booking-page"><div className="container">No booking found.</div></div>;

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-header">
          <h2>Booking Details</h2>
        </div>
        
        <div className="booking-card">
          <div className="card-header">
            <h3>
              <span>Booking #{booking._id}</span>
              <span className={`booking-status ${booking.status.toLowerCase()}`}>
                {booking.status}
              </span>
            </h3>
          </div>
          
          <div className="card-body">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Leg</th>
                  <th>Flight Details</th>
                  <th>Stay Details</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {booking.itinerary.map((leg, index) => (
                  <tr key={index}>
                    <td className="leg-label">
                      {index === 0 
                        ? "1" 
                        : (index === booking.itinerary.length - 1 
                          ? "Return" 
                          : String(index + 1))}
                    </td>
                    <td className="flight-details">
                      <div className="flight-route">
                        {leg.departureAirport} → {leg.arrivalAirport}
                      </div>
                      <div className="flight-schedule">
                        {formatDate(leg.departureTime)} - {formatDate(leg.arrivalTime)}
                      </div>
                      <div className="flight-info">
                        {leg.airline} · {leg.class}
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
                      <div>{formatPrice(leg.flightPrice)}</div>
                      {leg.hotelPrice > 0 && (
                        <div>{formatPrice(leg.hotelPrice)}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="card-footer">
            <div className="total-price">
              Total: {formatPrice(booking.totalPrice)}
            </div>
            {booking.status === 'pending' && (
              <button 
                className="btn btn-danger"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Cancel Booking</h5>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel this booking?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleCancelBooking}
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking; 