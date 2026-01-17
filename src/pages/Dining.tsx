import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';
import { Utensils, ChefHat, ArrowDown, Check, X } from 'lucide-react';

// --- TILT CARD COMPONENT ---
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

const Dining = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  // State for the success message
  const [inquirySent, setInquirySent] = useState(false);

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault(); // Stop page reload
    setInquirySent(true);
    // Reset after 3 seconds
    setTimeout(() => setInquirySent(false), 4000);
  };

  return (
    <div ref={containerRef} className="bg-[#fcfbf9] min-h-screen font-sans overflow-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <motion.div style={{ y }} className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl" />
          <motion.div style={{ y }} className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-yellow-100/50 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
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
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => document.getElementById('inquire-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-zinc-900 text-white rounded-full font-bold shadow-xl shadow-orange-500/20 flex items-center gap-3"
            >
              Reserve a Table <Utensils size={16} />
            </motion.button>
          </div>

          <div className="relative perspective-1000 h-[500px] flex items-center justify-center">
            <TiltCard className="relative z-10 w-full max-w-md">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" alt="Gourmet Dish" className="w-full h-full object-cover rounded-[3rem] shadow-2xl border-8 border-white transform rotate-3 hover:rotate-0 transition-transform duration-500"/>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }} className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-zinc-100 flex items-center gap-3">
                 <div className="bg-green-100 p-2 rounded-full text-green-600"><ChefHat size={20} /></div>
                 <div>
                   <p className="text-xs font-bold text-zinc-400 uppercase">Michelin Star</p>
                   <p className="font-bold text-zinc-900">Chef Ramsay</p>
                 </div>
              </motion.div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* --- MENU SECTION --- */}
      <section className="py-32 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif font-bold mb-4">Curated Experiences</h2>
            <p className="text-zinc-400">Select your dining atmosphere</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "The Morning Brew", icon: "☕", desc: "Artisan coffee & fresh pastries.", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800" },
              { title: "Golden Hour", icon: "🍷", desc: "Fine wines & sunset views.", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800" },
              { title: "Chef's Table", icon: "🍽️", desc: "7-course tasting menu.", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800" },
            ].map((item, i) => (
              <TiltCard key={i} className="h-full">
                <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className="bg-white rounded-[2rem] p-4 shadow-xl shadow-zinc-200/50 border border-zinc-100 h-full group overflow-hidden">
                  <div className="relative h-64 rounded-[1.5rem] overflow-hidden mb-6">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xl shadow-sm">{item.icon}</div>
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

      {/* --- PARALLAX FORM BANNER --- */}
      <section id="inquire-form" className="h-[70vh] relative flex items-center justify-center overflow-hidden">
        {/* Background */}
        <motion.div style={{ y }} className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Private Dining" />
           <div className="absolute inset-0 bg-black/60" />
        </motion.div>
        
        {/* Form Container */}
        <div className="relative z-10 w-full max-w-md px-6">
          <AnimatePresence mode="wait">
            {!inquirySent ? (
              <motion.div
                key="form"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="border border-white/20 bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl"
              >
                <h2 className="text-3xl font-serif font-bold text-white mb-2 text-center">Reserve Your Table</h2>
                <p className="text-zinc-300 mb-6 text-center text-sm">Experience the finest dining in the city.</p>
                
                <form onSubmit={handleInquiry} className="space-y-3">
                  <input required placeholder="Your Name" className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 p-3 rounded-xl outline-none focus:bg-white/20 transition-all" />
                  <input required type="date" className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-xl outline-none focus:bg-white/20 transition-all" />
                  <button className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-[#d4af37] hover:text-white transition-colors mt-2">
                    Confirm Reservation
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-white p-10 rounded-[2.5rem] text-center shadow-2xl"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Reserved!</h3>
                <p className="text-zinc-500 text-sm">We look forward to hosting you.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

    </div>
  );
};

export default Dining;