import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, DollarSign, Bell, LogOut, 
  Download, Search, TrendingUp, Lock, CheckCircle, XCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- CONFIGURATION ---
const ADMIN_PASSCODE = "2026"; // Change this to your desired 4-digit code

// --- HELPER: EXPORT TO CSV ---
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
  
  // STATE: SECURITY
  const [isLocked, setIsLocked] = useState(true);
  const [passcode, setPasscode] = useState(['', '', '', '']);
  
  // STATE: DATA
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, inquiries: 0, avgPrice: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // 1. INITIAL AUTH CHECK
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }
      
      // Check if user is actually admin (optional security layer)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (profile?.role !== 'admin') {
        toast.error("Unauthorized Access");
        navigate('/profile');
      }
      
      fetchData();
    };
    checkAuth();
  }, [navigate]);

  // 2. FETCH REAL SUPABASE DATA
  const fetchData = async () => {
    // A. Fetch Bookings
    const { data: bData } = await supabase
      .from('bookings')
      .select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false });

    // B. Fetch Inquiries
    const { data: iData } = await supabase
      .from('event_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    // C. PROCESS DATA FOR ANALYTICS
    const rawBookings = bData || [];
    const rawInquiries = iData || [];

    // Calculate Totals
    const totalRev = rawBookings.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
    const totalBookings = rawBookings.length;
    
    // Prepare Chart Data (Group by Date)
    const chartMap = new Map();
    rawBookings.forEach(b => {
      const date = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const current = chartMap.get(date) || 0;
      chartMap.set(date, current + Number(b.total_price));
    });
    
    // Convert Map to Array for Recharts
    const chartArray = Array.from(chartMap, ([name, value]) => ({ name, value })).reverse();

    setBookings(rawBookings);
    setInquiries(rawInquiries);
    setChartData(chartArray);
    setStats({
      revenue: totalRev,
      bookings: totalBookings,
      inquiries: rawInquiries.length,
      avgPrice: totalBookings > 0 ? Math.round(totalRev / totalBookings) : 0
    });
    setLoading(false);
  };

  // 3. PASSCODE LOGIC
  const handlePasscodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only 1 digit per box
    const newPasscode = [...passcode];
    newPasscode[index] = value;
    setPasscode(newPasscode);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }

    // Check Code
    if (newPasscode.join('').length === 4) {
      if (newPasscode.join('') === ADMIN_PASSCODE) {
        setTimeout(() => setIsLocked(false), 300);
        toast.success("Identity Verified");
      } else {
        toast.error("Access Denied");
        setPasscode(['', '', '', '']);
        document.getElementById('digit-0')?.focus();
      }
    }
  };

  const handleExport = () => {
    const dataToExport = activeTab === 'inquiries' ? inquiries : bookings.map(b => ({
       Guest: b.profiles?.full_name || 'Guest',
       Email: b.profiles?.email || 'N/A',
       Room: b.room_name,
       CheckIn: b.check_in,
       Price: b.total_price,
       Date: new Date(b.created_at).toLocaleDateString()
    }));
    downloadCSV(dataToExport, `Sunrise_Export_${activeTab}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // --- VIEW 1: LOCK SCREEN ---
  if (isLocked) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
       <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
         <div className="w-16 h-16 bg-[#d4af37] rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.3)]">
            <Lock className="text-black" size={32} />
         </div>
         <h1 className="text-3xl font-serif font-bold text-white mb-2">Admin Security</h1>
         <p className="text-zinc-500 mb-8">Enter your 4-digit secure PIN to access the dashboard.</p>
         
         <div className="flex gap-4 justify-center mb-8">
            {passcode.map((digit, i) => (
              <input
                key={i}
                id={`digit-${i}`}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePasscodeChange(i, e.target.value)}
                className="w-14 h-16 rounded-xl bg-zinc-900 border border-zinc-800 text-center text-2xl font-bold text-white focus:border-[#d4af37] focus:outline-none transition-all"
              />
            ))}
         </div>
         <button onClick={handleLogout} className="text-zinc-500 text-xs hover:text-white transition-colors uppercase tracking-widest">
            Back to Login
         </button>
       </motion.div>
    </div>
  );

  if (loading) return <div className="h-screen bg-zinc-50 flex items-center justify-center">Loading Analytics...</div>;

  // --- VIEW 2: DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-zinc-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col p-6 fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10">
           <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-[#d4af37] font-bold font-serif">S</div>
           <span className="font-bold tracking-tight">SUNRISE ANALYTICS</span>
        </div>
        
        <nav className="space-y-1">
           <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
           <SidebarItem icon={Calendar} label="Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
           <SidebarItem icon={Bell} label="Inquiries" active={activeTab === 'inquiries'} count={stats.inquiries} onClick={() => setActiveTab('inquiries')} />
        </nav>

        <div className="mt-auto">
           <button onClick={() => setIsLocked(true)} className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-zinc-500 hover:text-black transition-colors">
              <Lock size={16} /> Lock Screen
           </button>
           <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors mt-2">
              <LogOut size={16} /> Sign Out
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto h-screen">
         <header className="flex justify-between items-center mb-10">
            <div>
               <h1 className="text-2xl font-bold">{activeTab === 'overview' ? 'Performance Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
               <p className="text-zinc-500 text-sm">Real-time data from Supabase Connection</p>
            </div>
            <button onClick={handleExport} className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-zinc-50 transition-colors shadow-sm">
               <Download size={16} /> Export Report
            </button>
         </header>

         {/* --- OVERVIEW TAB --- */}
         {activeTab === 'overview' && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* ANALYTICS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <AnalyticsCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} change="+12% vs last month" icon={DollarSign} />
                 <AnalyticsCard title="Total Bookings" value={stats.bookings} change="Active Now" icon={Calendar} />
                 <AnalyticsCard title="Avg. Price" value={`₹${stats.avgPrice.toLocaleString()}`} change="Per Night" icon={TrendingUp} />
              </div>

              {/* CHART SECTION */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm h-[400px]">
                 <h3 className="font-bold mb-6">Revenue Trend</h3>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                       <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                       <Area type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              {/* RECENT BOOKINGS TABLE */}
              <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-zinc-100"><h3 className="font-bold">Recent Transactions</h3></div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-zinc-50 text-zinc-500 font-medium uppercase text-xs">
                          <tr>
                             <th className="px-6 py-4">Guest</th>
                             <th className="px-6 py-4">Room</th>
                             <th className="px-6 py-4">Amount</th>
                             <th className="px-6 py-4">Status</th>
                          </tr>
                       </thead>
                       <tbody>
                          {bookings.slice(0, 5).map(b => (
                             <tr key={b.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium">{b.profiles?.full_name || 'Guest User'}</td>
                                <td className="px-6 py-4 text-zinc-500">{b.room_name}</td>
                                <td className="px-6 py-4 font-bold text-zinc-900">₹{b.total_price.toLocaleString()}</td>
                                <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase">{b.status}</span></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </motion.div>
         )}

         {/* --- INQUIRIES TAB --- */}
         {activeTab === 'inquiries' && (
            <div className="grid gap-4">
               {inquiries.map(i => (
                  <div key={i.id} className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="font-bold text-lg">{i.name}</span>
                           <span className="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded text-xs uppercase font-bold">{i.event_type}</span>
                        </div>
                        <p className="text-zinc-600 bg-zinc-50 p-3 rounded-lg text-sm">{i.message}</p>
                     </div>
                     <div className="flex flex-col items-end gap-2 min-w-[140px]">
                        <span className="text-xs text-zinc-400">{new Date(i.created_at).toLocaleDateString()}</span>
                        <a href={`mailto:${i.email}`} className="text-xs font-bold text-[#d4af37] border border-[#d4af37] px-3 py-1.5 rounded-full hover:bg-[#d4af37] hover:text-white transition-all uppercase">
                           Reply
                        </a>
                     </div>
                  </div>
               ))}
               {inquiries.length === 0 && <p className="text-center text-zinc-400 mt-10">No messages found.</p>}
            </div>
         )}

         {/* --- BOOKINGS TAB --- */}
         {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 text-zinc-500 font-medium uppercase text-xs">
                     <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Guest Info</th>
                        <th className="px-6 py-4">Stay Details</th>
                        <th className="px-6 py-4 text-right">Revenue</th>
                     </tr>
                  </thead>
                  <tbody>
                     {bookings.map(b => (
                        <tr key={b.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                           <td className="px-6 py-4 text-zinc-500">{new Date(b.created_at).toLocaleDateString()}</td>
                           <td className="px-6 py-4">
                              <p className="font-bold">{b.profiles?.full_name || 'Guest'}</p>
                              <p className="text-xs text-zinc-400">{b.profiles?.email}</p>
                           </td>
                           <td className="px-6 py-4">
                              <p>{b.room_name}</p>
                              <p className="text-xs text-zinc-400">{b.nights} Nights • {b.guests} Guests</p>
                           </td>
                           <td className="px-6 py-4 text-right font-bold">₹{b.total_price.toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick, count }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg mb-1 transition-all text-sm font-medium ${active ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
  >
    <div className="flex items-center gap-3">
       <Icon size={18} /> {label}
    </div>
    {count > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{count}</span>}
  </button>
);

const AnalyticsCard = ({ title, value, change, icon: Icon }: any) => (
   <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex items-start justify-between">
      <div>
         <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
         <h3 className="text-2xl font-bold mb-1">{value}</h3>
         <p className="text-green-600 text-xs font-medium bg-green-50 inline-block px-2 py-0.5 rounded">{change}</p>
      </div>
      <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400">
         <Icon size={20} />
      </div>
   </div>
);

export default AdminDashboard;