import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';
import { Utensils, Coffee, Wine, ChefHat, ArrowDown, X, Calendar, Clock, Users, Mail, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

// --- 3D TILT CARD COMPONENT ---
const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  return (
    <div style={{ perspective: 1000 }} className={className}>
      <motion.div
        style={{ x, y, rotateX, rotateY, z: 100 }}
        drag
        dragElastic={0.16}
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        whileHover={{ cursor: "grab", scale: 1.02 }}
        className="w-full h-full transform-style-3d transition-all duration-200 ease-linear"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - rect.left - rect.width / 2);
          y.set(e.clientY - rect.top - rect.height / 2);
        }}
        onMouseLeave={() => { x.set(0); y.set(0); }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// --- FLOATING ICON COMPONENT ---
const FloatingIcon = ({ delay, children, x = 0 }: { delay: number, children: React.ReactNode, x?: number }) => (
  <motion.div
    animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay }}
    className="absolute z-20 pointer-events-none"
    style={{ x }}
  >
    {children}
  </motion.div>
);

const Dining = () => {
  const containerRef = useRef(null);
  
  // Parallax Logic (Only for the top hero blobs, removed for bottom image to fix gap)
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // --- FORM STATE ---
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', date: '', time: '', guests: 2
  });

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('dining_reservations')
      .insert([{
        name: formData.name,
        email: formData.email,
        date: formData.date,
        time: formData.time,
        guests: formData.guests
      }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Reservation Confirmed! We look forward to hosting you.");
      setShowModal(false);
      setFormData({ name: '', email: '', date: '', time: '', guests: 2 });
    }
    setLoading(false);
  };

  return (
    <div ref={containerRef} className="bg-[#fcfbf9] min-h-screen font-sans overflow-hidden text-zinc-900 selection:bg-orange-500 selection:text-white">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <motion.div style={{ y }} className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl" />
          <motion.div style={{ y }} className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-yellow-100/50 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="flex items-center gap-2 text-orange-500 font-bold tracking-widest uppercase text-xs mb-4">
                <ChefHat size={16} /> World Class Cuisine
              </span>
              <h1 className="text-6xl md:text-8xl font-serif font-bold text-zinc-900 leading-[0.9] mb-6">
                Taste <br/> the <span className="text-orange-500 italic">Magic.</span>
              </h1>
              <p className="text-xl text-zinc-500 max-w-md leading-relaxed">
                A culinary journey that engages all your senses. Fresh ingredients, masterful techniques, and an ambiance to remember.
              </p>
            </motion.div>

            <motion.button 
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-zinc-900 text-white rounded-full font-bold shadow-xl shadow-orange-500/20 flex items-center gap-3"
            >
              Reserve a Table <Utensils size={16} />
            </motion.button>
          </div>

          {/* 3D Floating Plate Image */}
          <div className="relative perspective-1000 h-[500px] flex items-center justify-center">
            <TiltCard className="relative z-10 w-full max-w-md">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" 
                alt="Gourmet Dish" 
                className="w-full h-full object-cover rounded-[3rem] shadow-2xl border-8 border-white transform rotate-3 hover:rotate-0 transition-transform duration-500"
              />
              
              {/* Floating Review Badge */}
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-zinc-100 flex items-center gap-3"
              >
                 <div className="bg-green-100 p-2 rounded-full text-green-600"><ChefHat size={20} /></div>
                 <div>
                   <p className="text-xs font-bold text-zinc-400 uppercase">Michelin Star</p>
                   <p className="font-bold text-zinc-900">Chef Ramsay</p>
                 </div>
              </motion.div>
            </TiltCard>

            {/* Floating Ingredients Animations */}
            <div className="absolute top-10 right-10"><FloatingIcon delay={0}><div className="text-4xl">🌿</div></FloatingIcon></div>
            <div className="absolute bottom-20 left-10"><FloatingIcon delay={1}><div className="text-4xl">🍋</div></FloatingIcon></div>
            <div className="absolute top-40 left-0"><FloatingIcon delay={2}><div className="text-4xl">🍅</div></FloatingIcon></div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-300"
        >
          <ArrowDown size={24} />
        </motion.div>
      </section>

      {/* --- MENU SHOWCASE --- */}
      <section className="py-32 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif font-bold mb-4">Curated Experiences</h2>
            <p className="text-zinc-400">Select your dining atmosphere</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "The Morning Brew", icon: "☕", desc: "Artisan coffee & fresh pastries.", color: "bg-orange-50", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800" },
              { title: "Golden Hour", icon: "🍷", desc: "Fine wines & sunset views.", color: "bg-rose-50", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800" },
              { title: "Chef's Table", icon: "🍽️", desc: "7-course tasting menu.", color: "bg-emerald-50", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800" },
            ].map((item, i) => (
              <TiltCard key={i} className="h-full">
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-white rounded-[2rem] p-4 shadow-xl shadow-zinc-200/50 border border-zinc-100 h-full group overflow-hidden cursor-pointer"
                  onClick={() => setShowModal(true)}
                >
                  <div className="relative h-64 rounded-[1.5rem] overflow-hidden mb-6">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xl shadow-sm">
                      {item.icon}
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <h3 className="text-2xl font-serif font-bold mb-2 group-hover:text-orange-500 transition-colors">{item.title}</h3>
                    <p className="text-zinc-500">{item.desc}</p>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* --- FIXED BACKGROUND BANNER (The Fix) --- */}
      <section className="h-[60vh] relative flex items-center justify-center overflow-hidden">
        
        {/* 1. The Image Layer */}
        <div className="absolute inset-0 z-0">
           <img 
             src="https://media.designcafe.com/wp-content/uploads/2020/11/25100115/green-dining-table-decor.jpg" 
             className="w-full h-full object-cover" // Removed brightness-50 here, added overlay below
             alt="Private Dining"
           />
           {/* 2. The Dark Overlay (Ensures text is readable) */}
           <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        {/* 3. The Content Layer */}
        <div className="relative z-10 text-center text-white px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="border border-white/20 bg-white/10 backdrop-blur-md p-10 md:p-14 rounded-[3rem] shadow-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Private Dining</h2>
            <p className="text-lg md:text-xl text-zinc-200 mb-8 max-w-lg mx-auto leading-relaxed">
              Host your exclusive events with us. Personalized menus, dedicated staff, and unforgettable memories.
            </p>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-white text-black px-10 py-4 rounded-full font-bold hover:bg-[#d4af37] hover:text-white transition-all shadow-lg"
            >
              Inquire Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* --- BOOKING MODAL --- */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-orange-100 to-yellow-50 z-0" />
              
              <div className="relative z-10">
                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-sm hover:bg-zinc-100 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="mb-8 mt-4">
                  <span className="inline-block p-3 bg-white rounded-2xl shadow-md mb-4 text-orange-500">
                    <Utensils size={28} />
                  </span>
                  <h3 className="text-3xl font-serif font-bold">Secure Your Table</h3>
                  <p className="text-zinc-500">Reserve a spot for an unforgettable meal.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-2">Name</label>
                       <div className="relative">
                         <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                         <input 
                           type="text" required
                           className="w-full pl-10 p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-orange-400 transition-colors"
                           placeholder="John Doe"
                           value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                         />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-2">Email</label>
                       <div className="relative">
                         <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                         <input 
                           type="email" required
                           className="w-full pl-10 p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-orange-400 transition-colors"
                           placeholder="john@email.com"
                           value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                         />
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-2">Date</label>
                       <div className="relative">
                         <input 
                           type="date" required
                           className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-orange-400 text-sm"
                           value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                         />
                       </div>
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-2">Time</label>
                       <div className="relative">
                         <input 
                           type="time" required
                           className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-orange-400 text-sm"
                           value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                         />
                       </div>
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-2">Guests</label>
                       <select 
                         className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-orange-400 text-sm appearance-none"
                         value={formData.guests} onChange={e => setFormData({...formData, guests: Number(e.target.value)})}
                       >
                         {[2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n}</option>)}
                       </select>
                     </div>
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-orange-500 transition-colors shadow-lg mt-4"
                  >
                    {loading ? "Confirming..." : "Confirm Booking"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dining;