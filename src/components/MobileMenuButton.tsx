import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Calendar, Utensils, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const MobileMenuButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  // const location = useLocation();
  // const isHome = location.pathname === '/';

  // Only show on non-home pages for mobile, or if we want it everywhere on mobile instead of Navbar
  // The requirement is "remove standard navbar from mobile".

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[60] w-14 h-14 bg-[#d4af37] text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all md:hidden`}
      >
        <Menu size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] md:hidden"
            />
            <motion.div
               initial={{ x: "100%" }}
               animate={{ x: 0 }}
               exit={{ x: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 300 }}
               className="fixed top-0 right-0 h-full w-3/4 max-w-sm bg-zinc-900 border-l border-white/10 z-[80] p-8 md:hidden flex flex-col"
            >
               <div className="flex justify-between items-center mb-12">
                  <span className="text-2xl font-serif font-bold text-[#d4af37]">SUNRISE</span>
                  <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">
                    <X size={24} />
                  </button>
               </div>

               <nav className="flex flex-col gap-6">
                  <MobileLink to="/" icon={<Home size={20} />} label="Home" onClick={() => setIsOpen(false)} />
                  <MobileLink to="/rooms" icon={<MapPin size={20} />} label="Rooms" onClick={() => setIsOpen(false)} />
                  <MobileLink to="/dining" icon={<Utensils size={20} />} label="Dining" onClick={() => setIsOpen(false)} />
                  <MobileLink to="/events" icon={<Calendar size={20} />} label="Events" onClick={() => setIsOpen(false)} />
                  <MobileLink to="/profile" icon={<User size={20} />} label="Profile" onClick={() => setIsOpen(false)} />
               </nav>

               <div className="mt-auto">
                  <p className="text-zinc-500 text-xs text-center uppercase tracking-widest">© 2026 Hotel Sunrise</p>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const MobileLink = ({ to, icon, label, onClick }: any) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-4 text-xl font-light text-white/80 hover:text-[#d4af37] transition-colors">
    <span className="text-[#d4af37]">{icon}</span>
    {label}
  </Link>
);

export default MobileMenuButton;
