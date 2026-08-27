Campus Study Space Management System

1. Problem Statement
Campus study spaces are hard to use efficiently due to several persistent challenges:

No Real-Time Visibility: Students have no way to know seat availability, crowd levels, or facilities before walking to a location.

Wasted Time & Effort: Students roam between blocks and floors searching for an open seat, especially during exam season.

Overcrowding & Underuse: Popular spaces get overcrowded while other rooms sit empty, with no system to balance demand.

No Data for Administrators: Administrators lack occupancy analytics needed to plan, expand, or reassign study infrastructure effectively.

2. Proposed Solution
StudySpace AI is a full-stack campus platform designed to make every study space visible, fair, and efficient to use. Built around smart matching filters, real-time occupancy synchronization, and predictive telemetry analytics, the system solves campus crowding by connecting students with their optimal study environment instantly.

3. Key Features
Institutional Authentication: Secure student and admin sign-in restricted strictly to @anurag.edu.in institutional email addresses.

Campus Hierarchy Support: Structured modeling across Blocks, Floors, and Rooms/Types (Classrooms, Labs, Libraries, Computer Labs, Discussion Cabins, Auditoriums, Seminar Halls).

Smart Matching & Requirements Engine: Interactive filter form allowing students to filter rooms by noise levels (Silent, Low, Moderate, High, Extreme), AC/Non-AC status, and required facilities.

Real-Time Pictorial Seat Maps: Dedicated individual room pages featuring interactive 12-seat grids where available seats are green and booked seats are dynamically disabled and grayed out.

Interactive Campus Map: Leaflet-powered digital map centered on Anurag University with live occupancy overlays and walking path routing.

Real-Time WebSockets: Powered by Socket.io to synchronize seat availability and room occupancies instantly across all connected clients.

Admin Analytics & Insights: Comprehensive dashboard featuring total managed spaces, active seat allocations, mail ID student directories, utilization reports, and peak-hour crowd forecasting.

4. Technologies Used
Frontend: React.js (Vite), Tailwind CSS, React Router, Lucide Icons, React-Leaflet (OpenStreetMap).

Backend: Node.js, Express.js, MongoDB Atlas, Mongoose ODM, JWT (JSON Web Tokens), bcryptjs, Socket.io.

Real-Time Sync: Socket.io for bi-directional event emission.

5. Implementation Details
Database Models: Mongoose schemas establish relational mapping between User, StudySpace (storing block, floor, room type, noise classifications, facilities, and coordinates), and Booking (storing time slots, user references, and specific seat numbers).

Conflict-Detection Booking Logic: Backend API validation checks incoming reservations against active time windows to prevent double-booking.

Real-Time Event Sockets: When a student reserves a seat, the backend instantly emits an occupancy-update event via Socket.io, updating room counters and seat grids globally without page refreshes.

Role-Based Portals: Conditional rendering splits the application UI into a streamlined student filtering/reservation portal and an administrative telemetry control center.

6. Future Scope
IoT Noise-Sensor Hardware: Integration with physical microphones capturing decibel (dB) levels to automatically map real-time noise categories.

Advanced Machine Learning Pipelines: Expanding predictive modeling using historical occupancy logs.

Automated Check-In Workflows: Mobile-friendly QR code check-in stations at room entrances to verify active reservations and dynamically adjust occupancy.

7. References / Bibliography
StudySpace AI Project Proposal & Architecture Presentation Deck.

React & Vite Documentation (https://react.dev)

Express.js & MongoDB Mongoose Documentation (https://mongoosejs.com)

Leaflet Maps & React-Leaflet Documentation (https://react-leaflet.js.org)