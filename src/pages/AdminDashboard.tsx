import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, DollarSign, Bell, LogOut, 
  Download, Lock, Wifi, WifiOff, Utensils, Mail, PartyPopper 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

// --- CONFIG ---
const ADMIN_PASSCODE = "3012"; 
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#d4af37'];

// --- EXPORT FUNCTION ---
const downloadCSV = (data: any[], filename: string) => {
  if (!data.length) return toast.error("No data to export");
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row => 
    Object.values(row).map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(",")
  );
  const blob = new Blob([[headers, ...rows].join("\n")], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // STATE: SECURITY & UI
  const [isLocked, setIsLocked] = useState(true);
  const [passcode, setPasscode] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isConnected, setIsConnected] = useState(false);
  
  // STATE: DATA
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, dining: 0, events: 0, contacts: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [diningData, setDiningData] = useState<any[]>([]);
  const [eventsData, setEventsData] = useState<any[]>([]); // New Events Data
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  
  // STATE: CHARTS
  const [areaChartData, setAreaChartData] = useState<any[]>([]);
  const [pieChartData, setPieChartData] = useState<any[]>([]);

  // 1. FETCH DATA
  const fetchData = async () => {
    try {
      console.log("⚡ Fetching Secure Data...");

      // A. Bookings
      const { data: bData } = await supabase
        .from('bookings')
        .select('*, profiles(email, full_name)')
        .order('created_at', { ascending: false });

      // B. All Inquiries (Dining + Events)
      const { data: iData } = await supabase
        .from('event_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      // C. Contact Messages
      const { data: cData } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      setIsConnected(true);

      // --- PROCESS DATA ---
      const rawBookings = bData || [];
      const rawInquiries = iData || [];
      const rawContacts = cData || [];

      // Filter Dining vs Events
      const dining = rawInquiries.filter(i => i.event_type === 'Dining');
      const events = rawInquiries.filter(i => i.event_type !== 'Dining');

      // Calculate Revenue
      const totalRev = rawBookings.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);

      // Process Area Chart (Revenue over Time)
      const areaMap = new Map();
      rawBookings.forEach(b => {
        const date = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        areaMap.set(date, (areaMap.get(date) || 0) + Number(b.total_price));
      });
      const areaData = Array.from(areaMap, ([name, value]) => ({ name, value })).reverse();

      // Process Pie Chart (Revenue by Room)
      const pieMap = new Map();
      rawBookings.forEach(b => {
        const room = b.room_name || 'Unknown Room';
        pieMap.set(room, (pieMap.get(room) || 0) + Number(b.total_price));
      });
      const pieData = Array.from(pieMap, ([name, value]) => ({ name, value }));

      // Set State
      setBookings(rawBookings);
      setDiningData(dining);
      setEventsData(events);
      setContactMessages(rawContacts);
      setAreaChartData(areaData);
      setPieChartData(pieData);
      
      setStats({
        revenue: totalRev,
        bookings: rawBookings.length,
        dining: dining.length,
        events: events.length,
        contacts: rawContacts.length
      });

    } catch (error) {
      console.error("Connection Error:", error);
      setIsConnected(false);
      toast.error("Database connection failed");
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. PASSCODE LOGIC
  const handlePasscode = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPass = [...passcode];
    newPass[index] = value;
    setPasscode(newPass);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
    
    if (newPass.join('').length === 4) {
      if (newPass.join('') === ADMIN_PASSCODE) {
        setIsLocked(false);
        toast.success("Welcome Admin");
      } else {
        toast.error("Access Denied");
        setPasscode(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Redirect to home
  };

  // --- VIEW 1: LOCKED ---
  if (isLocked) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 bg-[#d4af37] rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.3)]">
          <Lock className="text-zinc-950" size={36} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Security Check</h1>
        <p className="text-zinc-500 mb-8 text-sm">Enter passcode to access admin panel.</p>
        <div className="flex gap-3 justify-center">
          {passcode.map((digit, i) => (
            <input key={i} ref={el => inputRefs.current[i] = el} type="password" maxLength={1} value={digit}
              onChange={(e) => handlePasscode(i, e.target.value)}
              className="w-14 h-16 rounded-xl bg-zinc-900 border border-zinc-800 text-center text-2xl font-bold text-white focus:border-[#d4af37] focus:outline-none transition-all" />
          ))}
        </div>
      </div>
    </div>
  );

  // --- VIEW 2: DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#f4f4f5] flex font-sans text-zinc-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col p-6 h-full">
        <div className="flex items-center gap-3 mb-10">
           <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-[#d4af37] font-bold text-xl">S</div>
           <div><h1 className="font-bold text-sm">SUNRISE</h1><p className="text-[10px] text-zinc-400">ADMIN</p></div>
        </div>
        
        <nav className="space-y-1">
           <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
           <SidebarItem icon={Calendar} label="Reservations" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
           <div className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4">Inquiries</div>
           <SidebarItem icon={Utensils} label="Dining" active={activeTab === 'dining'} onClick={() => setActiveTab('dining')} count={stats.dining} />
           <SidebarItem icon={PartyPopper} label="Events" active={activeTab === 'events'} onClick={() => setActiveTab('events')} count={stats.events} />
           <SidebarItem icon={Mail} label="Messages" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} count={stats.contacts} />
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100 space-y-2">
           <div className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold border ${isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700'}`}>
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />} {isConnected ? "Secure" : "Offline"}
           </div>
           <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg">
              <LogOut size={16} /> Logout
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto h-full">
         <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif font-bold capitalize">{activeTab}</h1>
            {activeTab !== 'overview' && (
              <button onClick={() => downloadCSV(activeTab === 'bookings' ? bookings : activeTab === 'dining' ? diningData : eventsData, activeTab)} className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#d4af37] hover:text-black transition-colors">
                 <Download size={16} /> Export
              </button>
            )}
         </header>

         {/* --- 1. OVERVIEW (WITH PIE CHART) --- */}
         {activeTab === 'overview' && (
           <div className="space-y-6">
              {/* STAT CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <StatCard title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-[#d4af37]" />
                 <StatCard title="Bookings" value={stats.bookings} icon={Calendar} color="bg-zinc-900" dark />
                 <StatCard title="Events" value={stats.events} icon={PartyPopper} color="bg-purple-500" />
                 <StatCard title="Dining" value={stats.dining} icon={Utensils} color="bg-orange-500" />
              </div>

              {/* CHARTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[350px]">
                 {/* AREA CHART */}
                 <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
                    <h3 className="font-bold mb-4 text-xs uppercase tracking-wider text-zinc-400">Income Trend</h3>
                    <ResponsiveContainer width="100%" height="85%">
                       <AreaChart data={areaChartData}>
                          <defs>
                             <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/><stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize:10}} />
                          <Tooltip contentStyle={{borderRadius:'10px', border:'none'}} />
                          <Area type="monotone" dataKey="value" stroke="#d4af37" fill="url(#colorVal)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>

                 {/* PIE CHART */}
                 <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
                    <h3 className="font-bold mb-4 text-xs uppercase tracking-wider text-zinc-400">Revenue Source (Room Type)</h3>
                    <ResponsiveContainer width="100%" height="85%">
                       <PieChart>
                          <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                             {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
         )}

         {/* --- 2. BOOKINGS --- */}
         {activeTab === 'bookings' && <TableData data={bookings} type="booking" />}

         {/* --- 3. DINING --- */}
         {activeTab === 'dining' && <TableData data={diningData} type="inquiry" />}

         {/* --- 4. EVENTS (NEW) --- */}
         {activeTab === 'events' && <TableData data={eventsData} type="inquiry" />}

         {/* --- 5. MESSAGES --- */}
         {activeTab === 'contacts' && <TableData data={contactMessages} type="contact" />}

      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const SidebarItem = ({ icon: Icon, label, active, onClick, count }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-all text-sm font-bold ${active ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50'}`}>
    <div className="flex items-center gap-3"><Icon size={18} /> {label}</div>
    {count > 0 && <span className="bg-[#d4af37] text-black text-[10px] px-2 py-0.5 rounded-full">{count}</span>}
  </button>
);

const StatCard = ({ title, value, icon: Icon, color, dark }: any) => (
   <div className={`p-6 rounded-3xl relative overflow-hidden ${dark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 border border-zinc-100 shadow-sm'}`}>
      <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${color} opacity-10 blur-3xl`} />
      <div className="flex justify-between items-start mb-6">
         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-white/10' : 'bg-zinc-50'}`}><Icon size={20} /></div>
      </div>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 opacity-60`}>{title}</p>
      <h3 className="text-2xl font-serif font-bold">{value}</h3>
   </div>
);

const TableData = ({ data, type }: any) => (
  <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
     {data.length === 0 ? <div className="p-10 text-center text-zinc-400">No data found</div> : (
        <table className="w-full text-sm text-left">
           <thead className="bg-zinc-50/50 text-zinc-500 font-bold uppercase text-xs">
              <tr>
                 <th className="px-6 py-4">Name / Subject</th>
                 <th className="px-6 py-4">Details</th>
                 <th className="px-6 py-4 text-right">Action</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-zinc-50">
              {data.map((item: any) => (
                 <tr key={item.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                       <p className="font-bold">{item.name || item.full_name || item.subject}</p>
                       <p className="text-xs text-zinc-400">{new Date(item.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                       {type === 'booking' ? `Room: ${item.room_name} (₹${item.total_price})` : item.message}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <a href={`mailto:${item.email}`} className="text-xs font-bold border border-zinc-200 px-3 py-1 rounded-lg hover:bg-black hover:text-white transition-colors">Reply</a>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
     )}
  </div>
);

export default AdminDashboard;