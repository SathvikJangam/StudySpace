const mongoose = require('mongoose');
const Room = require('./models/Room');

// Connect to MongoDB (Removed deprecated options)
mongoose.connect('mongodb://localhost:27017/studyspace')
  .then(() => console.log("MongoDB Connected for Seeding"))
  .catch(err => console.log(err));

const seedRooms = [
  // 1. Library - Good for single students, Silent, AC
  { blockName: 'Library Block', floorNo: 1, roomName: 'Quiet Reading Room', type: 'Library', capacity: 100, hasAc: true, tableLayout: 'Individual', currentOccupancy: 25, noiseDb: 35, noiseLevel: 'Silent' },
  { blockName: 'Library Block', floorNo: 2, roomName: 'Discussion Cabin A', type: 'DiscussionCabin', capacity: 8, hasAc: true, tableLayout: 'Clusters', currentOccupancy: 0, noiseDb: 30, noiseLevel: 'Silent' },
  
  // 2. Tech Block - Labs, mostly AC, Moderate noise
  { blockName: 'Tech Block', floorNo: 3, roomName: 'CS Lab 301', type: 'ComputerLab', capacity: 60, hasAc: true, tableLayout: 'Rows', currentOccupancy: 45, noiseDb: 55, noiseLevel: 'Moderate' },
  { blockName: 'Tech Block', floorNo: 3, roomName: 'AI Seminar Hall', type: 'SeminarHall', capacity: 120, hasAc: true, tableLayout: 'Rows', currentOccupancy: 10, noiseDb: 40, noiseLevel: 'Low' },
  
  // 3. Arts & Humanities - Classrooms, some non-AC, varied noise
  { blockName: 'Arts Block', floorNo: 1, roomName: 'Room 101', type: 'Classroom', capacity: 40, hasAc: false, tableLayout: 'Rows', currentOccupancy: 35, noiseDb: 75, noiseLevel: 'High' },
  { blockName: 'Arts Block', floorNo: 1, roomName: 'Room 102', type: 'Classroom', capacity: 40, hasAc: false, tableLayout: 'Rows', currentOccupancy: 5, noiseDb: 45, noiseLevel: 'Low' },
  
  // 4. Student Center - Noisy, Cluster tables, Good for casual groups
  { blockName: 'Student Center', floorNo: 1, roomName: 'Open Lounge', type: 'DiscussionCabin', capacity: 50, hasAc: true, tableLayout: 'Clusters', currentOccupancy: 45, noiseDb: 85, noiseLevel: 'Extreme' },
  { blockName: 'Student Center', floorNo: 2, roomName: 'Project Room B', type: 'DiscussionCabin', capacity: 12, hasAc: true, tableLayout: 'Clusters', currentOccupancy: 4, noiseDb: 50, noiseLevel: 'Low' }
];

const seedDatabase = async () => {
  try {
    // Admin-Safe Check: Don't overwrite if data already exists
    const existingRooms = await Room.countDocuments();
    if (existingRooms > 0) {
      console.log("Database already has rooms. Seeding aborted to protect Admin data.");
      process.exit();
    }

    // Insert the seed data
    await Room.insertMany(seedRooms);
    console.log("Campus spaces successfully seeded!");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();