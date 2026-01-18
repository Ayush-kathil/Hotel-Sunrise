import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, DollarSign, Bell, LogOut, 
  Download, Search, TrendingUp, User, MapPin, Clock 
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadCSV } from '../utils/exportToExcel';

// --- ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, inquiries: 0, avgPrice: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }

    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false });

    const { data: inquiriesData } = await supabase
      .from('event_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    const totalRev = bookingsData?.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0) || 0;
    const totalBookings = bookingsData?.length || 0;
    const avgPrice = totalBookings > 0 ? Math.round(totalRev / totalBookings) : 0;

    setBookings(bookingsData || []);
    setInquiries(inquiriesData || []);
    setStats({
      revenue: totalRev,
      bookings: totalBookings,
      inquiries: inquiriesData?.length || 0,
      avgPrice: avgPrice
    });
    setLoading(false);
  };

  const handleExport = () => {
    const cleanData = bookings.map(b => ({
      Guest: b.profiles?.full_name || 'Guest',
      Email: b.profiles?.email || 'N/A',
      Room: b.room_name,
      CheckIn: b.check_in,
      CheckOut: b.check_out || 'N/A',
      Nights: b.nights || 1,
      Total: b.total_price,
      Date: new Date(b.created_at).toLocaleDateString()
    }));
    downloadCSV(cleanData, `Sunrise_Report_${new Date().toISOString().split('T')[0]}`);
    toast.success("Excel Report Ready");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Admin Suite...</div>;

  return (
    <div className="min-h-screen bg-[#f4f4f5] font-sans flex overflow-hidden">
      
      {/* 1. PREMIUM SIDEBAR */}
      <aside className="w-72 bg-[#0a0a0a] text-white hidden md:flex flex-col p-6 shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-10 h-10 bg-[#d4af37] rounded-xl flex items-center justify-center">
            <span className="font-serif font-bold text-black text-xl">S</span>
          </div>
          <div>
            <h1 className="font-serif text-xl tracking-widest font-bold">SUNRISE</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Admin Suite</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <NavButton icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavButton icon={Calendar} label="Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
          <NavButton icon={Bell} label="Inquiries" active={activeTab === 'inquiries'} onClick={() => setActiveTab('inquiries')} count={stats.inquiries} />
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-3 text-zinc-400 hover:text-red-400 transition-all w-full px-4 py-3 rounded-xl hover:bg-white/5">
            <LogOut size={18} /> <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto bg-zinc-50/50 p-8 md:p-12 scroll-smooth">
        <AnimatePresence mode="wait">
          
          {/* DASHBOARD OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div key="overview" variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-8">
              <div className="flex justify-between items-end">
                <h2 className="text-4xl font-serif font-bold text-zinc-900">Dashboard</h2>
                <button onClick={handleExport} className="bg-black text-white px-6 py-3 rounded-full font-bold text-xs uppercase flex items-center gap-2 hover:bg-[#d4af37]">
                  <Download size={16} /> Export Data
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-[#d4af37]" />
                <AnalyticsCard title="Total Bookings" value={stats.bookings} icon={Calendar} color="bg-zinc-900" dark />
                <AnalyticsCard title="Avg. Nightly Rate" value={`₹${stats.avgPrice.toLocaleString()}`} icon={TrendingUp} color="bg-emerald-500" />
                <AnalyticsCard title="Pending Inquiries" value={stats.inquiries} icon={Bell} color="bg-orange-500" />
              </div>
            </motion.div>
          )}

          {/* BOOKINGS VIEW */}
          {activeTab === 'bookings' && (
            <motion.div key="bookings" variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-serif font-bold mb-8">All Bookings</h2>
              <div className="space-y-4">
                 {bookings.map((b) => (
                   <motion.div variants={itemVariants} key={b.id} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-zinc-500">
                            {b.profiles?.full_name?.[0] || "G"}
                         </div>
                         <div>
                            <h4 className="font-bold text-lg">{b.room_name}</h4>
                            <p className="text-sm text-zinc-500">{b.profiles?.email}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-bold uppercase text-zinc-400">Total</p>
                         <p className="font-bold text-[#d4af37]">₹{b.total_price.toLocaleString()}</p>
                      </div>
                   </motion.div>
                 ))}
              </div>
            </motion.div>
          )}

          {/* INQUIRIES VIEW */}
          {activeTab === 'inquiries' && (
            <motion.div key="inquiries" variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
               <h2 className="text-3xl font-serif font-bold mb-8">Inbox</h2>
               <div className="grid gap-4">
                  {inquiries.map((i) => (
                    <motion.div variants={itemVariants} key={i.id} className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm">
                       <div className="flex justify-between mb-4">
                          <h4 className="font-bold">{i.name}</h4>
                          <span className="text-xs text-zinc-400">{new Date(i.created_at).toLocaleDateString()}</span>
                       </div>
                       <p className="text-zinc-600 bg-zinc-50 p-4 rounded-xl text-sm">{i.message}</p>
                       <a href={`mailto:${i.email}`} className="text-[#d4af37] text-xs font-bold uppercase mt-4 inline-block hover:underline">Reply via Email</a>
                    </motion.div>
                  ))}
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

// --- SUBCOMPONENTS ---
const NavButton = ({ icon: Icon, label, active, onClick, count }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${active ? 'bg-[#d4af37] text-black font-bold shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
    <div className="flex items-center gap-3"><Icon size={18} /><span className="text-sm">{label}</span></div>
    {count > 0 && <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">{count}</span>}
  </button>
);

const AnalyticsCard = ({ title, value, icon: Icon, color, dark }: any) => (
  <motion.div variants={itemVariants} whileHover={{ y: -5 }} className={`p-6 rounded-[2rem] shadow-lg relative overflow-hidden ${dark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}`}>
     <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${color} opacity-10 blur-3xl`} />
     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${dark ? 'bg-white/10' : 'bg-zinc-100'}`}><Icon size={20} /></div>
     <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-60">{title}</p>
     <h3 className="text-3xl font-serif font-bold">{value}</h3>
  </motion.div>
);

export default AdminDashboard;