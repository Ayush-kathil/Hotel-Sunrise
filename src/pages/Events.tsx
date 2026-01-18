import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowDown, Users, Star, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

// --- DATA ---
const venues = [
  {
    id: "ballroom",
    title: "The Grand Ballroom",
    subtitle: "Royal Elegance",
    capacity: "500 Guests",
    desc: "A masterpiece of architectural design featuring Austrian crystal chandeliers, soaring 24-foot ceilings, and a private bridal suite. The perfect stage for your fairytale ending.",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop",
    features: ["Private Bridal Suite", "State-of-the-art AV", "24ft Ceilings"]
  },
  {
    id: "terrace",
    title: "Oceanview Terrace",
    subtitle: "Al Fresco Luxury",
    capacity: "150 Guests",
    desc: "Where the horizon meets luxury. An open-air sanctuary designed for golden-hour cocktails and romantic ceremonies under a canopy of stars.",
    img: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070&auto=format&fit=crop",
    features: ["Panoramic Views", "Fire Pits", "Private Bar"]
  },
  {
    id: "boardroom",
    title: "The Executive Loft",
    subtitle: "Corporate Focus",
    capacity: "40 Guests",
    desc: "High stakes require high focus. A soundproofed haven equipped with cutting-edge telepresence technology and ergonomic Herman Miller seating.",
    img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop",
    features: ["Telepresence Tech", "Butler Service", "Acoustic Treatment"]
  }
];

// --- ANIMATION VARIANTS (Apple Style) ---
const blurReveal = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)", 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

const Events = () => {
  const [activeCard, setActiveCard] = useState(0);
  const heroRef = useRef(null);

  // Parallax Hero
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Form State
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Inquiry Received", { description: "We will contact you shortly." });
    }, 1500);
  };

  return (
    <div className="bg-[#fcfbf9] min-h-screen font-sans selection:bg-[#d4af37] selection:text-white">
      
      {/* 1. HERO SECTION (Immersive Video/Image) */}
      <section ref={heroRef} className="h-screen relative flex items-center justify-center overflow-hidden bg-black">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-black/30 z-10" />
           <img 
             src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop" 
             className="w-full h-full object-cover" 
             alt="Events Hero"
           />
        </motion.div>
        
        <div className="relative z-20 text-center px-6">
           <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.2 } } }}>
             <motion.span variants={blurReveal} className="inline-block text-[#d4af37] text-xs font-bold uppercase tracking-[0.3em] mb-6 border border-[#d4af37]/30 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md">
               The Collection
             </motion.span>
             <div className="overflow-hidden mb-6">
               <motion.h1 variants={blurReveal} className="text-7xl md:text-9xl font-serif font-bold text-white leading-[0.9] tracking-tighter">
                 Memories <br/> <span className="italic text-white/50">Unfolded.</span>
               </motion.h1>
             </div>
             <motion.p variants={blurReveal} className="max-w-md mx-auto text-white/70 text-lg font-light leading-relaxed">
               Spaces designed not just to host events, but to inspire awe.
             </motion.p>
           </motion.div>
        </div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-12 z-20 text-white/50">
           <ArrowDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* 2. THE SPLIT SCREEN SHOWCASE (The Core Fix) */}
      <div className="relative z-10 bg-[#fcfbf9] rounded-t-[3rem] mt-[-10vh] border-t border-white/20 shadow-[0_-50px_100px_rgba(0,0,0,0.2)]">
        
        <div className="flex flex-col-reverse lg:flex-row">
            
            {/* LEFT: SCROLLING CONTENT */}
            <div className="w-full lg:w-1/2 px-6 lg:px-20 py-20 lg:py-32 bg-[#fcfbf9]">
              {venues.map((venue, index) => (
                <motion.div 
                  key={venue.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ margin: "-50% 0px -50% 0px" }} // Triggers exact center
                  onViewportEnter={() => setActiveCard(index)} // UPDATES RIGHT SIDE
                  variants={blurReveal}
                  className="min-h-[80vh] flex flex-col justify-center"
                >
                   {/* Mobile Image (Only shows on mobile) */}
                   <div className="lg:hidden w-full aspect-video rounded-2xl overflow-hidden mb-8 shadow-lg">
                      <img src={venue.img} className="w-full h-full object-cover" alt={venue.title} />
                   </div>

                   <div className="flex items-center gap-4 mb-8">
                     <span className="text-5xl font-serif text-zinc-200 font-bold">0{index + 1}</span>
                     <span className="h-[1px] flex-1 bg-zinc-200" />
                     <span className="text-[#d4af37] text-xs font-bold tracking-widest uppercase">{venue.subtitle}</span>
                   </div>

                   <h2 className="text-4xl md:text-6xl font-serif text-zinc-900 mb-8 leading-[1]">
                     {venue.title}
                   </h2>
                   
                   <p className="text-lg text-zinc-500 leading-relaxed font-light mb-10 border-l-2 border-zinc-200 pl-6">
                     {venue.desc}
                   </p>

                   <div className="grid gap-4 mb-10">
                      <div className="flex items-center gap-4 p-4 bg-white border border-zinc-100 rounded-xl shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-[#d4af37]">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Capacity</p>
                          <p className="text-zinc-900 font-bold">{venue.capacity}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {venue.features.map((feat, i) => (
                          <span key={i} className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                             <CheckCircle size={12} className="text-[#d4af37]" /> {feat}
                          </span>
                        ))}
                      </div>
                   </div>
                </motion.div>
              ))}
            </div>

            {/* RIGHT: STICKY VISUALS (The Fix for Empty Space) */}
            <div className="hidden lg:block w-1/2 h-screen sticky top-0 bg-black overflow-hidden">
               
               {/* 1. Animated Background Mesh (Ensures no white space) */}
               <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black z-0" />
               <motion.div 
                 animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.1, 1] }}
                 transition={{ duration: 5, repeat: Infinity }}
                 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37] rounded-full blur-[200px] opacity-40 z-0"
               />

               {/* 2. The Active Image */}
               <AnimatePresence mode="wait">
                 <motion.img
                   key={activeCard}
                   src={venues[activeCard].img}
                   initial={{ opacity: 0, scale: 1.1 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.8, ease: "easeInOut" }}
                   className="absolute inset-0 w-full h-full object-cover z-10 opacity-80"
                 />
               </AnimatePresence>

               {/* 3. Texture Overlay */}
               <div className="absolute inset-0 z-20 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

               {/* 4. Glass Detail Card (Bottom Right) */}
               <div className="absolute bottom-12 right-12 z-30 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] text-white max-w-sm shadow-2xl">
                   <div className="flex justify-between items-start mb-4">
                     <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Live Preview</p>
                     <Star fill="#d4af37" className="text-[#d4af37]" size={16} />
                   </div>
                   <motion.p 
                     key={activeCard}
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     className="text-2xl font-serif leading-tight"
                   >
                     {venues[activeCard].title}
                   </motion.p>
               </div>
            </div>

        </div>
      </div>

      {/* 3. FOOTER */}
      <section className="bg-black text-white py-40 px-6 text-center relative z-20 overflow-hidden">
         <div className="relative z-10 max-w-4xl mx-auto">
           <h2 className="text-5xl md:text-8xl font-serif mb-8 leading-none tracking-tighter">Ready to <br/> Create?</h2>
           <p className="text-zinc-400 mb-12 text-lg font-light max-w-lg mx-auto">
             Our dedicated specialists are ready to curate every detail.
           </p>
           
           <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                required
                className="flex-1 bg-white/10 border border-white/10 rounded-full px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              />
              <button className="bg-[#d4af37] text-black px-8 py-4 rounded-full font-bold hover:bg-white transition-colors">
                Start
              </button>
           </form>
         </div>
      </section>

    </div>
  );
};

export default Events;