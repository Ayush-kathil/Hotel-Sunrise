import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, DollarSign, Bell, LogOut, 
  Download, Lock, TrendingUp, Wifi, WifiOff 
} from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- SECURITY CONFIG ---
const ADMIN_PASSCODE = "2026"; 

// --- EXCEL EXPORT FUNCTION ---
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
  
  // STATES
  const [isLocked, setIsLocked] = useState(true);
  const [passcode, setPasscode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false); // New: Connection Status
  const [activeTab, setActiveTab] = useState('overview');
  
  // DATA STATES
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, inquiries: 0, avgPrice: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // 1. DATA FETCHING (The "Connection" Logic)
  const fetchData = async () => {
    try {
      console.log("⚡ Connecting to Supabase...");
      
      // FETCH BOOKINGS
      const { data: bData, error: bError } = await supabase
        .from('bookings')
        .select('*, profiles(email, full_name)')
        .order('created_at', { ascending: false });

      if (bError) throw bError;

      // FETCH INQUIRIES (Dining, Events, Contact)
      const { data: iData, error: iError } = await supabase
        .from('event_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (iError) throw iError;

      // SUCCESS: PROCESS DATA
      setIsConnected(true);
      const rawBookings = bData || [];
      const rawInquiries = iData || [];

      // Calculate Revenue
      const totalRev = rawBookings.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
      
      // Build Chart Data
      const chartMap = new Map();
      rawBookings.forEach(b => {
        const date = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        chartMap.set(date, (chartMap.get(date) || 0) + Number(b.total_price));
      });
      const chartArray = Array.from(chartMap, ([name, value]) => ({ name, value })).reverse();

      setBookings(rawBookings);
      setInquiries(rawInquiries);
      setChartData(chartArray);
      setStats({
        revenue: totalRev,
        bookings: rawBookings.length,
        inquiries: rawInquiries.length,
        avgPrice: rawBookings.length > 0 ? Math.round(totalRev / rawBookings.length) : 0
      });

    } catch (error: any) {
      console.error("❌ Connection Failed:", error);
      setIsConnected(false);
      toast.error("Database Connection Error", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 2. AUTH & INIT
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }
      fetchData();
    };
    init();
  }, [navigate]);

  // 3. PASSCODE LOGIC
  const handlePasscodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPasscode = [...passcode];
    newPasscode[index] = value;
    setPasscode(newPasscode);

    if (value && index < 3) document.getElementById(`digit-${index + 1}`)?.focus();

    if (newPasscode.join('').length === 4) {
      if (newPasscode.join('') === ADMIN_PASSCODE) {
        setTimeout(() => setIsLocked(false), 300);
        toast.success("Admin Verified");
      } else {
        toast.error("Wrong Passcode");
        setPasscode(['', '', '', '']);
        document.getElementById('digit-0')?.focus();
      }
    }
  };

  const handleExport = () => {
    const data = activeTab === 'bookings' ? bookings : inquiries;
    downloadCSV(data, `Sunrise_Export_${activeTab}`);
  };

  // --- VIEW 1: LOCK SCREEN ---
  if (isLocked) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
       <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm text-center">
         <div className="w-20 h-20 bg-[#d4af37] rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.2)]">
            <Lock className="text-zinc-950" size={36} />
         </div>
         <h1 className="text-2xl font-serif font-bold text-white mb-2">Admin Access</h1>
         <p className="text-zinc-500 mb-8 text-sm">Enter the security PIN to verify identity.</p>
         <div className="flex gap-3 justify-center mb-8">
            {passcode.map((digit, i) => (
              <input key={i} id={`digit-${i}`} type="password" maxLength={1} value={digit} onChange={(e) => handlePasscodeChange(i, e.target.value)}
                className="w-14 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-2xl font-bold text-white focus:border-[#d4af37] focus:outline-none transition-all" />
            ))}
         </div>
       </motion.div>
    </div>
  );

  // --- VIEW 2: DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#f4f4f5] flex font-sans text-zinc-900">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-zinc-200 hidden md:flex flex-col p-6 fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10">
           <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-[#d4af37] font-bold font-serif text-xl">S</div>
           <div>
              <h1 className="font-bold tracking-tight text-sm">SUNRISE HOTEL</h1>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Management</p>
           </div>
        </div>
        
        <nav className="space-y-1">
           <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
           <SidebarItem icon={Calendar} label="Reservations" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
           <SidebarItem icon={Bell} label="All Inquiries" active={activeTab === 'inquiries'} onClick={() => setActiveTab('inquiries')} count={stats.inquiries} />
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100">
           {/* CONNECTION STATUS INDICATOR */}
           <div className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-xs font-bold border ${isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isConnected ? "System Online" : "Connection Lost"}
           </div>
           <button onClick={() => setIsLocked(true)} className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-zinc-500 hover:text-black">
              <Lock size={16} /> Lock Console
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-72 p-8 overflow-y-auto h-screen">
         <header className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-3xl font-serif font-bold">
                 {activeTab === 'overview' ? 'Overview' : activeTab === 'bookings' ? 'Reservations' : 'Messages & Dining'}
               </h1>
               <p className="text-zinc-500 text-sm mt-1">Real-time updates from Supabase Database.</p>
            </div>
            <button onClick={handleExport} className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#d4af37] hover:text-black transition-colors shadow-lg">
               <Download size={16} /> Export Data
            </button>
         </header>

         {/* TAB: OVERVIEW */}
         {activeTab === 'overview' && (
           <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-[#d4af37]" />
                 <StatCard title="Total Bookings" value={stats.bookings} icon={Calendar} color="bg-zinc-900" dark />
                 <StatCard title="Inquiries" value={stats.inquiries} icon={Bell} color="bg-orange-500" />
                 <StatCard title="Avg. Nightly Rate" value={`₹${stats.avgPrice.toLocaleString()}`} icon={TrendingUp} color="bg-emerald-500" />
              </div>

              {/* CHART */}
              <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm h-[350px]">
                 <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-zinc-400">Revenue Analytics</h3>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#aaa', fontSize: 12}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#aaa', fontSize: 12}} />
                       <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                       <Area type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={3} fill="url(#colorValue)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
         )}

         {/* TAB: BOOKINGS */}
         {activeTab === 'bookings' && (
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50/50 text-zinc-500 font-bold uppercase text-xs">
                     <tr>
                        <th className="px-8 py-5">Guest Info</th>
                        <th className="px-8 py-5">Room Details</th>
                        <th className="px-8 py-5">Dates</th>
                        <th className="px-8 py-5 text-right">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                     {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                           <td className="px-8 py-5">
                              <p className="font-bold text-base">{b.profiles?.full_name || 'Guest User'}</p>
                              <p className="text-zinc-400 text-xs">{b.profiles?.email}</p>
                           </td>
                           <td className="px-8 py-5">
                              <span className="bg-zinc-100 px-3 py-1 rounded-full text-xs font-bold">{b.room_name}</span>
                           </td>
                           <td className="px-8 py-5 text-zinc-500">
                              {b.check_in} <span className="text-zinc-300 mx-2">→</span> {b.check_out}
                           </td>
                           <td className="px-8 py-5 text-right font-bold text-[#d4af37]">₹{b.total_price.toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {bookings.length === 0 && <div className="p-12 text-center text-zinc-400">No bookings found in database.</div>}
            </div>
         )}

         {/* TAB: INQUIRIES (Dining, Events, Contact) */}
         {activeTab === 'inquiries' && (
            <div className="grid gap-4">
               {inquiries.map(i => (
                  <div key={i.id} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${i.event_type === 'Dining' ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                              {i.event_type || 'General'}
                           </span>
                           <span className="text-xs text-zinc-400">{new Date(i.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{i.name}</h3>
                        <p className="text-zinc-600 bg-zinc-50 p-4 rounded-xl text-sm leading-relaxed border border-zinc-100">
                           "{i.message}"
                        </p>
                     </div>
                     <div className="flex flex-col justify-center items-end min-w-[150px] border-l border-zinc-50 pl-6">
                        <p className="text-xs text-zinc-400 mb-2">Contact Info</p>
                        <p className="font-bold text-sm mb-1">{i.email}</p>
                        <p className="text-sm text-zinc-500 mb-4">{i.phone || 'No Phone'}</p>
                        <a href={`mailto:${i.email}`} className="text-xs font-bold bg-black text-white px-4 py-2 rounded-lg hover:bg-[#d4af37] hover:text-black transition-colors">
                           Reply to Guest
                        </a>
                     </div>
                  </div>
               ))}
               {inquiries.length === 0 && <div className="p-12 text-center text-zinc-400">No inquiries found.</div>}
            </div>
         )}
      </main>
    </div>
  );
};

// --- SUBCOMPONENTS ---
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
         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${dark ? 'bg-white/10' : 'bg-zinc-50'}`}><Icon size={20} /></div>
         <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${dark ? 'bg-white/10' : 'bg-zinc-100'}`}>+12%</span>
      </div>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{title}</p>
      <h3 className="text-3xl font-serif font-bold">{value}</h3>
   </div>
);

export default AdminDashboard;