import { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function StudentForm() {
  const [allRooms, setAllRooms] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [formData, setFormData] = useState({ groupType: 'single', groupSize: 1, acPreference: 'either', noisePreference: 'either' });

  // Booking Modal State (Added safety defaults)
  const [bookingModal, setBookingModal] = useState({ isOpen: false, room: null, date: new Date().toISOString().split('T')[0], bookedSlots: [] });
  const timeSlots = ["09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM"];
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchData = async () => {
    try {
      // Changed to pass auth headers just in case your backend locked the /api/rooms route
      const roomRes = await axios.get(`${API_URL}/api/rooms`, getAuthHeaders());
      setAllRooms(roomRes.data);
      
      const bookingRes = await axios.get(`${API_URL}/api/reservations/me`, getAuthHeaders());
      setMyBookings(bookingRes.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { groupSize: formData.groupType === 'single' ? 1 : Number(formData.groupSize), acPreference: formData.acPreference, noisePreference: formData.noisePreference };
    try {
      const response = await axios.post(`${API_URL}/api/match`, payload, getAuthHeaders());
      setResults(response.data);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  // --- BOOKING LOGIC ---
  const openBookingModal = async (room) => {
    setBookingModal({ isOpen: true, room: room, date: new Date().toISOString().split('T')[0], bookedSlots: [] });
    fetchBookedSlots(room._id, new Date().toISOString().split('T')[0]);
  };

  const fetchBookedSlots = async (roomId, date) => {
    try {
      const res = await axios.get(`${API_URL}/api/rooms/${roomId}/slots?date=${date}`, getAuthHeaders());
      // Ensure it defaults to an empty array to prevent mapping crashes
      setBookingModal(prev => ({ ...prev, bookedSlots: res.data || [] }));
    } catch (error) { console.error("Error fetching slots", error); }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setBookingModal(prev => ({ ...prev, date: newDate }));
    if (bookingModal.room) fetchBookedSlots(bookingModal.room._id, newDate);
  };

  const confirmBooking = async (timeSlot) => {
    try {
      await axios.post(`${API_URL}/api/reservations`, { roomId: bookingModal.room._id, date: bookingModal.date, timeSlot }, getAuthHeaders());
      setBookingModal({ isOpen: false, room: null, date: '', bookedSlots: [] });
      fetchData(); 
      setActiveTab('My Bookings'); 
    } catch (error) { alert(error.response?.data?.error || "Booking failed."); }
  };

  const roomTypes = ['All', 'My Bookings', ...new Set(allRooms.map(r => r.type))];
  const filteredRooms = activeTab === 'All' ? allRooms : allRooms.filter(r => r.type === activeTab);

  const RadioPill = ({ name, value, label, current, onChange }) => (
    <label className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold transition-all border ${current === value ? 'bg-[#0A84FF] border-[#0A84FF] text-white' : 'bg-[#1C1C1E] border-[#38383A] text-[#86868B] hover:text-white hover:border-[#86868B]'}`}>
      <input type="radio" className="hidden" name={name} value={value} checked={current === value} onChange={onChange} />
      {label}
    </label>
  );

  return (
    <div className="max-w-7xl mx-auto relative">
      
      {/* SIDE-BY-SIDE GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Campus Live Dashboard (Takes up 7 columns out of 12) */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-white">Campus Live Status</h2>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {roomTypes.map(type => (
              <button key={type} onClick={() => setActiveTab(type)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === type ? (type === 'My Bookings' ? 'bg-[#0A84FF] text-white' : 'bg-white text-black') : 'bg-[#1C1C1E] text-[#86868B] hover:text-white border border-[#38383A]'}`}>
                {type === 'My Bookings' ? '🎟️ My Digital Tickets' : type.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>

          {activeTab === 'My Bookings' ? (
            <div className="grid grid-cols-1 gap-4">
              {myBookings.length === 0 && <p className="text-[#86868B]">You have no active reservations.</p>}
              {myBookings.map(booking => (
                <div key={booking._id} className="bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] border border-[#38383A] p-6 rounded-3xl flex gap-6 items-center shadow-xl">
                  <div className="bg-white p-2 rounded-xl">
                    <QRCodeSVG value={booking._id || 'ticket'} size={90} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xl">{booking.room?.roomName || "Room Removed"}</h3>
                    <p className="text-sm text-[#0A84FF] font-medium mt-1">{booking.date}</p>
                    <p className="text-sm text-[#86868B]">{booking.timeSlot}</p>
                    <div className="mt-3 text-[10px] text-[#86868B] uppercase tracking-widest font-bold">Show at Door Scanner</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRooms.map(room => (
                <div key={room._id} className="bg-[#1C1C1E] border border-[#38383A] p-5 rounded-2xl flex flex-col justify-between h-36">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-white truncate pr-2">{room.roomName}</h3>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-sm flex-shrink-0 ${room.isReservable ? 'bg-[#0A84FF]/20 text-[#0A84FF]' : 'bg-[#32D74B]/20 text-[#32D74B]'}`}>
                        {room.isReservable ? 'Reservable' : 'Walk-in'}
                      </span>
                    </div>
                    <p className="text-xs text-[#86868B]">{room.blockName} • Floor {room.floorNo}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    {room.isReservable ? (
                      <button onClick={() => openBookingModal(room)} className="text-[#0A84FF] text-sm font-semibold hover:underline">Book Slot ➔</button>
                    ) : (
                      <div>
                        <div className="text-2xl font-semibold text-white leading-none">{room.capacity - room.currentOccupancy}</div>
                        <div className="text-[10px] text-[#86868B] uppercase">Seats Free</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Inquiry Form (Takes up 5 columns out of 12) */}
        <div className="lg:col-span-5 bg-[#1C1C1E] border border-[#38383A] p-6 rounded-3xl sticky top-24">
          <h2 className="text-xl font-bold text-white mb-6">AI Space Matcher</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#86868B]">1. Party Size</label>
              <div className="flex flex-wrap gap-2">
                <RadioPill name="groupType" value="single" label="Individual" current={formData.groupType} onChange={(e) => setFormData({...formData, groupType: e.target.value})} />
                <RadioPill name="groupType" value="group" label="Group Study" current={formData.groupType} onChange={(e) => setFormData({...formData, groupType: e.target.value})} />
              </div>
              {formData.groupType === 'group' && (
                <input type="number" min="2" max="20" placeholder="Number of people" required className="w-full px-4 py-3 bg-[#2C2C2E] border border-[#38383A] focus:border-[#0A84FF] text-white rounded-xl outline-none text-sm" value={formData.groupSize} onChange={(e) => setFormData({...formData, groupSize: e.target.value})} />
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#86868B]">2. Climate</label>
              <div className="flex flex-wrap gap-2">
                <RadioPill name="acPreference" value="ac" label="AC" current={formData.acPreference} onChange={(e) => setFormData({...formData, acPreference: e.target.value})} />
                <RadioPill name="acPreference" value="nonac" label="Non-AC" current={formData.acPreference} onChange={(e) => setFormData({...formData, acPreference: e.target.value})} />
                <RadioPill name="acPreference" value="either" label="Any" current={formData.acPreference} onChange={(e) => setFormData({...formData, acPreference: e.target.value})} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#86868B]">3. Acoustics</label>
              <div className="flex flex-wrap gap-2">
                <RadioPill name="noisePreference" value="low" label="Silent" current={formData.noisePreference} onChange={(e) => setFormData({...formData, noisePreference: e.target.value})} />
                <RadioPill name="noisePreference" value="med" label="Moderate" current={formData.noisePreference} onChange={(e) => setFormData({...formData, noisePreference: e.target.value})} />
                <RadioPill name="noisePreference" value="high" label="Lively" current={formData.noisePreference} onChange={(e) => setFormData({...formData, noisePreference: e.target.value})} />
                <RadioPill name="noisePreference" value="either" label="Any" current={formData.noisePreference} onChange={(e) => setFormData({...formData, noisePreference: e.target.value})} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#0A84FF] text-white font-semibold py-3 rounded-xl hover:bg-[#007AFF] transition-colors disabled:opacity-50 mt-4 text-sm">
              {loading ? "Analyzing..." : "Find Space"}
            </button>
          </form>

          {/* RESULTS RENDERED UNDER THE FORM ON THE RIGHT */}
          {results.length > 0 && (
            <div className="mt-8 space-y-3 border-t border-[#38383A] pt-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Matches</h3>
              {results.map((result, idx) => (
                <div key={idx} className="bg-[#2C2C2E] border border-[#38383A] p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{result.room.roomName}</h4>
                      <div className="text-[10px] text-[#86868B] mt-0.5">{result.room.isReservable ? "Requires Booking" : "Open Walk-in"}</div>
                    </div>
                    {result.room.isReservable ? (
                      <button onClick={() => openBookingModal(result.room)} className="bg-[#0A84FF] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#007AFF]">Reserve</button>
                    ) : (
                      <div className="text-right">
                        <div className="text-lg font-bold text-white leading-none">{result.room.capacity - result.room.currentOccupancy}</div>
                        <div className="text-[9px] text-[#86868B] uppercase mt-1">Seats</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 3. BOOKING MODAL (CRASH FIXED) */}
      {bookingModal.isOpen && bookingModal.room && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1C1C1E] border border-[#38383A] rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white truncate pr-4">Book {bookingModal.room.roomName}</h3>
              <button onClick={() => setBookingModal({ isOpen: false, room: null, date: '', bookedSlots: [] })} className="text-[#86868B] hover:text-[#FF453A] text-2xl font-light">&times;</button>
            </div>
            <input type="date" value={bookingModal.date} onChange={handleDateChange} className="w-full px-4 py-3 bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl mb-6 outline-none text-sm" min={new Date().toISOString().split('T')[0]} />
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {timeSlots.map(slot => {
                // Safely check if bookedSlots exists before calling .includes()
                const isBooked = (bookingModal.bookedSlots || []).includes(slot);
                return (
                  <button key={slot} disabled={isBooked} onClick={() => confirmBooking(slot)} className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isBooked ? 'bg-[#2C2C2E] text-[#86868B] cursor-not-allowed opacity-40' : 'bg-[#0A84FF]/10 text-[#0A84FF] hover:bg-[#0A84FF]/20 border border-[#0A84FF]/30'}`}>
                    <span>{slot}</span><span>{isBooked ? 'Booked' : 'Available'}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}