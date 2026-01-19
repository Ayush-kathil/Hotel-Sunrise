import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  LayoutDashboard, Calendar, DollarSign, LogOut, 
  Download, Lock, Utensils, Mail, Clock, Wifi, WifiOff 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- CONFIGURATION ---
const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || "0000";

// --- SMART CSV EXPORT FUNCTION ---
// Flattens nested Supabase data for clean Excel columns
const downloadCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return toast.error("No data to export");
  
  // 1. Flatten Data (Handle nested 'profiles.full_name')
  const flatData = data.map(row => {
    const newRow: any = { ...row };
    // If profiles object exists (from joins), flatten it
    if (newRow.profiles) {
      newRow.guest_name = newRow.profiles.full_name;
      newRow.guest_email = newRow.profiles.email;
      delete newRow.profiles; // Remove the object
    }
    return newRow;
  });

  // 2. Convert to CSV
  const headers = Object.keys(flatData[0]).join(",");
  const rows = flatData.map(row => 
    Object.values(row).map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(",")
  );
  
  const blob = new Blob([[headers, ...rows].join("\n")], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Sunrise_${filename}_Report_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  toast.success("Download Started");
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
  const [masterSchedule, setMasterSchedule] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // 1. DATA FETCHING
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("⚡ Fetching Premium Admin Data...");
        
        // A. Room Bookings (Join with Profiles to get names)
        const { data: bData } = await supabase
          .from('bookings')
          .select('*, profiles(full_name, email)')
          .order('check_in', { ascending: true });
        
        // B. Dining Reservations
        const { data: dData } = await supabase
          .from('dining_reservations')
          .select('*')
          .order('date', { ascending: true });
        
        // C. Contact Messages (Inquiries)
        const { data: cData } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });

        setIsConnected(true);

        const rawBookings = bData || [];
        const rawDining = dData || [];
        const rawContacts = cData || [];

        // --- MASTER SCHEDULE LOGIC ---
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

        // Revenue Logic
        const revenue = rawBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
        
        // Chart Logic
        const chartMap = new Map();
        rawBookings.forEach(b => {
          const date = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          chartMap.set(date, (chartMap.get(date) || 0) + Number(b.total_price));
        });
        const chartArr = Array.from(chartMap, ([name, value]) => ({ name, value })).reverse();

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

  // 2. SECURITY LOGIC
  const handlePasscode = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPass = [...passcode];
    newPass[index] = value;
    setPasscode(newPass);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
    
    if (newPass.join('').length === 4) {
      if (newPass.join('') === ADMIN_PASSCODE) {
        setIsLocked(false);
        toast.success("Verified");
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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 bg-[#d4af37] rounded-full mx-auto mb-8 flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.4)]">
          <Lock className="text-black" size={32} />
        </div>
        <h1 className="text-2xl font-serif font-bold text-white mb-2 tracking-wide">RESTRICTED ACCESS</h1>
        <p className="text-zinc-500 mb-8 text-xs uppercase tracking-widest">Enter Admin PIN</p>
        <div className="flex gap-4 justify-center">
          {passcode.map((digit, i) => (
            <input key={i} ref={el => inputRefs.current[i] = el} type="password" maxLength={1} value={digit}
              onChange={(e) => handlePasscode(i, e.target.value)}
              className="w-14 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-3xl font-bold text-[#d4af37] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all" />
          ))}
        </div>
      </div>
    </div>
  );

  // --- VIEW 2: DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-zinc-900">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-zinc-200 hidden md:flex flex-col p-6 fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 mb-12 px-2">
           <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-[#d4af37] font-bold text-xl shadow-lg">S</div>
           <div><h1 className="font-serif font-bold text-lg leading-none">SUNRISE</h1><p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase mt-1">Admin Console</p></div>
        </div>
        
        <nav className="space-y-2">
           <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
           <SidebarItem icon={Clock} label="Master Schedule" active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
           <div className="py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4">Database Management</div>
           <SidebarItem icon={Calendar} label="Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} count={stats.bookings} />
           <SidebarItem icon={Utensils} label="Dining" active={activeTab === 'dining'} onClick={() => setActiveTab('dining')} count={stats.dining} />
           <SidebarItem icon={Mail} label="Inquiries" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} count={stats.contacts} />
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100 space-y-3">
           <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold border ${isConnected ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700'}`}>
             {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />} {isConnected ? "Database Connected" : "Offline"}
           </div>
           <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-zinc-500 hover:bg-zinc-100 hover:text-black rounded-xl transition-colors">
             <LogOut size={16} /> Logout
           </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 md:ml-72 p-8 lg:p-12 overflow-y-auto h-screen scroll-smooth">
         <header className="flex justify-between items-end mb-10">
            <div>
               <h1 className="text-4xl font-serif font-bold capitalize text-zinc-900 mb-2">{activeTab.replace('_', ' ')}</h1>
               <p className="text-zinc-500 text-sm">Welcome back, Admin.</p>
            </div>
            {activeTab !== 'overview' && activeTab !== 'schedule' && (
              <button onClick={() => downloadCSV(activeTab === 'bookings' ? bookings : activeTab === 'dining' ? diningRes : contacts, activeTab)} 
                className="bg-black text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#d4af37] hover:text-black transition-all shadow-xl hover:shadow-[#d4af37]/20">
                 <Download size={16} /> Export CSV
              </button>
            )}
         </header>

         {/* TAB 1: OVERVIEW */}
         {activeTab === 'overview' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-[#d4af37]" />
                 <StatCard title="Active Bookings" value={stats.bookings} icon={Calendar} color="bg-zinc-900" dark />
                 <StatCard title="Dining Res." value={stats.dining} icon={Utensils} color="bg-orange-500" />
                 <StatCard title="New Inquiries" value={stats.contacts} icon={Mail} color="bg-blue-500" />
              </div>
              
              <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm h-[400px]">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-400">Revenue Trend</h3>
                    <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#d4af37]"></span>
                        <span className="text-xs text-zinc-500 font-bold">Income</span>
                    </div>
                 </div>
                 <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2}/><stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:11, fill:'#999'}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize:11, fill:'#999'}} tickFormatter={(val)=>`₹${val}`} />
                       <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}} />
                       <Area type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={3} fill="url(#colorVal)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
         )}

         {/* TAB 2: MASTER SCHEDULE */}
         {activeTab === 'schedule' && (
            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
               <div className="p-8 border-b border-zinc-50 bg-zinc-50/50 flex justify-between items-center">
                  <div>
                     <h3 className="font-bold text-lg">Timeline View</h3>
                     <p className="text-xs text-zinc-500 font-medium mt-1">Merged view of check-ins and dining.</p>
                  </div>
                  <Clock className="text-zinc-300" />
               </div>
               <div className="divide-y divide-zinc-50">
                  {masterSchedule.length === 0 ? <EmptyState msg="No upcoming events found." /> : 
                    masterSchedule.map((item: any) => (
                      <div key={`${item.type}-${item.id}`} className="p-5 flex items-center gap-6 hover:bg-zinc-50/50 transition-colors group">
                          <div className="w-16 text-center shrink-0">
                             <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                             <span className="block text-2xl font-serif font-bold text-zinc-800">{new Date(item.date).getDate()}</span>
                          </div>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${item.type === 'ROOM' ? 'bg-[#d4af37]/10 text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-white' : 'bg-orange-100 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'}`}>
                             {item.type === 'ROOM' ? <Calendar size={20} /> : <Utensils size={20} />}
                          </div>
                          <div className="flex-1">
                             <h4 className="font-bold text-base text-zinc-900">{item.title}</h4>
                             <p className="text-sm text-zinc-500 mt-0.5">{item.guest} <span className="text-zinc-300 mx-2">•</span> {item.detail}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${item.type === 'ROOM' ? 'bg-zinc-100 text-zinc-600' : 'bg-orange-50 text-orange-600'}`}>
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
             <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
                {bookings.map((b: any) => (
                   <div key={b.id} className="p-6 border-b border-zinc-50 flex justify-between items-center hover:bg-zinc-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 font-bold">
                            {b.profiles?.full_name?.charAt(0) || 'G'}
                         </div>
                         <div>
                            <p className="font-bold text-zinc-900">{b.room_name}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{new Date(b.created_at).toLocaleDateString()} • {b.profiles?.full_name}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="font-bold text-[#d4af37] text-lg">₹{b.total_price}</p>
                         <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md uppercase font-bold tracking-wide">{b.status}</span>
                      </div>
                   </div>
                ))}
                {bookings.length === 0 && <EmptyState msg="No bookings recorded yet." />}
             </div>
         )}

         {/* TAB 4: DINING */}
         {activeTab === 'dining' && (
            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
               {diningRes.map((d: any) => (
                   <div key={d.id} className="p-6 border-b border-zinc-50 flex justify-between items-center hover:bg-zinc-50/50 transition-colors">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500"><Utensils size={20} /></div>
                         <div>
                            <p className="font-bold text-lg">{d.name}</p>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                <span className="font-bold bg-zinc-100 px-2 py-0.5 rounded">{d.date}</span>
                                <span>at {d.time}</span>
                                <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                                <span>{d.guests} Guests</span>
                            </div>
                         </div>
                      </div>
                      <a href={`mailto:${d.email}`} className="text-xs font-bold border border-zinc-200 px-4 py-2 rounded-xl hover:bg-black hover:text-white transition-colors">Contact Guest</a>
                   </div>
               ))}
               {diningRes.length === 0 && <EmptyState msg="No dining reservations found." />}
            </div>
         )}
         
         {/* TAB 5: INQUIRIES (CONTACTS) */}
         {activeTab === 'contacts' && (
             <div className="grid gap-4 animate-in fade-in duration-500">
                {contacts.map((c: any) => {
                   // SAFETY CHECK: Prevent crash if name is missing
                   const safeName = c.full_name || c.name || "Guest"; 
                   const safeInitial = safeName.charAt(0).toUpperCase();

                   return (
                     <div key={c.id} className="bg-white p-6 rounded-[1.5rem] border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between mb-3">
                           <h3 className="font-bold text-lg text-zinc-900">{c.subject || 'No Subject'}</h3>
                           <span className="text-xs font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded-lg">
                             {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Date N/A'}
                           </span>
                        </div>
                        <p className="text-sm text-zinc-600 mb-6 leading-relaxed bg-zinc-50/50 p-4 rounded-xl">
                          {c.message || 'No message content.'}
                        </p>
                        <div className="flex justify-between items-center pt-2">
                           <div className="flex items-center gap-2">
                              {/* FIXED: Uses safeInitial to prevent white screen */}
                              <div className="w-8 h-8 rounded-full bg-[#d4af37] text-black flex items-center justify-center font-bold text-xs">
                                {safeInitial}
                              </div>
                              <span className="text-sm font-bold text-zinc-600">{safeName}</span>
                           </div>
                           <a href={`mailto:${c.email}`} className="text-xs font-bold text-[#d4af37] hover:text-black flex items-center gap-1 transition-colors">
                              Reply via Email <Mail size={12} />
                           </a>
                        </div>
                     </div>
                   );
                })}
                {contacts.length === 0 && <EmptyState msg="Inbox is empty." />}
             </div>
         )}
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const SidebarItem = ({ icon: Icon, label, active, onClick, count }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl mb-1 transition-all text-sm font-bold ${active ? 'bg-zinc-100 text-black shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'}`}>
    <div className="flex items-center gap-3"><Icon size={18} /> {label}</div>
    {count > 0 && <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600'}`}>{count}</span>}
  </button>
);

const StatCard = ({ title, value, icon: Icon, color, dark }: any) => (
   <div className={`p-6 rounded-[1.5rem] relative overflow-hidden transition-transform hover:-translate-y-1 ${dark ? 'bg-zinc-900 text-white shadow-xl' : 'bg-white text-zinc-900 border border-zinc-100 shadow-sm'}`}>
      <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${color} opacity-10 blur-3xl`} />
      <div className="flex justify-between items-start mb-6">
         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${dark ? 'bg-white/10' : 'bg-zinc-50'}`}><Icon size={20} /></div>
      </div>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60`}>{title}</p>
      <h3 className="text-3xl font-serif font-bold">{value}</h3>
   </div>
);

const EmptyState = ({ msg }: { msg: string }) => (
  <div className="p-12 text-center flex flex-col items-center justify-center opacity-50">
      <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4"><LogOut className="rotate-45" /></div>
      <p className="text-zinc-500 font-medium">{msg}</p>
  </div>
);

export default AdminDashboard;