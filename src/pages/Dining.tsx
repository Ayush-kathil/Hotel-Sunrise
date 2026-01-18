import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Clock, Calendar, Users, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Dining = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', date: '', time: '', guests: 2
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('dining_reservations')
      .insert([formData]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Table Reserved Successfully!");
      setFormData({ name: '', email: '', date: '', time: '', guests: 2 });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white pt-20 pb-20 font-sans selection:bg-[#d4af37] selection:text-white">
      <div className="container mx-auto px-6 max-w-4xl text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-serif mb-6 text-[#d4af37]">Culinary Art</h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Experience flavors that transcend borders.</p>
      </div>

      <div className="container mx-auto px-6 max-w-2xl">
        <div className="bg-zinc-800/50 p-10 rounded-[2rem] border border-zinc-700">
          <h2 className="text-3xl font-serif mb-8 text-center">Reserve a Table</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <input 
                type="text" placeholder="Name" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-black/30 border border-zinc-600 p-4 rounded-xl outline-none focus:border-[#d4af37]" 
              />
              <input 
                type="email" placeholder="Email" required
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black/30 border border-zinc-600 p-4 rounded-xl outline-none focus:border-[#d4af37]" 
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <input 
                type="date" required
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-black/30 border border-zinc-600 p-4 rounded-xl outline-none focus:border-[#d4af37] text-zinc-400" 
              />
              <input 
                type="time" required
                value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                className="w-full bg-black/30 border border-zinc-600 p-4 rounded-xl outline-none focus:border-[#d4af37] text-zinc-400" 
              />
              <select 
                value={formData.guests} onChange={e => setFormData({...formData, guests: Number(e.target.value)})}
                className="w-full bg-black/30 border border-zinc-600 p-4 rounded-xl outline-none focus:border-[#d4af37] text-zinc-400"
              >
                {[2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} Guests</option>)}
              </select>
            </div>
            <button disabled={loading} className="w-full py-5 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-white transition-colors">
              {loading ? "Confirming..." : "Confirm Reservation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dining;