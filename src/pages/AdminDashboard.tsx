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

    // Fetch Bookings with User Profiles
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false });

    // Fetch Inquiries
    const { data: inquiriesData } = await supabase
      .from('event_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    // Calculate Analytics
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

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#d4af37] font-serif tracking-widest text-sm animate-pulse">LOADING SUITE...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f5] font-sans flex overflow-hidden">
      
      {/* 1. PREMIUM SIDEBAR */}
      <aside className="w-72 bg-[#0a0a0a] text-white hidden md:flex flex-col p-6 shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#8a701f] rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
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
          <button onClick={handleLogout} className="flex items-center gap-3 text-zinc-400 hover:text-red-400 transition-all w-full px-4 py-3 rounded-xl hover:bg-white/5 group">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto bg-zinc-50/50 p-8 md:p-12 scroll-smooth">
        <AnimatePresence mode="wait">
          
          {/* --- DASHBOARD OVERVIEW --- */}
          {activeTab === 'overview' && (
            <motion.div key="overview" variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-8">
              
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-serif font-bold text-zinc-900 mb-2">Dashboard</h2>
                  <p className="text-zinc-500">Real-time overview of hotel performance.</p>
                </div>
                <button onClick={handleExport} className="hidden md:flex bg-black text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider items-center gap-2 hover:bg-[#d4af37] transition-all shadow-xl hover:shadow-[#d4af37]/20 hover:-translate-y-1">
                  <Download size={16} /> Export Data
                </button>
              </div>

              {/* ANALYTICS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} trend="+12.5%" color="bg-[#d4af37]" />
                <AnalyticsCard title="Total Bookings" value={stats.bookings} icon={Calendar} trend="+4 this week" color="bg-zinc-900" dark />
                <AnalyticsCard title="Avg. Nightly Rate" value={`₹${stats.avgPrice.toLocaleString()}`} icon={TrendingUp} trend="Stable" color="bg-emerald-500" />
                <AnalyticsCard title="Pending Inquiries" value={stats.inquiries} icon={Bell} trend="Needs Action" color="bg-orange-500" />
              </div>

              {/* RECENT ACTIVITY FEED */}
              <div className="grid lg:grid-cols-3 gap-8 h-full">
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-100">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Clock size={18} className="text-[#d4af37]" /> Recent Bookings
                  </h3>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-colors group cursor-default border border-transparent hover:border-zinc-200">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-zinc-500 group-hover:bg-[#d4af37] group-hover:text-white transition-colors">
                            {b.profiles?.full_name?.[0] || "G"}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-zinc-900">{b.room_name}</p>
                            <p className="text-xs text-zinc-500">{b.profiles?.full_name || 'Guest User'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">₹{b.total_price.toLocaleString()}</p>
                          <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">{new Date(b.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* MINI INBOX */}
                <motion.div variants={itemVariants} className="bg-zinc-900 text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                   <h3 className="font-bold text-lg mb-6 relative z-10">Latest Messages</h3>
                   <div className="space-y-6 relative z-10">
                     {inquiries.slice(0, 4).map((i) => (
                       <div key={i.id} className="border-l-2 border-[#d4af37] pl-4">
                         <p className="text-xs text-white/40 mb-1">{new Date(i.created_at).toLocaleDateString()}</p>
                         <p className="font-bold text-sm">{i.name}</p>
                         <p className="text-xs text-white/60 line-clamp-1">{i.message}</p>
                       </div>
                     ))}
                     {inquiries.length === 0 && <p className="text-white/40 italic">No new messages.</p>}
                   </div>
                   <button onClick={() => setActiveTab('inquiries')} className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
                     View All
                   </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* --- ALL BOOKINGS VIEW --- */}
          {activeTab === 'bookings' && (
            <motion.div key="bookings" variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-serif font-bold">All Bookings</h2>
                 <div className="bg-white px-4 py-2 rounded-full border border-zinc-200 flex items-center gap-2 text-zinc-500 text-sm">
                   <Search size={16} />
                   <input type="text" placeholder="Search guests..." className="outline-none bg-transparent" />
                 </div>
              </div>
              
              <div className="grid gap-4">
                 {bookings.map((b) => (
                   <motion.div variants={itemVariants} key={b.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-[#fcfbf9] rounded-2xl flex items-center justify-center text-[#d4af37]">
                            <MapPin size={24} />
                         </div>
                         <div>
                            <h4 className="font-bold text-lg">{b.room_name}</h4>
                            <p className="text-sm text-zinc-500 flex items-center gap-2">
                               <User size={12} /> {b.profiles?.full_name} <span className="text-zinc-300">|</span> {b.profiles?.email}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-8">
                         <div className="text-right">
                            <p className="text-xs font-bold uppercase text-zinc-400">Check In</p>
                            <p className="font-bold text-zinc-900">{b.check_in}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-bold uppercase text-zinc-400">Total</p>
                            <p className="font-bold text-[#d4af37]">₹{b.total_price}</p>
                         </div>
                         <div className="px-4 py-2 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full">
                            {b.status}
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </div>
            </motion.div>
          )}

          {/* --- INQUIRIES VIEW --- */}
          {activeTab === 'inquiries' && (
            <motion.div key="inquiries" variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
               <h2 className="text-3xl font-serif font-bold mb-8">Inbox</h2>
               <div className="space-y-4">
                  {inquiries.map((msg) => (
                    <motion.div variants={itemVariants} key={msg.id} className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                                {msg.name[0]}
                             </div>
                             <div>
                                <h4 className="font-bold">{msg.name}</h4>
                                <p className="text-xs text-zinc-400">{msg.email}</p>
                             </div>
                          </div>
                          <span className="text-xs font-bold bg-zinc-100 px-3 py-1 rounded-full text-zinc-500">{msg.event_type}</span>
                       </div>
                       <p className="text-zinc-600 leading-relaxed bg-zinc-50/50 p-4 rounded-xl text-sm border border-zinc-100">
                          {msg.message}
                       </p>
                       <div className="mt-4 flex justify-end">
                          <a href={`mailto:${msg.email}`} className="text-xs font-bold uppercase tracking-wider text-[#d4af37] hover:text-black transition-colors flex items-center gap-2">
                             Reply to Guest <LayoutDashboard size={12} className="rotate-180" />
                          </a>
                       </div>
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

// --- SUBCOMPONENTS FOR CLEANER CODE ---

const NavButton = ({ icon: Icon, label, active, onClick, count }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${active ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={active ? "text-black" : "text-zinc-500 group-hover:text-white transition-colors"} />
      <span className="text-sm">{label}</span>
    </div>
    {count > 0 && (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-black/10 text-black' : 'bg-white/10 text-white'}`}>
        {count}
      </span>
    )}
  </button>
);

const AnalyticsCard = ({ title, value, icon: Icon, trend, color, dark }: any) => (
  <motion.div variants={itemVariants} whileHover={{ y: -5 }} className={`p-6 rounded-[2rem] shadow-lg relative overflow-hidden ${dark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}`}>
     <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${color} opacity-10 blur-3xl`} />
     <div className="flex justify-between items-start mb-8">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${dark ? 'bg-white/10' : 'bg-zinc-50 text-black'}`}>
           <Icon size={20} />
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${dark ? 'bg-white/10 text-white' : 'bg-green-50 text-green-700'}`}>
           {trend}
        </span>
     </div>
     <div>
        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{title}</p>
        <h3 className="text-3xl font-serif font-bold">{value}</h3>
     </div>
  </motion.div>
);

export default AdminDashboard;