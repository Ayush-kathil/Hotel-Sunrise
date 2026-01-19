import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, DollarSign, Bell, LogOut, 
  Download, Lock, TrendingUp, Wifi, WifiOff, Utensils, Mail 
} from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- SECURITY CONFIG ---
const ADMIN_PASSCODE = "2026"; 

// --- EXCEL EXPORT ---
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
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // FIX: Refs for auto-focus

  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // DATA STATES
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, inquiries: 0, contacts: 0, avgPrice: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [diningInquiries, setDiningInquiries] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // 1. FETCH DATA FROM 3 TABLES
  const fetchData = async () => {
    try {
      console.log("⚡ Fetching All Tables...");
      
      // A. Bookings
      const { data: bData } = await supabase
        .from('bookings')
        .select('*, profiles(email, full_name)')
        .order('created_at', { ascending: false });

      // B. Dining & Events
      const { data: eData } = await supabase
        .from('event_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      // C. Contact Messages
      const { data: cData } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      setIsConnected(true);
      
      const rawBookings = bData || [];
      const rawEvents = eData || [];
      const rawContacts = cData || [];

      // Calculate Revenue
      const totalRev = rawBookings.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
      
      // Chart Data
      const chartMap = new Map();
      rawBookings.forEach(b => {
        const date = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        chartMap.set(date, (chartMap.get(date) || 0) + Number(b.total_price));
      });
      const chartArray = Array.from(chartMap, ([name, value]) => ({ name, value })).reverse();

      setBookings(rawBookings);
      setDiningInquiries(rawEvents);
      setContactMessages(rawContacts);
      setChartData(chartArray);
      
      setStats({
        revenue: totalRev,
        bookings: rawBookings.length,
        inquiries: rawEvents.length,
        contacts: rawContacts.length,
        avgPrice: rawBookings.length > 0 ? Math.round(totalRev / rawBookings.length) : 0
      });

    } catch (error: any) {
      console.error("❌ Connection Failed:", error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. FIXED PASSCODE LOGIC (AUTO-MOVE)
  const handlePasscodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newPasscode = [...passcode];
    newPasscode[index] = value;
    setPasscode(newPasscode);

    // Auto-focus next input using REFS
    if (value !== '' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Verify Code
    if (newPasscode.join('').length === 4) {
      if (newPasscode.join('') === ADMIN_PASSCODE) {
        setTimeout(() => setIsLocked(false), 300);
        toast.success("Identity Verified");
      } else {
        toast.error("Access Denied");
        setPasscode(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleExport = () => {
    if (activeTab === 'bookings') downloadCSV(bookings, 'Bookings');
    else if (activeTab === 'dining') downloadCSV(diningInquiries, 'Dining_Events');
    else if (activeTab === 'contacts') downloadCSV(contactMessages, 'Contact_Messages');
    else toast.error("Select a tab to export data");
  };

  // --- VIEW 1: LOCK SCREEN ---
  if (isLocked) return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 font-sans">
       <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm text-center">
         <div className="w-20 h-20 bg-gradient-to-br from-[#d4af37] to-[#b39020] rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-[0_0_60px_rgba(212,175,55,0.15)]">
            <Lock className="text-black" size={32} />
         </div>
         <h1 className="text-2xl font-serif font-bold text-white mb-2">Admin Security</h1>
         <p className="text-zinc-500 mb-8 text-sm">Enter passcode to access dashboard.</p>
         
         <div className="flex gap-3 justify-center mb-8">
            {passcode.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el} // Assign ref
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePasscodeChange(i, e.target.value)}
                className="w-14 h-16 rounded-xl bg-zinc-900 border border-zinc-800 text-center text-2xl font-bold text-white focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all"
              />
            ))}
         </div>
       </motion.div>
    </div>
  );

  // --- VIEW 2: MAIN DASHBOARD ---
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
           <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
           <SidebarItem icon={Calendar} label="Reservations" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
           
           <div className="pt-4 pb-2">
             <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Inquiries</p>
           </div>
           
           <SidebarItem icon={Utensils} label="Dining & Events" active={activeTab === 'dining'} onClick={() => setActiveTab('dining')} count={stats.inquiries} />
           <SidebarItem icon={Mail} label="Contact Msgs" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} count={stats.contacts} />
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100">
           <div className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-xs font-bold border ${isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isConnected ? "System Online" : "Disconnected"}
           </div>
           <button onClick={() => setIsLocked(true)} className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-zinc-500 hover:text-black">
              <Lock size={16} /> Lock Console
           </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 md:ml-72 p-8 overflow-y-auto h-screen">
         <header className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-3xl font-serif font-bold capitalize">
                 {activeTab.replace('_', ' ')}
               </h1>
               <p className="text-zinc-500 text-sm mt-1">Real-time database connection active.</p>
            </div>
            {activeTab !== 'overview' && (
              <button onClick={handleExport} className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#d4af37] hover:text-black transition-colors shadow-lg">
                 <Download size={16} /> Export CSV
              </button>
            )}
         </header>

         {/* --- 1. OVERVIEW --- */}
         {activeTab === 'overview' && (
           <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <StatCard title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-[#d4af37]" />
                 <StatCard title="Bookings" value={stats.bookings} icon={Calendar} color="bg-zinc-900" dark />
                 <StatCard title="Dining Inq." value={stats.inquiries} icon={Utensils} color="bg-orange-500" />
                 <StatCard title="Messages" value={stats.contacts} icon={Mail} color="bg-blue-500" />
              </div>

              <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm h-[350px]">
                 <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-zinc-400">Revenue Growth</h3>
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

         {/* --- 2. BOOKINGS --- */}
         {activeTab === 'bookings' && (
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50/50 text-zinc-500 font-bold uppercase text-xs">
                     <tr>
                        <th className="px-8 py-5">Guest</th>
                        <th className="px-8 py-5">Room</th>
                        <th className="px-8 py-5">Dates</th>
                        <th className="px-8 py-5 text-right">Price</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                     {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-zinc-50/50">
                           <td className="px-8 py-5">
                              <p className="font-bold">{b.profiles?.full_name || 'Guest'}</p>
                              <p className="text-zinc-400 text-xs">{b.profiles?.email}</p>
                           </td>
                           <td className="px-8 py-5"><span className="bg-zinc-100 px-3 py-1 rounded-full text-xs font-bold">{b.room_name}</span></td>
                           <td className="px-8 py-5 text-zinc-500">{b.check_in}</td>
                           <td className="px-8 py-5 text-right font-bold text-[#d4af37]">₹{b.total_price.toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {/* --- 3. DINING & EVENTS (Separate) --- */}
         {activeTab === 'dining' && (
            <div className="grid gap-4">
               {diningInquiries.map(i => (
                  <div key={i.id} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-6">
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">{i.event_type || 'Event'}</span>
                           <span className="text-xs text-zinc-400">{new Date(i.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-lg">{i.name}</h3>
                        <p className="text-zinc-500 text-sm mt-2">{i.message}</p>
                     </div>
                     <div className="border-l border-zinc-50 pl-6 flex flex-col justify-center gap-1 min-w-[180px]">
                        <p className="text-sm font-bold">{i.guests ? `${i.guests} Guests` : 'N/A'}</p>
                        <p className="text-xs text-zinc-400">{i.date || 'No Date'}</p>
                        <p className="text-xs font-bold text-[#d4af37] mt-2">{i.email}</p>
                     </div>
                  </div>
               ))}
               {diningInquiries.length === 0 && <div className="text-center text-zinc-400 py-10">No dining or event inquiries yet.</div>}
            </div>
         )}

         {/* --- 4. CONTACT MESSAGES (Separate) --- */}
         {activeTab === 'contacts' && (
            <div className="grid gap-4">
               {contactMessages.map(c => (
                  <div key={c.id} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-6">
                     <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                        <Mail size={20} />
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <h3 className="font-bold text-lg">{c.subject || 'No Subject'}</h3>
                           <span className="text-xs text-zinc-400">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-medium text-zinc-900 mt-1">{c.full_name}</p>
                        <p className="text-zinc-500 text-sm mt-3 bg-zinc-50 p-3 rounded-lg">{c.message}</p>
                     </div>
                     <div className="flex items-center">
                        <a href={`mailto:${c.email}`} className="px-4 py-2 border border-zinc-200 text-zinc-700 font-bold text-xs rounded-lg hover:bg-black hover:text-white transition-colors">
                           Reply
                        </a>
                     </div>
                  </div>
               ))}
               {contactMessages.length === 0 && <div className="text-center text-zinc-400 py-10">No contact messages yet.</div>}
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
      </div>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{title}</p>
      <h3 className="text-3xl font-serif font-bold">{value}</h3>
   </div>
);

export default AdminDashboard;