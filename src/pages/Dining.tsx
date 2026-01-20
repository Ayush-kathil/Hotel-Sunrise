import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';

const Dining = () => {
  const [loading, setLoading] = useState(true);
  // Optional: Fetch menu items from Supabase if you have a table, else use static
  const [menuItems, setMenuItems] = useState([
    { id: 1, title: 'Royal Thali', desc: 'A curated selection of 56 Rajasthani delicacies.', price: '₹1,200', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80' },
    { id: 2, title: 'Truffle Risotto', desc: 'Imported black truffle shavings over aged arborio rice.', price: '₹950', img: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80' },
    { id: 3, title: 'Saffron Milk Cake', desc: 'Dense milk fudge infused with Kashmiri saffron.', price: '₹400', img: 'https://images.unsplash.com/photo-1517244683847-7454b94e1b71?q=80' }
  ]);

  // Parallax Header
  const headerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "150%"]);

  useEffect(() => {
    // Simulate loading for premium feel
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <div className="bg-[#0a0a0a] text-white font-sans min-h-screen">
      
      {/* 1. HERO HEADER */}
      <section ref={headerRef} className="h-screen relative overflow-hidden flex items-center justify-center">
        <motion.div style={{ y: yBg }} className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974" className="w-full h-full object-cover opacity-60" alt="Dining" />
           <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#0a0a0a]" />
        </motion.div>

        <motion.div style={{ y: textY }} className="relative z-10 text-center px-4">
           <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="block text-[#d4af37] text-xs font-bold tracking-[0.4em] uppercase mb-4">Culinary Art</motion.span>
           <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="text-6xl md:text-8xl font-serif font-bold mb-6">
             The Golden <br/> Spoon
           </motion.h1>
           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-zinc-400 max-w-md mx-auto leading-relaxed">
             Where ancient recipes meet modern gastronomy. Experience the finest dining in Orai.
           </motion.p>
        </motion.div>
      </section>

      {/* 2. MENU SHOWCASE */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-serif text-center mb-16">Signature Selection</h2>
        
        {loading ? (
          <div className="flex justify-center h-40 items-center text-[#d4af37]"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
             {menuItems.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="group relative h-[400px] overflow-hidden rounded-[2rem] border border-white/10"
                >
                  <img src={item.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-8">
                    <div className="flex justify-between items-end mb-2">
                       <h3 className="text-2xl font-serif">{item.title}</h3>
                       <span className="text-[#d4af37] font-bold text-lg">{item.price}</span>
                    </div>
                    <p className="text-zinc-400 text-sm line-clamp-2">{item.desc}</p>
                  </div>
                </motion.div>
             ))}
          </div>
        )}
      </section>

      {/* 3. RESERVATION CTA */}
      <section className="py-32 px-6 text-center">
         <div className="max-w-3xl mx-auto bg-[#d4af37] text-black rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Reserve Your Table</h2>
              <p className="text-black/70 mb-8 max-w-lg mx-auto">Due to high demand, we recommend booking at least 24 hours in advance.</p>
              <button 
                onClick={() => toast.success("Reservation Request Sent", { description: "Our concierge will call you shortly." })}
                className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform"
              >
                Book Now
              </button>
            </div>
            {/* Decorative pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         </div>
      </section>

    </div>
  );
};

export default Dining;