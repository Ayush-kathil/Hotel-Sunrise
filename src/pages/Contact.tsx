import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Mail, MapPin, Phone, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save to Database (This triggers the Excel Sync Webhook automatically)
      const { error: dbError } = await supabase.from('contact_messages').insert([{
        full_name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      }]);

      if (dbError) throw dbError;

      // 2. Send Secure Email to Admin (Edge Function)
      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (emailError) console.error("Email failed:", emailError);

      toast.success("Message Sent!", { description: "We will get back to you shortly." });
      setFormData({ name: '', email: '', subject: '', message: '' });

    } catch (error: any) {
      toast.error("Failed to send", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-bold mb-4">Get in Touch</h1>
          <p className="text-zinc-500">We are here to assist you 24/7</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
              <div className="w-10 h-10 bg-[#d4af37]/10 text-[#d4af37] rounded-full flex items-center justify-center mb-4"><Phone size={20} /></div>
              <h3 className="font-bold">Phone</h3>
              <p className="text-zinc-500 text-sm">+91 987 654 3210</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
              <div className="w-10 h-10 bg-[#d4af37]/10 text-[#d4af37] rounded-full flex items-center justify-center mb-4"><Mail size={20} /></div>
              <h3 className="font-bold">Email</h3>
              <p className="text-zinc-500 text-sm">concierge@sunrise.com</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
              <div className="w-10 h-10 bg-[#d4af37]/10 text-[#d4af37] rounded-full flex items-center justify-center mb-4"><MapPin size={20} /></div>
              <h3 className="font-bold">Location</h3>
              <p className="text-zinc-500 text-sm">Udaipur, Rajasthan</p>
            </div>
          </div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl border border-zinc-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Name</label>
                  <input type="text" required className="w-full bg-[#fcfbf9] border border-zinc-200 rounded-xl p-3 outline-none focus:border-[#d4af37]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Email</label>
                  <input type="email" required className="w-full bg-[#fcfbf9] border border-zinc-200 rounded-xl p-3 outline-none focus:border-[#d4af37]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Subject</label>
                <input type="text" required className="w-full bg-[#fcfbf9] border border-zinc-200 rounded-xl p-3 outline-none focus:border-[#d4af37]" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Message</label>
                <textarea required rows={4} className="w-full bg-[#fcfbf9] border border-zinc-200 rounded-xl p-3 outline-none focus:border-[#d4af37]" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
              </div>
              <button disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-[#d4af37] transition-colors flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />} Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;