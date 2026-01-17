import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogIn, Phone, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [user, setUser] = useState<string | null>(null);

  // Check for user login on load & when localStorage changes
  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('sunriseUser');
      if (storedUser) setUser(storedUser);
    };

    checkUser();
    window.addEventListener('storage', checkUser); // Listen for updates
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Apple-style easing
      className="fixed top-0 w-full px-6 md:px-12 py-5 flex justify-between items-center bg-white/80 backdrop-blur-xl z-[100] border-b border-zinc-100/50"
    >
      <Link to="/" className="text-2xl font-serif tracking-widest font-bold text-black no-underline hover:opacity-70 transition-opacity">
        SUNRISE
      </Link>
      
      <div className="flex items-center gap-8">
        {/* Navigation Links */}
        <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-500">
          <Link to="/rooms" className="hover:text-black transition-colors flex items-center gap-2">
            Rooms
          </Link>
          <Link to="/rooms" className="hover:text-black transition-colors flex items-center gap-2">
            <UtensilsCrossed size={12} /> Dining
          </Link>
          <Link to="/contact" className="hover:text-[#d4af37] transition-colors flex items-center gap-2 text-black">
            <Phone size={12} /> Concierge
          </Link>
        </div>

        <div className="h-6 w-[1px] bg-zinc-200 hidden md:block"></div>
        
        {/* User Profile / Login */}
        {user ? (
          <Link 
            to="/dashboard" 
            className="group flex items-center gap-3 pl-1 pr-4 py-1.5 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all duration-300 border border-transparent hover:border-black/10"
          >
            <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-black group-hover:scale-110 transition-transform">
              <User size={14} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider truncate max-w-[100px]">{user}</span>
          </Link>
        ) : (
          <Link 
            to="/login" 
            className="group flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full hover:bg-[#d4af37] hover:scale-105 transition-all shadow-lg shadow-black/10"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Sign In</span>
            <LogIn size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;