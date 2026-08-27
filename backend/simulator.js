const mongoose = require('mongoose');
const Room = require('./models/Room');
const OccupancyLog = require('./models/OccupancyLog');

// Connect to MongoDB (Updated connection string without deprecated options)
mongoose.connect('mongodb://localhost:27017/studyspace')
  .then(() => console.log("MongoDB Connected for Simulator"))
  .catch(err => console.log("MongoDB Connection Error: ", err));

const determineNoiseLevel = (db) => {
  if (db < 40) return 'Silent';
  if (db < 55) return 'Low';
  if (db < 70) return 'Moderate';
  if (db < 85) return 'High';
  return 'Extreme';
};

const simulateSensors = async () => {
  console.log("📡 IoT Simulator Running: Polling 'CCTV' and 'Mics'...");
  
  try {
    const rooms = await Room.find();
    
    if (rooms.length === 0) {
        console.log("No rooms found in database. Run 'node seed.js' first.");
        return;
    }

    for (let room of rooms) {
      // Simulate slight changes in occupancy (+2, -2, or stay same)
      const change = Math.floor(Math.random() * 5) - 2; 
      let newOccupancy = room.currentOccupancy + change;
      
      // Boundary checks (can't be negative, can't exceed capacity)
      if (newOccupancy < 0) newOccupancy = 0;
      if (newOccupancy > room.capacity) newOccupancy = room.capacity;

      // Simulate noise based on occupancy (more people = more baseline noise)
      const baseNoise = 30 + (newOccupancy * 1.5);
      const fluctuation = Math.floor(Math.random() * 10) - 5;
      const newNoiseDb = Math.max(30, Math.min(100, baseNoise + fluctuation));

      // Update room live status
      room.currentOccupancy = newOccupancy;
      room.noiseDb = newNoiseDb;
      room.noiseLevel = determineNoiseLevel(newNoiseDb);
      room.lastUpdated = Date.now();

      await room.save();

      // Log for Admin Analytics (Historical Data)
      await OccupancyLog.create({
        roomId: room._id,
        occupancy: newOccupancy,
        noiseDb: newNoiseDb
      });
    }
    
    console.log(`✅ Updated ${rooms.length} rooms at ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    console.error("Simulator error:", err);
  }
};

// Run immediately once, then every 30 seconds
setTimeout(simulateSensors, 2000); 
setInterval(simulateSensors, 30000);