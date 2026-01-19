import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  LayoutDashboard, Calendar, DollarSign, Bell, LogOut, 
  Download, Lock, Utensils, Mail, Clock, MapPin, CheckCircle, Wifi, WifiOff 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- CONFIGURATION ---
// secure passcode from .env file
const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || "0000";

// --- EXPORT CSV FUNCTION ---
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
  
  // UI STATES
  const [isLocked, setIsLocked] = useState(true);
  const [passcode, setPasscode] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isConnected, setIsConnected] = useState(false);
  
  // DATA STATES
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, dining: 0, contacts: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [diningRes, setDiningRes] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [masterSchedule, setMasterSchedule] = useState<any[]>([]); // New Premium Feature
  const [chartData, setChartData] = useState<any[]>([]);

  // 1. DATA FETCHING
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("⚡ Fetching Premium Admin Data...");
        
        // A. Room Bookings
        const { data: bData } = await supabase
          .from('bookings')
          .select('*, profiles(full_name, email)')
          .order('check_in', { ascending: true }); // Order by date for calendar
        
        // B. Dining Reservations
        const { data: dData } = await supabase
          .from('dining_reservations')
          .select('*')
          .order('date', { ascending: true }); // Order by date
        
        // C. Contact Messages
        const { data: cData } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });

        setIsConnected(true);

        const rawBookings = bData || [];
        const rawDining = dData || [];
        const rawContacts = cData || [];

        // --- BUILD MASTER SCHEDULE (PREMIUM FEATURE) ---
        // Combine Rooms and Dining into one timeline
        const schedule = [
          ...rawBookings.map(b => ({
            type: 'ROOM',
            date: b.check_in,
            title: `Check-in: ${b.room_name}`,
            guest: b.profiles?.full_name || 'Guest',
            detail: `${b.nights} Nights`,
            status: b.status,
            id: b.id
          })),
          ...rawDining.map(d => ({
            type: 'DINING',
            date: d.date,
            title: `Dinner Res: ${d.time}`,
            guest: d.name,
            detail: `${d.guests} Guests`,
            status: 'Reserved',
            id: d.id
          }))
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate Revenue
        const revenue = rawBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
        
        // Prepare Chart
        const chartMap = new Map();
        rawBookings.forEach(b => {
          const date = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          chartMap.set(date, (chartMap.get(date) || 0) + Number(b.total_price));
        });
        const chartArr = Array.from(chartMap, ([name, value]) => ({ name, value })).reverse();

        // Set All States
        setBookings(rawBookings);
        setDiningRes(rawDining);
        setContacts(rawContacts);
        setMasterSchedule(schedule);
        setChartData(chartArr);
        setStats({ 
          revenue, 
          bookings: rawBookings.length, 
          dining: rawDining.length, 
          contacts: rawContacts.length 
        });

      } catch (err) {
        console.error("Fetch Error:", err);
        setIsConnected(false);
      }
    };
    fetchData();
  }, []);

  // 2. SECURE PASSCODE LOGIC
  const handlePasscode = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPass = [...passcode];
    newPass[index] = value;
    setPasscode(newPass);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
    
    if (newPass.join('').length === 4) {
      if (newPass.join('') === ADMIN_PASSCODE) {
        setIsLocked(false);
        toast.success("Identity Verified");
      } else {
        toast.error("Access Denied");
        setPasscode(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // --- VIEW 1: LOCK SCREEN ---
  if (isLocked) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 bg-[#d4af37] rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.3)]">
          <Lock className="text-zinc-950" size={36} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Admin Security</h1>
        <p className="text-zinc-500 mb-8 text-sm">Enter secure PIN to verify identity.</p>
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
    <div className="min-h-screen bg-[#f4f4f5] flex font-sans text-zinc-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col p-6 fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10">
           <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-[#d4af37] font-bold text-xl">S</div>
           <div><h1 className="font-bold text-sm">SUNRISE</h1><p className="text-[10px] text-zinc-400">ADMIN</p></div>
        </div>
        
        <nav className="space-y-1">
           <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
           <SidebarItem icon={Clock} label="Master Schedule" active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
           <div className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4">Database</div>
           <SidebarItem icon={Calendar} label="Room Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} count={stats.bookings} />
           <SidebarItem icon={Utensils} label="Dining Res." active={activeTab === 'dining'} onClick={() => setActiveTab('dining')} count={stats.dining} />
           <SidebarItem icon={Mail} label="Messages" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} count={stats.contacts} />
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100 space-y-2">
           <div className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold border ${isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700'}`}>
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />} {isConnected ? "System Online" : "Offline"}
           </div>
           <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut size={16} /> Logout
           </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto h-screen">
         <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif font-bold capitalize">{activeTab.replace('_', ' ')}</h1>
            {activeTab !== 'overview' && activeTab !== 'schedule' && (
              <button onClick={() => downloadCSV(activeTab === 'bookings' ? bookings : activeTab === 'dining' ? diningRes : contacts, activeTab)} className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#d4af37] hover:text-black transition-colors shadow-lg">
                 <Download size={16} /> Export CSV
              </button>
            )}
         </header>

         {/* TAB 1: OVERVIEW */}
         {activeTab === 'overview' && (
           <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <StatCard title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-[#d4af37]" />
                 <StatCard title="Bookings" value={stats.bookings} icon={Calendar} color="bg-zinc-900" dark />
                 <StatCard title="Dining" value={stats.dining} icon={Utensils} color="bg-orange-500" />
                 <StatCard title="Msgs" value={stats.contacts} icon={Mail} color="bg-blue-500" />
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm h-[350px]">
                 <h3 className="font-bold mb-4 text-xs uppercase tracking-wider text-zinc-400">Revenue Analytics</h3>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/><stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize:10}} />
                       <Tooltip contentStyle={{borderRadius:'8px', border:'none'}} />
                       <Area type="monotone" dataKey="value" stroke="#d4af37" fill="url(#colorVal)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
         )}

         {/* TAB 2: MASTER SCHEDULE (PREMIUM FEATURE) */}
         {activeTab === 'schedule' && (
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-zinc-100 bg-zinc-50/30">
                  <h3 className="font-bold text-lg">Upcoming Timeline</h3>
                  <p className="text-xs text-zinc-500">Merged view of room check-ins and dining reservations.</p>
               </div>
               <div className="divide-y divide-zinc-50">
                  {masterSchedule.length === 0 ? <div className="p-10 text-center text-zinc-400">No upcoming events.</div> : 
                    masterSchedule.map((item: any) => (
                      <div key={`${item.type}-${item.id}`} className="p-4 flex items-center gap-4 hover:bg-zinc-50/50 transition-colors">
                         {/* Date Badge */}
                         <div className="w-16 text-center shrink-0">
                            <span className="block text-xs font-bold text-zinc-400 uppercase">{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="block text-xl font-bold">{new Date(item.date).getDate()}</span>
                         </div>
                         
                         {/* Icon Badge */}
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'ROOM' ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'bg-orange-100 text-orange-600'}`}>
                            {item.type === 'ROOM' ? <Calendar size={18} /> : <Utensils size={18} />}
                         </div>

                         {/* Details */}
                         <div className="flex-1">
                            <h4 className="font-bold text-sm">{item.title}</h4>
                            <p className="text-xs text-zinc-500">{item.guest} • {item.detail}</p>
                         </div>

                         {/* Status */}
                         <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${item.type === 'ROOM' ? 'bg-zinc-100 text-zinc-600' : 'bg-orange-50 text-orange-600'}`}>
                            {item.type}
                         </span>
                      </div>
                    ))
                  }
               </div>
            </div>
         )}

         {/* TAB 3: BOOKINGS */}
         {activeTab === 'bookings' && (
             <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                {bookings.map((b: any) => (
                   <div key={b.id} className="p-4 border-b border-zinc-50 flex justify-between items-center hover:bg-zinc-50/50">
                      <div>
                         <p className="font-bold">{b.room_name}</p>
                         <p className="text-xs text-zinc-400">{new Date(b.created_at).toLocaleDateString()} • {b.profiles?.full_name}</p>
                      </div>
                      <div className="text-right">
                         <p className="font-bold text-[#d4af37]">₹{b.total_price}</p>
                         <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase font-bold">{b.status}</span>
                      </div>
                   </div>
                ))}
             </div>
         )}

         {/* TAB 4: DINING */}
         {activeTab === 'dining' && (
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
               {diningRes.map((d: any) => (
                   <div key={d.id} className="p-4 border-b border-zinc-50 flex justify-between items-center hover:bg-zinc-50/50">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500"><Utensils size={16} /></div>
                         <div>
                            <p className="font-bold">{d.name}</p>
                            <p className="text-xs text-zinc-400">{d.date} at {d.time} • {d.guests} Guests</p>
                         </div>
                      </div>
                      <a href={`mailto:${d.email}`} className="text-xs font-bold border border-zinc-200 px-3 py-1 rounded-lg hover:bg-black hover:text-white transition-colors">Reply</a>
                   </div>
               ))}
               {diningRes.length === 0 && <div className="p-8 text-center text-zinc-400">No dining reservations.</div>}
            </div>
         )}
         
         {/* TAB 5: CONTACTS */}
         {activeTab === 'contacts' && (
             <div className="grid gap-4">
                {contacts.map((c: any) => (
                   <div key={c.id} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="flex justify-between mb-2">
                         <h3 className="font-bold">{c.subject}</h3>
                         <span className="text-xs text-zinc-400">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-zinc-600 mb-4">{c.message}</p>
                      <div className="flex justify-between items-center border-t border-zinc-50 pt-4">
                         <span className="text-xs font-bold text-zinc-500">{c.full_name}</span>
                         <a href={`mailto:${c.email}`} className="text-xs font-bold text-[#d4af37] hover:underline">Reply</a>
                      </div>
                   </div>
                ))}
             </div>
         )}

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

export default AdminDashboard;