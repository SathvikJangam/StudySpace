import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import axios from 'axios';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function CampusMap() {
  const [rooms, setRooms] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('All');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/rooms`, getAuthHeaders());
        setRooms(response.data);
      } catch (error) { console.error("Map Fetch Error:", error); }
    };
    fetchRooms();
  }, []);

  // Anurag University Coordinates
  const anuragUniversityCoords = [17.4223, 78.6575]; 
  
  const blockCoordinates = {
    'Tech Block': [17.4230, 78.6570],
    'Library Block': [17.4220, 78.6580],
    'Arts Block': [17.4215, 78.6565],
    'Student Center': [17.4225, 78.6585]
  };

  const extractedFloors = rooms.map(r => Number(r.floorNo)).filter(f => !isNaN(f));
  const availableFloors = ['All', ...new Set(extractedFloors)].sort((a, b) => a - b);
  const filteredRooms = selectedFloor === 'All' ? rooms : rooms.filter(r => Number(r.floorNo) === selectedFloor);

  const blocks = filteredRooms.reduce((acc, room) => {
    if (!acc[room.blockName]) acc[room.blockName] = [];
    acc[room.blockName].push(room);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Anurag University Navigator</h2>
        <p className="text-[#86868B]">Interactive Floor-Wise Campus Map</p>
      </div>

      <div className="flex justify-center gap-3 bg-[#1C1C1E] p-4 rounded-2xl border border-[#38383A] overflow-x-auto">
        <span className="text-[#86868B] text-sm font-medium self-center mr-2 whitespace-nowrap">Select Floor:</span>
        {availableFloors.map(floor => (
          <button 
            key={floor} 
            onClick={() => setSelectedFloor(floor)}
            className={`whitespace-nowrap px-5 py-2 rounded-lg text-sm font-bold transition-all ${selectedFloor === floor ? 'bg-[#0A84FF] text-white shadow-lg shadow-[#0A84FF]/20' : 'bg-[#2C2C2E] text-[#86868B] hover:text-white'}`}
          >
            {floor === 'All' ? 'Campus View' : `Floor ${floor}`}
          </button>
        ))}
      </div>

      <div className="bg-[#1C1C1E] border border-[#38383A] p-2 rounded-3xl overflow-hidden shadow-2xl h-[600px] relative z-0">
        
        {/* Adjusted Zoom level to 17 so buildings are clearly visible */}
        <MapContainer center={anuragUniversityCoords} zoom={17} style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}>
          
          {/* STANDARD OPENSTREETMAP TILES (100% Free, No API Key, Shows Buildings) */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {Object.keys(blocks).map(blockName => {
            const position = blockCoordinates[blockName] || anuragUniversityCoords;
            return (
              <Marker key={blockName} position={position}>
                <Popup className="custom-popup">
                  <div className="bg-[#1C1C1E] text-white p-3 rounded-lg border border-[#38383A]">
                    <h3 className="font-bold text-lg mb-3 text-[#0A84FF]">{blockName} {selectedFloor !== 'All' && `(Floor ${selectedFloor})`}</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                      {blocks[blockName].map(room => (
                        <div key={room._id} className="text-sm border-b border-[#38383A] pb-2">
                          <div className="flex justify-between items-center gap-4">
                            <span className="font-semibold text-white">{room.roomName}</span>
                            <span className="text-[9px] uppercase font-bold text-[#86868B] whitespace-nowrap">{room.type}</span>
                          </div>
                          <div className="mt-1 flex justify-between">
                            <span className={`text-xs font-semibold ${room.isReservable ? 'text-[#0A84FF]' : 'text-[#32D74B]'}`}>
                              {room.isReservable ? 'Reservable' : 'Walk-in'}
                            </span>
                            {!room.isReservable && (
                              <span className="text-xs text-[#86868B]">{room.capacity - room.currentOccupancy} free</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}