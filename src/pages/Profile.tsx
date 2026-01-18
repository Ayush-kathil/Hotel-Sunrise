import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { LogOut, Calendar, MapPin, CreditCard, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const getData = async () => {
      // 1. Get User
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);

      // 2. Get Their Bookings
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', session.user.id) // <--- CRITICAL: Only get THEIR bookings
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

  if (loading) return <div className="min-h-screen bg-[#fcfbf9] pt-32 text-center">Loading your profile...</div>;

  return (
    <div className="min-h-screen bg-[#fcfbf9] pt-28 pb-20 px-6 font-sans">
      <div className="container mx-auto max-w-4xl">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-zinc-200 flex items-center justify-center text-2xl font-serif text-zinc-500">
               {user?.email?.charAt(0).toUpperCase()}
             </div>
             <div>
               <h1 className="text-3xl font-serif font-bold text-zinc-900">My Account</h1>
               <p className="text-zinc-500 text-sm">{user?.email}</p>
             </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="px-6 py-2 border border-zinc-200 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center gap-2"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* BOOKINGS LIST */}
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="text-[#d4af37]" /> Upcoming Stays
        </h2>

        {bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] text-center border border-zinc-100 shadow-sm">
            <p className="text-zinc-400 mb-4">You haven't booked any trips yet.</p>
            <button onClick={() => navigate('/rooms')} className="text-[#d4af37] font-bold hover:underline">
              Browse Rooms
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking, i) => (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                key={booking.id} 
                className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="flex gap-6 items-center">
                  {/* Fake Image Thumbnail */}
                  <div className="w-20 h-20 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-300">
                    <MapPin />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-zinc-900">{booking.room_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
                      <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(booking.check_in).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><CreditCard size={12}/> ₹{booking.total_price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <span className="px-4 py-2 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-2">
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Confirmed
                   </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;