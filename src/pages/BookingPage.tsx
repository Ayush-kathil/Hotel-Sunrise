import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, CreditCard, CheckCircle, Moon } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // FORM STATE
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const room = location.state?.room;
  const today = new Date().toISOString().split('T')[0];

  // 1. Initialize & Calculate Totals
  useEffect(() => {
    if (!room) navigate('/rooms');
    else setTotalPrice(room.price); // Default to 1 night price
  }, [room, navigate]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to book");
        navigate('/login', { state: { returnTo: '/booking', room } });
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, []);

  // 2. Calculate Nights when Dates Change
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays > 0) {
        setNights(diffDays);
        setTotalPrice(diffDays * (room?.price || 0));
      }
    }
  }, [checkIn, checkOut, room]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user || !room) return;

    // VALIDATION
    if (new Date(checkIn) < new Date(today)) {
        toast.error("Invalid Check-in Date");
        setLoading(false); return;
    }
    if (!checkOut || new Date(checkOut) <= new Date(checkIn)) {
        toast.error("Invalid Check-out Date");
        setLoading(false); return;
    }

    // 3. DATABASE INSERT (Including 'nights' and 'check_out')
    const { error } = await supabase
      .from('bookings')
      .insert([{
        room_name: room.name,
        price: room.price,
        total_price: totalPrice,
        check_in: checkIn,
        check_out: checkOut,
        nights: nights,
        guests: guests,
        status: 'confirmed',
        user_id: user.id
      }]);

    if (error) {
      console.error("DB Error:", error);
      toast.error("Booking Failed", { description: error.message });
    } else {
      
      // 4. EMAIL NOTIFICATION (Only runs if DB success)
      try {
        const templateParams = {
           to_name: "Admin",
           guest_name: user.user_metadata?.full_name || user.email,
           guest_email: user.email,
           room_name: room.name,
           dates: `${checkIn} to ${checkOut} (${nights} nights)`,
           price: `₹${totalPrice.toLocaleString()}`,
           reply_to: user.email
        };
        
        // REPLACE THESE WITH YOUR ACTUAL KEYS FROM EMAILJS DASHBOARD
        await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_PUBLIC_KEY');
        console.log("✅ Email sent successfully!");

      } catch (err) { 
        console.error("❌ Email Failed:", err);
        // We don't stop the flow here because the booking was successful
      }

      toast.success("Booking Confirmed!", { icon: <CheckCircle className="text-green-500" /> });
      
      // REDIRECT: Send normal users to their profile
      navigate('/profile'); 
    }
    setLoading(false);
  };

  if (!room) return null;

  return (
    <div className="min-h-screen bg-[#fcfbf9] pt-28 px-6 pb-20">
      <div className="container mx-auto max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 mb-8 hover:text-black">
          <ArrowLeft size={20} /> Back
        </button>
        
        <div className="grid md:grid-cols-2 gap-8 items-start">
           
           {/* ROOM INFO */}
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-[2rem] shadow-xl border border-zinc-100">
              <img src={room.img} alt={room.name} className="w-full h-64 object-cover rounded-[1.5rem] mb-6 shadow-md" />
              <h1 className="text-3xl font-serif font-bold mb-2">{room.name}</h1>
              <div className="flex justify-between py-4 border-b border-zinc-100">
                <span className="text-zinc-500">Price per night</span>
                <span className="text-xl font-bold">₹{room.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-4">
                <span className="text-zinc-500">Total ({nights} nights)</span>
                <span className="text-2xl font-bold text-[#d4af37]">₹{totalPrice.toLocaleString()}</span>
              </div>
           </motion.div>

           {/* BOOKING FORM */}
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2rem] shadow-xl border border-zinc-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <CreditCard className="text-[#d4af37]" /> Confirm Stay
              </h3>
              
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                   <label className="text-xs font-bold uppercase text-zinc-400 ml-2">Guest</label>
                   <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                      <input value={user?.email || ''} disabled className="w-full bg-zinc-50 pl-12 p-4 rounded-xl text-zinc-500" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-400 ml-2">Check-In</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                        <input type="date" required min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full border pl-12 p-4 rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-400 ml-2">Check-Out</label>
                    <div className="relative">
                        <Moon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                        <input type="date" required min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full border pl-12 p-4 rounded-xl" />
                    </div>
                  </div>
                </div>

                <div>
                   <label className="text-xs font-bold uppercase text-zinc-400 ml-2">Guests</label>
                   <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full border p-4 rounded-xl bg-white">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Guests</option>)}
                   </select>
                </div>

                <button disabled={loading} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-[#d4af37] transition-all disabled:opacity-50">
                  {loading ? "Processing..." : `Pay ₹${totalPrice.toLocaleString()}`}
                </button>
              </form>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;