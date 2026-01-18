import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Calendar, Users, Check, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Make sure this path is correct

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Room data (fallback if accessed directly)
  const roomData = location.state?.room || {
    name: "Deluxe Suite",
    price: 3500,
    img: "https://images.oyoroomscdn.com/uploads/hotel_image/76246/large/89f37ad358dbcbae.jpg",
    desc: "Experience the pinnacle of luxury with panoramic views."
  };

  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(1);
  const [checkInDate, setCheckInDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please sign in to book a room.");
        navigate('/login');
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [navigate]);

  const TAX_RATE = 0.18;
  const GUEST_FEE = 500;

  const subtotal = (roomData.price * nights) + ((guests - 1) * GUEST_FEE);
  const taxes = Math.round(subtotal * TAX_RATE);
  const total = subtotal + taxes;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    // 1. Insert Booking into Supabase
    const { error } = await supabase
      .from('bookings')
      .insert([
        {
          user_id: user.id,
          room_name: roomData.name,
          check_in: checkInDate,
          nights: nights,
          guests: guests,
          total_price: total,
          status: 'confirmed'
        }
      ]);

    if (error) {
      alert("Error saving booking: " + error.message);
      setLoading(false);
    } else {
      // 2. Success Animation & Redirect
      setTimeout(() => {
        setLoading(false);
        alert(`Payment of ₹${total.toLocaleString()} Successful! Booking Confirmed.`);
        navigate('/dashboard'); // Go to dashboard to see the booking
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] font-sans selection:bg-[#d4af37] selection:text-white pt-24 pb-20">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-black/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <button onClick={() => navigate(-1)} className="text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-black mb-4 flex items-center gap-2">
            ← Back to Rooms
          </button>
          <h1 className="text-4xl md:text-6xl font-serif text-black">Confirm Reservation</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* LEFT: FORM */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
              className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 border border-zinc-100"
            >
              <form onSubmit={handlePayment} className="space-y-8">
                <h2 className="text-2xl font-serif mb-8 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#d4af37] text-white flex items-center justify-center text-sm font-sans font-bold">1</span>
                  Stay Details
                </h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-2 mb-2 block">Check In</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="date" 
                        required 
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full pl-12 p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#d4af37]" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-2 mb-2 block">Nights</label>
                    <select 
                      value={nights} 
                      onChange={(e) => setNights(Number(e.target.value))}
                      className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#d4af37] appearance-none"
                    >
                      {[1,2,3,4,5,7,14].map(n => <option key={n} value={n}>{n} Night{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-2 mb-2 block">Guests</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <select 
                      value={guests} 
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full pl-12 p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#d4af37] appearance-none"
                    >
                      {[1,2,3,4].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    disabled={loading || !checkInDate}
                    className="w-full py-5 bg-black text-white font-bold rounded-xl hover:bg-[#d4af37] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing Booking..." : `Confirm & Pay ₹${total.toLocaleString()}`} <ArrowRight size={20} />
                  </button>
                  <div className="flex justify-center items-center gap-2 mt-4 text-zinc-400 text-xs">
                    <ShieldCheck size={14} /> Secure Booking via Supabase
                  </div>
                </div>

              </form>
            </motion.div>
          </div>

          {/* RIGHT: SUMMARY CARD (Sticky) */}
          <div className="lg:col-span-5">
            <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
               className="sticky top-32"
            >
              <div className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-zinc-200 border border-zinc-100 overflow-hidden">
                <div className="relative h-64 rounded-[1.5rem] overflow-hidden mb-6 group">
                   <img src={roomData.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Room" />
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                      <Star size={12} className="fill-[#d4af37] text-[#d4af37]" /> 5.0
                   </div>
                </div>
                
                <div className="px-6 pb-6">
                  <h3 className="text-3xl font-serif mb-2">{roomData.name}</h3>
                  <div className="space-y-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-100 mt-6">
                    <div className="flex justify-between text-sm text-zinc-600">
                      <span>Rate (x{nights} nights)</span>
                      <span>₹{(roomData.price * nights).toLocaleString()}</span>
                    </div>
                    {guests > 1 && (
                      <div className="flex justify-between text-sm text-zinc-600">
                        <span>Extra Guest Fee</span>
                        <span>₹{((guests - 1) * GUEST_FEE).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-zinc-600">
                      <span>Taxes & Fees (18%)</span>
                      <span>₹{taxes.toLocaleString()}</span>
                    </div>
                    <div className="h-[1px] bg-zinc-200 my-2"></div>
                    <div className="flex justify-between text-xl font-serif font-bold text-black items-center">
                      <span>Total</span>
                      <span className="text-[#d4af37]">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Booking;