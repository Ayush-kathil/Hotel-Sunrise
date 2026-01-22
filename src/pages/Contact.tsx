import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Mail, MapPin, Phone, Send, Loader2, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save to Database
      const { error: dbError } = await supabase.from('contact_messages').insert([{
        full_name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      }]);

      if (dbError) throw dbError;

      // 2. Send Secure Email (Optional Edge Function)
      // await supabase.functions.invoke('send-contact-email', { body: formData });

      toast.success("Message Sent", { 
        description: "Our concierge will contact you shortly.",
        style: { background: '#0a0a0a', color: '#fff', border: '1px solid #333' }
      });
      setFormData({ name: '', email: '', subject: '', message: '' });

    } catch (error: any) {
      toast.error("Transmission Failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] relative overflow-hidden flex items-center justify-center py-20 px-4 font-sans text-zinc-900">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-[100px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-100/40 rounded-full blur-[120px] z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Text & Info */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#d4af37]">
              <Star size={16} fill="#d4af37" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">24/7 Concierge</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-zinc-900 leading-tight">
              Let us arrange <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#b8952b]">your perfect stay.</span>
            </h1>
            <p className="text-zinc-500 text-lg mt-4 max-w-md font-light leading-relaxed">
              Whether it is a booking inquiry, dining reservation, or a special request, we are at your service.
            </p>
          </div>

          <div className="grid gap-4">
            <ContactCard icon={Phone} title="Direct Line" value="+91 987 654 3210" />
            <ContactCard icon={Mail} title="Email" value="concierge@sunrise.com" />
            <ContactCard icon={MapPin} title="Location" value="Lake Pichola, Udaipur" />
          </div>
        </motion.div>

        {/* Right Side: Glass Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl border border-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-zinc-200/50"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <InputGroup label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
              <InputGroup label="Email Address" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
            </div>
            <InputGroup label="Subject" value={formData.subject} onChange={v => setFormData({...formData, subject: v})} />
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#d4af37] uppercase tracking-wider ml-1">Message</label>
              <textarea 
                required 
                rows={4} 
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl p-4 text-zinc-900 outline-none focus:border-[#d4af37] transition-all resize-none placeholder:text-zinc-400 focus:bg-white" 
                placeholder="How may we assist you?"
                value={formData.message} 
                onChange={e => setFormData({...formData, message: e.target.value})} 
              />
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-[#d4af37] text-white font-bold py-4 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 mt-4 shadow-[0_10px_30px_rgba(212,175,55,0.3)]"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />} 
              Send Message
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
};

// UI Helper Components
const ContactCard = ({ icon: Icon, title, value }: any) => (
  <div className="flex items-center gap-4 bg-white border border-zinc-100 p-4 rounded-xl hover:shadow-lg transition-all cursor-default group">
    <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-white transition-colors">
      <Icon size={20} />
    </div>
    <div>
      <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
      <p className="text-zinc-900 font-serif text-lg">{value}</p>
    </div>
  </div>
);

interface InputGroupProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}

const InputGroup = ({ label, type = "text", value, onChange }: InputGroupProps) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-[#d4af37] uppercase tracking-wider ml-1">{label}</label>
    <input 
      type={type} 
      required 
      className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl p-4 text-zinc-900 outline-none focus:border-[#d4af37] transition-all placeholder:text-zinc-400 focus:bg-white"
      value={value} 
      onChange={e => onChange(e.target.value)} 
    />
  </div>
);

export default Contact;