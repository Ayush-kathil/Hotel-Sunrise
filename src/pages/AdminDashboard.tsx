import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ShieldAlert, Users, Calendar, Coffee, LogOut, CheckCircle, XCircle } from 'lucide-react';

// --- TYPES (Fixes the "Property does not exist" errors) ---
interface Booking {
  id: string;
  room_name: string;
  user_id: string;
  check_in: string;
  total_price: number;
  status: string;
}

interface DiningReservation {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  guests: number;
}

interface EventInquiry {
  id: string;
  name: string;
  email: string;
  event_type: string;
  date: string;
  guests: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // State with proper types
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dining, setDining] = useState<DiningReservation[]>([]);
  const [events, setEvents] = useState<EventInquiry[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        // 1. Check Admin Role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError || profile?.role !== 'admin') {
          setErrorMsg("Access Denied: You do not have administrator privileges.");
          setLoading(false);
          return;
        }

        // 2. Fetch All Data (Parallel for speed)
        const [bookingsRes, diningRes, eventsRes] = await Promise.all([
          supabase.from('bookings').select('*').order('created_at', { ascending: false }),
          supabase.from('dining_reservations').select('*').order('created_at', { ascending: false }),
          supabase.from('event_inquiries').select('*').order('created_at', { ascending: false })
        ]);

        if (bookingsRes.error) throw bookingsRes.error;
        if (diningRes.error) throw diningRes.error;
        if (eventsRes.error) throw eventsRes.error;

        setBookings(bookingsRes.data || []);
        setDining(diningRes.data || []);
        setEvents(eventsRes.data || []);

      } catch (err: any) {
        setErrorMsg(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  // --- RENDER STATES ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-serif text-xl">
        Loading Admin Panel...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-6 text-center">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-serif text-black mb-2">Access Denied</h1>
        <p className="text-zinc-500 mb-6">{errorMsg}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-zinc-800 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf9] pt-24 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-4xl font-serif mb-2 flex items-center gap-3">
              <ShieldAlert className="text-[#d4af37]" /> Admin Dashboard
            </h1>
            <p className="text-zinc-500">Overview of all hotel operations.</p>
          </div>
          <button 
             onClick={() => navigate('/')}
             className="mt-4 md:mt-0 flex items-center gap-2 text-zinc-400 hover:text-black transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={16} /> Exit Panel
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* 1. ROOM BOOKINGS */}
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="text-blue-500" /> Room Bookings
              <span className="ml-auto bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs">{bookings.length}</span>
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {bookings.length === 0 ? <p className="text-zinc-400 text-sm">No bookings yet.</p> : bookings.map((item) => (
                <div key={item.id} className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-serif font-bold text-lg">{item.room_name}</span>
                    <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">₹{item.total_price.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Check In</p>
                  <p className="text-sm text-zinc-700 mb-2">{item.check_in}</p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Confirmed
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. DINING RESERVATIONS */}
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Coffee className="text-orange-500" /> Dining
              <span className="ml-auto bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs">{dining.length}</span>
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {dining.length === 0 ? <p className="text-zinc-400 text-sm">No reservations found.</p> : dining.map((item) => (
                <div key={item.id} className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-orange-200 transition-colors">
                  <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                  <a href={`mailto:${item.email}`} className="text-xs text-blue-500 hover:underline block mb-3">{item.email}</a>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded-lg text-center border border-zinc-100">
                       <p className="text-[10px] text-zinc-400 uppercase">Date</p>
                       <p className="font-bold text-sm">{item.date}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg text-center border border-zinc-100">
                       <p className="text-[10px] text-zinc-400 uppercase">Time</p>
                       <p className="font-bold text-sm">{item.time}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Users size={12} /> {item.guests} Guests
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. EVENT INQUIRIES */}
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="text-purple-500" /> Events
              <span className="ml-auto bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs">{events.length}</span>
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {events.length === 0 ? <p className="text-zinc-400 text-sm">No inquiries yet.</p> : events.map((item) => (
                <div key={item.id} className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-purple-200 transition-colors">
                  <div className="flex justify-between items-start">
                     <h3 className="font-bold text-lg">{item.name}</h3>
                     <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded font-bold uppercase">{item.event_type}</span>
                  </div>
                  <a href={`mailto:${item.email}`} className="text-xs text-blue-500 hover:underline block mb-3">{item.email}</a>
                  
                  <div className="bg-white p-3 rounded-xl border border-zinc-100 text-sm text-zinc-600 mb-3">
                    <span className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Date Requested</span>
                    {item.date}
                  </div>
                  <div className="text-xs text-zinc-500 font-medium">
                    Est. {item.guests} Guests
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;