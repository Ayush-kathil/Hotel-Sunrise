import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'sonner';
import { CreditCard, Calendar as CalIcon, User, AlertTriangle, ArrowLeft, Wifi, Coffee, Tv, Wind } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { motion, useScroll, useTransform } from 'framer-motion';

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
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

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
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: guestName || 'Guest',
        }, { onConflict: 'id' })
        .select();

      if (profileError) {
         console.warn("Profile Upsert Warning:", profileError);
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
    <div ref={containerRef} className="min-h-screen bg-[#fcfbf9] font-sans text-zinc-900 pb-20 selection:bg-[#d4af37] selection:text-white">
      
      {/* 1. HERO SECTION (Video) */}
      <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
         <motion.div style={{ scale: heroScale }} className="absolute inset-0">
             <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                <source src={room.video || "https://cdn.pixabay.com/video/2017/01/04/7123-198192800_large.mp4"} type="video/mp4" />
             </video>
         </motion.div>
         <div className="absolute inset-0 bg-black/20" />
         
         {/* Navigation Back */}
         <div className="absolute top-0 left-0 w-full p-6 z-20 pt-24">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full w-fit hover:bg-[#d4af37] hover:text-black">
               <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>
         </div>

         <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20">
             <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-6xl mx-auto">
                 <span className="text-[#d4af37] px-3 py-1 rounded-full border border-[#d4af37]/30 bg-black/40 backdrop-blur-md font-bold tracking-widest uppercase text-[10px] mb-4 inline-block shadow-[0_0_20px_rgba(212,175,55,0.2)]">Luxury Collection</span>
                 <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-6 drop-shadow-2xl">{room.name}</h1>
             </motion.div>
         </div>
      </section>

      {/* 2. DESCRIPTION & AMENITIES */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
             <h2 className="text-3xl font-serif text-[#d4af37] mb-6">Experience Unmatched Comfort</h2>
             <p className="text-zinc-600 text-lg leading-relaxed font-light mb-8">
                 Immerse yourself in a sanctuary of tranquility. Every detail of the {room.name} has been meticulously crafted to provide an unforgettable stay. 
                 From the panoramic views to the bespoke furniture, indulge in a world where luxury knows no bounds.
             </p>
             
             <h3 className="text-xl font-bold mb-6 text-zinc-900">Amenity Highlights</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                    { icon: <Wifi size={20} />, label: "High-Speed Wifi" },
                    { icon: <Wind size={20} />, label: "Climate Control" },
                    { icon: <Coffee size={20} />, label: "Gourmet Breakfast" },
                    { icon: <Tv size={20} />, label: "Smart Entertainment" }
                 ].map((item, i) => (
                    <div key={i} className="bg-white border border-zinc-200 p-4 rounded-2xl flex flex-col items-center gap-3 text-center hover:border-[#d4af37] transition-colors group shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">{item.icon}</div>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{item.label}</span>
                    </div>
                 ))}
             </div>
          </div>
          
          <div className="lg:col-span-4 flex items-center">
              <div className="w-full bg-zinc-50 p-6 rounded-3xl border-l-[1px] border-[#d4af37]">
                  <p className="font-serif italic text-zinc-600 text-lg">"The perfect blend of modern elegance and timeless hospitality. A stay here isn't just a visit; it's a memory crafted."</p>
              </div>
          </div>
      </section>

      {/* 3. BOOKING INTERFACE */}
      <div className="max-w-6xl mx-auto px-4 relative z-30 grid lg:grid-cols-12 gap-8 mb-20">
         
         {/* Left: Calendar */}
         <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="lg:col-span-7">
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-zinc-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] rounded-full blur-[120px] opacity-10 pointer-events-none" />
               
               <div className="relative z-10 flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-zinc-50 rounded-full flex items-center justify-center text-[#d4af37] border border-zinc-100"><CalIcon size={24} /></div>
                  <div>
                    <h3 className="font-bold text-2xl text-zinc-900">Select Dates</h3>
                    <p className="text-zinc-500 text-sm">Tap start date, then end date.</p>
                  </div>
               </div>
               
               <div className="flex justify-center bg-zinc-50 rounded-3xl p-6 border border-zinc-100">
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
                  .react-datepicker__current-month { color: #18181b !important; font-family: serif; font-size: 1.2rem; margin-bottom: 1rem; }
                  .react-datepicker__day-name { color: #a1a1aa !important; font-weight: bold; }
                  .react-datepicker__day { color: #52525b !important; }
                  .react-datepicker__day:hover { background-color: #f4f4f5 !important; border-radius: 50%; color: black !important; }
                  .react-datepicker__day--selected, .react-datepicker__day--in-range { background-color: #d4af37 !important; color: black !important; font-weight: bold; border-radius: 50%; box-shadow: 0 0 15px rgba(212,175,55,0.4); }
                  .react-datepicker__day--disabled { color: #d4d4d8 !important; }
               `}</style>
            </div>
         </motion.div>

         {/* Right: Checkout Card */}
         <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="lg:col-span-5 relative">
            <div className="sticky top-24">
              <div className="bg-white text-zinc-900 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl border border-zinc-100">
                 {/* Gold Glow Effect */}
                 <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#d4af37] rounded-full blur-[100px] opacity-10" />
                 
                 <h2 className="text-2xl font-serif font-bold mb-8 relative z-10 flex items-center gap-3">
                    <span className="w-1 h-8 bg-[#d4af37] rounded-full" /> Reservation
                 </h2>
                 
                 <div className="space-y-6 relative z-10">
                    <div>
                       <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Guest Name</label>
                       <div className="relative bg-zinc-50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#d4af37]/20 transition-all border border-zinc-200">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                          <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full Name" className="w-full bg-transparent border-none py-4 pl-12 pr-4 text-zinc-900 focus:outline-none placeholder:text-zinc-400" />
                       </div>
                    </div>

                    <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 space-y-4">
                        <div className="flex justify-between text-sm text-zinc-500">
                           <span>Price / Night</span>
                           <span className="text-zinc-900 font-bold">₹{room.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-zinc-500">
                           <span>Duration</span>
                           <span className="text-zinc-900 font-bold">{nights} Nights</span>
                        </div>
                        <div className="h-px bg-zinc-200 my-1" />
                        <div className="flex justify-between items-end">
                           <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Total</span>
                           <span className="text-3xl font-serif font-bold text-[#d4af37]">₹{totalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                 </div>

                 <button 
                    onClick={handlePayment} 
                    disabled={loading || !nights || !guestName} 
                    className="w-full mt-8 py-5 bg-[#d4af37] text-black font-bold text-lg rounded-2xl hover:bg-black hover:text-white transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_40px_rgba(212,175,55,0.3)] relative z-10 group"
                 >
                    {loading ? <span className="animate-pulse">Processing...</span> : <><CreditCard size={20} className="group-hover:scale-110 transition-transform" /> Confirm Booking</>}
                 </button>
              </div>
            </div>
         </motion.div>

      </div>
    </div>
  );
};
export default BookingPage;