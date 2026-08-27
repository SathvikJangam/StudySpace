const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  occupancy: Number,
  noiseDb: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OccupancyLog', logSchema);