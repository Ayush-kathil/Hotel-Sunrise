import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Rooms from './pages/Rooms';
import Booking from './pages/BookingPage';
import Contact from './pages/Contact'; // <-- ADDED THIS
import UserDashboard from './components/UserDashboard';
import Terms from './pages/Terms';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="font-sans text-zinc-900 bg-white selection:bg-black selection:text-white min-h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/contact" element={<Contact />} /> {/* <-- ADDED THIS */}
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/terms" element={<Terms />} />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;