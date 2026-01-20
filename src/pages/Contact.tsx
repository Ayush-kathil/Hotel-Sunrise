import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Mail, MapPin, Phone, Send, Loader2 } from 'lucide-react';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Send to Supabase
    const { error } = await supabase
      .from('contact_messages') // Ensure this table exists in Supabase
      .insert([formData]);

    setLoading(false);

    if (error) {
      toast.error("Transmission Failed", { description: error.message });
    } else {
      toast.success("Message Received", { description: "We will respond within 2 hours." });
      setFormData({ name: '', email: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-zinc-900 font-sans pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* LEFT: INFO */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
           <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">Get in <br/><span className="text-[#d4af37]">Touch</span></h1>
           <p className="text-zinc-500 text-lg mb-12 max-w-sm">Whether it's a booking inquiry or special arrangement, our concierge is at your disposal.</p>
           
           <div className="space-y-8">
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-[#d4af37]"><Phone /></div>
                 <div>
                    <h3 className="font-bold text-lg">Phone</h3>
                    <p className="text-zinc-500">+91 987 654 3210</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-[#d4af37]"><Mail /></div>
                 <div>
                    <h3 className="font-bold text-lg">Email</h3>
                    <p className="text-zinc-500">concierge@sunrise.com</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-[#d4af37]"><MapPin /></div>
                 <div>
                    <h3 className="font-bold text-lg">Address</h3>
                    <p className="text-zinc-500">Near Kalpi Stand, Orai, Uttar Pradesh</p>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* RIGHT: FORM */}
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
           <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-zinc-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37] rounded-full blur-[80px] opacity-20" />
              
              <div className="space-y-6 relative z-10">
                 <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Your Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-zinc-50 border-none rounded-xl p-4 mt-2 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none" 
                      placeholder="John Doe"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-zinc-50 border-none rounded-xl p-4 mt-2 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none" 
                      placeholder="john@example.com"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Message</label>
                    <textarea 
                      required 
                      rows={4} 
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-zinc-50 border-none rounded-xl p-4 mt-2 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none" 
                      placeholder="How can we help you?"
                    />
                 </div>
                 
                 <button disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-[#d4af37] transition-colors flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Message</>}
                 </button>
              </div>
           </form>
        </motion.div>

      </div>
    </div>
  );
};

export default Contact;