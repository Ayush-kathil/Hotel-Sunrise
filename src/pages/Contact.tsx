import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../supabaseClient';

// --- ANIMATION VARIANTS (Nexus Smooth Style) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 50, damping: 20 },
  },
};

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('contact_messages')
      .insert([formData]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] font-sans pt-24 pb-20 selection:bg-[#d4af37] selection:text-white">
      
      {/* 1. HEADER SECTION */}
      <div className="container mx-auto px-6 mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-[#d4af37] font-bold tracking-[0.2em] uppercase text-xs mb-4 block">
            24/7 Support
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-zinc-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-zinc-500 text-lg leading-relaxed">
            We are here to help you plan your stay. Whether you have questions about booking or special requests, our concierge team is ready.
          </p>
        </motion.div>
      </div>

      {/* 2. MAIN GRID */}
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-12 lg:gap-24"
        >
          
          {/* LEFT: CONTACT INFO */}
          <div className="space-y-12">
            
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100">
              <h3 className="text-2xl font-serif font-bold mb-8">Concierge Desk</h3>
              
              <div className="space-y-6">
                
                {/* 1. MAP BUTTON (Clickable) */}
                <InfoItem 
                  icon={MapPin} 
                  title="Our Location" 
                  text="NH 27, Patel Nagar, Orai, Jalaun, Uttar Pradesh, 285001" 
                  href="https://www.google.com/maps/place/hotel+sunrise+orai/data=!4m2!3m1!1s0x399d7f2518de88b9:0x3a79b69cfecc307f?sa=X&ved=1t:242&ictx=111"
                  actionLabel="Get Directions"
                />

                {/* 2. PHONE BUTTON (Clickable) */}
                <InfoItem 
                  icon={Phone} 
                  title="Phone Support" 
                  text="+91 123 456 7890" 
                  subtext="Available 24/7 for guests"
                  href="tel:+911234567890"
                  actionLabel="Call Now"
                />

                {/* 3. EMAIL BUTTON (Clickable) */}
                <InfoItem 
                  icon={Mail} 
                  title="Email Us" 
                  text="reservations@hotelsunrise.com" 
                  href="mailto:reservations@hotelsunrise.com"
                  actionLabel="Send Email"
                />

              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-black text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                   <Clock className="text-[#d4af37]" /> Operating Hours
                 </h3>
                 <p className="text-zinc-400 text-sm mb-6">Our front desk is always open.</p>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <span className="block text-[#d4af37] font-bold uppercase text-xs">Check-In</span>
                     <span>2:00 PM Onwards</span>
                   </div>
                   <div>
                     <span className="block text-[#d4af37] font-bold uppercase text-xs">Check-Out</span>
                     <span>Until 11:00 AM</span>
                   </div>
                 </div>
               </div>
               {/* Decorative Circle */}
               <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-[#d4af37]/20 rounded-full blur-3xl pointer-events-none" />
            </motion.div>

          </div>

          {/* RIGHT: CONTACT FORM */}
          <motion.div variants={itemVariants}>
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-zinc-200 border border-zinc-100 h-full relative overflow-hidden">
              
              {/* Form Success State */}
              {sent ? (
                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center text-center p-8 z-20">
                   <motion.div 
                     initial={{ scale: 0 }} animate={{ scale: 1 }} 
                     className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
                   >
                     <CheckCircle size={40} />
                   </motion.div>
                   <h3 className="text-3xl font-serif font-bold mb-2">Message Sent!</h3>
                   <p className="text-zinc-500 mb-8">Thank you. We will get back to you shortly.</p>
                   <button 
                     onClick={() => setSent(false)}
                     className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-[#d4af37] transition-colors"
                   >
                     Send Another
                   </button>
                </div>
              ) : null}

              <h3 className="text-3xl font-serif font-bold mb-2">Send a Message</h3>
              <p className="text-zinc-500 mb-8">Direct line to our management team.</p>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-2">Your Name</label>
                    <input 
                      type="text" required
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all"
                      placeholder="John Doe"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-2">Email Address</label>
                    <input 
                      type="email" required
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all"
                      placeholder="john@example.com"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-2">Subject</label>
                   <input 
                     type="text" 
                     className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all"
                     placeholder="Booking Inquiry, Event, etc."
                     value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-2">Message</label>
                   <textarea 
                     required
                     className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all min-h-[150px]"
                     placeholder="How can we help you?"
                     value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                   />
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-[#d4af37] transition-all flex items-center justify-center gap-2 group shadow-lg"
                >
                  {loading ? "Sending..." : "Send Message"} 
                  {!loading && <Send size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

            </div>
          </motion.div>

        </motion.div>
      </div>

    </div>
  );
};

// --- HELPER COMPONENT (Now Clickable!) ---
const InfoItem = ({ icon: Icon, title, text, subtext, href, actionLabel }: any) => {
  const content = (
    <div className={`flex gap-5 group p-4 rounded-2xl border border-transparent transition-all ${href ? 'hover:bg-zinc-50 hover:border-zinc-100 cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-[#d4af37] transition-all duration-300 shrink-0 ${href ? 'group-hover:bg-[#d4af37] group-hover:text-white group-hover:scale-110' : ''}`}>
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
           <h4 className="font-bold text-zinc-900 mb-1">{title}</h4>
           {href && <ExternalLink size={14} className="text-zinc-300 group-hover:text-[#d4af37] transition-colors" />}
        </div>
        <p className="text-zinc-600 leading-relaxed text-sm">{text}</p>
        {subtext && <p className="text-zinc-400 text-xs mt-1">{subtext}</p>}
        
        {href && (
          <span className="inline-block mt-2 text-xs font-bold uppercase tracking-widest text-[#d4af37] border-b border-[#d4af37]/0 group-hover:border-[#d4af37] transition-all">
            {actionLabel}
          </span>
        )}
      </div>
    </div>
  );

  return href ? (
    <a href={href} target={href.startsWith('http') ? "_blank" : "_self"} rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    content
  );
};

export default Contact;