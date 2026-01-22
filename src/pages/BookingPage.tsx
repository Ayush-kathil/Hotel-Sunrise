import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'sonner';
import { CreditCard, Calendar as CalIcon, User, AlertTriangle, ArrowLeft, Wifi, Coffee, Tv, Wind } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { motion } from 'framer-motion';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { room } = location.state || {}; 

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [guests] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Redirect if no room selected
    if (!room) { navigate('/rooms'); return; }
    
    // 2. Fetch User Session
    const checkSession = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session) {
         toast.error("Authentication Required", { description: "Please login to complete your booking." });
         navigate('/login', { state: { room } });
       } else {
         setUser(session.user);
         setGuestName(session.user.user_metadata?.full_name || '');
       }
    };
    checkSession();
  }, [room, navigate]);

  const nights = startDate && endDate ? differenceInDays(endDate, startDate) : 0;
  const totalPrice = nights > 0 ? (room?.price || 0) * nights : 0;

  const handlePayment = async () => {
    if (!startDate || !endDate) return toast.warning("Dates Required", { description: "Please select check-in and check-out dates." });
    if (!guestName) return toast.warning("Guest Name Required");
    
    setLoading(true);

    try {
      // 1. RPC Call: Check Availability
      const { data: assignedRoomNumber, error: rpcError } = await supabase
        .rpc('get_available_room', {
          requested_category: room.name,
          check_in_date: startDate, 
          check_out_date: endDate
        });

      if (rpcError) throw rpcError;

      if (!assignedRoomNumber) {
         toast.error(`Room Unavailable`, {
           description: `Sorry, the ${room.name} is fully booked for these dates.`,
           icon: <AlertTriangle className="text-red-500" />
         });
         return; 
      }

      // 2. Ensure Profile Exists (Fix for FK Error)
      // Sometimes triggers fail or don't exist, so we ensure the profile row exists before referencing it.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          // Only update basic info if creating/updating
          full_name: guestName || 'Guest',
          // email: user.email // optional, depends on schema
        }, { onConflict: 'id' })
        .select();

      if (profileError) {
         console.warn("Profile Upsert Warning:", profileError);
         // We continue, hoping the row exists or error is RLS related but row is there.
      }

      // 3. Insert Booking
      const { data: savedBooking, error: dbError } = await supabase
        .from('bookings')
        .insert([{
            user_id: user.id,
            room_name: room.name,
            room_number: assignedRoomNumber,
            price: room.price,
            total_price: totalPrice,
            check_in: startDate,
            check_out: endDate,
            nights: nights,
            guests: guests,
            status: 'confirmed'
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Send Confirmation Email
      await supabase.functions.invoke('send-booking-email', {
        body: {
          email: user.email,
          name: guestName,
          room_name: room.name,
          room_number: assignedRoomNumber,
          dates: `${format(startDate!, 'MMM dd')} - ${format(endDate!, 'MMM dd, yyyy')}`,
          price: totalPrice.toLocaleString(),
          booking_id: savedBooking.id
        }
      });

      toast.success("Booking Confirmed!", { 
        description: `Confirmation sent to ${user.email} and Hotel Admin.`,
        duration: 5000 
      });
      navigate('/profile');

    } catch (err: any) {
      console.error(err);
      toast.error("System Error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!room) return null;

  return (
    <div className="min-h-screen bg-[#fcfbf9] font-sans text-zinc-900 pb-20">
      
      {/* 1. HERO SECTION (Room Description) */}
      <div className="relative h-[50vh] min-h-[400px]">
         <div className="absolute inset-0 bg-black/40 z-10" />
         <img src={room.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80"} alt={room.name} className="w-full h-full object-cover" />
         
         <div className="absolute top-0 left-0 w-full p-6 z-20 pt-24">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full w-fit">
               <ArrowLeft size={18} /> Back
            </button>
         </div>

         <div className="absolute bottom-0 left-0 w-full p-6 z-20 bg-gradient-to-t from-black/90 to-transparent pt-32">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-6xl mx-auto">
                <span className="text-[#d4af37] font-bold tracking-widest uppercase text-xs mb-2 block">Luxury Collection</span>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">{room.name}</h1>
                <div className="flex gap-6 text-white/80 text-sm overflow-x-auto pb-2 no-scrollbar">
                   <div className="flex items-center gap-2"><Wifi size={16} /> Free Wifi</div>
                   <div className="flex items-center gap-2"><Wind size={16} /> AC</div>
                   <div className="flex items-center gap-2"><Coffee size={16} /> Breakfast</div>
                   <div className="flex items-center gap-2"><Tv size={16} /> Smart TV</div>
                </div>
            </motion.div>
         </div>
      </div>

      {/* 2. BOOKING SECTION */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-30 grid lg:grid-cols-12 gap-8">
         
         {/* Left: Calendar */}
         <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="lg:col-span-7">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-zinc-100">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-[#d4af37]"><CalIcon size={24} /></div>
                  <div>
                    <h3 className="font-bold text-xl">Select Dates</h3>
                    <p className="text-zinc-500 text-sm">Tap start date, then end date.</p>
                  </div>
               </div>
               
               <div className="flex justify-center bg-zinc-50/50 rounded-3xl p-4">
                 <DatePicker 
                    selected={startDate} 
                    onChange={(update) => setDateRange(update)} 
                    startDate={startDate} 
                    endDate={endDate} 
                    selectsRange 
                    inline 
                    monthsShown={window.innerWidth > 768 ? 2 : 1} // Responsive Calendar
                    minDate={new Date()} 
                    calendarClassName="!border-0 !font-sans !bg-transparent" 
                 />
               </div>
               <style>{`
                  .react-datepicker__header { background: transparent; border: none; }
                  .react-datepicker__day--selected, .react-datepicker__day--in-range { background-color: #d4af37 !important; color: black !important; font-weight: bold; border-radius: 50%; }
                  .react-datepicker__day:hover { background-color: #f4f4f5; border-radius: 50%; }
                  .react-datepicker__day-name { color: #a1a1aa; font-weight: bold; }
               `}</style>
            </div>
         </motion.div>

         {/* Right: Checkout Card */}
         <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="lg:col-span-5 relative">
            <div className="sticky top-24">
              <div className="bg-[#0a0a0a] text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl ring-4 ring-black/5">
                 {/* Gold Glow Effect */}
                 <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#d4af37] rounded-full blur-[100px] opacity-20" />
                 
                 <h2 className="text-2xl font-serif font-bold mb-8 relative z-10">Reservation Summary</h2>
                 
                 <div className="space-y-6 relative z-10">
                    <div>
                       <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Guest Name</label>
                       <div className="relative bg-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#d4af37] transition-all">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                          <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full Name" className="w-full bg-transparent border-none py-4 pl-12 pr-4 text-white focus:outline-none placeholder:text-zinc-600" />
                       </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 space-y-3">
                        <div className="flex justify-between text-sm text-zinc-400">
                           <span>Price per night</span>
                           <span>₹{room.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-zinc-400">
                           <span>Duration</span>
                           <span>{nights} Nights</span>
                        </div>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="flex justify-between items-center">
                           <span className="text-lg font-bold">Total Pay</span>
                           <span className="text-2xl font-serif font-bold text-[#d4af37]">₹{totalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                 </div>

                 <button 
                    onClick={handlePayment} 
                    disabled={loading || !nights || !guestName} 
                    className="w-full mt-8 py-5 bg-[#d4af37] text-black font-bold text-lg rounded-2xl hover:bg-white transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_40px_rgba(212,175,55,0.3)] relative z-10"
                 >
                    {loading ? <span className="animate-pulse">Processing...</span> : <><CreditCard size={20} /> Confirm Booking</>}
                 </button>
              </div>
            </div>
         </motion.div>

      </div>
    </div>
  );
};

export default BookingPage;