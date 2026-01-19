import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'sonner';
import { CreditCard, Calendar as CalIcon, Users, CheckCircle, Loader2, ArrowLeft, User } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

// --- CONFIGURATION ---
const ROOM_RANGES: Record<string, number[]> = {
  'Standard Room': Array.from({ length: 20 }, (_, i) => 101 + i), // 101-120
  'Deluxe Room': Array.from({ length: 15 }, (_, i) => 201 + i),   // 201-215
  'Suite': Array.from({ length: 15 }, (_, i) => 301 + i),         // 301-315
};

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
    if (!room) {
      navigate('/rooms');
      return;
    }
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to book");
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

  // --- SMART ROOM ALLOCATION ---
  const findAvailableRoom = async (checkIn: Date, checkOut: Date, roomType: string) => {
    const allRooms = ROOM_RANGES[roomType] || ROOM_RANGES['Standard Room'];

    // Find conflicting bookings
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('room_number')
      .eq('room_name', roomType)
      .eq('status', 'confirmed')
      // Overlap logic: (StartA < EndB) and (EndA > StartB)
      .lt('check_in', checkOut.toISOString())
      .gt('check_out', checkIn.toISOString());

    const occupiedNumbers = new Set(conflicts?.map(b => b.room_number));
    // Return first room NOT in the occupied set
    return allRooms.find(num => !occupiedNumbers.has(num)) || null;
  };

  // --- BOOKING LOGIC WITH RETRY ---
  const handlePayment = async () => {
    if (!startDate || !endDate) return toast.error("Select dates.");
    if (!guestName.trim()) return toast.error("Enter guest name.");
    if (!user) return toast.error("Login required.");

    setLoading(true);
    let finalRoomNumber: number | null = null;
    let bookingId: string | null = null;

    try {
      // 1. First Attempt to Find Room
      finalRoomNumber = await findAvailableRoom(startDate, endDate, room.name);
      
      if (!finalRoomNumber) throw new Error(`Sold out of ${room.name}s for these dates.`);

      // 2. Attempt Insert
      const bookingData = {
        user_id: user.id,
        room_name: room.name,
        room_number: finalRoomNumber,
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

      // --- COLLISION HANDLER (Double Booking Fix) ---
      if (dbError) {
        // Error '23P01' = Exclusion Constraint Violation (Row overlap)
        if (dbError.code === '23P01') {
           console.warn(`Collision on Room ${finalRoomNumber}. Retrying...`);
           
           // RETRY: Find a NEW room
           const newRoomNumber = await findAvailableRoom(startDate, endDate, room.name);
           
           // If no new room or it gave us the same one (full), fail.
           if (!newRoomNumber || newRoomNumber === finalRoomNumber) {
             throw new Error("Room was just taken by another user. Please try again.");
           }

           // Update logic
           finalRoomNumber = newRoomNumber;
           bookingData.room_number = newRoomNumber;

           // Retry Insert
           const { data: retryBooking, error: retryError } = await supabase
             .from('bookings')
             .insert([bookingData])
             .select()
             .single();

           if (retryError) throw retryError; // Real error
           bookingId = retryBooking.id;

        } else {
           throw dbError; // Any other DB error
        }
      } else {
        bookingId = savedBooking.id;
      }

      // 3. Send Email (Backend Function)
      const { error: emailError } = await supabase.functions.invoke('send-booking-email', {
        body: {
          email: user.email,
          name: guestName,
          room_name: room.name,
          room_number: finalRoomNumber,
          dates: `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`,
          price: totalPrice.toLocaleString(),
          booking_id: bookingId
        }
      });

      if (emailError) console.error("Email failed:", emailError);
      
      toast.success("Booking Confirmed!", { 
        description: `Room #${finalRoomNumber} assigned.` 
      });
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
    <div className="min-h-screen bg-[#fcfbf9] pt-24 pb-12 px-4 font-sans text-zinc-900">
      <button onClick={() => navigate(-1)} className="max-w-6xl mx-auto flex items-center gap-2 text-zinc-500 hover:text-black mb-8 transition-colors">
        <ArrowLeft size={18} /> Back to Rooms
      </button>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12">
         {/* LEFT: CALENDAR */}
         <div className="lg:col-span-7 space-y-8">
            <div>
               <h1 className="text-4xl font-serif font-bold mb-2">{room.name}</h1>
               <p className="text-zinc-500 flex items-center gap-2"><CheckCircle size={16} className="text-[#d4af37]" /> Instant Confirmation • Free Cancellation</p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-white/50 relative overflow-hidden">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#f4f4f5] rounded-full flex items-center justify-center"><CalIcon size={20} /></div>
                  <h3 className="font-bold text-lg">Select Dates</h3>
               </div>
               <div className="flex justify-center">
                 <DatePicker selected={startDate} onChange={(update) => setDateRange(update)} startDate={startDate} endDate={endDate} selectsRange inline monthsShown={2} minDate={new Date()} disabledKeyboardNavigation calendarClassName="!border-0 !font-sans" />
               </div>
               <style>{`.react-datepicker { border: none; font-family: inherit; width: 100%; display: flex; justify-content: center; } .react-datepicker__header { bg-white; border-bottom: none; background: white; } .react-datepicker__day--selected, .react-datepicker__day--in-range { background-color: #d4af37 !important; color: black !important; border-radius: 50%; font-weight: bold; } .react-datepicker__day:hover { background-color: #f4f4f5; border-radius: 50%; }`}</style>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f4f4f5] rounded-full flex items-center justify-center"><Users size={20} /></div>
                  <div><h3 className="font-bold">Guests</h3><p className="text-xs text-zinc-500">Max {room.capacity || 2} guests</p></div>
               </div>
               <div className="flex items-center gap-4 bg-zinc-50 px-4 py-2 rounded-xl">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition shadow-sm">-</button>
                  <span className="font-bold w-4 text-center">{guests}</span>
                  <button onClick={() => setGuests(Math.min(room.capacity || 4, guests + 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition shadow-sm">+</button>
               </div>
            </div>
         </div>
         
         {/* RIGHT: SUMMARY */}
         <div className="lg:col-span-5 relative">
            <div className="sticky top-24">
              <div className="bg-black text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                 <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#d4af37] rounded-full blur-[80px] opacity-20" />
                 <h2 className="text-2xl font-serif font-bold mb-6 relative z-10">Booking Summary</h2>
                 
                 <div className="mb-8 relative z-10">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Guest Name</label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                       <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full Name" className="w-full bg-white/10 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37] transition-colors" />
                    </div>
                 </div>

                 <div className="space-y-4 text-zinc-400 mb-8 border-t border-white/10 pt-6 relative z-10">
                    <div className="flex justify-between text-sm"><span>Room Rate</span><span>₹{room.price.toLocaleString()} / night</span></div>
                    <div className="flex justify-between text-sm"><span>Duration</span><span>{nights} Nights</span></div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between text-white font-bold text-xl items-center"><span>Total</span><span className="text-[#d4af37]">₹{totalPrice.toLocaleString()}</span></div>
                 </div>

                 <button onClick={handlePayment} disabled={loading || !nights || !guestName} className="w-full py-4 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-white transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative z-10">
                    {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />} {loading ? "Processing..." : "Confirm & Pay"}
                 </button>
                 <p className="text-center text-zinc-600 text-[10px] mt-4 relative z-10">By confirming, you agree to our Terms.</p>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-zinc-400 text-xs"><CheckCircle size={12} /> Secure Booking • Instant Confirmation</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BookingPage;