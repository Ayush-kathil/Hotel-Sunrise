import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { supabase } from './supabaseClient'; 

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
import Profile from './pages/Profile'; 

// Components
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import ScrollProgress from './components/ScrollProgress';
import SmoothScroll from './components/SmoothScroll';
import AdminRoute from './components/AdminRoute';
import ChatBot from './components/ChatBot';
import MobileMenuButton from './components/MobileMenuButton';

function App() {
  const location = useLocation();
  const [sessionLoading, setSessionLoading] = useState(true);

  // Helper to hide navbar on admin pages
  const isAdminRoute = location.pathname === '/dashboard' || location.pathname.startsWith('/admin');

  // Global Session Check
  useEffect(() => {
    const checkSession = async () => {
       await supabase.auth.getSession();
       setSessionLoading(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
       setSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (sessionLoading) {
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
    <div className="bg-[#fcfbf9] min-h-screen relative">
      <div className="grain-overlay"></div>
      <ScrollProgress />
      <SmoothScroll />
      <ScrollToTop />
      <Toaster 
        position="top-center" 
        toastOptions={{
          classNames: {
            toast: "bg-black/90 backdrop-blur-xl border border-[#d4af37]/30 text-white shadow-2xl rounded-xl p-4 gap-4",
            title: "text-[#d4af37] font-serif font-bold tracking-widest uppercase text-xs",
            description: "text-zinc-300 text-sm font-light",
            actionButton: "bg-[#d4af37] text-black font-bold uppercase tracking-widest text-[10px] px-3 py-2 rounded-lg hover:bg-white transition-colors",
            cancelButton: "bg-zinc-800 text-white font-bold uppercase tracking-widest text-[10px] px-3 py-2 rounded-lg hover:bg-zinc-700 transition-colors",
          }
        }}
      /> 

      {/* --- RESPONSIVE NAVIGATION --- */}
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        {!isAdminRoute && <Navbar />}
      </div>
      
      {/* Mobile Header (Logo only) */}
      <div className="md:hidden"> 
        {!isAdminRoute && (
          <div className="fixed top-0 w-full p-4 z-50 flex justify-center bg-white/0 backdrop-blur-[2px] pointer-events-none">
             <span className="text-xl font-serif font-bold tracking-widest text-[#d4af37] drop-shadow-sm">SUNRISE</span>
          </div>
        )}
      </div>

      {/* --- UNIFIED ROUTING WITH TRANSITIONS --- */}
      <div className="pb-24 md:pb-0"> {/* Mobile padding for bottom nav */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
             <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
             <Route path="/rooms" element={<PageWrapper><Rooms /></PageWrapper>} />
             <Route path="/booking" element={<PageWrapper><BookingPage /></PageWrapper>} />
             <Route path="/dining" element={<PageWrapper><Dining /></PageWrapper>} />
             <Route path="/events" element={<PageWrapper><Events /></PageWrapper>} />
             <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
             <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
             <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
             <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
             
             {/* SECURE ADMIN ROUTES */}
             <Route element={<AdminRoute />}>
                <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
                <Route path="/dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
             </Route>

             <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>

      {/* --- MOBILE BOTTOM MENU --- */}
      <div className="md:hidden">
        {!isAdminRoute && <MobileMenuButton />}
      </div>

      {/* --- FLOATING CHATBOT --- */}
      <ChatBot />

    </div>
  );
}

// OPTIMIZED PAGE TRANSITION
// Removed heavy 'x' slide which causes layout trashing on mobile.
// Switched to 'y' fade for a premium, lightweight feel.
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="w-full min-h-screen"
  >
    {children}
  </motion.div>
);

export default App;