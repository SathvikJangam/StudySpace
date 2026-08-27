const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Room = require('./models/Room');
const User = require('./models/User'); // Make sure you created this file in Step 2!
const Reservation = require('./models/Reservation');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "studyspace_super_secret_key_2026"; // In production, put this in a .env file

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/studyspace')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error: ", err));

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Register Route
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Auto-assign admin role if email is 'admin@college.edu'
    const role = email === 'admin@college.edu' ? 'admin' : 'student';

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// MIDDLEWARE: PROTECT ADMIN ROUTES
// ==========================================
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: "Access denied. Admins only." });
    req.user = decoded; // Attach the decoded user payload to the request
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};

const verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied. Please login." });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};
// ==========================================
// ADMIN ENDPOINTS (Secured with verifyAdmin)
// ==========================================
app.post('/api/admin/rooms', verifyAdmin, async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.status(201).json({ message: "Room added successfully", room: newRoom });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/rooms/:id', verifyAdmin, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/rooms', verifyAdmin, async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Get all the vacancies
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ==========================================
// STUDENT ENDPOINTS (Intelligent Matching)
// ==========================================
app.post('/api/match', async (req, res) => {
  const { groupSize, acPreference, noisePreference } = req.body; 

  try {
    const allRooms = await Room.find();

    // Hard Filter: Must have enough available seats
    let validRooms = allRooms.filter(room => 
      (room.capacity - room.currentOccupancy) >= groupSize
    );

    const noiseLevels = { 'Silent': 1, 'Low': 2, 'Moderate': 3, 'High': 4, 'Extreme': 5 };
    
    let targetNoiseLimit = 5; 
    if (noisePreference === 'low') targetNoiseLimit = 2;
    if (noisePreference === 'med') targetNoiseLimit = 3;
    if (noisePreference === 'high') targetNoiseLimit = 4;

    const scoredRooms = validRooms.map(room => {
      let score = 0;
      let reasons = [];

      // AC Preference Scoring
      if (acPreference === 'ac' && room.hasAc) {
        score += 20; reasons.push("Has AC");
      } else if (acPreference === 'nonac' && !room.hasAc) {
        score += 20; reasons.push("Non-AC environment as requested");
      } else if (acPreference === 'either') {
        score += 5; 
      } else if (acPreference !== 'either') {
        score -= 20; 
      }

      // Noise Preference Scoring
      const roomNoiseVal = noiseLevels[room.noiseLevel] || 1;
      if (noisePreference !== 'either') {
        if (roomNoiseVal <= targetNoiseLimit) {
          score += 20; reasons.push(`Meets noise requirement (${room.noiseLevel})`);
        } else {
          score -= 30; 
        }
      }

      // Group vs Single Logic
      if (groupSize > 1) {
        if (room.tableLayout === 'Clusters' || room.type === 'DiscussionCabin') {
          score += 25; reasons.push("Perfect layout for group discussion");
        }
      } else if (groupSize === 1 && room.tableLayout === 'Individual') {
        score += 15; reasons.push("Individual seating available");
      }

      // Availability Bonus
      const availabilityPercentage = ((room.capacity - room.currentOccupancy) / room.capacity) * 100;
      if (availabilityPercentage > 40) {
        score += 10; reasons.push("Plenty of space available");
      }

      return { room, score, reasons };
    });

    const highlyRecommended = scoredRooms.filter(r => r.score > 0);
    highlyRecommended.sort((a, b) => b.score - a.score);
    res.json(highlyRecommended.slice(0, 5));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// RESERVATION ENDPOINTS (Hybrid Model)
// ==========================================

// Get booked slots for a specific room on a specific date
app.get('/api/rooms/:id/slots', verifyUser, async (req, res) => {
  const { date } = req.query; // Expecting YYYY-MM-DD
  try {
    const bookings = await Reservation.find({ room: req.params.id, date, status: 'active' });
    const bookedSlots = bookings.map(b => b.timeSlot);
    res.json(bookedSlots); // Returns an array of strings like ["10:00 AM - 11:00 AM"]
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book a room slot
app.post('/api/reservations', verifyUser, async (req, res) => {
  const { roomId, date, timeSlot } = req.body;
  try {
    const room = await Room.findById(roomId);
    if (!room || !room.isReservable) return res.status(400).json({ error: "This space is First-Come-First-Serve." });

    // Check if slot is already taken
    const existingBooking = await Reservation.findOne({ room: roomId, date, timeSlot, status: 'active' });
    if (existingBooking) return res.status(400).json({ error: "This time slot is already booked." });

    const newReservation = new Reservation({ user: req.user.id, room: roomId, date, timeSlot });
    await newReservation.save();
    
    res.status(201).json({ message: "Space reserved successfully!", reservation: newReservation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit/Update a room
app.put('/api/admin/rooms/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Room updated successfully", room: updatedRoom });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a student's personal bookings
app.get('/api/reservations/me', verifyUser, async (req, res) => {
  try {
    // We use .populate('room') to pull in the room name/details for the UI
    const bookings = await Reservation.find({ user: req.user.id, status: 'active' }).populate('room');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));