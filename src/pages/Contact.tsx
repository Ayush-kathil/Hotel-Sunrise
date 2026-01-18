import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ArrowUpRight, Navigation } from 'lucide-react';

const Contact = () => {
  return (
    <div className="bg-zinc-950 min-h-screen text-white font-sans selection:bg-[#d4af37] selection:text-white pt-20">
      
      <div className="container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-20">
        
        {/* LEFT: INFO */}
        <div className="space-y-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
          >
            <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-bold block mb-6">Contact</span>
            <h1 className="text-7xl md:text-8xl font-serif leading-none">
              Get in <br/> Touch.
            </h1>
          </motion.div>

          <div className="space-y-8">
            {/* 1. FUNCTIONAL MAP BUTTON */}
            <a 
               href="https://www.google.com/maps/search/?api=1&query=Orai,Uttar+Pradesh" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-start gap-6 group cursor-pointer p-4 -ml-4 rounded-2xl hover:bg-white/5 transition-all"
            >
               <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:border-[#d4af37] group-hover:text-[#d4af37] transition-colors">
                  <MapPin size={20} />
               </div>
               <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1 group-hover:text-white transition-colors">Visit Us</p>
                  <p className="text-2xl font-serif">Near Kalpi Stand, Orai, UP</p>
                  <span className="text-xs text-[#d4af37] font-bold flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     OPEN MAPS <ArrowUpRight size={10} />
                  </span>
               </div>
            </a>

            {/* 2. FUNCTIONAL CALL BUTTON */}
            <a 
               href="tel:+919876543210" 
               className="flex items-start gap-6 group cursor-pointer p-4 -ml-4 rounded-2xl hover:bg-white/5 transition-all"
            >
               <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:border-[#d4af37] group-hover:text-[#d4af37] transition-colors">
                  <Phone size={20} />
               </div>
               <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1 group-hover:text-white transition-colors">Call Us</p>
                  <p className="text-2xl font-serif">+91 987 654 3210</p>
                  <span className="text-xs text-[#d4af37] font-bold flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     CALL NOW <ArrowUpRight size={10} />
                  </span>
               </div>
            </a>

            {/* 3. FUNCTIONAL EMAIL BUTTON */}
            <a 
               href="mailto:hello@hotelsunrise.com" 
               className="flex items-start gap-6 group cursor-pointer p-4 -ml-4 rounded-2xl hover:bg-white/5 transition-all"
            >
               <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:border-[#d4af37] group-hover:text-[#d4af37] transition-colors">
                  <Mail size={20} />
               </div>
               <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1 group-hover:text-white transition-colors">Email Us</p>
                  <p className="text-2xl font-serif">hello@hotelsunrise.com</p>
                  <span className="text-xs text-[#d4af37] font-bold flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     SEND EMAIL <ArrowUpRight size={10} />
                  </span>
               </div>
            </a>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8 }}
           className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800"
        >
          <h2 className="text-3xl font-serif mb-8">Send a Message</h2>
          <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); alert("Message sent!"); }}>
            <div className="space-y-2">
               <label className="text-xs uppercase tracking-widest text-zinc-500 ml-4">Name</label>
               <input className="w-full bg-black/50 border-b border-zinc-800 p-4 text-xl outline-none focus:border-[#d4af37] transition-colors" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
               <label className="text-xs uppercase tracking-widest text-zinc-500 ml-4">Email</label>
               <input className="w-full bg-black/50 border-b border-zinc-800 p-4 text-xl outline-none focus:border-[#d4af37] transition-colors" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
               <label className="text-xs uppercase tracking-widest text-zinc-500 ml-4">Message</label>
               <textarea className="w-full bg-black/50 border-b border-zinc-800 p-4 text-xl outline-none focus:border-[#d4af37] transition-colors min-h-[150px]" placeholder="How can we help?" />
            </div>
            
            <button className="w-full py-6 bg-[#d4af37] text-black font-bold rounded-2xl hover:bg-white transition-colors flex items-center justify-center gap-2 group">
              Send Message <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </motion.div>

      </div>

      {/* FULL WIDTH MAP (Clickable) */}
      <a 
         href="https://www.google.com/maps/search/?api=1&query=Orai,Uttar+Pradesh" 
         target="_blank" 
         rel="noopener noreferrer"
         className="block h-[50vh] w-full grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 relative group"
      >
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
           <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-full text-white font-bold uppercase tracking-widest text-xs opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
              Click to navigate
           </div>
        </div>
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.0123456789!2d79.4500!3d25.9900!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39987979264426b3%3A0xc3f8e815668b422!2sOrai%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
          className="w-full h-full border-0 pointer-events-none" // Pointer events none so click goes to anchor tag
          title="Map"
        ></iframe>
      </a>
    </div>
  );
};

export default Contact;