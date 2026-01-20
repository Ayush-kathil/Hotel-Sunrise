import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Utensils, Clock, MapPin, Star, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Dining = () => {
  const [menu, setMenu] = useState<any[]>([]);

  // If you have a menu table, fetch it here. Otherwise static is fine.
  useEffect(() => {
     // Mock data or fetch from Supabase
     setMenu([
        { id: 1, name: "Royal Thali", price: 1200, desc: "Authentic Rajasthani platter", tag: "Bestseller" },
        { id: 2, name: "Truffle Pasta", price: 850, desc: "Handmade pasta with black truffle", tag: "Chef's Choice" },
        { id: 3, name: "Saffron Risotto", price: 950, desc: "Creamy risotto with Kashmiri saffron", tag: "New" },
        { id: 4, name: "Grilled Salmon", price: 1500, desc: "Atlantic salmon with asparagus", tag: "" },
     ]);
  }, []);

  return (
    // 'min-h-screen' ensures full height, 'pb-20' makes room for footer/mobile nav
    <div className="min-h-screen bg-[#fcfbf9] font-sans text-zinc-900 pb-20 pt-20">
      
      {/* HEADER */}
      <div className="px-6 mb-12 text-center max-w-2xl mx-auto">
         <span className="text-[#d4af37] font-bold tracking-widest uppercase text-xs mb-2 block">Fine Dining</span>
         <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">The Golden Spoon</h1>
         <p className="text-zinc-500 leading-relaxed">Experience a culinary journey with ingredients sourced from our organic gardens and spices from the ancient trade routes.</p>
      </div>

      {/* INFO CARDS (Horizontal Scroll on Mobile) */}
      <div className="flex gap-4 overflow-x-auto px-6 mb-12 no-scrollbar snap-x">
         <div className="snap-center shrink-0 w-64 p-6 bg-white rounded-2xl shadow-sm border border-zinc-100">
            <Clock className="text-[#d4af37] mb-3" />
            <h3 className="font-bold">Opening Hours</h3>
            <p className="text-sm text-zinc-500">Breakfast: 7am - 11am</p>
            <p className="text-sm text-zinc-500">Dinner: 7pm - 11pm</p>
         </div>
         <div className="snap-center shrink-0 w-64 p-6 bg-white rounded-2xl shadow-sm border border-zinc-100">
            <MapPin className="text-[#d4af37] mb-3" />
            <h3 className="font-bold">Location</h3>
            <p className="text-sm text-zinc-500">Rooftop Level 5</p>
            <p className="text-sm text-zinc-500">Lake View Terrace</p>
         </div>
         <div className="snap-center shrink-0 w-64 p-6 bg-black text-white rounded-2xl shadow-xl">
            <Calendar className="text-[#d4af37] mb-3" />
            <h3 className="font-bold">Reservations</h3>
            <p className="text-sm text-zinc-400 mb-4">Book a table in advance.</p>
            <button className="bg-[#d4af37] text-black text-xs font-bold px-4 py-2 rounded-full w-full">Reserve Now</button>
         </div>
      </div>

      {/* MENU GRID */}
      <div className="px-4 max-w-5xl mx-auto">
         <h2 className="text-2xl font-serif font-bold mb-6 px-2">Signature Menu</h2>
         <div className="grid md:grid-cols-2 gap-4">
            {menu.map((item, i) => (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 key={item.id} 
                 className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex justify-between items-center group hover:border-[#d4af37]/30 transition-all"
               >
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        {item.tag && <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full uppercase font-bold">{item.tag}</span>}
                     </div>
                     <p className="text-sm text-zinc-500">{item.desc}</p>
                  </div>
                  <div className="text-right">
                     <span className="block font-serif font-bold text-lg text-[#d4af37]">₹{item.price}</span>
                     <button className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-black transition-colors">Add</button>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default Dining;