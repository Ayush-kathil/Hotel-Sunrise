import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { ArrowRight, Users, CheckCircle, Calendar, X, Sparkles, MapPin } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

// --- DATA ---
const venues = [
  {
    id: "ballroom",
    title: "The Grand Ballroom",
    subtitle: "Royal Elegance",
    capacity: "500 Guests",
    price: "From $5,000",
    desc: "A masterpiece of architectural design featuring Austrian crystal chandeliers, soaring 24-foot ceilings, and a private bridal suite. The perfect stage for your fairytale ending.",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop",
    features: ["Private Bridal Suite", "State-of-the-art AV", "24ft Ceilings"]
  },
  {
    id: "terrace",
    title: "Oceanview Terrace",
    subtitle: "Al Fresco Luxury",
    capacity: "150 Guests",
    price: "From $3,500",
    desc: "Where the horizon meets luxury. An open-air sanctuary designed for golden-hour cocktails and romantic ceremonies under a canopy of stars.",
    img: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070&auto=format&fit=crop",
    features: ["Panoramic Views", "Fire Pits", "Private Bar"]
  },
  {
    id: "boardroom",
    title: "The Executive Loft",
    subtitle: "Corporate Focus",
    capacity: "40 Guests",
    price: "From $1,200",
    desc: "High stakes require high focus. A soundproofed haven equipped with cutting-edge telepresence technology and ergonomic Herman Miller seating.",
    img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop",
    features: ["Telepresence Tech", "Butler Service", "Acoustic Treatment"]
  }
];

const Events = () => {
  const [activeVenue, setActiveVenue] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const containerRef = useRef(null);

  // Smooth scroll progress for the whole page
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div ref={containerRef} className="bg-[#fcfbf9] min-h-screen font-sans text-zinc-900 selection:bg-[#d4af37] selection:text-white">
      
      {/* 1. CINEMATIC HERO */}
      <HeroSection onBook={() => setShowModal(true)} />

      {/* 2. IMMERSIVE SCROLL SHOWCASE */}
      <section className="relative w-full">
        {/* Mobile: Standard Stack / Desktop: Sticky Layout */}
        <div className="flex flex-col lg:flex-row">
          
          {/* LEFT: SCROLLING CONTENT (Desktop) */}
          <div className="w-full lg:w-[45%] relative z-10 bg-[#fcfbf9]/80 backdrop-blur-sm lg:bg-transparent">
            <div className="lg:h-[20vh]" /> {/* Spacer */}
            {venues.map((venue, index) => (
              <VenueInfoCard 
                key={venue.id} 
                venue={venue} 
                index={index} 
                setActiveVenue={setActiveVenue} 
                onBook={() => setShowModal(true)}
              />
            ))}
            <div className="lg:h-[20vh]" /> {/* Spacer */}
          </div>

          {/* RIGHT: STICKY IMAGE CANVAS (Desktop Only) */}
          <div className="hidden lg:block w-[55%] h-screen sticky top-0 right-0 overflow-hidden">
             {/* Background noise texture for premium feel */}
             <div className="absolute inset-0 z-20 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
             
             <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeVenue}
                  initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1, filter: "blur(10px)" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 w-full h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/10 to-transparent z-10" />
                  <img 
                    src={venues[activeVenue].img} 
                    alt="Venue Background" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
             </AnimatePresence>

             {/* Floating Indicator */}
             <div className="absolute bottom-10 right-10 z-30 flex gap-2">
                {venues.map((_, idx) => (
                  <motion.div 
                    key={idx}
                    animate={{ 
                      width: activeVenue === idx ? 32 : 8,
                      backgroundColor: activeVenue === idx ? "#d4af37" : "rgba(255,255,255,0.5)"
                    }}
                    className="h-2 rounded-full box-border border border-white/20 shadow-sm"
                  />
                ))}
             </div>
          </div>

        </div>
      </section>

      {/* 3. CALL TO ACTION FOOTER */}
      <Footer onBook={() => setShowModal(true)} />

      {/* 4. SUPABASE FORM MODAL */}
      <InquiryModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

// --- COMPONENT: HERO ---
const HeroSection = ({ onBook }: { onBook: () => void }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  return (
    <section ref={ref} className="h-screen relative overflow-hidden flex items-center justify-center bg-zinc-50">
      <motion.div style={{ scale, opacity: useTransform(scrollYProgress, [0, 1], [1, 0.5]) }} className="absolute inset-0 z-0">
         <img 
           src="https://novoxinc.com/cdn/shop/articles/novox_7_event_setup_styles_for_hotel_and_mice_hero_image_1024x576px_1024x.jpg?v=1657957442" 
           className="w-full h-full object-cover opacity-90 grayscale-[20%]"
           alt="Hero"
         />
         <div className="absolute inset-0 bg-black/20" />
      </motion.div>

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, ease: "easeOut" }}
          className="bg-white/60 backdrop-blur-sm p-12 rounded-[3rem] border border-white/40 shadow-xl"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-900/10 bg-white/50 backdrop-blur-md text-xs font-medium text-[#d4af37] tracking-wider uppercase mb-6">
            <Sparkles size={12} /> The 2026 Collection
          </span>
          <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter text-zinc-900 mb-6 drop-shadow-sm">
            Moments, <br/> <span className="text-zinc-500 italic">Elevated.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-700 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover a curated selection of spaces where architecture meets emotion. 
            Designed for those who seek the extraordinary.
          </p>
          <button onClick={onBook} className="group relative inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full text-sm font-bold tracking-wide overflow-hidden transition-all hover:bg-[#d4af37] border border-transparent shadow-lg hover:shadow-xl hover:scale-105">
            <span className="relative z-10">Start Planning</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

// --- COMPONENT: VENUE CARD (Scroll Trigger) ---
const VenueInfoCard = ({ venue, index, setActiveVenue, onBook }: any) => {
  return (
    <motion.div 
      onViewportEnter={() => setActiveVenue(index)}
      viewport={{ amount: 0.6, margin: "0px 0px -20% 0px" }}
      className="min-h-screen flex flex-col justify-center p-6 md:p-12 lg:pl-20 border-l border-zinc-200 lg:border-none"
    >
      {/* Mobile Image (Visible only on small screens) */}
      <div className="lg:hidden w-full aspect-[4/3] mb-8 rounded-3xl overflow-hidden relative shadow-2xl">
        <img src={venue.img} className="w-full h-full object-cover" alt={venue.title} />
      </div>

      <div className="space-y-8 relative">
        <div className="flex items-center gap-4 text-[#d4af37]">
          <span className="text-sm font-bold tracking-widest uppercase">{venue.subtitle}</span>
          <div className="h-[1px] w-12 bg-[#d4af37]/50" />
        </div>
        
        <h2 className="text-4xl md:text-6xl font-serif font-medium text-zinc-900 leading-[1.1] tracking-tight">
          {venue.title}
        </h2>

        <p className="text-zinc-500 text-lg leading-relaxed max-w-md font-light border-l-2 border-zinc-200 pl-6">
          {venue.desc}
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
                <Users size={20} className="text-[#d4af37] mb-2" />
                <div className="text-sm text-zinc-500 uppercase text-[10px] font-bold tracking-wider">Capacity</div>
                <div className="text-white font-medium">{venue.capacity}</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
                <MapPin size={20} className="text-[#d4af37] mb-2" />
                <div className="text-sm text-zinc-500 uppercase text-[10px] font-bold tracking-wider">Location</div>
                <div className="text-white font-medium">Main Wing</div>
            </div>
        </div>

        <div className="flex flex-wrap gap-3 max-w-md">
            {venue.features.map((feat: string, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-zinc-300 flex items-center gap-2 font-bold uppercase tracking-wider shadow-sm">
                    <CheckCircle size={10} className="text-[#d4af37]" /> {feat}
                </span>
            ))}
        </div>

        <button 
          onClick={onBook}
          className="mt-8 text-black hover:text-[#d4af37] transition-colors text-sm font-bold uppercase tracking-widest border-b border-zinc-900/20 pb-1 hover:border-[#d4af37]"
        >
            Check Availability
        </button>
      </div>
    </motion.div>
  );
};

// --- COMPONENT: FOOTER ---
const Footer = ({ onBook }: any) => (
  <section className="relative py-32 bg-zinc-900 flex flex-col items-center justify-center text-center overflow-hidden text-white">
     <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
     
     <motion.div 
       initial={{ opacity: 0, scale: 0.9 }}
       whileInView={{ opacity: 1, scale: 1 }}
       transition={{ duration: 0.8 }}
       className="relative z-10 px-6"
     >
        <h2 className="text-5xl md:text-8xl font-serif font-medium mb-6 tracking-tighter">
            Make it <span className="text-[#d4af37]">yours.</span>
        </h2>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-12 font-light">
            Our team of event specialists is ready to transform your vision into an unforgettable reality.
        </p>
        <button 
           onClick={onBook}
           className="bg-[#d4af37] text-black px-12 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 shadow-[0_0_50px_rgba(212,175,55,0.4)]"
        >
           Inquire Now
        </button>
     </motion.div>
  </section>
);

// --- COMPONENT: MODAL (Supabase Connected) ---
const InquiryModal = ({ show, onClose }: { show: boolean, onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', type: 'Wedding', guests: 100, date: '' });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Supabase Connection
    const { error } = await supabase.from('contact_messages').insert([{
       full_name: formData.name,
       email: formData.email,
       subject: `Inquiry: ${formData.type} - ${formData.date}`,
       message: `Automated Inquiry via Events Page. Expected Guests: ${formData.guests}`
    }]);

    if (error) {
      toast.error("Submission Failed", { description: error.message });
    } else {
      toast.success("Request Received", { description: "Our concierge will contact you shortly." });
      onClose();
      setFormData({ name: '', email: '', type: 'Wedding', guests: 100, date: '' });
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
           initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
           className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
           
           <motion.div 
             initial={{ scale: 0.9, y: 20, opacity: 0 }} 
             animate={{ scale: 1, y: 0, opacity: 1 }} 
             exit={{ scale: 0.9, y: 20, opacity: 0 }}
             transition={{ type: "spring", damping: 25, stiffness: 300 }}
             className="glass-black w-full max-w-lg rounded-[2rem] overflow-hidden relative z-10"
           >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                  <h3 className="text-xl font-serif font-bold text-white">Event Inquiry</h3>
                  <button onClick={onClose} className="p-2 bg-transparent border border-white/20 rounded-full hover:bg-white/10 text-white transition-colors">
                      <X size={18} />
                  </button>
              </div>

              <div className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 local-light-form">
                            <label className="text-xs uppercase font-bold text-zinc-500 pl-1">Event Type</label>
                            <select 
                              className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 rounded-xl focus:ring-1 focus:ring-[#d4af37] outline-none appearance-none font-medium"
                              value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                            >
                                <option>Wedding</option>
                                <option>Corporate</option>
                                <option>Social</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                             <label className="text-xs uppercase font-bold text-zinc-500 pl-1">Guests</label>
                             <input type="number" required className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 rounded-xl focus:ring-1 focus:ring-[#d4af37] outline-none font-medium" 
                               value={formData.guests} onChange={e => setFormData({...formData, guests: Number(e.target.value)})} 
                             />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-xs uppercase font-bold text-zinc-500 pl-1">Preferred Date</label>
                        <input type="date" required className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 rounded-xl focus:ring-1 focus:ring-[#d4af37] outline-none font-medium text-zinc-400" 
                          value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} 
                        />
                     </div>

                     <div className="space-y-4 pt-2">
                        <input type="text" placeholder="Your Name" required className="w-full bg-transparent border-b border-zinc-800 text-white p-3 focus:border-[#d4af37] outline-none transition-colors placeholder:text-zinc-600" 
                           value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                        <input type="email" placeholder="Email Address" required className="w-full bg-transparent border-b border-zinc-800 text-white p-3 focus:border-[#d4af37] outline-none transition-colors placeholder:text-zinc-600" 
                           value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                     </div>

                     <button disabled={loading} className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-xl mt-4 hover:bg-white hover:text-black transition-colors flex justify-center gap-2 items-center shadow-lg">
                        {loading ? <span className="animate-pulse">Processing...</span> : <><Calendar size={18} /> Request Proposal</>}
                     </button>
                  </form>
              </div>
           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Events;