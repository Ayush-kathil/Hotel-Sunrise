import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, DollarSign, Bell, LogOut, 
  Download, CheckCircle, Clock, XCircle, Search, Mail 
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadCSV } from '../utils/exportToExcel';

// --- COMPONENTS ---
const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-200/50 flex items-center gap-4 relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-24 opacity-5 rounded-full ${color} blur-3xl translate-x-10 -translate-y-10`} />
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-serif font-bold text-zinc-900">{value}</p>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // Controls which screen is visible
  
  // Data State
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, inquiries: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }

    // Fetch Data
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false });
      
    const { data: inquiriesData } = await supabase
      .from('event_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    const totalRev = bookingsData?.reduce((sum, item) => sum + Number(item.total_price), 0) || 0;

    setBookings(bookingsData || []);
    setInquiries(inquiriesData || []);
    setStats({
      revenue: totalRev,
      bookings: bookingsData?.length || 0,
      inquiries: inquiriesData?.length || 0
    });
    setLoading(false);
  };

  const handleExport = () => {
    const cleanData = bookings.map(b => ({
      Guest: b.profiles?.full_name || 'Guest',
      Email: b.profiles?.email || 'N/A',
      Room: b.room_name,
      CheckIn: b.check_in,
      Price: b.total_price,
      Status: b.status,
      BookingDate: new Date(b.created_at).toLocaleDateString()
    }));
    downloadCSV(cleanData, `Sunrise_Bookings_${new Date().toISOString().split('T')[0]}`);
    toast.success("Excel File Generated Successfully");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f4f4f5] font-sans flex">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-zinc-900 text-white hidden md:flex flex-col p-6 fixed h-full z-20">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center font-serif font-bold text-black text-xl">S</div>
          <span className="font-serif text-lg tracking-widest font-bold">SUNRISE</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${activeTab === 'dashboard' ? 'bg-white text-black font-bold shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('bookings')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${activeTab === 'bookings' ? 'bg-white text-black font-bold shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <Calendar size={18} /> Bookings
          </button>

          <button 
            onClick={() => setActiveTab('inquiries')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${activeTab === 'inquiries' ? 'bg-white text-black font-bold shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <Bell size={18} /> Inquiries
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors w-full px-2 py-2">
            <LogOut size={18} /> <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-8 md:p-12">
        
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
             <header className="flex justify-between items-center mb-12">
               <div>
                 <h1 className="text-3xl font-serif font-bold text-zinc-900">Overview</h1>
                 <p className="text-zinc-500 text-sm">Welcome back, Admin.</p>
               </div>
               <button onClick={handleExport} className="bg-[#d4af37] text-black px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-black hover:text-[#d4af37] transition-all shadow-lg">
                 <Download size={16} /> Export Excel
               </button>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
               <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-emerald-500" />
               <StatCard title="Active Bookings" value={stats.bookings.toString()} icon={Calendar} color="bg-blue-500" />
               <StatCard title="New Inquiries" value={stats.inquiries.toString()} icon={Bell} color="bg-orange-500" />
             </div>

             <div className="grid lg:grid-cols-2 gap-8">
               <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-200/50">
                 <h3 className="font-bold text-lg mb-6">Recent Activity</h3>
                 {bookings.slice(0, 5).map(b => (
                    <div key={b.id} className="flex justify-between items-center py-3 border-b border-zinc-50 last:border-0">
                      <div>
                        <p className="font-bold text-sm">{b.room_name}</p>
                        <p className="text-xs text-zinc-400">{new Date(b.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+ ₹{b.total_price}</span>
                    </div>
                 ))}
               </div>
             </div>
          </motion.div>
        )}

        {/* VIEW 2: ALL BOOKINGS */}
        {activeTab === 'bookings' && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
             <h1 className="text-3xl font-serif font-bold text-zinc-900 mb-8">All Bookings</h1>
             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-200/50">
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 hover:bg-white border border-transparent hover:border-zinc-200 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-[#d4af37] text-white rounded-full flex items-center justify-center font-bold">{booking.profiles?.full_name?.[0]}</div>
                         <div>
                            <p className="font-bold text-zinc-900">{booking.room_name}</p>
                            <p className="text-xs text-zinc-500">{booking.profiles?.email}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="font-bold">₹{booking.total_price}</p>
                         <p className="text-xs text-zinc-400">Check-in: {booking.check_in}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           </motion.div>
        )}

        {/* VIEW 3: INQUIRIES */}
        {activeTab === 'inquiries' && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
             <h1 className="text-3xl font-serif font-bold text-zinc-900 mb-8">Messages</h1>
             <div className="grid gap-4">
               {inquiries.map(msg => (
                 <div key={msg.id} className="bg-white p-6 rounded-[2rem] border border-zinc-200/50">
                    <div className="flex justify-between mb-4">
                       <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase">{msg.event_type}</span>
                       <span className="text-xs text-zinc-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{msg.name} <span className="text-zinc-400 font-normal text-sm">({msg.email})</span></h3>
                    <p className="text-zinc-600 bg-zinc-50 p-4 rounded-xl text-sm">{msg.message}</p>
                    <div className="mt-4">
                       <a href={`mailto:${msg.email}`} className="text-[#d4af37] text-xs font-bold uppercase hover:underline">Reply via Email</a>
                    </div>
                 </div>
               ))}
             </div>
           </motion.div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;