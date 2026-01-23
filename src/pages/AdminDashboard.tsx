import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  LayoutGrid, Users, Package, FileText, Star, DollarSign, Receipt, Settings, 
  HelpCircle, LogOut, Search, Bell, Moon, Sun, ChevronRight,
  BedDouble, Calendar, ArrowUpRight, ArrowDownRight, Megaphone
} from 'lucide-react';
import { toast } from 'sonner';

// --- TYPES (For TypeScript safety) ---
interface Room {
  id: number;
  room_number: string;
  category: string;
  status: 'available' | 'occupied' | 'maintenance';
}

interface Reservation {
  id: number;
  room_number: string;
  check_in: string;
  check_out: string;
  total_price: number;
  created_at: string;
  profiles: {
    full_name: string;
    mobile_number: string;
  } | null; // Handle case where profile might be missing
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'offer' | 'news' | 'alert';
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  // Data States
  const [stats, setStats] = useState({ 
    newBookings: 0, availableRooms: 0, reservations: 0, checkIns: 0, checkOuts: 0 
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // FETCH DATA FROM SUPABASE
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Rooms
      const { data: rData, error: rError } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number', { ascending: true });
      
      if (rError) throw rError;

      // 2. Fetch Reservations (Joined with Profiles)
      const { data: bData, error: bError } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles (full_name, mobile_number)
        `)
        .order('created_at', { ascending: false });

      if (bError) throw bError;

      // 3. Fetch Notifications (Updates)
      const { data: nData, error: nError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (nError) throw nError;

      // SET STATE
      if (rData) {
        setRooms(rData as Room[]);
        setStats(prev => ({
          ...prev,
          availableRooms: rData.filter((r: any) => r.status === 'available').length,
        }));
      }

      if (bData) {
        setReservations(bData as any); // Cast to any to bypass strict join type checks if needed
        const today = new Date().toDateString();
        
        setStats(prev => ({
          ...prev,
          reservations: bData.length,
          newBookings: bData.filter((b: any) => new Date(b.created_at).toDateString() === today).length,
          checkIns: bData.filter((b: any) => new Date(b.check_in).toDateString() === today).length,
          checkOuts: bData.filter((b: any) => new Date(b.check_out).toDateString() === today).length,
        }));
      }

      if (nData) setNotifications(nData as Notification[]);

    } catch (err: any) {
      console.error('Data fetch error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS ---

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error('Error logging out');
    else {
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  const handlePostNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;
    const type = formData.get('type') as string;

    if (!title || !message) return toast.warning('Please fill all fields');

    const { error } = await supabase
      .from('notifications')
      .insert([{ title, message, type, active: true }]);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Update pushed to website!');
      (e.target as HTMLFormElement).reset();
      fetchData(); // Refresh list
    }
  };

  const handleDeleteNotification = async (id: number) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Notification removed');
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // --- RENDER ---
  return (
    <div className={`flex h-screen font-sans overflow-hidden ${darkMode ? 'bg-[#0D0D0D] text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* SIDEBAR */}
      <aside className={`w-60 flex flex-col border-r shrink-0 ${darkMode ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-200'}`}>
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-bold tracking-wider">
            <span className="text-[#6366F1]">bl</span><span className="opacity-30">o</span>ok
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-3 px-3">Summary</p>
            <div className="space-y-1">
              <NavItem icon={LayoutGrid} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} darkMode={darkMode} />
              <NavItem icon={Users} label="Guests info" active={activeTab === 'guests'} onClick={() => setActiveTab('guests')} darkMode={darkMode} />
              <NavItem icon={Package} label="Inventory" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} darkMode={darkMode} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-3 px-3">Website Control</p>
            <div className="space-y-1">
              <NavItem icon={Megaphone} label="Push Updates" active={activeTab === 'updates'} onClick={() => setActiveTab('updates')} darkMode={darkMode} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-3 px-3">Others</p>
            <div className="space-y-1">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
                <LogOut size={18} /> Log out
              </button>
            </div>
          </div>
        </nav>

        {/* Theme Toggle in Sidebar Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full">
            <button onClick={() => setDarkMode(true)} className={`flex-1 p-2 rounded-full flex justify-center ${darkMode ? 'bg-[#6366F1] text-white' : 'opacity-40'}`}>
              <Moon size={16} />
            </button>
            <button onClick={() => setDarkMode(false)} className={`flex-1 p-2 rounded-full flex justify-center ${!darkMode ? 'bg-[#6366F1] text-white' : 'opacity-40'}`}>
              <Sun size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`flex items-center justify-between px-8 py-4 border-b shrink-0 ${darkMode ? 'border-white/5' : 'bg-white border-gray-200'}`}>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
            <input 
              type="text" 
              placeholder="Search data..." 
              className={`pl-12 pr-4 py-3 rounded-full text-sm w-80 border placeholder:opacity-30 focus:outline-none focus:border-[#6366F1]/50 ${darkMode ? 'bg-[#1A1A1A] border-white/5 text-white' : 'bg-gray-100 border-gray-200 text-black'}`}
            />
          </div>
          
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500" />
            <div>
              <p className="text-sm font-bold">Admin</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {loading && <div className="text-center py-10 opacity-50">Loading Dashboard Data...</div>}

          {/* 1. OVERVIEW TAB */}
          {!loading && activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <StatCard icon={BedDouble} label="New booking" value={stats.newBookings} color="bg-[#6366F1]" />
                <StatCard icon={Package} label="Available" value={stats.availableRooms} color="bg-[#22C55E]" />
                <StatCard icon={Calendar} label="Total Resv." value={stats.reservations} color="bg-[#14B8A6]" />
                <StatCard icon={ArrowUpRight} label="Check Ins" value={stats.checkIns} color="bg-[#F97316]" />
                <StatCard icon={ArrowDownRight} label="Check Outs" value={stats.checkOuts} color="bg-[#3B82F6]" />
              </div>

              {/* Recent Bookings List */}
              <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                <h3 className="font-bold text-lg mb-6">Recent Bookings</h3>
                <div className="space-y-4">
                  {reservations.slice(0, 5).map((res) => (
                    <div key={res.id} className={`flex gap-4 p-4 rounded-xl items-center transition-colors ${darkMode ? 'bg-[#252525] hover:bg-[#2a2a2a]' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 shrink-0 flex items-center justify-center text-xs font-bold text-white">
                        {res.profiles?.full_name?.[0] || 'G'}
                      </div>
                      <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <h4 className="font-bold text-sm">{res.profiles?.full_name || 'Guest User'}</h4>
                          <p className="text-[10px] opacity-40">{res.profiles?.mobile_number || 'No Phone'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] opacity-40 uppercase tracking-widest">Room</p>
                          <p className="text-sm font-bold">{res.room_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] opacity-40 uppercase tracking-widest">Check In</p>
                          <p className="text-sm font-bold">{new Date(res.check_in).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                           <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold">Paid</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {reservations.length === 0 && <p className="text-center opacity-40">No bookings yet.</p>}
                </div>
              </div>
            </>
          )}

          {/* 2. GUESTS / ALL RESERVATIONS TAB */}
          {!loading && activeTab === 'guests' && (
             <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                   <h2 className="text-xl font-bold">All Reservations</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className={`uppercase text-[10px] tracking-widest ${darkMode ? 'bg-[#202020] text-white/40' : 'bg-gray-100 text-gray-500'}`}>
                      <tr>
                          <th className="p-4 pl-6">Guest</th>
                          <th className="p-4">Room</th>
                          <th className="p-4">Check-in</th>
                          <th className="p-4">Check-out</th>
                          <th className="p-4">Total</th>
                          <th className="p-4 text-right pr-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-200'}`}>
                      {reservations.map(res => (
                          <tr key={res.id} className="hover:opacity-80 transition-opacity">
                            <td className="p-4 pl-6 font-bold">{res.profiles?.full_name || 'Guest'}</td>
                            <td className="p-4"><span className="bg-opacity-10 bg-white px-2 py-1 rounded text-xs font-mono">{res.room_number}</span></td>
                            <td className="p-4 opacity-60">{new Date(res.check_in).toLocaleDateString()}</td>
                            <td className="p-4 opacity-60">{new Date(res.check_out).toLocaleDateString()}</td>
                            <td className="p-4 font-mono">₹{res.total_price?.toLocaleString()}</td>
                            <td className="p-4 text-right pr-6">
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold uppercase tracking-wider">Confirmed</span>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          )}

          {/* 3. INVENTORY / ROOMS TAB */}
          {!loading && activeTab === 'inventory' && (
             <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                <div className="p-6 border-b border-white/5">
                   <h2 className="text-xl font-bold">Room Inventory</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
                   {rooms.map(room => (
                      <div key={room.id} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-colors ${darkMode ? 'bg-[#252525] border-white/5 hover:border-[#6366F1]/50' : 'bg-gray-50 border-gray-200 hover:border-[#6366F1]'}`}>
                         <span className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                            room.status === 'available' ? 'text-green-500' : 
                            room.status === 'occupied' ? 'text-red-500' : 'text-blue-500'
                         }`}>{room.status}</span>
                         <h3 className="text-2xl font-bold mb-1">{room.room_number}</h3>
                         <p className="text-[10px] opacity-40 uppercase truncate w-full">{room.category}</p>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* 4. UPDATES / NOTIFICATIONS TAB (Push to Website) */}
          {!loading && activeTab === 'updates' && (
             <div className="grid lg:grid-cols-3 gap-8">
               {/* Form Section */}
               <div className={`lg:col-span-1 p-6 rounded-2xl border h-fit ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                 <h2 className="text-xl font-bold mb-4">Push Website Update</h2>
                 <p className="text-xs opacity-50 mb-4">This will appear on the user homepage immediately.</p>
                 
                 <form onSubmit={handlePostNotification} className="space-y-4">
                   <div>
                      <label className="text-xs font-bold opacity-50 uppercase">Title</label>
                      <input name="title" required className={`w-full p-3 rounded-xl border mt-1 outline-none focus:border-[#6366F1] ${darkMode ? 'bg-[#252525] border-white/10 text-white' : 'bg-white border-gray-300'}`} placeholder="e.g. Summer Sale" />
                   </div>
                   <div>
                      <label className="text-xs font-bold opacity-50 uppercase">Type</label>
                      <select name="type" className={`w-full p-3 rounded-xl border mt-1 outline-none ${darkMode ? 'bg-[#252525] border-white/10 text-white' : 'bg-white border-gray-300'}`}>
                         <option value="offer">Special Offer (Orange)</option>
                         <option value="news">News / Update (Blue)</option>
                         <option value="alert">Alert / Warning (Red)</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-xs font-bold opacity-50 uppercase">Message</label>
                      <textarea name="message" required rows={4} className={`w-full p-3 rounded-xl border mt-1 outline-none focus:border-[#6366F1] ${darkMode ? 'bg-[#252525] border-white/10 text-white' : 'bg-white border-gray-300'}`} placeholder="Enter announcement content..."></textarea>
                   </div>
                   <button type="submit" className="w-full bg-[#6366F1] text-white font-bold py-3 rounded-xl hover:bg-[#5254cf] transition-colors">
                     Push Notification
                   </button>
                 </form>
               </div>

               {/* List Section */}
               <div className="lg:col-span-2 space-y-4">
                 <h2 className="text-xl font-bold">Active Website Notifications</h2>
                 {notifications.map(n => (
                    <div key={n.id} className={`p-6 rounded-2xl border flex justify-between items-start ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                       <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                             n.type === 'offer' ? 'bg-orange-500/20 text-orange-500' :
                             n.type === 'alert' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                          }`}>
                             <Megaphone size={20} />
                          </div>
                          <div>
                             <h4 className="font-bold text-lg mb-1">{n.title}</h4>
                             <p className="opacity-60 text-sm mb-2">{n.message}</p>
                             <span className="text-[10px] uppercase font-bold opacity-30">{new Date(n.created_at).toLocaleString()}</span>
                          </div>
                       </div>
                       <button onClick={() => handleDeleteNotification(n.id)} className="p-2 opacity-20 hover:opacity-100 hover:text-red-500 transition-all">
                          <LogOut size={18} className="rotate-180" /> 
                       </button>
                    </div>
                 ))}
                 {notifications.length === 0 && <div className="text-center p-8 opacity-30 italic border-2 border-dashed rounded-2xl">No active notifications on website</div>}
               </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

// --- SUB COMPONENTS ---

const NavItem = ({ icon: Icon, label, active, onClick, darkMode }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active 
        ? 'bg-[#6366F1] text-white' 
        : `${darkMode ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`
    }`}
  >
    <Icon size={18} /> {label}
  </button>
);

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className={`${color} rounded-2xl p-5 text-white shadow-lg`}>
    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
      <Icon size={20} />
    </div>
    <p className="text-sm opacity-80 mb-1">{label}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;