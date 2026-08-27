import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import StudentForm from './components/StudentForm';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import CampusMap from './components/CampusMap'; // Imported the new Map Component

function NavLinks({ user, handleLogout }) {
  const location = useLocation();
  const linkBase = "px-4 py-1.5 rounded-full font-medium transition-all duration-200 text-sm";
  
  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <div className="flex gap-2 bg-[#1C1C1E] p-1 rounded-full border border-[#38383A]">
            <Link to="/" className={`${linkBase} ${location.pathname === '/' ? 'bg-[#38383A] text-white' : 'text-[#86868B] hover:text-white'}`}>
              Campus Live
            </Link>
            
            {/* NEW MAP LINK */}
            <Link to="/map" className={`${linkBase} ${location.pathname === '/map' ? 'bg-[#38383A] text-white' : 'text-[#86868B] hover:text-white'}`}>
              Map
            </Link>

            {user.role === 'admin' && (
              <Link to="/admin" className={`${linkBase} ${location.pathname === '/admin' ? 'bg-[#38383A] text-white' : 'text-[#86868B] hover:text-white'}`}>
                Admin
              </Link>
            )}
          </div>
          <button onClick={handleLogout} className="text-[#86868B] text-sm font-medium hover:text-white transition-colors">Logout</button>
        </>
      ) : (
        <Link to="/auth" className="bg-[#0A84FF] text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-[#007AFF] transition-colors">Sign In</Link>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  // Check if user is already logged in on page load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-black">
        {/* Apple-style Frosted Glass Navbar */}
        <nav className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl border-b border-[#38383A]">
          <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
            <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
              <span className="bg-white text-black p-1 rounded-md leading-none text-sm font-bold">SS</span>
              StudySpace <span className="text-[#86868B]">AI</span>
            </h1>
            <NavLinks user={user} handleLogout={handleLogout} />
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-6 md:p-10">
          <Routes>
            {/* Public Auth Route */}
            <Route path="/auth" element={!user ? <Auth setUser={setUser} /> : <Navigate to="/" />} />
            
            {/* Protected Student Routes */}
            <Route path="/" element={user ? <StudentForm /> : <Navigate to="/auth" />} />
            <Route path="/map" element={user ? <CampusMap /> : <Navigate to="/auth" />} />
            
            {/* Highly Protected Admin Route */}
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}