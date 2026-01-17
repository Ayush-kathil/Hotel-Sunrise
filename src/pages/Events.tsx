import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Music, ArrowRight, Star, X, Check, Mail, MapPin, Sparkles, Phone } from 'lucide-react';

const Events = () => {
  const [showModal, setShowModal] = useState(false);
  const [formStep, setFormStep] = useState(1);

  const handleOpenModal = () => {
    setFormStep(1);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep(2);
    setTimeout(() => setShowModal(false), 2500);
  };

  const venues = [
    {
      name: "The Grand Ballroom",
      capacity: "500 Guests",
      desc: "Our signature venue featuring crystal chandeliers, soaring ceilings, and a private terrace.",
      features: ["Built-in Stage", "State-of-the-art AV", "Private Bridal Suite"],
      img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop"
    },
    {
      name: "Oceanview Terrace",
      capacity: "150 Guests",
      desc: "An open-air sanctuary with panoramic views. Ideal for sunset cocktail hours.",
      features: ["Panoramic Views", "Outdoor Bar", "Ambient Lighting"],
      img: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2070&auto=format&fit=crop"
    },
    {
      name: "Executive Boardroom",
      capacity: "40 Guests",
      desc: "Sophistication meets functionality. Equipped for high-level meetings.",
      features: ["Video Conferencing", "Ergonomic Seating", "Private Dining"],
      img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop"
    }
  ];

  return (
    <div className="bg-[#fcfbf9] min-h-screen font-sans selection:bg-[#d4af37] selection:text-white">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469371670807-013ccf25f164?q=80&w=2070&auto=format&fit=crop" 
            alt="Event Hero" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center text-white">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <span className="text-[#d4af37] font-bold tracking-[0.2em] uppercase text-sm mb-6 block">
              Celebrations & Gatherings
            </span>
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight">
              Unforgettable <br/> Starts Here.
            </h1>
            <p className="text-xl text-zinc-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Crafting timeless memories in settings of unparalleled elegance.
            </p>
            <motion.button 
              onClick={handleOpenModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#d4af37] text-white px-10 py-5 rounded-full font-bold hover:bg-[#b5952f] transition-all shadow-xl shadow-[#d4af37]/20 text-sm tracking-widest uppercase"
            >
              Inquire Today
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* --- INTRO --- */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto text-center max-w-3xl">
           <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
             <Sparkles className="w-12 h-12 text-[#d4af37] mx-auto mb-6" />
             <h2 className="text-4xl font-serif font-bold text-zinc-900 mb-6">The Art of Celebration</h2>
             <p className="text-zinc-500 text-lg leading-relaxed">
               We believe every event should be a masterpiece. Our dedicated team works in seamless harmony to ensure every detail exceeds expectations.
             </p>
           </motion.div>
        </div>
      </section>

      {/* --- VENUE SHOWCASE (The Long Section) --- */}
      <section className="py-24 px-6 bg-zinc-50">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <span className="text-[#d4af37] font-bold tracking-widest uppercase text-xs mb-2 block">Our Spaces</span>
            <h2 className="text-5xl font-serif font-bold text-zinc-900">Distinctive Venues</h2>
          </div>

          <div className="space-y-32">
            {venues.map((venue, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center`}
              >
                <div className="w-full md:w-1/2">
                  <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl relative group">
                    <img src={venue.img} alt={venue.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 space-y-6 md:px-6">
                  <div className="flex items-center gap-2 text-[#d4af37] font-bold uppercase tracking-wider text-sm">
                    <Users size={16} /> <span>{venue.capacity}</span>
                  </div>
                  <h3 className="text-4xl font-serif font-bold text-zinc-900">{venue.name}</h3>
                  <p className="text-zinc-600 text-lg leading-relaxed">{venue.desc}</p>
                  <ul className="grid grid-cols-1 gap-3 pt-4">
                    {venue.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-zinc-800 font-medium">
                        <div className="w-6 h-6 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
                          <Check size={14} strokeWidth={3} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- INQUIRY SECTION (Dark & Luxurious) --- */}
      <section className="bg-zinc-900 py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
           <div>
             <span className="text-[#d4af37] font-bold tracking-widest uppercase text-xs mb-4 block">Concierge Service</span>
             <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">Let's begin <br/> planning.</h2>
             <p className="text-zinc-400 text-lg mb-12 leading-relaxed max-w-md">
               Reach out to schedule a private tour or request a personalized proposal.
             </p>
             <div className="space-y-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37]"><Phone size={20} /></div>
                 <div><p className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">Direct Event Line</p><p className="font-serif text-2xl">+1 (555) 123-4567</p></div>
               </div>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37]"><MapPin size={20} /></div>
                 <div><p className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">Visit Us</p><p className="font-serif text-xl">123 Luxury Ave, Paradise City</p></div>
               </div>
             </div>
           </div>
           
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8 }}
             className="bg-white/5 p-10 rounded-[3rem] backdrop-blur-md border border-white/10 shadow-2xl"
           >
             <h3 className="text-3xl font-serif font-bold mb-8">Request Proposal</h3>
             <form className="space-y-6">
               <div className="space-y-2">
                 <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 ml-2">Email Address</label>
                 <input type="email" className="w-full bg-transparent border-b border-zinc-600 p-3 outline-none focus:border-[#d4af37] transition-colors text-white font-medium" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 ml-2">Event Type</label>
                 <select className="w-full bg-transparent border-b border-zinc-600 p-3 outline-none focus:border-[#d4af37] transition-colors text-white font-medium appearance-none cursor-pointer">
                   <option className="bg-zinc-800">Wedding</option>
                   <option className="bg-zinc-800">Corporate</option>
                   <option className="bg-zinc-800">Social Gathering</option>
                 </select>
               </div>
               <button className="w-full bg-[#d4af37] text-white py-5 rounded-full font-bold hover:bg-[#b5952f] transition-all shadow-lg shadow-[#d4af37]/20 uppercase tracking-widest text-sm mt-4">
                 Send Request
               </button>
             </form>
           </motion.div>
        </div>
      </section>

      {/* --- POPUP FORM MODAL --- */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
                <X size={20} className="text-zinc-500" />
              </button>

              {formStep === 1 ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <span className="px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] rounded-lg text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">Quick Inquiry</span>
                    <h2 className="text-3xl font-serif font-bold mb-2 text-zinc-900">Save Your Date</h2>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase ml-3">Event Date</label>
                      <input required type="date" className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#d4af37] rounded-2xl p-4 outline-none font-medium text-zinc-900" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase ml-3">Your Email</label>
                      <div className="relative">
                        <input required type="email" placeholder="hello@example.com" className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#d4af37] rounded-2xl p-4 pl-12 outline-none font-medium text-zinc-900" />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                      </div>
                    </div>
                    <button className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-[#d4af37] transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg">
                      Check Availability <ArrowRight size={18} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={48} strokeWidth={3} /></motion.div>
                  <h3 className="text-2xl font-serif font-bold mb-3 text-zinc-900">Request Sent!</h3>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;