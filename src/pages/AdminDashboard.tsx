import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, DollarSign, Bell, LogOut, 
  Download, CheckCircle, Clock, XCircle, Search 
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadCSV } from '../utils/exportToExcel'; // Import the helper

// Animation Variants
const containerVar = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

const itemVar = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, inquiries: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); // all, confirmed, pending

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    // 1. Security Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }

    // 2. Fetch Data
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*, profiles(email, full_name)') // Join with profiles to get user info
      .order('created_at', { ascending: false });
      
    const { data: inquiriesData } = await supabase
      .from('event_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    // 3. Calculate Money & Stats
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
    // Prepare clean data for Excel (remove technical IDs if wanted)
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
    toast.success("Excel Report Downloaded");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f5] font-sans flex">
      
      {/* 1. SIDEBAR */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-zinc-900 text-white hidden md:flex flex-col p-6 fixed h-full z-20"
      >
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center font-serif font-bold text-black text-xl">S</div>
          <span className="font-serif text-lg tracking-widest font-bold">SUNRISE</span>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={Calendar} label="Bookings" />
          <NavItem icon={Bell} label="Inquiries" />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors w-full px-2 py-2">
            <LogOut size={18} /> <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </motion.aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-8 md:p-12">
        <motion.div variants={containerVar} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h1 className="text-3xl font-serif font-bold text-zinc-900">Overview</h1>
              <p className="text-zinc-500 text-sm">Welcome back, Admin.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleExport}
                className="bg-[#d4af37] text-black px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-black hover:text-[#d4af37] transition-all shadow-lg"
              >
                <Download size={16} /> Export Excel
              </button>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-emerald-500" />
            <StatCard title="Active Bookings" value={stats.bookings.toString()} icon={Calendar} color="bg-blue-500" />
            <StatCard title="New Inquiries" value={stats.inquiries.toString()} icon={Bell} color="bg-orange-500" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* BOOKINGS TABLE */}
            <motion.div variants={itemVar} className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-200/50">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-serif font-bold text-xl">Recent Bookings</h3>
                <div className="flex gap-2">
                   {['all', 'confirmed'].map(f => (
                     <button 
                       key={f}
                       onClick={() => setFilter(f)}
                       className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${filter === f ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500'}`}
                     >
                       {f}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-10 text-zinc-400">No bookings found in database.</div>
                ) : (
                  bookings
                    .filter(b => filter === 'all' || b.status === filter)
                    .slice(0, 6) // Show top 6
                    .map((booking) => (
                    <div key={booking.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-500">
                          {booking.profiles?.full_name?.[0] || "G"}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-900">{booking.room_name}</p>
                          <p className="text-xs text-zinc-500">{booking.profiles?.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">₹{booking.total_price.toLocaleString()}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} /> Paid
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* INQUIRIES LIST */}
            <motion.div variants={itemVar} className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-200/50">
              <h3 className="font-serif font-bold text-xl mb-8">Messages</h3>
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {inquiries.length === 0 ? (
                   <p className="text-zinc-400 text-sm">No new messages.</p>
                ) : (
                  inquiries.map((msg) => (
                    <div key={msg.id} className="relative pl-6 border-l-2 border-zinc-100 pb-2">
                       <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
                       <div className="flex justify-between items-start mb-1">
                         <span className="text-xs font-bold uppercase text-zinc-400">{msg.event_type}</span>
                         <span className="text-[10px] text-zinc-300">{new Date(msg.created_at).toLocaleDateString()}</span>
                       </div>
                       <p className="font-bold text-sm text-zinc-900 mb-1">{msg.name}</p>
                       <p className="text-xs text-zinc-500 line-clamp-3 bg-zinc-50 p-3 rounded-lg">
                         "{msg.message}"
                       </p>
                       <div className="mt-2 flex gap-2">
                         <button onClick={() => window.open(`mailto:${msg.email}`)} className="text-[10px] font-bold text-blue-500 hover:underline">Reply via Email</button>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

          </div>

        </motion.div>
      </main>
    </div>
  );
};

// Helper Components
const NavItem = ({ icon: Icon, label, active }: any) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-white text-black font-bold shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </div>
);

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <motion.div variants={itemVar} whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-200/50 flex items-center gap-4 relative overflow-hidden">
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

export default AdminDashboard;