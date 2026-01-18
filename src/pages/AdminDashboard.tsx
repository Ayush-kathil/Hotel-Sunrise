import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, Bell, LogOut, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, inquiries: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      // 1. Check if User is Admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        toast.error("Unauthorized access");
        navigate('/'); // Kick them out if not admin
        return;
      }

      // 2. Fetch Real Data
      const { data: bookingsData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      const { data: inquiryData } = await supabase.from('event_inquiries').select('*').order('created_at', { ascending: false });

      // 3. Calculate Stats
      const totalRevenue = bookingsData?.reduce((acc, curr) => acc + Number(curr.total_price), 0) || 0;
      
      setStats({
        revenue: totalRevenue,
        bookings: bookingsData?.length || 0,
        inquiries: inquiryData?.length || 0
      });
      setRecentBookings(bookingsData?.slice(0, 5) || []);
      setInquiries(inquiryData || []);
      setLoading(false);
    };

    fetchAdminData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      
      {/* SIDEBAR (Simplified for single page view) */}
      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 bg-black text-white hidden md:flex flex-col p-6">
           <h1 className="text-2xl font-serif font-bold tracking-widest text-[#d4af37] mb-10">SUNRISE</h1>
           <nav className="space-y-4 flex-1">
             <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl text-[#d4af37] font-bold"><Calendar size={18} /> Overview</div>
             <div className="flex items-center gap-3 p-3 text-zinc-400 hover:text-white cursor-not-allowed"><Users size={18} /> Guests</div>
             <div className="flex items-center gap-3 p-3 text-zinc-400 hover:text-white cursor-not-allowed"><Bell size={18} /> Messages</div>
           </nav>
           <button onClick={handleLogout} className="flex items-center gap-2 text-zinc-500 hover:text-white mt-auto">
             <LogOut size={16} /> Sign Out
           </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
           <header className="flex justify-between items-center mb-12">
             <h2 className="text-3xl font-serif font-bold text-zinc-900">Dashboard</h2>
             <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-zinc-400">Admin Mode</span>
                <div className="w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center font-bold text-black">A</div>
             </div>
           </header>

           {/* STATS GRID */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-green-100 text-green-700" />
              <StatCard title="Total Bookings" value={stats.bookings.toString()} icon={Calendar} color="bg-blue-100 text-blue-700" />
              <StatCard title="Pending Inquiries" value={stats.inquiries.toString()} icon={Bell} color="bg-yellow-100 text-yellow-700" />
           </div>

           <div className="grid lg:grid-cols-2 gap-12">
              
              {/* RECENT BOOKINGS */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100">
                 <h3 className="text-xl font-bold mb-6">Recent Bookings</h3>
                 <div className="space-y-4">
                    {recentBookings.length === 0 ? <p className="text-zinc-400">No bookings yet.</p> : recentBookings.map((b) => (
                       <div key={b.id} className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
                          <div>
                             <p className="font-bold text-zinc-900">{b.room_name}</p>
                             <p className="text-xs text-zinc-500">Check-in: {b.check_in}</p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">Paid</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* INQUIRIES */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100">
                 <h3 className="text-xl font-bold mb-6">Inquiries / Messages</h3>
                 <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {inquiries.length === 0 ? <p className="text-zinc-400">No messages yet.</p> : inquiries.map((i) => (
                       <div key={i.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                          <div className="flex justify-between mb-2">
                             <p className="font-bold text-sm">{i.name}</p>
                             <span className="text-[10px] uppercase bg-zinc-200 px-2 py-0.5 rounded text-zinc-600">{i.event_type}</span>
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2">{i.message}</p>
                          <div className="mt-2 text-[10px] text-zinc-400">{new Date(i.created_at).toLocaleDateString()}</div>
                       </div>
                    ))}
                 </div>
              </div>

           </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 flex items-center gap-4">
     <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <Icon size={24} />
     </div>
     <div>
        <p className="text-xs font-bold uppercase text-zinc-400">{title}</p>
        <p className="text-2xl font-serif font-bold text-zinc-900">{value}</p>
     </div>
  </motion.div>
);

export default AdminDashboard;