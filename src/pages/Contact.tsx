// REMOVED "import React"
import { motion } from 'framer-motion';
import { Phone, Mail, MessageSquare } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-white pt-32 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-yellow-600 font-bold tracking-[0.2em] uppercase text-xs">Here to Help</span>
          <h1 className="text-6xl md:text-7xl font-serif mb-8 text-black mt-6">Concierge & Support</h1>
          <p className="text-zinc-500 mb-20 text-xl font-light max-w-2xl mx-auto">
            Whether you need a room upgrade, event planning, or travel assistance, our team is at your service 24/7.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Call Option */}
          <motion.a 
            href="tel:+919876543210" 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="group p-12 border border-zinc-100 rounded-3xl hover:border-black transition-all bg-zinc-50 hover:bg-white shadow-sm hover:shadow-2xl text-left"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-8 group-hover:scale-110 transition-transform">
              <Phone className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-3xl font-serif mb-3 group-hover:text-[#d4af37] transition-colors">Call Us</h2>
            <p className="text-zinc-500 mb-8 text-lg">Immediate assistance for bookings.</p>
            <span className="text-xl font-bold border-b border-black pb-1">+91 98765 43210</span>
          </motion.a>

          {/* Email Option */}
          <motion.a 
            href="mailto:support@hotelsunrise.com" 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="group p-12 border border-zinc-100 rounded-3xl hover:border-black transition-all bg-zinc-50 hover:bg-white shadow-sm hover:shadow-2xl text-left"
          >
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-8 group-hover:scale-110 transition-transform">
              <Mail className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-3xl font-serif mb-3 group-hover:text-[#d4af37] transition-colors">Email Us</h2>
            <p className="text-zinc-500 mb-8 text-lg">For events and special requests.</p>
            <span className="text-xl font-bold border-b border-black pb-1">support@hotelsunrise.com</span>
          </motion.a>
        </div>
      </div>
    </div>
  );
};

export default Contact;