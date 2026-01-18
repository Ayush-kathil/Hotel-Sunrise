import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Calendar, MapPin, CreditCard, User, Shield, ChevronRight, Settings, Bell } from 'lucide-react';
import { toast } from 'sonner';

// --- ANIMATION VARIANTS (The "Landing.love" Smoothness) ---
const containerVar = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVar = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [viewState, setViewState] = useState<'profile' | 'dashboard'>('profile'); // Toggle between Profile & Dashboard

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', session.user.id)
        .order('check_in', { ascending: true });

      if (error) console.error(error);
      else setBookings(data || []);
      
      setLoading(false);
    };

    getData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfbf9] pt-28 pb-20 px-6 font-sans">
      <div className="container mx-auto max-w-5xl">
        
        {/* --- HEADER SECTION --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="flex justify-between items-end mb-12"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-2 block">Welcome Back</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900">
              {user?.user_metadata?.full_name || "Guest"}
            </h1>
          </div>
          <button 
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </motion.div>

        {/* --- TOGGLE CONTENT --- */}
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: SIMPLE PROFILE (Landing View) */}
          {viewState === 'profile' && (
            <motion.div 
              key="profile"
              variants={containerVar}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* ID CARD */}
              <motion.div variants={itemVar} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <User size={120} />
                </div>
                
                <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center text-2xl font-serif text-zinc-400 mb-6 group-hover:scale-110 transition-transform duration-500">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                
                <h2 className="text-2xl font-bold mb-1">Personal Info</h2>
                <p className="text-zinc-500 text-sm mb-8">{user?.email}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                    <span className="text-xs font-bold uppercase text-zinc-400">Status</span>
                    <span className="text-xs font-bold uppercase text-[#d4af37] bg-[#d4af37]/10 px-3 py-1 rounded-full">Gold Member</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                    <span className="text-xs font-bold uppercase text-zinc-400">Member Since</span>
                    <span className="text-xs font-bold text-zinc-900">2026</span>
                  </div>
                </div>
              </motion.div>

              {/* ACTION CARD (The "Button" you asked for) */}
              <motion.div variants={itemVar} className="flex flex-col gap-6">
                
                <div 
                  onClick={() => setViewState('dashboard')}
                  className="flex-1 bg-black text-white p-8 rounded-[2.5rem] shadow-2xl cursor-pointer hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group"
                >
                   {/* Gradient Hover Effect */}
                   <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37] to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                   
                   <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                        <Settings size={20} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-serif font-bold mb-2">My Dashboard</h2>
                        <p className="text-white/60 text-sm flex items-center gap-2">
                          View Bookings & Stats <ChevronRight size={14} />
                        </p>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-lg flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                        <Bell size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Notifications</p>
                        <p className="text-zinc-400 text-xs">2 New Offers</p>
                      </div>
                   </div>
                   <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>

              </motion.div>
            </motion.div>
          )}

          {/* VIEW 2: THE DASHBOARD (Detailed View) */}
          {viewState === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <button 
                onClick={() => setViewState('profile')}
                className="mb-8 flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-black transition-colors"
              >
                ← Back to Profile
              </button>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Stats Column */}
                <div className="space-y-6">
                  <StatCard label="Total Stays" value={bookings.length.toString()} />
                  <StatCard label="Reward Points" value={(bookings.length * 150).toString()} />
                  <StatCard label="Next Trip" value={bookings.length > 0 ? "In 12 Days" : "Not Planned"} />
                </div>

                {/* Bookings Column (Wider) */}
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-xl font-serif font-bold mb-4">Recent Activity</h3>
                  {bookings.length === 0 ? (
                    <div className="bg-white p-12 rounded-[2rem] text-center border border-zinc-100">
                      <p className="text-zinc-400 mb-4">No bookings found.</p>
                      <button onClick={() => navigate('/rooms')} className="text-[#d4af37] font-bold text-sm underline">Book a Stay</button>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        key={booking.id} 
                        className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                         <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center">
                              <MapPin size={24} className="text-zinc-400" />
                            </div>
                            <div>
                               <h4 className="font-bold text-lg">{booking.room_name}</h4>
                               <p className="text-zinc-500 text-xs">{new Date(booking.check_in).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className="font-serif font-bold">₹{booking.total_price.toLocaleString()}</span>
                            <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-bold uppercase rounded-full">Paid</span>
                         </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ label, value }: { label: string, value: string }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-lg">
    <p className="text-xs font-bold uppercase text-zinc-400 mb-2">{label}</p>
    <p className="text-3xl font-serif font-bold">{value}</p>
  </motion.div>
);

export default Profile;