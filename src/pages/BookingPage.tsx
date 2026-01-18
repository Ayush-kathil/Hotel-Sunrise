import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, CreditCard, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkInDate, setCheckInDate] = useState(''); // Control the date input
  
  // Get room data passed from Rooms page
  const room = location.state?.room;

  // 1. PREVENT PAST DATES (The Fix)
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!room) {
      navigate('/rooms');
    }
  }, [room, navigate]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to book a room");
        // Pass the room state so they don't lose it after login
        navigate('/login', { state: { returnTo: '/booking', room: room } });
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [navigate, room]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) return;

    // Validate Date Again
    if (new Date(checkInDate) < new Date(today)) {
        toast.error("Invalid Date", { description: "You cannot book a date in the past." });
        setLoading(false);
        return;
    }

    const { error } = await supabase
      .from('bookings')
      .insert([{
        room_name: room.name,
        price: room.price,
        total_price: room.price,
        check_in: checkInDate, // Use the state variable
        status: 'confirmed',
        user_id: user.id
      }]);

    if (error) {
      toast.error("Booking Failed", { description: error.message });
    } else {
      toast.success("Booking Confirmed!", {
        description: `You have successfully booked ${room.name}`,
        icon: <CheckCircle className="text-green-500" />
      });
      navigate('/dashboard'); 
    }
    setLoading(false);
  };

  if (!room) return null;

  return (
    <div className="min-h-screen bg-[#fcfbf9] pt-28 px-6 pb-20">
      <div className="container mx-auto max-w-4xl">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 mb-8 hover:text-black transition-colors">
          <ArrowLeft size={20} /> Back to Rooms
        </button>
        
        <div className="grid md:grid-cols-2 gap-8 items-start">
           
           {/* LEFT: ROOM DETAILS */}
           <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white p-6 rounded-[2rem] shadow-xl border border-zinc-100">
              <img src={room.img} alt={room.name} className="w-full h-64 object-cover rounded-[1.5rem] mb-6 shadow-md" />
              <h1 className="text-3xl font-serif font-bold mb-2">{room.name}</h1>
              <div className="flex justify-between items-center py-4 border-b border-zinc-100">
                <span className="text-zinc-500">Price per night</span>
                <span className="text-2xl font-bold">₹{room.price.toLocaleString()}</span>
              </div>
              <div className="mt-4 space-y-2">
                 <p className="text-sm text-zinc-500 flex items-center gap-2"><CheckCircle size={14} className="text-[#d4af37]"/> {room.size}</p>
                 <p className="text-sm text-zinc-500 flex items-center gap-2"><CheckCircle size={14} className="text-[#d4af37]"/> {room.amenities[0]}</p>
              </div>
           </motion.div>

           {/* RIGHT: CHECKOUT FORM */}
           <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2rem] shadow-xl border border-zinc-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <CreditCard className="text-[#d4af37]" /> Confirm & Pay
              </h3>
              
              <form onSubmit={handlePayment} className="space-y-5">
                <div className="space-y-1">
                   <label className="text-xs font-bold uppercase text-zinc-400 ml-2">Guest Email</label>
                   <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                      <input type="email" value={user?.email || ''} disabled className="w-full bg-zinc-50 pl-12 p-4 rounded-xl text-zinc-500 cursor-not-allowed" />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-bold uppercase text-zinc-400 ml-2">Check-in Date</label>
                   <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                      <input 
                        type="date" 
                        required 
                        min={today} // <--- FIX APPLIED HERE
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full bg-white border border-zinc-200 pl-12 p-4 rounded-xl outline-none focus:border-[#d4af37]" 
                      />
                   </div>
                </div>

                <div className="bg-zinc-50 p-4 rounded-xl flex justify-between items-center mt-4">
                   <span className="font-bold text-zinc-500">Total to Pay</span>
                   <span className="font-serif text-2xl font-bold text-black">₹{room.price.toLocaleString()}</span>
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-4 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-[#d4af37] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Confirm Booking"}
                </button>
              </form>
           </motion.div>

        </div>
      </div>
    </div>
  );
};

export default BookingPage;