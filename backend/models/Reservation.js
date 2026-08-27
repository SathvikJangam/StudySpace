const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  timeSlot: { type: String, required: true }, // Format: "10:00 AM - 11:00 AM"
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  bookedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);