const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  blockName: { type: String, required: true },
  floorNo: { type: Number, required: true },
  roomName: { type: String, required: true },
  type: { type: String, enum: ['Classroom', 'ComputerLab', 'Library', 'DiscussionCabin', 'SeminarHall'] },
  capacity: { type: Number, required: true },
  hasAc: { type: Boolean, default: false },
  tableLayout: { type: String, enum: ['Rows', 'Clusters', 'Individual'], default: 'Rows' },
  
  // NEW: Hybrid Model Flag
  isReservable: { type: Boolean, default: false },
  
  // Live Status (For FCFS tracking)
  currentOccupancy: { type: Number, default: 0 },
  noiseDb: { type: Number, default: 30 },
  noiseLevel: { type: String, enum: ['Silent', 'Low', 'Moderate', 'High', 'Extreme'], default: 'Silent' },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);