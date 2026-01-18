import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="relative h-screen w-full flex items-center justify-center bg-zinc-900 overflow-hidden">
      
      {/* 1. LUXURY BACKGROUND (Blurred) */}
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px)'
        }}
      />
      
      {/* Dark Overlay to make text pop */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* 2. GLASS CARD CONTENT */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 p-10 md:p-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] text-center max-w-lg mx-6 shadow-2xl"
      >
        <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
        >
            <div className="w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center text-zinc-900 shadow-[0_0_20px_#d4af37]">
                <span className="text-4xl font-serif font-bold">?</span>
            </div>
        </motion.div>

        <h1 className="text-8xl font-serif font-bold text-white mb-2 tracking-tighter">404</h1>
        <h2 className="text-xl md:text-2xl font-bold text-[#d4af37] uppercase tracking-widest mb-6">Wrong Destination</h2>
        
        <p className="text-zinc-300 text-base md:text-lg mb-10 leading-relaxed font-light">
           We apologize, but the suite you are looking for is currently unavailable or does not exist.
        </p>

        <Link to="/">
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest hover:bg-[#d4af37] hover:text-white transition-all shadow-lg flex items-center gap-3 mx-auto"
            >
                <Home size={18} /> Return to Lobby
            </motion.button>
        </Link>
      </motion.div>

    </div>
  );
};

export default NotFound;