import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, Save, Camera, Mail, Phone, User, Calendar } from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  
  // State for user details
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membership: 'Gold Tier'
  });

  useEffect(() => {
    // Load data from storage (Simulating Database Fetch)
    setFormData({
      name: localStorage.getItem('sunriseUser') || 'Guest',
      email: localStorage.getItem('sunriseEmail') || 'guest@example.com',
      phone: localStorage.getItem('sunrisePhone') || '',
      membership: 'Gold Member'
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Save back to local storage (Simulating Database Update)
    localStorage.setItem('sunriseUser', formData.name);
    localStorage.setItem('sunriseEmail', formData.email);
    localStorage.setItem('sunrisePhone', formData.phone);
    
    alert("Profile Saved Successfully");
    closeDashboard();
  };

  const handleLogout = () => {
    if (confirm("Sign out of Hotel Sunrise?")) {
      localStorage.clear(); // Clear session
      navigate('/');
      window.location.reload(); // Refresh to update Navbar
    }
  };

  const closeDashboard = () => {
    setIsOpen(false);
    setTimeout(() => navigate('/'), 400); // Wait for animation to finish
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end font-sans">
          
          {/* Dark Backdrop (Click to close) */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={closeDashboard}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />

          {/* Sliding Glass Panel */}
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md h-full bg-white/90 backdrop-blur-2xl shadow-2xl border-l border-white/50 p-8 flex flex-col"
          >
            
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-serif text-black">Member Profile</h2>
              <button 
                onClick={closeDashboard} 
                className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X size={20} className="text-zinc-500" />
              </button>
            </div>

            {/* Profile Picture Area */}
            <div className="text-center mb-10 relative">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-full flex items-center justify-center shadow-inner mb-4 relative group cursor-pointer">
                 <span className="text-3xl font-serif text-zinc-400">
                    {formData.name.charAt(0).toUpperCase()}
                 </span>
                 {/* Hover Edit Icon */}
                 <div className="absolute inset-0 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Camera size={16} className="text-white" />
                 </div>
              </div>
              <h3 className="text-2xl font-serif text-black mb-1">{formData.name}</h3>
              <span className="px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-bold uppercase tracking-widest rounded-full">
                {formData.membership}
              </span>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSave} className="space-y-6 flex-1 overflow-y-auto pr-2">
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-2">
                  <User size={12} /> Full Name
                </label>
                <input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-50 border-b-2 border-zinc-200 px-0 py-3 text-black font-medium focus:border-black focus:bg-transparent outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </label>
                <input 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-zinc-50 border-b-2 border-zinc-200 px-0 py-3 text-black font-medium focus:border-black focus:bg-transparent outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-2">
                  <Phone size={12} /> Phone Number
                </label>
                <input 
                  placeholder="+91..."
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-zinc-50 border-b-2 border-zinc-200 px-0 py-3 text-black font-medium focus:border-black focus:bg-transparent outline-none transition-all"
                />
              </div>

              <div className="pt-6">
                <button className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-[#d4af37] hover:text-white transition-all shadow-lg flex items-center justify-center gap-2">
                  <Save size={16} /> SAVE CHANGES
                </button>
              </div>

            </form>

            {/* Footer / Logout */}
            <div className="pt-6 border-t border-zinc-100">
              <button 
                onClick={handleLogout}
                className="w-full py-3 text-red-500 text-sm font-bold hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Sign Out
              </button>
              <p className="text-center text-[10px] text-zinc-300 mt-4 uppercase tracking-widest">
                Member ID: #8834920
              </p>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserDashboard;