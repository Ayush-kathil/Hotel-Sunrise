import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, ArrowDown } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Make sure this path matches your project

// --- DATA FOR STICKY SCROLL SECTION ---
const venues = [
  {
    title: "The Grand Ballroom",
    capacity: "500 Guests",
    desc: "A masterpiece of design featuring crystal chandeliers, soaring 20-foot ceilings, and a private bridal suite. The perfect stage for your fairytale ending.",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop"
  },
  {
    title: "Oceanview Terrace",
    capacity: "150 Guests",
    desc: "Where the sky meets the sea. An open-air sanctuary designed for sunset cocktail hours and romantic ceremonies under the stars.",
    img: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Executive Boardroom",
    capacity: "40 Guests",
    desc: "High stakes require high focus. A private, soundproofed haven equipped with cutting-edge technology and ergonomic luxury.",
    img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop"
  }
];

const Events = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const scrollRef = useRef(null);

  // --- SUPABASE FORM STATE ---
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    event_type: 'Wedding', // Default
    date: '',
    guests: 100,
    message: ''
  });

  // --- SCROLL LISTENER FOR STICKY CHANGE ---
  const { scrollYProgress } = useScroll({ target: scrollRef });
  useTransform(scrollYProgress, [0, 1], [0, 1]); 
  
  useEffect(() => {
    const handleScroll = () => {
       const sections = document.querySelectorAll('.venue-text-section');
       sections.forEach((sec, index) => {
          const rect = sec.getBoundingClientRect();
          if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
             setActiveCard(index);
          }
       });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- SUPABASE SUBMIT HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('event_inquiries')
      .insert([{
        name: formData.name,
        email: formData.email,
        event_type: formData.event_type,
        date: formData.date,
        guests: formData.guests,
        message: formData.message
      }]);

    if (error) {
      alert("Error submitting inquiry: " + error.message);
    } else {
      alert("Success! We have received your inquiry.");
      setShowModal(false);
      setFormData({ name: '', email: '', event_type: 'Wedding', date: '', guests: 100, message: '' });
    }
    setLoading(false);
  };

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-[#d4af37] selection:text-white">
      
      {/* 1. CINEMATIC HERO */}
      <section className="h-screen sticky top-0 z-0 flex flex-col justify-center items-center overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-40">
           <img 
             src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop" 
             className="w-full h-full object-cover" 
           />
        </div>
        <div className="relative z-10 text-center px-4">
           <motion.span 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="text-[#d4af37] text-xs font-bold tracking-[0.3em] uppercase block mb-6"
           >
             The Collection
           </motion.span>
           <motion.h1 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-9xl font-serif font-bold leading-none tracking-tighter"
           >
             Memories <br/> in Motion.
           </motion.h1>
           <motion.div 
             animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
             className="absolute bottom-[-20vh] left-1/2 -translate-x-1/2"
           >
              <ArrowDown className="text-white/50 w-8 h-8" />
           </motion.div>
        </div>
      </section>

      {/* 2. STICKY SCROLL SECTION */}
      <div ref={scrollRef} className="relative z-10 bg-white rounded-t-[3rem] mt-[-10vh] pt-32 pb-32">
        <div className="container mx-auto px-6 flex flex-col md:flex-row gap-20">
          
          {/* LEFT: SCROLLING TEXT */}
          <div className="w-full md:w-1/2 py-[10vh]">
            {venues.map((venue, index) => (
              <div key={index} className="venue-text-section min-h-[80vh] flex flex-col justify-center">
                 <motion.div
                   initial={{ opacity: 0, y: 50 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8 }}
                   viewport={{ margin: "-20% 0px -20% 0px" }}
                 >
                   <span className="text-[#d4af37] text-xs font-bold tracking-widest uppercase mb-4 block">
                      0{index + 1}
                   </span>
                   <h2 className="text-4xl md:text-6xl font-serif text-black mb-8 leading-tight">
                     {venue.title}
                   </h2>
                   <p className="text-xl text-zinc-500 leading-relaxed font-light mb-8 max-w-md">
                     {venue.desc}
                   </p>
                   <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-zinc-800">
                        <Check size={16} className="text-[#d4af37]" /> {venue.capacity}
                      </li>
                      <li className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-zinc-800">
                         <Check size={16} className="text-[#d4af37]" /> Premium Sound
                      </li>
                   </ul>
                   <button 
                     onClick={() => setShowModal(true)}
                     className="px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-[#d4af37] transition-all flex items-center gap-2"
                   >
                     Book This Space <ArrowRight size={16} />
                   </button>
                 </motion.div>
              </div>
            ))}
          </div>

          {/* RIGHT: STICKY IMAGE */}
          <div className="hidden md:block w-1/2 h-screen sticky top-0 flex items-center justify-center">
             <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeCard}
                    src={venues[activeCard].img}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                <div className="absolute bottom-8 left-8 text-white">
                   <p className="text-xs uppercase tracking-widest font-bold opacity-80">Currently Viewing</p>
                   <p className="text-2xl font-serif">{venues[activeCard].title}</p>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* 3. CALL TO ACTION */}
      <section className="bg-zinc-900 text-white py-32 px-6 text-center relative z-10">
         <h2 className="text-5xl font-serif mb-8">Your Vision. Our Canvas.</h2>
         <p className="text-zinc-400 mb-12 text-lg max-w-xl mx-auto">
           Contact our dedicated event specialists to begin planning your perfect occasion.
         </p>
         <button 
           onClick={() => setShowModal(true)}
           className="px-12 py-5 bg-[#d4af37] text-black font-bold rounded-full hover:bg-white transition-colors text-lg"
         >
           Start Planning
         </button>
      </section>

      {/* --- MODAL FORM (Connected to Supabase) --- */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onClick={() => setShowModal(false)}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg p-8 rounded-[2rem] relative text-black max-h-[90vh] overflow-y-auto"
            >
               <X className="absolute top-6 right-6 cursor-pointer text-zinc-400 hover:text-black" onClick={() => setShowModal(false)} />
               
               <h3 className="text-3xl font-serif mb-2">Inquire</h3>
               <p className="text-zinc-500 mb-6 text-sm">Fill out the details below for your event.</p>
               
               <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" placeholder="Name" required 
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    <input 
                      type="email" placeholder="Email" required 
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black"
                      value={formData.event_type} onChange={e => setFormData({...formData, event_type: e.target.value})}
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Social">Social Gathering</option>
                      <option value="Other">Other</option>
                    </select>
                    <input 
                      type="number" placeholder="Guests" required 
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black"
                      value={formData.guests} onChange={e => setFormData({...formData, guests: Number(e.target.value)})}
                    />
                  </div>

                  <input 
                    type="date" required 
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black text-zinc-500"
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                  
                  <textarea 
                    placeholder="Tell us more about your vision..." 
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black min-h-[100px]"
                    value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                  />

                  <button 
                    disabled={loading}
                    className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-[#d4af37] transition-colors disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Request"}
                  </button>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Events;