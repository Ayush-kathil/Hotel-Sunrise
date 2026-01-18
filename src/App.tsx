import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { supabase } from './supabaseClient'; // Import Supabase

// Pages
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Dining from './pages/Dining';
import Events from './pages/Events';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import BookingPage from './pages/BookingPage';
import Profile from './pages/Profile'; // Ensure you created this from previous step

// Components
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import ScrollToTop from './components/ScrollToTop';
import ScrollProgress from './components/ScrollProgress';

function App() {
  const location = useLocation();
  const [sessionLoading, setSessionLoading] = useState(true);

  // 1. GLOBAL SESSION CHECK (Prevents Flashing)
  useEffect(() => {
    supabase.auth.getSession().then(() => {
       setSessionLoading(false);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
       setSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (sessionLoading) {
     // 2. LOADING SCREEN (Shows while checking login)
     return (
       <div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-serif font-bold tracking-widest animate-pulse text-[#d4af37]">SUNRISE</h1>
            <div className="w-8 h-8 border-2 border-zinc-200 border-t-black rounded-full animate-spin"></div>
         </div>
       </div>
     );
  }

  return (
    <div className="bg-[#fcfbf9] min-h-screen">
      
      <ScrollProgress />
      <ScrollToTop />
      <Toaster position="top-center" richColors /> 

      <div className="hidden md:block">
        <Navbar />
      </div>

      <div className="md:hidden pb-24"> 
        <div className="fixed top-0 w-full p-4 z-50 flex justify-center bg-white/0 backdrop-blur-[2px] pointer-events-none">
           <span className="text-xl font-serif font-bold tracking-widest text-[#d4af37] drop-shadow-sm">SUNRISE</span>
        </div>
        
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="*" element={
              <PageWrapper>
                 <Routes location={location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/dining" element={<Dining />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/dashboard" element={<AdminDashboard />} /> {/* Handle old links */}
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="*" element={<NotFound />} />
                 </Routes>
              </PageWrapper>
            } />
          </Routes>
        </AnimatePresence>
      </div>

      <div className="hidden md:block">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/dining" element={<Dining />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <MobileNav />
      
    </div>
  );
}

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ x: "100%", opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: "-20%", opacity: 0 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
    className="w-full min-h-screen"
  >
    {children}
  </motion.div>
);

export default App;