import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import { CreditCard, Calendar as CalIcon, Users, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { addDays, differenceInDays, format } from 'date-fns';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { room } = location.state || {};

  // --- STATE MANAGEMENT ---
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // --- INITIAL CHECKS ---
  useEffect(() => {
    if (!room) navigate('/rooms');
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to book a room");
        navigate('/login', { state: { room } });
      } else {
        setUser(session.user);
      }
    };
    getUser();
  }, [navigate, room]);

  // --- CALCULATE PRICE ---
  const nights = startDate && endDate ? differenceInDays(endDate, startDate) : 0;
  const totalPrice = nights > 0 ? (room?.price || 0) * nights : 0;

  // --- BACKEND LOGIC (PRESERVED) ---
  const handlePayment = async () => {
    if (!startDate || !endDate) return toast.error("Please select check-in and check-out dates");
    if (!user) return toast.error("You must be logged in");

    setLoading(true);
    try {
      // 1. Save to Supabase
      const { error } = await supabase.from('bookings').insert([
        {
          user_id: user.id,
          room_name: room.name,
          price: room.price,
          total_price: totalPrice,
          check_in: startDate,
          check_out: endDate,
          nights: nights,
          guests: guests,
          status: 'confirmed'
        }
      ]);

      if (error) throw error;

      // 2. Send Emails (Admin + Guest)
      const emailParams = {
        guest_name: user.user_metadata?.full_name || user.email,
        guest_email: user.email,
        room_name: room.name,
        check_in: format(startDate, 'PP'),
        check_out: format(endDate, 'PP'),
        total_price: `₹${totalPrice.toLocaleString()}`,
        nights: nights
      };

      // Send to Admin (Use your IDs from .env)
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        emailParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      toast.success("Booking Confirmed!", { description: "Check your email for details." });
      navigate('/profile');

    } catch (err: any) {
      console.error(err);
      toast.error("Booking Failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!room) return null;

  return (
    <div className="min-h-screen bg-[#fcfbf9] relative pt-24 pb-12 px-4 md:px-8">
      
      {/* CUSTOM CSS FOR GOLD CALENDAR */}
      <style>{`
        .react-datepicker {
          font-family: 'Playfair Display', serif;
          border: none;
          background: white;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
          border-radius: 1.5rem;
          padding: 1rem;
        }
        .react-datepicker__header {
          background: white;
          border-bottom: 1px solid #f0f0f0;
        }
        .react-datepicker__day--selected, 
        .react-datepicker__day--in-range,
        .react-datepicker__day--in-selecting-range {
          background-color: #d4af37 !important;
          color: white !important;
          border-radius: 50%;
        }
        .react-datepicker__day--in-range:not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end) {
          background-color: #fcefb4 !important;
          color: black !important;
          border-radius: 0;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: transparent;
          color: black;
        }
        .react-datepicker__day:hover {
          background-color: #f9f9f9;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Rooms
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* --- LEFT: ROOM & CALENDAR --- */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-2">
                {room.name}
              </motion.h1>
              <p className="text-zinc-500 text-lg">Select your dates to proceed.</p>
            </div>

            {/* THE PREMIUM CALENDAR */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-[2rem] shadow-xl border border-white/50 relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#d4af37] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#d4af37]/30">
                  <CalIcon size={20} />
                </div>
                <h3 className="font-serif font-bold text-xl">Select Stay Dates</h3>
              </div>

              <div className="flex justify-center">
                <DatePicker
                  selected={startDate}
                  onChange={(update) => setDateRange(update)}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  inline
                  monthsShown={window.innerWidth > 768 ? 2 : 1}
                  minDate={new Date()}
                  renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                    <div className="flex justify-between items-center px-4 py-2 mb-4">
                      <button onClick={decreaseMonth} className="text-zinc-400 hover:text-black transition-colors">←</button>
                      <span className="font-serif font-bold text-lg">{format(date, 'MMMM yyyy')}</span>
                      <button onClick={increaseMonth} className="text-zinc-400 hover:text-black transition-colors">→</button>
                    </div>
                  )}
                />
              </div>

              <div className="mt-6 flex flex-col md:flex-row gap-4 p-4 bg-zinc-50 rounded-2xl">
                <div className="flex-1">
                  <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-1">Check In</p>
                  <p className="font-serif text-lg font-bold">{startDate ? format(startDate, 'MMM dd, yyyy') : 'Select Date'}</p>
                </div>
                <div className="w-px bg-zinc-200 hidden md:block"></div>
                <div className="flex-1">
                  <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-1">Check Out</p>
                  <p className="font-serif text-lg font-bold">{endDate ? format(endDate, 'MMM dd, yyyy') : 'Select Date'}</p>
                </div>
              </div>
            </motion.div>

            {/* GUEST COUNT */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Guests</h3>
                  <p className="text-sm text-zinc-400">Max capacity: {room.capacity || 2}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-zinc-50 px-4 py-2 rounded-full">
                <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 flex items-center justify-center bg-white shadow-sm rounded-full hover:bg-black hover:text-white transition-all">-</button>
                <span className="font-bold w-4 text-center">{guests}</span>
                <button onClick={() => setGuests(Math.min(4, guests + 1))} className="w-8 h-8 flex items-center justify-center bg-white shadow-sm rounded-full hover:bg-black hover:text-white transition-all">+</button>
              </div>
            </div>
          </div>

          {/* --- RIGHT: ORDER SUMMARY (STICKY) --- */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.2 }}
                className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
              >
                {/* Decorative Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#d4af37] rounded-full blur-[80px] opacity-20 animate-pulse" />

                <h2 className="text-2xl font-serif font-bold mb-8">Booking Summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Rate per night</span>
                    <span>₹{room.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Nights</span>
                    <span>{nights} Nights</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Taxes & Fees</span>
                    <span>₹0</span>
                  </div>
                  <div className="h-px bg-white/10 my-4" />
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total</span>
                    <span className="text-[#d4af37]">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-xl mb-8 flex gap-3 backdrop-blur-sm">
                  <CheckCircle className="text-[#d4af37] shrink-0" size={20} />
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    By proceeding, you agree to our cancellation policy. Free cancellation up to 48 hours before check-in.
                  </p>
                </div>

                <button 
                  onClick={handlePayment} 
                  disabled={loading || nights === 0}
                  className="w-full py-4 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                  {loading ? "Processing..." : "Confirm & Pay"}
                </button>

              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingPage;