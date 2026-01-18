import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, Phone, UtensilsCrossed, Calendar, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';


const navLinks = [
  { name: "Rooms", path: "/rooms", icon: null },
  { name: "Dining", path: "/dining", icon: <UtensilsCrossed size={16} /> },
  { name: "Events", path: "/events", icon: <Calendar size={16} /> },
  { name: "Contact", path: "/contact", icon: <Phone size={16} /> },
  // ADD THIS LINE:
  { name: "Terms", path: "/terms", icon: null }, 
];
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string, photo: string | null } | null>(null);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // ROBUST DATA FETCHING
        const meta = session.user.user_metadata;
        const name = meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Member';
        // Check for Google photo OR custom photo
        const photo = meta.avatar_url || meta.picture || null;
        
        setUser({ name, photo });
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Listen for changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        const name = meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Member';
        const photo = meta.avatar_url || meta.picture || null;
        setUser({ name, photo });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8 }} 
        className="fixed top-0 w-full px-6 py-5 flex justify-between items-center bg-white/80 backdrop-blur-xl z-[100] border-b border-zinc-100/50"
      >
        <Link to="/" className="text-2xl font-serif tracking-widest font-bold text-black z-[110]">
          SUNRISE
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-8 text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-500">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className={`hover:text-black transition-colors flex items-center gap-2 ${location.pathname === link.path ? 'text-black' : ''}`}>
                {link.icon} {link.name}
              </Link>
            ))}
          </div>
          <div className="h-6 w-[1px] bg-zinc-200"></div>
          
          {user ? (
            <Link to="/dashboard" className="flex items-center gap-3 pl-1 pr-4 py-1 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all group">
              {user.photo ? (
                <img 
                  src={user.photo} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover border border-white"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none'; 
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              {/* Fallback Initial (Visible if no photo or photo fails) */}
              <div className={`w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs ${user.photo ? 'hidden' : ''}`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">
                {user.name.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full hover:bg-[#d4af37] transition-all">
              <span className="text-[10px] font-bold uppercase tracking-widest">Sign In</span>
            </Link>
          )}
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden z-[110] p-2 text-black">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: "-100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-white z-[90] flex flex-col justify-center items-center md:hidden"
          >
            <div className="flex flex-col gap-8 text-center">
              {navLinks.map((link, i) => (
                <motion.div key={link.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.1) }}>
                  <Link to={link.path} className="text-4xl font-serif text-black hover:text-[#d4af37] transition-colors">
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
                {user ? (
                   <Link to="/dashboard" className="px-8 py-4 bg-zinc-100 rounded-full font-bold uppercase tracking-widest text-xs">My Account</Link>
                ) : (
                   <Link to="/login" className="px-10 py-4 bg-black text-white rounded-full font-bold uppercase tracking-widest text-xs">Sign In</Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;