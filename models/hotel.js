import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  amenities: [{
    type: String
  }],
  roomsAvailable: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  }],
  description: {
    type: String,
    required: true
  }
});

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel; 