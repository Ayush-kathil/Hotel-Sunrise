import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'sonner';
import { CreditCard, Calendar as CalIcon, Users, CheckCircle, Loader2, ArrowLeft, User, AlertTriangle } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { room } = location.state || {}; 

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!room) { navigate('/rooms'); return; }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please login to continue");
        navigate('/login', { state: { room } });
      } else {
        setUser(session.user);
        setGuestName(session.user.user_metadata?.full_name || '');
      }
    });
  }, [room, navigate]);

  const nights = startDate && endDate ? differenceInDays(endDate, startDate) : 0;
  const totalPrice = nights > 0 ? (room?.price || 0) * nights : 0;

  // --- THE NEW LOGIC ---
  const handlePayment = async () => {
    if (!startDate || !endDate) return toast.error("Select dates.");
    if (!guestName) return toast.error("Enter guest name.");
    
    setLoading(true);

    try {
      // 1. ASK THE DATABASE FOR A ROOM (Server-Side Logic)
      const { data: assignedRoomNumber, error: rpcError } = await supabase
        .rpc('get_available_room', {
          requested_category: room.name,
          check_in_date: startDate, 
          check_out_date: endDate
        });

      if (rpcError) throw rpcError;

      // 2. CHECK IF SOLD OUT (Database returned null)
      if (!assignedRoomNumber) {
         toast.error(`Sold Out: ${room.name}`, {
           description: "We are fully booked for these dates. Please try another room type.",
           duration: 5000,
           icon: <AlertTriangle className="text-red-500" />
         });
         
         // Redirect to Rooms page after 2 seconds
         setTimeout(() => navigate('/rooms'), 2000);
         return; 
      }

      // 3. BOOK THE ROOM
      const bookingData = {
        user_id: user.id,
        room_name: room.name,
        room_number: assignedRoomNumber, // From Database
        price: room.price,
        total_price: totalPrice,
        check_in: startDate,
        check_out: endDate,
        nights: nights,
        guests: guests,
        status: 'confirmed'
      };

      const { data: savedBooking, error: dbError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (dbError) throw dbError;

      // 4. SEND EMAIL
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

      toast.success("Booking Confirmed!", { description: `Room #${assignedRoomNumber} Assigned.` });
      navigate('/profile');

    } catch (err: any) {
      console.error(err);
      toast.error("Booking Error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!room) return null;

  return (
    <div className="min-h-screen bg-[#fcfbf9] pt-24 pb-12 px-4 font-sans text-zinc-900">
      <button onClick={() => navigate(-1)} className="max-w-6xl mx-auto flex items-center gap-2 text-zinc-500 hover:text-black mb-8 transition-colors">
        <ArrowLeft size={18} /> Back to Rooms
      </button>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12">
         {/* LEFT COLUMN */}
         <div className="lg:col-span-7 space-y-8">
            <h1 className="text-4xl font-serif font-bold mb-2">{room.name}</h1>
            
            {/* Calendar */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl relative">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#f4f4f5] rounded-full flex items-center justify-center"><CalIcon size={20} /></div>
                  <h3 className="font-bold text-lg">Select Dates</h3>
               </div>
               <div className="flex justify-center">
                 <DatePicker selected={startDate} onChange={(update) => setDateRange(update)} startDate={startDate} endDate={endDate} selectsRange inline monthsShown={2} minDate={new Date()} disabledKeyboardNavigation calendarClassName="!border-0 !font-sans" />
               </div>
               <style>{`.react-datepicker { border: none; font-family: inherit; width: 100%; display: flex; justify-content: center; } .react-datepicker__header { bg-white; border-bottom: none; background: white; } .react-datepicker__day--selected, .react-datepicker__day--in-range { background-color: #d4af37 !important; color: black !important; border-radius: 50%; font-weight: bold; } .react-datepicker__day:hover { background-color: #f4f4f5; border-radius: 50%; }`}</style>
            </div>
         </div>
         
         {/* RIGHT COLUMN */}
         <div className="lg:col-span-5 relative">
            <div className="sticky top-24">
              <div className="bg-black text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                 <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#d4af37] rounded-full blur-[80px] opacity-20" />
                 <h2 className="text-2xl font-serif font-bold mb-6 relative z-10">Summary</h2>
                 
                 <div className="mb-8 relative z-10">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Guest Name</label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                       <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full Name" className="w-full bg-white/10 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#d4af37]" />
                    </div>
                 </div>

                 <div className="space-y-4 text-zinc-400 mb-8 border-t border-white/10 pt-6 relative z-10">
                    <div className="flex justify-between text-sm"><span>Rate</span><span>₹{room.price.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span>Nights</span><span>{nights}</span></div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between text-white font-bold text-xl items-center"><span>Total</span><span className="text-[#d4af37]">₹{totalPrice.toLocaleString()}</span></div>
                 </div>

                 <button onClick={handlePayment} disabled={loading || !nights || !guestName} className="w-full py-4 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-white transition-all flex justify-center items-center gap-2 disabled:opacity-50 relative z-10">
                    {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />} {loading ? "Checking Availability..." : "Book Now"}
                 </button>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BookingPage;