import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [rooms, setRooms] = useState([]);
  const [editModeId, setEditModeId] = useState(null); // Tracks if we are editing
  
  const [roomForm, setRoomForm] = useState({ 
    blockName: '', floorNo: '', roomName: '', type: 'Classroom', capacity: '', hasAc: false, tableLayout: 'Rows', isReservable: false 
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchRooms = async () => {
    try {
      const response = await axios.get('${API_URL}/api/admin/rooms', getAuthHeaders());
      setRooms(response.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editModeId) {
        await axios.put(`${API_URL}/api/admin/rooms/${editModeId}`, roomForm, getAuthHeaders());
      } else {
        await axios.post('${API_URL}/api/admin/rooms', roomForm, getAuthHeaders());
      }
      fetchRooms();
      setRoomForm({ blockName: '', floorNo: '', roomName: '', type: 'Classroom', capacity: '', hasAc: false, tableLayout: 'Rows', isReservable: false });
      setEditModeId(null);
    } catch (error) { alert("Failed to save room."); }
  };

  const handleEdit = (room) => {
    setEditModeId(room._id);
    setRoomForm({
      blockName: room.blockName, floorNo: room.floorNo, roomName: room.roomName, type: room.type, 
      capacity: room.capacity, hasAc: room.hasAc, tableLayout: room.tableLayout, isReservable: room.isReservable
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm("Remove this space from the campus registry?")) {
      await axios.delete(`${API_URL}/api/admin/rooms/${id}`, getAuthHeaders());
      fetchRooms();
    }
  };

  const inputClass = "w-full px-4 py-3 bg-[#2C2C2E] border border-[#38383A] focus:border-[#0A84FF] text-white rounded-xl outline-none transition-colors text-sm";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* FORM SECTION */}
      <div className="bg-[#1C1C1E] rounded-3xl border border-[#38383A] p-8">
        <h2 className="text-xl font-semibold text-white mb-6">
          {editModeId ? "✏️ Edit Campus Space" : "🏗️ Deploy New Space"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Block Name" required className={inputClass} value={roomForm.blockName} onChange={e => setRoomForm({...roomForm, blockName: e.target.value})} />
          <input type="number" placeholder="Floor No." required className={inputClass} value={roomForm.floorNo} onChange={e => setRoomForm({...roomForm, floorNo: e.target.value})} />
          <input type="text" placeholder="Room Name" required className={inputClass} value={roomForm.roomName} onChange={e => setRoomForm({...roomForm, roomName: e.target.value})} />
          
          <select className={inputClass} value={roomForm.type} onChange={e => setRoomForm({...roomForm, type: e.target.value})}>
            <option value="Classroom">Classroom</option><option value="ComputerLab">Computer Lab</option>
            <option value="Library">Library</option><option value="DiscussionCabin">Discussion Cabin</option><option value="SeminarHall">Seminar Hall</option>
          </select>
          <input type="number" placeholder="Capacity" required className={inputClass} value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: e.target.value})} />
          <select className={inputClass} value={roomForm.tableLayout} onChange={e => setRoomForm({...roomForm, tableLayout: e.target.value})}>
            <option value="Rows">Row Seating</option><option value="Clusters">Cluster Tables</option><option value="Individual">Individual Desks</option>
          </select>
          
          <div className="flex flex-col gap-2 justify-center">
            <label className="flex items-center gap-3 p-2 font-medium text-sm text-[#86868B] cursor-pointer">
              <input type="checkbox" checked={roomForm.hasAc} onChange={e => setRoomForm({...roomForm, hasAc: e.target.checked})} className="w-4 h-4 accent-[#0A84FF]" /> Has AC
            </label>
            <label className="flex items-center gap-3 p-2 font-medium text-sm text-[#86868B] cursor-pointer">
              <input type="checkbox" checked={roomForm.isReservable} onChange={e => setRoomForm({...roomForm, isReservable: e.target.checked})} className="w-4 h-4 accent-[#0A84FF]" /> Requires Reservation
            </label>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="flex-1 bg-[#0A84FF] text-white font-medium py-3 rounded-xl hover:bg-[#007AFF] transition-colors">
              {editModeId ? "Update Space Info" : "Add to Registry"}
            </button>
            {editModeId && (
              <button type="button" onClick={() => { setEditModeId(null); setRoomForm({ blockName: '', floorNo: '', roomName: '', type: 'Classroom', capacity: '', hasAc: false, tableLayout: 'Rows', isReservable: false }); }} className="px-6 bg-[#2C2C2E] text-white font-medium py-3 rounded-xl hover:bg-[#38383A] transition-colors">Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-[#1C1C1E] rounded-3xl border border-[#38383A] overflow-hidden">
        <div className="p-6 border-b border-[#38383A] bg-[#2C2C2E]/50"><h2 className="text-xl font-semibold text-white">Live Telemetry</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#38383A] bg-[#1C1C1E]">
                <th className="py-4 px-6 text-[#86868B] text-xs font-medium uppercase tracking-wider">Location</th>
                <th className="py-4 px-6 text-[#86868B] text-xs font-medium uppercase tracking-wider">Type</th>
                <th className="py-4 px-6 text-[#86868B] text-xs font-medium uppercase tracking-wider">Occupancy</th>
                <th className="py-4 px-6 text-[#86868B] text-xs font-medium uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38383A]">
              {rooms.map(room => (
                <tr key={room._id} className="hover:bg-[#2C2C2E] transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-medium text-white">{room.roomName}</div>
                    <div className="text-xs text-[#86868B] mt-1">{room.blockName} • Flr {room.floorNo}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-[#86868B]">
                    <div className="font-medium text-white">{room.type}</div>
                    <div className={`text-[10px] mt-1 uppercase font-bold tracking-wider ${room.isReservable ? 'text-[#0A84FF]' : 'text-[#32D74B]'}`}>
                      {room.isReservable ? "Reservable" : "Walk-in (FCFS)"}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white text-sm">{room.currentOccupancy}/{room.capacity}</td>
                  <td className="py-4 px-6 text-right space-x-4">
                    <button onClick={() => handleEdit(room)} className="text-[#0A84FF] text-sm hover:underline font-medium">Edit</button>
                    <button onClick={() => handleDeleteRoom(room._id)} className="text-[#FF453A] text-sm hover:underline font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}