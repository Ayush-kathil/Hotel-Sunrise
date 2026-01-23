import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  LayoutGrid, Users, Package, FileText, Star, DollarSign, Receipt, Settings, 
  HelpCircle, LogOut, Search, Bell, Moon, Sun, ChevronLeft, ChevronRight,
  BedDouble, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(true);
  
  // Data States
  const [stats, setStats] = useState({ 
    newBookings: 0, availableRooms: 0, reservations: 0, checkIns: 0, checkOuts: 0 
  });
  const [rooms, setRooms] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  // FETCH DATA FROM SUPABASE
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Rooms
        const { data: rData, error: rError } = await supabase.from('rooms').select('*').order('room_number', { ascending: true });
        if (rError) console.error('Rooms fetch error:', rError);
        if (rData) {
          setRooms(rData);
          setStats(prev => ({
            ...prev,
            availableRooms: rData.filter(r => r.status === 'available').length,
          }));
        }
        
        // 2. Reservations (Bookings)
        const { data: bData, error: bError } = await supabase.from('bookings').select('*, profiles(full_name, phone)').order('created_at', { ascending: false });
        if (bError) console.error('Bookings fetch error:', bError);
        if (bData) {
          setReservations(bData);
          const today = new Date().toDateString();
          setStats(prev => ({
            ...prev,
            newBookings: bData.filter(b => new Date(b.created_at).toDateString() === today).length,
            reservations: bData.length,
            checkIns: bData.filter(b => new Date(b.check_in).toDateString() === today).length,
            checkOuts: bData.filter(b => new Date(b.check_out).toDateString() === today).length,
          }));
        }

        // 3. Notifications
        const { data: nData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (nData) setNotifications(nData);

      } catch (err) {
        console.error('Data fetch error:', err);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Calendar Helpers
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="flex h-screen bg-[#0D0D0D] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-60 bg-[#121212] flex flex-col border-r border-white/5 shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-bold tracking-wider">
            <span className="text-[#6366F1]">bl</span><span className="text-white/30">o</span>ok
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* SUMMARY */}
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-3">Summary</p>
            <div className="space-y-1">
              <NavItem icon={LayoutGrid} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <NavItem icon={Users} label="Guests info" active={activeTab === 'guests'} onClick={() => setActiveTab('guests')} />
              <NavItem icon={Users} label="Employees" active={activeTab === 'employees'} onClick={() => setActiveTab('employees')} />
              <NavItem icon={Package} label="Inventory" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
            </div>
          </div>

          {/* FEEDBACKS */}
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-3">Feedbacks</p>
            <div className="space-y-1">
              <NavItem icon={FileText} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
              <NavItem icon={Star} label="Reviews" active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
            </div>
          </div>

          {/* CASHFLOW */}
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-3">Cashflow</p>
            <div className="space-y-1">
              <NavItem icon={DollarSign} label="Finances" active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
              <NavItem icon={Receipt} label="Transactions" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
            </div>
          </div>

          {/* OTHERS */}
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-3">Others</p>
            <div className="space-y-1">
              <NavItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
              <NavItem icon={HelpCircle} label="Help & Support" active={activeTab === 'help'} onClick={() => setActiveTab('help')} />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
                <LogOut size={18} /> Log out
              </button>
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Admin User</p>
              <p className="text-[10px] text-white/40 truncate">View Profile &gt;</p>
            </div>
          </div>
          
          {/* Theme Toggle */}
          <div className="flex items-center gap-2 mt-4 p-1 bg-white/5 rounded-full">
            <button onClick={() => setDarkMode(true)} className={`flex-1 p-2 rounded-full flex justify-center ${darkMode ? 'bg-[#6366F1] text-white' : 'text-white/40'}`}>
              <Moon size={16} />
            </button>
            <button onClick={() => setDarkMode(false)} className={`flex-1 p-2 rounded-full flex justify-center ${!darkMode ? 'bg-[#6366F1] text-white' : 'text-white/40'}`}>
              <Sun size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 shrink-0">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text" 
              placeholder="Search for anything" 
              className="bg-[#1A1A1A] text-white pl-12 pr-4 py-3 rounded-full text-sm w-80 border border-white/5 placeholder:text-white/30 focus:outline-none focus:border-[#6366F1]/50"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <Settings size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#6366F1] rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500" />
              <div>
                <p className="text-sm font-bold">My profile</p>
                <p className="text-[10px] text-white/40">admin@hotel.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* VIEW: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Date Selector & Stats */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm font-medium">Today</span>
                <ChevronRight size={14} className="text-white/40" />
              </div>

              <div className="grid grid-cols-5 gap-4 mb-6">
                <StatCard icon={BedDouble} label="New booking" value={stats.newBookings} color="bg-[#6366F1]" />
                <StatCard icon={Package} label="Available rooms" value={stats.availableRooms} color="bg-[#22C55E]" />
                <StatCard icon={Calendar} label="Reservations" value={stats.reservations} color="bg-[#14B8A6]" />
                <StatCard icon={ArrowUpRight} label="Check ins" value={stats.checkIns} color="bg-[#F97316]" />
                <StatCard icon={ArrowDownRight} label="Check outs" value={stats.checkOuts} color="bg-[#3B82F6]" />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-4 bg-[#1A1A1A] rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Expenses</h3>
                    <select className="bg-[#252525] text-sm px-3 py-1.5 rounded-lg border border-white/10 text-white/70">
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-full border-[12px] border-[#6366F1] relative">
                      <div className="absolute inset-0 rounded-full border-[12px] border-transparent border-t-[#22C55E] border-r-[#22C55E] rotate-[100deg]" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#6366F1]" /> Utilities <span className="text-white/50 ml-auto">29%</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#22C55E]" /> Inventory <span className="text-white/50 ml-auto">24%</span></div>
                    </div>
                  </div>
                </div>

                <div className="col-span-8 bg-[#1A1A1A] rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Reservation Analytics</h3>
                  </div>
                  <div className="h-48 flex items-end gap-2 pt-8">
                     {[35, 45, 40, 60, 80, 70, 90, 75, 85, 65, 50, 55].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gradient-to-t from-[#6366F1]/20 to-[#6366F1] rounded-t" style={{ height: `${h}%` }} />
                        <span className="text-[10px] text-white/30">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 bg-[#1A1A1A] rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Recent Bookings</h3>
                  </div>
                  <div className="space-y-4">
                    {reservations.slice(0, 5).map((res) => (
                      <div key={res.id} className="flex gap-4 p-4 bg-[#252525] rounded-xl items-center hover:bg-[#2a2a2a] transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 shrink-0 flex items-center justify-center text-xs font-bold">{res.profiles?.full_name?.[0]}</div>
                        <div className="flex-1 min-w-0 grid grid-cols-4 gap-4 items-center">
                          <div>
                            <h4 className="font-bold text-sm text-white">{res.profiles?.full_name || 'Guest User'}</h4>
                            <p className="text-[10px] text-white/40">{res.mobile_number || 'No Phone'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Room</p>
                            <p className="text-sm font-bold">{res.room_number || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Check In</p>
                            <p className="text-sm font-bold">{new Date(res.check_in).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                             <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold">Paid</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VIEW: GUESTS (BOOKINGS) */}
          {activeTab === 'guests' && (
             <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                   <h2 className="text-xl font-bold">All Reservations</h2>
                   <div className="flex gap-2">
                      <button className="px-4 py-2 bg-[#6366F1] text-sm font-bold rounded-lg hover:bg-[#5254cf] transition-colors">Export CSV</button>
                   </div>
                </div>
                <table className="w-full text-left text-sm">
                   <thead className="text-white/40 uppercase text-[10px] tracking-widest bg-[#202020]">
                      <tr>
                         <th className="p-4 pl-6">Guest</th>
                         <th className="p-4">Contact</th>
                         <th className="p-4">Room</th>
                         <th className="p-4">Check-in</th>
                         <th className="p-4">Nights</th>
                         <th className="p-4">Amount</th>
                         <th className="p-4 text-right pr-6">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {reservations.map(res => (
                         <tr key={res.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 pl-6 font-bold">{res.profiles?.full_name || 'Guest'}</td>
                            <td className="p-4 text-white/60">{res.mobile_number || '-'}</td>
                            <td className="p-4"><span className="bg-white/10 px-2 py-1 rounded text-xs font-mono">{res.room_number}</span></td>
                            <td className="p-4 text-white/60">{new Date(res.check_in).toLocaleDateString()}</td>
                            <td className="p-4">{res.nights}</td>
                            <td className="p-4 font-mono">₹{res.total_price?.toLocaleString()}</td>
                            <td className="p-4 text-right pr-6">
                               <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold uppercase tracking-wider">Confirmed</span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}

          {/* VIEW: INVENTORY (ROOMS) */}
          {activeTab === 'inventory' && (
             <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                   <h2 className="text-xl font-bold">Room Inventory</h2>
                </div>
                <div className="grid grid-cols-4 lg:grid-cols-6 gap-4 p-6">
                   {rooms.map(room => (
                      <div key={room.id} className="bg-[#252525] p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center group hover:border-[#6366F1]/50 transition-colors">
                         <span className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                            room.status === 'available' ? 'text-green-500' : 
                            room.status === 'occupied' ? 'text-red-500' : 'text-blue-500'
                         }`}>{room.status}</span>
                         <h3 className="text-2xl font-bold mb-1">{room.room_number}</h3>
                         <p className="text-[10px] text-white/40 uppercase truncate w-full">{room.category}</p>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* VIEW: REPORTS (NOTIFICATIONS) */}
          {activeTab === 'reports' && (
             <div className="grid lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1 bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 h-fit">
                 <h2 className="text-xl font-bold mb-4">Post Update</h2>
                 <form onSubmit={async (e: any) => {
                    e.preventDefault();
                    const title = e.target.title.value;
                    const message = e.target.message.value;
                    const type = e.target.type.value;
                    if(!title || !message) return;
                    
                    const { error } = await supabase.from('notifications').insert([{ title, message, type }]);
                    if(!error) {
                       toast.success('Notification posted');
                       e.target.reset();
                       // simplified refresh
                       window.location.reload();
                    } else {
                       toast.error(error.message);
                    }
                 }} className="space-y-4">
                    <div>
                       <label className="text-xs font-bold text-white/50 uppercase">Title</label>
                       <input name="title" className="w-full bg-[#252525] p-3 rounded-xl border border-white/10 text-white mt-1 outline-none focus:border-[#6366F1]" placeholder="e.g. Summer Sale" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-white/50 uppercase">Type</label>
                       <select name="type" className="w-full bg-[#252525] p-3 rounded-xl border border-white/10 text-white mt-1 outline-none">
                          <option value="offer">Special Offer</option>
                          <option value="news">News</option>
                          <option value="alert">Alert</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-white/50 uppercase">Message</label>
                       <textarea name="message" rows={4} className="w-full bg-[#252525] p-3 rounded-xl border border-white/10 text-white mt-1 outline-none focus:border-[#6366F1]" placeholder="Enter announcement..."></textarea>
                    </div>
                    <button className="w-full bg-[#6366F1] text-white font-bold py-3 rounded-xl hover:bg-[#5254cf] transition-colors">Post Notification</button>
                 </form>
               </div>

               <div className="lg:col-span-2 space-y-4">
                 {notifications.map(n => (
                    <div key={n.id} className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 flex justify-between items-start group hover:border-white/10 transition-colors">
                       <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                             n.type === 'offer' ? 'bg-orange-500/20 text-orange-500' :
                             n.type === 'alert' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            <Bell size={20} />
                          </div>
                          <div>
                             <h4 className="font-bold text-lg mb-1">{n.title}</h4>
                             <p className="text-white/60 text-sm mb-2">{n.message}</p>
                             <span className="text-[10px] uppercase font-bold text-white/30">{new Date(n.created_at).toLocaleString()}</span>
                          </div>
                       </div>
                       <button onClick={async () => {
                          const { error } = await supabase.from('notifications').delete().eq('id', n.id);
                          if(!error) {
                             toast.success('Deleted');
                             window.location.reload();
                          }
                       }} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                          <LogOut size={18} className="rotate-180" /> 
                       </button>
                    </div>
                 ))}
                 {notifications.length === 0 && <div className="text-center p-8 text-white/30 italic">No active notifications</div>}
               </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

// --- SUB COMPONENTS ---

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active 
        ? 'bg-[#6366F1] text-white' 
        : 'text-white/50 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={18} /> {label}
  </button>
);

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className={`${color} rounded-2xl p-5 text-white`}>
    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
      <Icon size={20} />
    </div>
    <p className="text-sm opacity-80 mb-1">{label}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;