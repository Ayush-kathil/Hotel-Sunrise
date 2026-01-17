import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, Phone, UtensilsCrossed, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

const Navbar = () => {
  const [user, setUser] = useState<{ name: string, photo: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { full_name, avatar_url } = session.user.user_metadata;
        const name = full_name || session.user.email?.split('@')[0] || 'Member';
        setUser({ name, photo: avatar_url || null });
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const { full_name, avatar_url } = session.user.user_metadata;
        const name = full_name || session.user.email?.split('@')[0] || 'Member';
        setUser({ name, photo: avatar_url || null });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // UPDATED LINK LIST (No Wellness)
  const navLinks = [
    { name: "Rooms", path: "/rooms", icon: null },
    { name: "Dining", path: "/dining", icon: <UtensilsCrossed size={12} /> },
    { name: "Events", path: "/events", icon: <Calendar size={12} /> },
    { name: "Contact", path: "/contact", icon: <Phone size={12} /> },
    { name: "Terms", path: "/terms", icon: <FileText size={12} /> },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
      className="fixed top-0 w-full px-6 md:px-12 py-5 flex justify-between items-center bg-white/80 backdrop-blur-xl z-[100] border-b border-zinc-100/50"
    >
      <Link to="/" className="text-2xl font-serif tracking-widest font-bold text-black no-underline hover:opacity-70 transition-opacity">
        SUNRISE
      </Link>
      
      <div className="flex items-center gap-8">
        <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-500">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className={`hover:text-black transition-colors flex items-center gap-2 ${location.pathname === link.path ? 'text-black' : ''}`}>
              {link.icon} {link.name}
            </Link>
          ))}
        </div>

        <div className="h-6 w-[1px] bg-zinc-200 hidden md:block"></div>
        
        <AnimatePresence mode='wait'>
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-zinc-100 animate-pulse" />
          ) : user ? (
            <Link to="/dashboard" className="group flex items-center gap-3 pl-1.5 pr-4 py-1.5 bg-zinc-50 rounded-full hover:bg-black hover:text-white transition-all duration-300 border border-zinc-200 hover:border-black">
              <div className="relative">
                {user.photo ? (
                  <img src={user.photo} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-white shadow-sm" />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-zinc-600 font-bold text-xs border border-white shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider truncate max-w-[100px] hidden sm:block">
                {user.name.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="group flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full hover:bg-[#d4af37] hover:scale-105 transition-all shadow-lg shadow-black/10">
              <span className="text-[10px] font-bold uppercase tracking-widest">Sign In</span>
              <LogIn size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;