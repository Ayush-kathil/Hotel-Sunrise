import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, Save, Camera, Mail, Phone, User, Lock } from 'lucide-react';
import { supabase } from '../supabaseClient';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // State for user details
  const [formData, setFormData] = useState({
    id: '',
    full_name: '',
    email: '',
    phone: '',
    membership: 'Gold Tier' // Default
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    
    // 1. Get the currently logged-in user from Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // If no one is logged in, send them to login page
      navigate('/login');
      return;
    }

    // 2. Fetch their extra details (Phone, Name) from the 'profiles' table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setFormData({
        id: user.id,
        email: user.email || '', // Auto-filled from Login
        full_name: data.full_name || 'Valued Guest',
        phone: data.phone || '',
        membership: data.membership || 'Gold Tier'
      });
    } else {
      // If profile is missing, just show basic email info
      setFormData({
        id: user.id,
        email: user.email || '',
        full_name: '',
        phone: '',
        membership: 'Gold Tier'
      });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save updates to the 'profiles' table
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: formData.id,
        full_name: formData.full_name,
        phone: formData.phone,
        membership: formData.membership,
        email: formData.email, // Ensure email is synced
        updated_at: new Date()
      });

    if (error) {
      alert('Error saving profile');
      console.error(error);
    } else {
      alert('Profile updated successfully!');
      closeDashboard();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    window.location.reload();
  };

  const closeDashboard = () => {
    setIsOpen(false);
    setTimeout(() => navigate('/'), 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end font-sans">
          
          {/* Dark Backdrop */}
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

            {loading ? (
              <div className="flex-1 flex items-center justify-center text-zinc-400">Loading Profile...</div>
            ) : (
              <>
                {/* Profile Picture Area */}
                <div className="text-center mb-10 relative">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-full flex items-center justify-center shadow-inner mb-4 relative group cursor-pointer">
                     <span className="text-3xl font-serif text-zinc-400">
                        {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : 'U'}
                     </span>
                     <div className="absolute inset-0 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Camera size={16} className="text-white" />
                     </div>
                  </div>
                  <h3 className="text-2xl font-serif text-black mb-1">
                    {formData.full_name || 'Guest'}
                  </h3>
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
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full bg-zinc-50 border-b-2 border-zinc-200 px-0 py-3 text-black font-medium focus:border-black focus:bg-transparent outline-none transition-all"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-2">
                      <Mail size={12} /> Email Address
                    </label>
                    <div className="relative">
                      <input 
                        value={formData.email}
                        disabled // Disabled because email comes from Login
                        className="w-full bg-zinc-100 border-b-2 border-transparent px-0 py-3 text-zinc-500 font-medium cursor-not-allowed"
                      />
                      <Lock size={12} className="absolute right-2 top-4 text-zinc-400" />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">Email is linked to your login and cannot be changed here.</p>
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
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-3 text-red-500 text-sm font-bold hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserDashboard;