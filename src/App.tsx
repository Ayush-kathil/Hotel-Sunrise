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
import MobileNav from './components/MobileNav';
import ScrollToTop from './components/ScrollToTop';
import ScrollProgress from './components/ScrollProgress';
import SmoothScroll from './components/SmoothScroll';
import AdminRoute from './components/AdminRoute';
import ChatBot from './components/ChatBot'; // <--- IMPORT CHATBOT

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

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block">
        {!isAdminRoute && <Navbar />}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/dining" element={<Dining />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* SECURE ADMIN ROUTES */}
          <Route element={<AdminRoute />}>
             <Route path="/admin" element={<AdminDashboard />} />
             <Route path="/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="md:hidden pb-24"> 
        {!isAdminRoute && (
          <div className="fixed top-0 w-full p-4 z-50 flex justify-center bg-white/0 backdrop-blur-[2px] pointer-events-none">
             <span className="text-xl font-serif font-bold tracking-widest text-[#d4af37] drop-shadow-sm">SUNRISE</span>
          </div>
        )}
        
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
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/terms" element={<Terms />} />
                    
                    {/* SECURE ADMIN ROUTES (Mobile) */}
                    <Route element={<AdminRoute />}>
                       <Route path="/admin" element={<AdminDashboard />} />
                       <Route path="/dashboard" element={<AdminDashboard />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                 </Routes>
              </PageWrapper>
            } />
          </Routes>
        </AnimatePresence>

        {!isAdminRoute && <MobileNav />}
      </div>

      {/* --- FLOATING CHATBOT (Visible on All Views) --- */}
      <ChatBot />

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