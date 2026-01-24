import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';
import { Utensils, ChefHat, ArrowDown, Wine, Coffee, Calendar } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

// --- DESKTOP 3D COMPONENT ---
const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  return (
    <div style={{ perspective: 1000 }} className={className}>
      <motion.div
        style={{ x, y, rotateX, rotateY, z: 100 }}
        drag dragElastic={0.16} dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
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

// --- MAIN DINING COMPONENT ---
const Dining = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <DiningMobile /> : <DiningDesktop />;
};

// --- DATA ---
const MENU_ITEMS = [
  { title: "Morning Brew", icon: <Coffee size={20} />, desc: "Artisan coffee & fresh pastries.", color: "bg-orange-50", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800" },
  { title: "Golden Hour", icon: <Wine size={20} />, desc: "Fine wines & sunset views.", color: "bg-rose-50", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800" },
  { title: "Chef's Table", icon: <Utensils size={20} />, desc: "7-course tasting menu.", color: "bg-emerald-50", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800" },
];

// --- DESKTOP VIEW (Classic 3D) ---
const DiningDesktop = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const [showModal, setShowModal] = useState(false);

  return (
    <div ref={containerRef} className="bg-[#fcfbf9] min-h-screen font-sans overflow-hidden text-zinc-900 selection:bg-orange-500 selection:text-white">
      {/* 1. Desktop Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <motion.div style={{ y }} className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl" />
          <motion.div style={{ y }} className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-yellow-100/50 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="flex items-center gap-2 text-orange-500 font-bold tracking-widest uppercase text-xs mb-4"><ChefHat size={16} /> World Class Cuisine</span>
              <h1 className="text-6xl md:text-8xl font-serif font-bold text-zinc-900 leading-[0.9] mb-6">Taste <br/> the <span className="text-orange-500 italic">Magic.</span></h1>
              <p className="text-xl text-zinc-500 max-w-md leading-relaxed">A culinary journey that engages all your senses.</p>
            </motion.div>
            <motion.button onClick={() => setShowModal(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-zinc-900 text-white rounded-full font-bold shadow-xl shadow-orange-500/20 flex items-center gap-3">
              Reserve a Table <Utensils size={16} />
            </motion.button>
          </div>
          <div className="relative perspective-1000 h-[500px] flex items-center justify-center">
            <TiltCard className="relative z-10 w-full max-w-md">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" alt="Gourmet" className="w-full h-full object-cover rounded-[3rem] shadow-2xl border-8 border-white transform rotate-3 hover:rotate-0 transition-transform duration-500"/>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }} className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-zinc-100 flex items-center gap-3">
                 <div className="bg-green-100 p-2 rounded-full text-green-600"><ChefHat size={20} /></div>
                 <div><p className="text-xs font-bold text-zinc-400 uppercase">Michelin Star</p><p className="font-bold text-zinc-900">Chef Ramsay</p></div>
              </motion.div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* 2. Desktop Menu Grid */}
      <section className="py-32 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif font-bold mb-4">Curated Experiences</h2>
            <p className="text-zinc-400">Select your dining atmosphere</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {MENU_ITEMS.map((item, i) => (
              <TiltCard key={i} className="h-full">
                <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className="bg-white rounded-[2rem] p-4 shadow-xl border border-zinc-100 h-full group overflow-hidden cursor-pointer" onClick={() => setShowModal(true)}>
                  <div className="relative h-64 rounded-[1.5rem] overflow-hidden mb-6">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">{item.icon}</div>
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

      <BookingModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

// --- MOBILE VIEW (Apple-Style) ---
const DiningMobile = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-24 font-sans text-zinc-900">
      {/* 1. Mobile Hero: Full Bleed with Text Overlay */}
      <section className="relative h-[85vh] w-full overflow-hidden rounded-b-[3rem] shadow-2xl">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }} className="absolute inset-0">
           <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800" alt="Dining" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 pb-12">
           <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-3 py-1 bg-orange-500 rounded-full text-white text-[10px] uppercase font-bold tracking-widest mb-3">Michelin Star</motion.span>
           <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl font-serif font-bold text-white mb-2 leading-none">Sunrise <br/> Dining</motion.h1>
           <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/80 text-lg">Experience culinary perfection.</motion.p>
        </div>
      </section>

      {/* 2. Horizontal Scroll Menu */}
      <section className="py-10">
         <div className="px-6 mb-6 flex justify-between items-end">
            <h2 className="text-2xl font-serif font-bold text-zinc-900">Collections</h2>
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Swipe →</span>
         </div>
         
         <div className="flex gap-4 overflow-x-auto px-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
            {MENU_ITEMS.map((item, i) => (
               <motion.div key={i} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} 
                  className="snap-center shrink-0 w-[80vw] bg-white rounded-[2rem] p-3 shadow-xl border border-zinc-100 overflow-hidden"
                  onClick={() => setShowModal(true)}
               >
                  <div className="h-48 rounded-[1.5rem] overflow-hidden relative mb-4">
                     <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                     <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">{item.icon}</div>
                  </div>
                  <div className="px-2 pb-2">
                     <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                     <p className="text-zinc-500 text-sm">{item.desc}</p>
                     <div className="mt-4 flex items-center text-orange-500 text-xs font-bold uppercase tracking-wide gap-1">
                        Reserve Table <ArrowDown className="-rotate-90" size={12} />
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      </section>

      {/* 3. Floating Action Button */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
         <button onClick={() => setShowModal(true)} className="bg-[#0a0a0a] text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 active:scale-95 transition-transform">
             <Calendar size={18} /> Book a Table
         </button>
      </motion.div>

      <BookingModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

// --- SHARED BOOKING MODAL (PREMIUM FORM) ---
const BookingModal = ({ show, onClose }: { show: boolean, onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', date: '', time: '', guests: 2 });
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('dining_reservations').insert([formData]);
    if (error) {
       toast.error(error.message);
    } else {
       toast.success("Table Reserved", { description: "Confirmation sent to your email." });
       onClose();
       setFormData({ name: '', email: '', date: '', time: '', guests: 2 });
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md" onClick={onClose}>
          <motion.div 
             initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
             onClick={e => e.stopPropagation()}
             className="glass-black w-full md:max-w-lg md:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto border border-white/10"
          >
             <div className="p-8">
                <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8 md:hidden" />
                
                <h3 className="text-3xl font-serif font-bold text-center mb-2 text-white">Secure Your Table</h3>
                <p className="text-zinc-400 text-center mb-8 text-sm">Join us for an unforgettable evening.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-900/50 p-3 rounded-2xl border border-white/5 focus-within:border-[#d4af37] transition-colors">
                         <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Name</label>
                         <input required type="text" placeholder="John Doe" className="w-full bg-transparent outline-none font-medium text-white placeholder-zinc-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="bg-zinc-900/50 p-3 rounded-2xl border border-white/5 focus-within:border-[#d4af37] transition-colors">
                         <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Guests</label>
                         <select className="w-full bg-transparent outline-none font-medium text-white [&>option]:text-black" value={formData.guests} onChange={e => setFormData({...formData, guests: Number(e.target.value)})}>
                            {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} Guests</option>)}
                         </select>
                      </div>
                   </div>
                   
                   <div className="bg-zinc-900/50 p-3 rounded-2xl border border-white/5 focus-within:border-[#d4af37] transition-colors">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Email</label>
                      <input required type="email" placeholder="john@example.com" className="w-full bg-transparent outline-none font-medium text-white placeholder-zinc-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-900/50 p-3 rounded-2xl border border-white/5 focus-within:border-[#d4af37] transition-colors">
                         <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Date</label>
                         <input required type="date" min={today} className="w-full bg-transparent outline-none font-medium text-sm text-white [color-scheme:dark]" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                      </div>
                      <div className="bg-zinc-900/50 p-3 rounded-2xl border border-white/5 focus-within:border-[#d4af37] transition-colors">
                         <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Time</label>
                         <input required type="time" className="w-full bg-transparent outline-none font-medium text-sm text-white [color-scheme:dark]" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                      </div>
                   </div>

                   <button disabled={loading} className="w-full py-5 bg-[#d4af37] text-black font-bold rounded-2xl shadow-lg mt-6 active:scale-95 transition-all hover:bg-white">
                      {loading ? "Confirming..." : "Confirm Booking"}
                   </button>
                   <p className="text-center text-xs text-zinc-500 mt-4 pb-4">No payment required for reservation.</p>
                </form>
             </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Dining;