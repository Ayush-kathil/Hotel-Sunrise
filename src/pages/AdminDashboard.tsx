import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LayoutDashboard, Calendar, Utensils, Users, MessageSquare, 
  LogOut, Search, TrendingUp, DollarSign, Bell 
} from 'lucide-react';
import { motion } from 'framer-motion';


// --- TYPES ---
interface Booking {
  id: string; room_name: string; user_id: string; check_in: string; total_price: number; status: string;
}
interface Dining {
  id: string; name: string; email: string; date: string; time: string; guests: number;
}
interface Event {
  id: string; name: string; email: string; event_type: string; date: string; guests: number;
}
interface UserProfile {
  id: string; full_name: string; email: string; role: string; mobile: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data State
  const [stats, setStats] = useState({ revenue: 0, totalBookings: 0, totalUsers: 0 });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dining, setDining] = useState<Dining[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }

      // Check Admin Role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') {
        alert("Access Denied");
        navigate('/');
        return;
      }

      // Fetch All Tables
      const [bRes, dRes, eRes, uRes] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('dining_reservations').select('*').order('created_at', { ascending: false }),
        supabase.from('event_inquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false })
      ]);

      const bData = bRes.data || [];
      const uData = uRes.data || [];

      setBookings(bData);
      setDining(dRes.data || []);
      setEvents(eRes.data || []);
      setUsers(uData);

      // Calculate Stats
      const totalRev = bData.reduce((acc, curr) => acc + (curr.total_price || 0), 0);
      setStats({
        revenue: totalRev,
        totalBookings: bData.length,
        totalUsers: uData.length
      });

      setLoading(false);
    };
    fetchData();
  }, [navigate]);

  // --- HELPER: FILTER DATA ---
  const filterData = (data: any[]) => {
    if (!searchTerm) return data;
    return data.filter(item => 
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50">Loading Dashboard...</div>;

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-zinc-800">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col">
        <div className="p-8">
           <h1 className="text-2xl font-serif font-bold text-[#d4af37]">SUNRISE</h1>
           <p className="text-xs text-zinc-400 tracking-widest uppercase mt-1">Admin Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'bookings', icon: Calendar, label: 'Room Bookings' },
            { id: 'dining', icon: Utensils, label: 'Dining' },
            { id: 'events', icon: MessageSquare, label: 'Inquiries' },
            { id: 'users', icon: Users, label: 'User Database' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-black text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={18} /> Exit Dashboard
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        
        {/* TOP HEADER */}
        <header className="bg-white border-b border-zinc-200 px-8 py-5 flex justify-between items-center sticky top-0 z-20">
           <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
           <div className="flex items-center gap-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-full text-sm outline-none focus:border-[#d4af37] w-64 transition-all"
               />
             </div>
             <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
               <Bell size={18} />
             </div>
           </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">

          {/* OVERVIEW STATS (Only on Overview Tab) */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-green-500" />
              <StatCard title="Active Bookings" value={stats.totalBookings} icon={Calendar} color="bg-blue-500" />
              <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-purple-500" />
            </motion.div>
          )}

          {/* DYNAMIC CONTENT TABLE */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-200 overflow-hidden">
             
             {/* -- USERS VIEW -- */}
             {activeTab === 'users' && (
                <Table 
                  headers={['Name', 'Email', 'Role', 'Mobile', 'Joined']}
                  data={filterData(users)}
                  renderRow={(user: UserProfile) => (
                    <>
                      <td className="p-4 font-bold">{user.full_name || 'Guest'}</td>
                      <td className="p-4 text-zinc-500">{user.email}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-600'}`}>{user.role}</span></td>
                      <td className="p-4 text-zinc-500">{user.mobile || '-'}</td>
                      <td className="p-4 text-zinc-400 text-xs">Recently</td>
                    </>
                  )}
                />
             )}

             {/* -- BOOKINGS VIEW -- */}
             {(activeTab === 'bookings' || activeTab === 'overview') && (
                <Table 
                  headers={['Room', 'Guest ID', 'Check In', 'Price', 'Status']}
                  data={filterData(bookings)}
                  renderRow={(item: Booking) => (
                    <>
                      <td className="p-4 font-bold font-serif">{item.room_name}</td>
                      <td className="p-4 text-xs text-zinc-400 font-mono">{item.user_id.slice(0,8)}...</td>
                      <td className="p-4 text-zinc-600">{item.check_in}</td>
                      <td className="p-4 font-bold text-green-600">₹{item.total_price.toLocaleString()}</td>
                      <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Confirmed</span></td>
                    </>
                  )}
                />
             )}

             {/* -- DINING VIEW -- */}
             {activeTab === 'dining' && (
                <Table 
                   headers={['Guest Name', 'Date', 'Time', 'Party Size', 'Contact']}
                   data={filterData(dining)}
                   renderRow={(item: Dining) => (
                     <>
                       <td className="p-4 font-bold">{item.name}</td>
                       <td className="p-4 text-zinc-600">{item.date}</td>
                       <td className="p-4 text-zinc-600">{item.time}</td>
                       <td className="p-4"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">{item.guests} Guests</span></td>
                       <td className="p-4 text-blue-500 text-sm hover:underline cursor-pointer">{item.email}</td>
                     </>
                   )}
                />
             )}

             {/* -- EVENTS VIEW -- */}
             {activeTab === 'events' && (
                <Table 
                   headers={['Event Type', 'Organizer', 'Date', 'Est. Guests', 'Details']}
                   data={filterData(events)}
                   renderRow={(item: Event) => (
                     <>
                       <td className="p-4"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold uppercase">{item.event_type}</span></td>
                       <td className="p-4 font-bold">{item.name}</td>
                       <td className="p-4 text-zinc-600">{item.date}</td>
                       <td className="p-4 text-zinc-600">{item.guests} People</td>
                       <td className="p-4 text-zinc-400 text-xs truncate max-w-[200px]">Click to view</td>
                     </>
                   )}
                />
             )}
          </div>

        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-zinc-900">{value}</h3>
    </div>
  </div>
);

const Table = ({ headers, data, renderRow }: any) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-zinc-50 border-b border-zinc-100">
        <tr>
          {headers.map((h: string) => (
            <th key={h} className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-50">
        {data.length === 0 ? (
          <tr><td colSpan={headers.length} className="p-8 text-center text-zinc-400">No data found.</td></tr>
        ) : (
          data.map((item: any, i: number) => (
            <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
              {renderRow(item)}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default AdminDashboard;