import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MAX_CITY_STOPS = 4;
const MAX_DAYS = 10;

const TRAVEL_MODES = {
  air: { label: 'Air ✈️', id: 'air' },
  train: { label: 'Train 🚂', id: 'train' },
  bus: { label: 'Bus 🚌', id: 'bus' },
  ferry: { label: 'Ferry ⛴️', id: 'ferry' }
};

const defaultCityStop = { 
  city: '', 
  days: 3, 
  flightClass: 'economy', 
  hotelStars: 0,
  travelModes: Object.keys(TRAVEL_MODES).reduce((acc, mode) => ({ ...acc, [mode]: true }), {})
};

const Search = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTravelModes, setShowTravelModes] = useState({});
  const [formData, setFormData] = useState({
    departureAirport: 'JFK',
    returnAirport: 'JFK',
    departureDate: '2025-05-29',
    returnDate: '',
    departureTravelModes: Object.keys(TRAVEL_MODES).reduce((acc, mode) => ({ ...acc, [mode]: true }), {}),
    returnTravelModes: Object.keys(TRAVEL_MODES).reduce((acc, mode) => ({ ...acc, [mode]: true }), {}),
    departureFlightClass: 'economy',
    returnFlightClass: 'economy',
    cityStops: [
      { ...defaultCityStop, city: 'LHR', days: 3, flightClass: 'economy', hotelStars: 3 },
      { ...defaultCityStop, city: 'CDG', days: 3, flightClass: 'economy', hotelStars: 3 }
    ]
  });

  // Handle travel mode selection for a specific leg
  const handleModeChange = (legIndex, mode) => {
    const updateModes = (prevModes) => {
      // If clicking "all" when everything is already selected, do nothing
      if (mode === 'all' && Object.values(prevModes).every(Boolean)) {
        return prevModes;
      }

      // If clicking "all", select all modes
      if (mode === 'all') {
        return Object.keys(TRAVEL_MODES).reduce((acc, m) => ({ ...acc, [m]: true }), {});
      }

      // Count currently selected modes
      const selectedModes = Object.values(prevModes).filter(Boolean).length;

      // If trying to deselect the last selected mode, prevent it
      if (!prevModes[mode] === false && selectedModes === 1) {
        return prevModes;
      }

      // Otherwise toggle the selected mode
      return { ...prevModes, [mode]: !prevModes[mode] };
    };

    if (legIndex === 'departure') {
      setFormData(prev => ({
        ...prev,
        departureTravelModes: updateModes(prev.departureTravelModes)
      }));
    } else if (legIndex === 'return') {
      setFormData(prev => ({
        ...prev,
        returnTravelModes: updateModes(prev.returnTravelModes)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        cityStops: prev.cityStops.map((stop, i) => 
          i === legIndex
            ? { ...stop, travelModes: updateModes(stop.travelModes) }
            : stop
        )
      }));
    }
  };

  const toggleTravelModes = (index) => {
    setShowTravelModes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Helper function to render travel mode selector
  const renderTravelModeSelector = (legIndex, modes, isStopSelector = false) => {
    const allModesSelected = Object.values(modes).every(Boolean);
    
    return (
      <div className="travel-mode-selector" style={{ 
        position: 'relative', 
        width: '130px',
        marginTop: '42px'
      }}>
        <div 
          className="travel-mode-dropdown-header"
          onClick={() => toggleTravelModes(legIndex)}
          style={{
            cursor: 'pointer',
            padding: '6px 8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fff',
            fontSize: '14px',
            height: '45px',
            boxSizing: 'border-box',
            width: '130px'
          }}
        >
          <span>Travel Modes</span>
          <span>{showTravelModes[legIndex] ? '▼' : '▶'}</span>
        </div>
        {showTravelModes[legIndex] && (
          <div 
            className="travel-mode-options"
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#fff',
              zIndex: 1000,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              width: '130px'
            }}
          >
            <label style={{ 
              display: 'block',
              position: 'relative',
              padding: '4px 4px 4px 35px',
              borderBottom: '1px solid #eee', 
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              <input
                type="checkbox"
                checked={allModesSelected}
                onChange={() => handleModeChange(legIndex, 'all')}
                style={{ 
                  position: 'absolute',
                  left: '-45px',
                  top: '8px',
                  margin: 0
                }}
              />
              All Modes
            </label>
            {Object.entries(TRAVEL_MODES).map(([mode, { label }]) => (
              <label key={mode} style={{ 
                display: 'block',
                position: 'relative',
                padding: '4px 4px 4px 35px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                <input
                  type="checkbox"
                  checked={modes[mode]}
                  onChange={() => handleModeChange(legIndex, mode)}
                  style={{ 
                    position: 'absolute',
                    left: '-45px',
                    top: '8px',
                    margin: 0
                  }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span>{label.split(' ')[0]}</span>
                  <span style={{ marginRight: '-22px' }}>{label.split(' ')[1]}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCityStopChange = (index, field, value) => {
    setFormData(prev => {
      const newCityStops = [...prev.cityStops];
      if (field === 'days') {
        newCityStops[index][field] = Math.max(1, parseInt(value) || 1);
      } else if (field === 'hotelStars') {
        newCityStops[index][field] = value;
      } else {
        newCityStops[index][field] = value;
      }
      return { ...prev, cityStops: newCityStops };
    });
  };

  const handleDaysInput = (index, value) => {
    let numValue = parseInt(value) || 1;
    numValue = Math.min(10, Math.max(1, numValue));
    
    setFormData(prev => {
      const newCityStops = [...prev.cityStops];
      newCityStops[index].days = numValue;
      return { ...prev, cityStops: newCityStops };
    });
  };

  const handleStarClick = (index, star) => {
    setFormData(prev => {
      const newCityStops = [...prev.cityStops];
      newCityStops[index] = {
        ...newCityStops[index],
        hotelStars: newCityStops[index].hotelStars === star ? 0 : star
      };
      return { ...prev, cityStops: newCityStops };
    });
  };

  const addCityStop = () => {
    setFormData(prev => ({
      ...prev,
      cityStops: prev.cityStops.length < MAX_CITY_STOPS
        ? [...prev.cityStops, { ...defaultCityStop }]
        : prev.cityStops
    }));
  };

  const removeCityStop = (index) => {
    setFormData(prev => ({
      ...prev,
      cityStops: prev.cityStops.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const validCityStops = formData.cityStops.filter(stop => stop.city.trim() !== '');
      
      const requestBody = {
        departureAirport: formData.departureAirport.trim(),
        departureDate: formData.departureDate,
        returnAirport: formData.returnAirport.trim(),
        returnFlightClass: formData.returnFlightClass,
        cityStops: validCityStops.map(stop => stop.city.trim()),
        days: validCityStops.map(stop => stop.days),
        flightClass: validCityStops.map(stop => stop.flightClass),
        hotelRatings: validCityStops.map(stop => stop.hotelStars || 1),
        travelModes: {
          departure: Object.entries(formData.departureTravelModes)
            .filter(([_, selected]) => selected)
            .map(([mode]) => mode),
          stops: validCityStops.map(stop => 
            Object.entries(stop.travelModes)
              .filter(([_, selected]) => selected)
              .map(([mode]) => mode)
          ),
          return: Object.entries(formData.returnTravelModes)
            .filter(([_, selected]) => selected)
            .map(([mode]) => mode)
        }
      };

      console.log('Sending search request:', requestBody);

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Search failed. Please try again.');
      }

      console.log('Navigating to results with data:', { results: data, requestBody: formData });
      navigate('/results', { state: { results: data, requestBody: formData } });
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <div className="container">
        <h1>Plan Your Trip</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="search-form">
          <div className="city-stop-row-horizontal" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label htmlFor="departureAirport">Departure Airport</label>
              <input
                type="text"
                id="departureAirport"
                name="departureAirport"
                className="form-control"
                value={formData.departureAirport}
                onChange={handleInputChange}
                placeholder="e.g., JFK"
                required
                style={{ minWidth: 120 }}
              />
            </div>
            <div className="form-group">
              {renderTravelModeSelector('departure', formData.departureTravelModes)}
            </div>
            <div className="form-group">
              <label htmlFor="departureDate">Departure Date</label>
              <input
                type="date"
                id="departureDate"
                name="departureDate"
                className="form-control"
                value={formData.departureDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="departureFlightClass">Flight Class</label>
              <select
                name="departureFlightClass"
                id="departureFlightClass"
                className="form-control"
                value={formData.departureFlightClass}
                onChange={handleInputChange}
              >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>

          <div className="city-stops">
            {formData.cityStops.map((stop, index) => (
              <div className="city-stop-row-horizontal" key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label htmlFor={`cityStop${index}`}>City {index + 1}</label>
                  <input
                    type="text"
                    id={`cityStop${index}`}
                    name="city"
                    className="form-control"
                    placeholder="Enter city or airport code"
                    value={stop.city}
                    onChange={e => handleCityStopChange(index, 'city', e.target.value)}
                    required
                    style={{ minWidth: 120 }}
                  />
                </div>
                <div className="form-group">
                  {renderTravelModeSelector(index, stop.travelModes, true)}
                </div>
                <div className="form-group">
                  <label>Days</label>
                  <div className="days-input-container" style={{ display: 'flex', alignItems: 'center' }}>
                    <button type="button" className="days-decrement" onClick={() => handleDaysInput(index, stop.days - 1)}>-</button>
                    <input
                      type="number"
                      className="days-input"
                      min="1"
                      max="10"
                      value={stop.days}
                      required
                      onChange={(e) => handleDaysInput(index, e.target.value)}
                      style={{ 
                        width: 50, 
                        textAlign: 'center', 
                        margin: '0 0.5rem',
                        padding: '4px 2px'
                      }}
                    />
                    <button type="button" className="days-increment" onClick={() => handleDaysInput(index, stop.days + 1)}>+</button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Flight Class</label>
                  <select
                    className="form-control"
                    value={stop.flightClass}
                    onChange={e => handleCityStopChange(index, 'flightClass', e.target.value)}
                  >
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Hotel Rating</label>
                  <div className="hotel-rating" style={{ gap: '15px' }}>
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(index, star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: star <= stop.hotelStars ? '#ffd700' : '#ccc',
                          width: '24px',
                          height: '24px',
                          padding: 0,
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          lineHeight: 1
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                {formData.cityStops.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-city-btn" 
                    onClick={() => removeCityStop(index)} 
                    style={{ 
                      marginLeft: '-20px',
                      transform: 'scale(0.8)',
                      transformOrigin: 'left center',
                      position: 'relative',
                      top: '10px'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {formData.cityStops.length < MAX_CITY_STOPS && (
              <button 
                type="button" 
                className="add-city-btn" 
                onClick={addCityStop} 
                style={{ 
                  marginTop: -17,
                  width: '20%',
                  display: 'block',
                  marginLeft: 0,
                  transform: 'scale(0.8)',
                  transformOrigin: 'left center',
                  height: '38px'
                }}
              >
                Add Another City
              </button>
            )}
          </div>

          <div className="city-stop-row-horizontal" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label htmlFor="returnAirport">Return Airport</label>
              <input
                type="text"
                id="returnAirport"
                name="returnAirport"
                className="form-control"
                value={formData.returnAirport}
                onChange={handleInputChange}
                placeholder="e.g., LAX"
                required
                style={{ minWidth: 120 }}
              />
            </div>
            <div className="form-group">
              {renderTravelModeSelector('return', formData.returnTravelModes)}
            </div>
            <div className="form-group">
              <label htmlFor="returnFlightClass">Flight Class</label>
              <select
                name="returnFlightClass"
                id="returnFlightClass"
                className="form-control"
                value={formData.returnFlightClass}
                onChange={handleInputChange}
              >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>

          <div className="search-button-wrapper">
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Search;