import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, ArrowDown, MapPin, Users, Music } from 'lucide-react';
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

// --- ANIMATIONS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const Events = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const containerRef = useRef(null);

  // Parallax Hero
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1.1, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);

  // Form
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', event_type: 'Wedding', date: '', guests: 100, message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('event_inquiries').insert([formData]);

    if (error) {
      toast.error("Submission Failed", { description: error.message });
    } else {
      toast.success("Inquiry Received", { description: "We will contact you shortly." });
      setShowModal(false);
      setFormData({ name: '', email: '', event_type: 'Wedding', date: '', guests: 100, message: '' });
    }
    setLoading(false);
  };

  return (
    <div ref={containerRef} className="bg-zinc-50 min-h-screen font-sans selection:bg-[#d4af37] selection:text-white">
      
      {/* 1. APPLE-STYLE HERO */}
      <section className="h-screen sticky top-0 z-0 overflow-hidden bg-black">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="absolute inset-0">
           <div className="absolute inset-0 bg-black/30 z-10" />
           <img 
             src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop" 
             className="w-full h-full object-cover" 
             alt="Events Hero"
           />
        </motion.div>
        
        <motion.div 
          style={{ y: textY, opacity: heroOpacity }}
          className="relative z-20 h-full flex flex-col justify-center items-center text-center text-white px-6"
        >
           <motion.span 
             initial={{ opacity: 0, filter: "blur(10px)" }} 
             animate={{ opacity: 1, filter: "blur(0px)" }} 
             transition={{ duration: 1.5 }}
             className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.3em] mb-6 border border-[#d4af37]/30 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md"
           >
             The Collection
           </motion.span>
           
           <h1 className="text-7xl md:text-9xl font-serif font-bold leading-none tracking-tighter mb-6">
             Memories <br/> <span className="italic text-white/60">Unfolded.</span>
           </h1>
           
           <p className="max-w-md text-white/70 text-lg font-light leading-relaxed">
             Spaces designed not just to host events, but to inspire awe.
           </p>

           <motion.div 
             animate={{ y: [0, 10, 0] }} 
             transition={{ repeat: Infinity, duration: 2 }}
             className="absolute bottom-12"
           >
              <ArrowDown className="text-white/50 w-6 h-6" />
           </motion.div>
        </motion.div>
      </section>

      {/* 2. THE SHOWCASE (White Layer slides over Hero) */}
      <div className="relative z-10 bg-[#fcfbf9] rounded-t-[3rem] mt-[-5vh] pt-32 pb-32 border-t border-white/20 shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-start">
            
            {/* LEFT: SCROLLING TEXT (The Trigger) */}
            <div className="w-full lg:w-1/2">
              {venues.map((venue, index) => (
                <motion.div 
                  key={venue.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ margin: "-40% 0px -40% 0px" }} // Triggers when in middle of screen
                  onViewportEnter={() => setActiveCard(index)} // <--- THE BUG FIX
                  variants={fadeInUp}
                  className="min-h-[90vh] flex flex-col justify-center py-20"
                >
                   {/* Mobile Image (Only visible on small screens) */}
                   <div className="lg:hidden w-full aspect-video rounded-2xl overflow-hidden mb-8 shadow-lg">
                      <img src={venue.img} className="w-full h-full object-cover" alt={venue.title} />
                   </div>

                   <div className="flex items-center gap-4 mb-6">
                     <span className="text-[#d4af37] text-xs font-bold tracking-widest uppercase bg-[#d4af37]/10 px-3 py-1 rounded-full">
                       0{index + 1}
                     </span>
                     <span className="h-[1px] w-12 bg-zinc-200" />
                     <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase">
                       {venue.subtitle}
                     </span>
                   </div>

                   <h2 className="text-5xl md:text-6xl font-serif text-zinc-900 mb-6 leading-[1.1]">
                     {venue.title}
                   </h2>
                   
                   <p className="text-xl text-zinc-500 leading-relaxed font-light mb-10">
                     {venue.desc}
                   </p>

                   <div className="grid gap-4 mb-10">
                      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-zinc-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-[#d4af37] shrink-0">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-zinc-400">Capacity</p>
                          <p className="text-zinc-900 font-medium">{venue.capacity}</p>
                        </div>
                      </div>
                      
                      {venue.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-600 pl-2">
                           <Check size={14} className="text-[#d4af37]" /> {feat}
                        </div>
                      ))}
                   </div>

                   <button 
                     onClick={() => setShowModal(true)}
                     className="w-fit px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-[#d4af37] transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                   >
                     Inquire About This Space <ArrowRight size={16} />
                   </button>
                </motion.div>
              ))}
            </div>

            {/* RIGHT: STICKY IMAGE DECK (Desktop Only) */}
            <div className="hidden lg:block w-1/2 h-screen sticky top-0 py-20 flex items-center">
               <div className="relative w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl bg-zinc-100 border-[8px] border-white">
                  
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeCard}
                      src={venues[activeCard].img}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  
                  {/* Glass Card Overlay */}
                  <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl text-white">
                     <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Live Preview</p>
                     <motion.p 
                       key={activeCard}
                       initial={{ y: 10, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       className="text-2xl font-serif"
                     >
                       {venues[activeCard].title}
                     </motion.p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. FOOTER CTA */}
      <section className="bg-zinc-900 text-white py-40 px-6 text-center relative z-20 overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none" />
         
         <div className="relative z-10 max-w-4xl mx-auto">
           <h2 className="text-5xl md:text-7xl font-serif mb-8 leading-none">Ready to Create?</h2>
           <p className="text-zinc-400 mb-12 text-lg md:text-xl font-light max-w-lg mx-auto">
             Our team is ready to curate every detail of your event.
           </p>
           <button 
             onClick={() => setShowModal(true)}
             className="px-12 py-5 bg-[#d4af37] text-black font-bold rounded-full hover:bg-white hover:scale-105 transition-all text-lg shadow-[0_0_40px_rgba(212,175,55,0.4)]"
           >
             Start Planning
           </button>
         </div>
      </section>

      {/* --- VISION PRO MODAL --- */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-2xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
               <button 
                 onClick={() => setShowModal(false)} 
                 className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors"
               >
                 <X size={20} className="text-zinc-500" />
               </button>
               
               <div className="mb-8">
                 <span className="text-[#d4af37] text-xs font-bold uppercase tracking-widest">Inquiry Form</span>
                 <h3 className="text-4xl font-serif font-bold text-zinc-900 mt-2">Let's Connect</h3>
               </div>
               
               <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase text-zinc-400 pl-2">Name</label>
                       <input 
                         type="text" required 
                         className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all"
                         value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase text-zinc-400 pl-2">Email</label>
                       <input 
                         type="email" required 
                         className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all"
                         value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 pl-2">Type</label>
                        <select 
                          className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all appearance-none"
                          value={formData.event_type} onChange={e => setFormData({...formData, event_type: e.target.value})}
                        >
                          <option value="Wedding">Wedding</option>
                          <option value="Corporate">Corporate</option>
                          <option value="Social">Social</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 pl-2">Guests</label>
                        <input 
                          type="number" required 
                          className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all"
                          value={formData.guests} onChange={e => setFormData({...formData, guests: Number(e.target.value)})}
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase text-zinc-400 pl-2">Date</label>
                     <input 
                       type="date" required 
                       className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all text-zinc-600"
                       value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                     />
                  </div>
                  
                  <button 
                    disabled={loading}
                    className="w-full py-5 bg-black text-white font-bold rounded-xl hover:bg-[#d4af37] transition-all disabled:opacity-50 flex justify-center items-center gap-2 mt-4"
                  >
                    {loading ? "Sending..." : "Submit Inquiry"} <ArrowRight size={16} />
                  </button>
               </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Events;