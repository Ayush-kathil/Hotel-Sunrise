import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, UtensilsCrossed, Calendar, User, Phone } from 'lucide-react';

const MobileNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: <Home size={24} />, label: "Home" },
    { path: "/rooms", icon: <Calendar size={24} />, label: "Stay" },
    { path: "/dining", icon: <UtensilsCrossed size={24} />, label: "Eat" },
    { path: "/contact", icon: <Phone size={24} />, label: "Help" },
    { path: "/dashboard", icon: <User size={24} />, label: "Me" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-lg border-t border-zinc-200 pb-safe pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center pb-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path} className="relative flex flex-col items-center gap-1 p-2 w-16">
              {/* Active Indicator (Glowing Dot) */}
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-active"
                  className="absolute -top-2 w-8 h-1 bg-[#d4af37] rounded-b-lg shadow-[0_0_10px_#d4af37]" 
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon Animation */}
              <motion.div
                animate={{ 
                  y: isActive ? -2 : 0, 
                  color: isActive ? "#d4af37" : "#a1a1aa" 
                }}
                whileTap={{ scale: 0.8 }}
              >
                {item.icon}
              </motion.div>

              {/* Label */}
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-zinc-900" : "text-zinc-400"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;