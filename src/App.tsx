import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Dining from './pages/Dining';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './components/UserDashboard';
import Terms from './pages/Terms';
import Events from './pages/Events';
import SmoothScroll from './components/SmoothScroll'; // <--- IMPORT THIS
import Booking from './pages/BookingPage'; // Check the filename match!



const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  return (
    <>
      <SmoothScroll /> {/* <--- ADD THIS AT THE TOP */}
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/events" element={<Events />} />
        <Route path="/booking" element={<Booking />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;