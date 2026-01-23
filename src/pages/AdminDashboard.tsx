import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  LayoutGrid, Package, Calendar, Megaphone,
  Utensils, Mail, UserCheck, Brush, PartyPopper,
  LogOut, Moon, Sun, BedDouble, Lock
} from 'lucide-react';
import { toast } from 'sonner';

// --- TYPES ---
interface Room { id: number; room_number: string; category: string; status: 'available' | 'occupied' | 'maintenance'; price: number; }
interface Reservation { id: number; room_number: string; check_in: string; check_out: string; total_price: number; created_at: string; profiles: { full_name: string; mobile_number: string; } | null; }
interface Notification { id: number; title: string; message: string; type: 'offer' | 'news' | 'alert'; created_at: string; }
interface DiningReservation { id: number; name: string; date: string; time: string; guests: number; status: string; }
interface EventInquiry { id: number; name: string; email: string; event_type: string; date: string; guests: number; status: string; }
interface ContactMessage { id: number; name: string; email: string; subject: string; message: string; created_at: string; }
interface HousekeepingTask { id: number; room_number: string; status: 'clean' | 'dirty' | 'cleaning'; assigned_to: string; }
interface Guest { id: number; full_name: string; email: string; mobile_number: string; }

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // AUTH STATE
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('sunrise_admin_auth') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // DATA STATES
  const [stats, setStats] = useState({ newBookings: 0, availableRooms: 0, reservations: 0, checkIns: 0, checkOuts: 0 });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dining, setDining] = useState<DiningReservation[]>([]);
  const [events, setEvents] = useState<EventInquiry[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [housekeeping, setHousekeeping] = useState<HousekeepingTask[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  // FETCH DATA - Each query wrapped separately to prevent one failure from blocking others
  const fetchData = async () => {
    if (!isAuthenticated) return;
    
    try {
      // Fetch rooms
      const { data: rData, error: rError } = await supabase.from('rooms').select('*').order('room_number');
      if (rError) console.error('Rooms fetch error:', rError);
      else if (rData) {
        setRooms(rData as Room[]);
        setStats(prev => ({ ...prev, availableRooms: rData.filter(r => r.status === 'available').length }));
      }

      // Fetch bookings
      const { data: bData, error: bError } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (bError) console.error('Bookings fetch error:', bError);
      
      // Fetch profiles for joining
      const { data: pData, error: pError } = await supabase.from('profiles').select('id, full_name, mobile_number');
      if (pError) console.error('Profiles fetch error:', pError);
      
      if (bData) {
        const joinedBookings = bData.map((b: any) => {
          const profile = pData?.find((p: any) => p.id === b.user_id);
          return {
            ...b,
            profiles: profile 
              ? { full_name: profile.full_name, mobile_number: profile.mobile_number || b.mobile_number } 
              : { full_name: b.guest_name || 'Guest', mobile_number: b.mobile_number }
          };
        });
        setReservations(joinedBookings);
        
        const today = new Date().toDateString();
        setStats(prev => ({
          ...prev,
          reservations: bData.length,
          newBookings: bData.filter((b: any) => new Date(b.created_at).toDateString() === today).length,
          checkIns: bData.filter((b: any) => new Date(b.check_in).toDateString() === today).length,
          checkOuts: bData.filter((b: any) => new Date(b.check_out).toDateString() === today).length,
        }));
      }

      // Fetch notifications
      const { data: nData, error: nError } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (nError) console.error('Notifications fetch error:', nError);
      else if (nData) setNotifications(nData as Notification[]);

      // Fetch dining reservations
      const { data: dData, error: dError } = await supabase.from('dining_reservations').select('*').order('date', { ascending: true });
      if (dError) console.error('Dining fetch error:', dError);
      else if (dData) setDining(dData as DiningReservation[]);

      // Fetch event inquiries
      const { data: eData, error: eError } = await supabase.from('event_inquiries').select('*').order('created_at', { ascending: false });
      if (eError) console.error('Events fetch error:', eError);
      else if (eData) setEvents(eData as EventInquiry[]);

      // Fetch contact messages
      const { data: mData, error: mError } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (mError) console.error('Messages fetch error:', mError);
      else if (mData) setMessages(mData as ContactMessage[]);

      // Fetch housekeeping
      const { data: hData, error: hError } = await supabase.from('housekeeping').select('*').order('room_number');
      if (hError) console.error('Housekeeping fetch error:', hError);
      else if (hData) setHousekeeping(hData as HousekeepingTask[]);

      // Fetch guests - try lowercase first, then uppercase if it fails
      let gData = null;
      const { data: gDataLower, error: gErrorLower } = await supabase.from('guests').select('*');
      if (gErrorLower) {
        // Try uppercase table name
        const { data: gDataUpper, error: gErrorUpper } = await supabase.from('Guest').select('*');
        if (!gErrorUpper && gDataUpper) gData = gDataUpper;
      } else {
        gData = gDataLower;
      }
      if (gData) setGuests(gData as Guest[]);

    } catch (err: any) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // REALTIME SUBSCRIPTIONS
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase.channel('admin-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchData(); // Auto-refresh on any DB change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  // AUTH HANDLER
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const envPasscode = import.meta.env.VITE_ADMIN_PASSCODE;
    
    if (passcodeInput === envPasscode) {
      setIsAuthenticated(true);
      sessionStorage.setItem('sunrise_admin_auth', 'true');
      setAuthError(false);
      toast.success('Welcome back, Admin');
    } else {
      setAuthError(true);
      toast.error('Access Denied');
      setPasscodeInput('');
    }
  };

  // ACTIONS
  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('sunrise_admin_auth');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handlePostNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;
    const type = formData.get('type') as string;

    if (!title || !message) return toast.warning('Please fill all fields');

    const { error } = await supabase.from('notifications').insert([{ title, message, type, is_active: true }]);
    if (error) toast.error(error.message);
    else {
      toast.success('Update pushed!');
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      toast.success('Removed');
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch(err: any) {
      toast.error('Delete failed', { description: err.message });
    }
  };

  // --- RENDER: AUTH SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center justify-center h-screen w-full font-sans ${darkMode ? 'bg-[#0D0D0D] text-white' : 'bg-gray-100'}`}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-sm"></div>
        <div className={`relative z-10 p-8 rounded-3xl border backdrop-blur-xl shadow-2xl w-full max-w-md ${darkMode ? 'bg-black/40 border-white/10' : 'bg-white/40 border-white/50'}`}>
           <div className="flex flex-col items-center mb-8">
             <div className="w-16 h-16 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white font-serif italic text-2xl shadow-[0_0_40px_-10px_#6366F1]">S</div>
             <h1 className="mt-6 text-2xl font-bold tracking-wider">Admin Portal</h1>
             <p className="opacity-50 text-sm">Sunrise Hotel & Resort</p>
           </div>
           <form onSubmit={handleAuth} className="space-y-4">
             <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold tracking-widest opacity-50 ml-1">Passcode</label>
                 <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" size={16} />
                   <input 
                     type="password" 
                     autoFocus
                     value={passcodeInput}
                     onChange={(e) => { setPasscodeInput(e.target.value); setAuthError(false); }}
                     className={`w-full bg-black/20 border text-center font-mono text-lg tracking-[0.5em] rounded-xl py-4 px-10 outline-none transition-all ${authError ? 'border-red-500/50 text-red-500' : 'border-white/10 focus:border-[#6366F1]/50'}`}
                     placeholder="••••••"
                   />
                 </div>
                 {authError && <p className="text-center text-red-500 text-xs font-bold animate-pulse">Invalid Passcode</p>}
             </div>
             <button className="w-full bg-[#6366F1] hover:bg-[#5558DD] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#6366F1]/20 transition-all hover:scale-[1.02] active:scale-[0.98]">Access Dashboard</button>
           </form>
        </div>
      </div>
    );
  }

  // --- RENDER: DASHBOARD ---
  return (
    <div className={`flex h-screen font-sans ${darkMode ? 'bg-[#0D0D0D] text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* SIDEBAR */}
      <aside className={`w-64 h-screen flex flex-col border-r shrink-0 z-20 ${darkMode ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-200'}`}>
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-bold tracking-wider flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center text-white font-serif italic">S</span>
            <span>Sunrise<span className="opacity-30">Admin</span></span>
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-8 overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-3 px-3">Front Desk</p>
            <div className="space-y-1">
              <NavItem icon={LayoutGrid} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <NavItem icon={Calendar} label="Reservations" active={activeTab === 'guests'} onClick={() => setActiveTab('guests')} />
              <NavItem icon={Package} label="Rooms & Inventory" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
              <NavItem icon={UserCheck} label="Guest Database" active={activeTab === 'guest_db'} onClick={() => setActiveTab('guest_db')} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-3 px-3">Operations</p>
            <div className="space-y-1">
              <NavItem icon={Brush} label="Housekeeping" active={activeTab === 'housekeeping'} onClick={() => setActiveTab('housekeeping')} />
              <NavItem icon={Utensils} label="Dining" active={activeTab === 'dining'} onClick={() => setActiveTab('dining')} />
              <NavItem icon={PartyPopper} label="Events" active={activeTab === 'events'} onClick={() => setActiveTab('events')} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-3 px-3">System</p>
            <div className="space-y-1">
               <NavItem icon={Mail} label="Inbox" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
               <NavItem icon={Megaphone} label="Website Updates" active={activeTab === 'updates'} onClick={() => setActiveTab('updates')} />
            </div>
          </div>
        </nav>
        <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#a855f7]" />
              <div className="text-xs">
                <p className="font-bold">Admin</p>
                <p className="opacity-40">Online</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-black/20 rounded-lg text-red-500 transition-colors"><LogOut size={16} /></button>
        </div>
      </aside>

      {/* MAIN CONTENT - Fixed scrolling by removing overflow-hidden from main */}
      <main className="flex-1 h-screen flex flex-col">
        <header className={`flex items-center justify-between px-8 py-4 border-b shrink-0 ${darkMode ? 'border-white/5' : 'bg-white border-gray-200'}`}>
          <h2 className="text-xl font-bold capitalize">{activeTab.replace('_', ' ')}</h2>
          <div className="flex items-center gap-4">
             {loading && <span className="text-xs opacity-50 animate-pulse">Syncing...</span>}
             <div className="flex bg-black/20 ml-auto rounded-lg p-1">
                 <button onClick={() => setDarkMode(true)} className={`p-2 rounded-md ${darkMode ? 'bg-[#6366F1] text-white' : 'opacity-40'}`}><Moon size={16}/></button>
                 <button onClick={() => setDarkMode(false)} className={`p-2 rounded-md ${!darkMode ? 'bg-[#6366F1] text-white' : 'opacity-40'}`}><Sun size={16}/></button>
             </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT AREA - This is the key fix for scrolling */}
        <div 
          className="flex-1 p-8 space-y-8"
          style={{ overflowY: 'auto', height: 'calc(100vh - 80px)' }}
        >
          
          {loading && rooms.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 opacity-50 animate-pulse gap-4">
                 <div className="w-10 h-10 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin"/>
                 <p>Connecting to Hotel Database...</p>
             </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <StatCard icon={BedDouble} label="New Bookings" value={stats.newBookings} color="bg-[#6366F1]" />
                       <StatCard icon={Package} label="Available Rooms" value={stats.availableRooms} color="bg-[#22C55E]" />
                       <StatCard icon={Utensils} label="Dining Resv" value={dining.length} color="bg-[#F97316]" />
                       <StatCard icon={Mail} label="Messages" value={messages.length} color="bg-[#EC4899]" />
                    </div>
                    
                    {/* Recent Bookings List */}
                    <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                       <h3 className="font-bold text-lg mb-4">Recent Hotel Bookings ({reservations.length} total)</h3>
                       {reservations.length > 0 ? (
                         reservations.slice(0, 5).map(res => (
                           <div key={res.id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
                              <div>
                                 <p className="font-bold">{res.profiles?.full_name || 'Guest'}</p>
                                 <p className="text-xs opacity-40">Room {res.room_number || 'N/A'}</p>
                              </div>
                              <span className="text-xs font-bold opacity-60">{new Date(res.check_in).toLocaleDateString()}</span>
                           </div>
                         ))
                       ) : (
                         <p className="opacity-30 text-center py-4">No recent bookings found</p>
                       )}
                    </div>
                  </>
               )}

              {/* RESERVATIONS TAB */}
              {activeTab === 'guests' && (
                  <div className={`rounded-2xl border overflow-x-auto ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                     <table className="w-full text-sm text-left">
                        <thead className={`uppercase text-[10px] tracking-widest opacity-50 ${darkMode ? 'bg-[#202020]' : 'bg-gray-100'}`}>
                          <tr><th className="p-4">Guest</th><th className="p-4">Room</th><th className="p-4">Dates</th><th className="p-4">Amount</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {reservations.length > 0 ? reservations.map(r => (
                              <tr key={r.id} className="hover:opacity-80">
                                <td className="p-4 font-bold">{r.profiles?.full_name || 'Unknown'}</td>
                                <td className="p-4">{r.room_number || '-'}</td>
                                <td className="p-4 opacity-60">{new Date(r.check_in).toLocaleDateString()} - {new Date(r.check_out).toLocaleDateString()}</td>
                                <td className="p-4 opacity-60">₹{r.total_price?.toLocaleString()}</td>
                              </tr>
                           )) : (
                             <tr><td colSpan={4} className="p-8 text-center opacity-30">No reservations found</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
              )}

              {/* ROOMS & INVENTORY TAB */}
              {activeTab === 'inventory' && (
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {rooms.length > 0 ? rooms.map(r => {
                       const now = new Date();
                       const activeRes = reservations.find(res => {
                           if (String(res.room_number) !== String(r.room_number)) return false;
                           const checkIn = new Date(res.check_in);
                           const checkOut = new Date(res.check_out);
                           checkIn.setHours(0,0,0,0);
                           checkOut.setHours(23,59,59,999);
                           return now.getTime() >= checkIn.getTime() && now.getTime() <= checkOut.getTime();
                       });

                       const isOccupied = !!activeRes;
                       const statusLabel = isOccupied ? 'occupied' : r.status;

                       return (
                         <div 
                           key={r.id} 
                           className={`p-4 rounded-xl border text-center transition-all hover:scale-105 cursor-pointer ${
                             statusLabel === 'available' 
                               ? 'border-green-500/30 text-green-500 bg-green-500/10' 
                               : isOccupied 
                                 ? 'border-yellow-500 text-black bg-yellow-400 shadow-lg' 
                                 : 'border-red-500/30 text-red-500 bg-red-500/10'
                           }`}
                         >
                            {isOccupied && (
                              <p className="text-[9px] font-bold uppercase tracking-wider mb-1 opacity-80">
                                Out: {new Date(activeRes!.check_out).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                              </p>
                            )}
                            <h3 className="font-bold text-2xl">{r.room_number}</h3>
                            <p className="text-[10px] uppercase opacity-70 font-bold tracking-wider mt-1">{statusLabel}</p>
                         </div>
                       );
                    }) : (
                      <div className="col-span-6 text-center py-10 opacity-30">No rooms found in database</div>
                    )}
                 </div>
              )}

              {/* GUEST DATABASE TAB */}
              {activeTab === 'guest_db' && (
                 <div className={`rounded-2xl border overflow-x-auto ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                    <table className="w-full text-sm text-left">
                       <thead className={`uppercase text-[10px] tracking-widest opacity-50 ${darkMode ? 'bg-[#202020]' : 'bg-gray-100'}`}>
                         <tr><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Contact</th></tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {guests.length > 0 ? guests.map(g => (
                             <tr key={g.id} className="hover:opacity-80">
                                <td className="p-4 font-mono opacity-50">#{g.id}</td>
                                <td className="p-4 font-bold">{g.full_name}</td>
                                <td className="p-4 opacity-70">
                                   <div>{g.email}</div>
                                   <div className="text-xs opacity-50">{g.mobile_number}</div>
                                </td>
                             </tr>
                          )) : (
                            <tr><td colSpan={3} className="p-8 text-center opacity-30 italic">No guests found</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              )}

              {/* HOUSEKEEPING TAB */}
              {activeTab === 'housekeeping' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                         <Brush size={18}/> Cleaning Tasks
                    </h3>
                    <div className="space-y-3">
                       {housekeeping.length > 0 ? housekeeping.map(task => (
                          <div key={task.id} className={`flex items-center gap-4 p-4 rounded-xl border ${darkMode ? 'bg-[#252525] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                task.status === 'clean' ? 'bg-green-500/20 text-green-500' :
                                task.status === 'dirty' ? 'bg-red-500/20 text-red-500' :
                                'bg-yellow-500/20 text-yellow-500'
                             }`}>
                                {task.room_number}
                             </div>
                             <div>
                                <p className="font-bold">{task.assigned_to || 'Unassigned'}</p>
                                <p className="text-xs opacity-50 uppercase tracking-wider">{task.status}</p>
                             </div>
                             <div className="ml-auto">
                                <span className={`w-3 h-3 rounded-full inline-block ${
                                   task.status === 'clean' ? 'bg-green-500' :
                                   task.status === 'dirty' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                                }`}/>
                             </div>
                          </div>
                       )) : (
                         <p className="text-center opacity-30 italic py-10">No housekeeping tasks</p>
                       )}
                    </div>
                  </div>
                  
                  <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                     <h3 className="font-bold text-lg mb-4">Floor Plan Status</h3>
                     <div className="grid grid-cols-4 gap-2">
                        {rooms.map(r => {
                           const hpStatus = housekeeping.find(h => String(h.room_number) === String(r.room_number))?.status || 'clean';
                           return (
                           <div key={r.id} className={`p-2 text-center rounded-lg border text-xs flex flex-col items-center justify-center h-20 transition-all ${
                              hpStatus === 'dirty' ? 'border-red-500/50 bg-red-500/10 text-red-500' :
                              hpStatus === 'cleaning' ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500' :
                              r.status === 'occupied' ? 'border-blue-500/20 bg-blue-500/5 text-blue-500' :
                              'border-green-500/20 bg-green-500/5 text-green-500'
                           }`}>
                              <span className="text-lg font-bold">{r.room_number}</span>
                              <span className="text-[9px] opacity-70 font-bold uppercase">{hpStatus === 'clean' ? r.status : hpStatus}</span>
                           </div>
                        )})}
                     </div>
                  </div>
                </div>
              )}

              {/* DINING TAB */}
              {activeTab === 'dining' && (
                 <div className={`rounded-2xl border overflow-x-auto ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                    <div className="p-6 border-b border-white/5"><h2 className="font-bold text-lg">Table Reservations</h2></div>
                    <table className="w-full text-sm text-left">
                       <thead className={`uppercase text-[10px] tracking-widest opacity-50 ${darkMode ? 'bg-[#202020]' : 'bg-gray-100'}`}>
                         <tr><th className="p-4">Name</th><th className="p-4">Date & Time</th><th className="p-4">Guests</th><th className="p-4">Status</th></tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {dining.length > 0 ? dining.map(d => (
                             <tr key={d.id} className="hover:opacity-80">
                                <td className="p-4 font-bold">{d.name}</td>
                                <td className="p-4 opacity-70">{new Date(d.date).toLocaleDateString()} at {d.time}</td>
                                <td className="p-4">{d.guests} Pax</td>
                                <td className="p-4"><span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded text-xs font-bold uppercase">{d.status}</span></td>
                             </tr>
                          )) : (
                            <tr><td colSpan={4} className="p-8 text-center opacity-30">No dining reservations</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              )}

              {/* EVENTS TAB */}
              {activeTab === 'events' && (
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.length > 0 ? events.map(e => (
                       <div key={e.id} className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                          <div className="flex justify-between items-start mb-4">
                             <div className="p-2 bg-[#6366F1]/10 text-[#6366F1] rounded-lg"><PartyPopper size={20}/></div>
                             <span className="text-xs font-bold uppercase tracking-wider opacity-50">{new Date(e.date).toLocaleDateString()}</span>
                          </div>
                          <h3 className="font-bold text-lg mb-1">{e.event_type}</h3>
                          <p className="text-sm opacity-60 mb-4">by {e.name}</p>
                          <div className="flex items-center gap-2 text-xs opacity-50">
                             <Mail size={12}/> {e.email} • {e.guests} Guests
                          </div>
                       </div>
                    )) : (
                      <div className="col-span-3 text-center opacity-30 py-10">No event inquiries</div>
                    )}
                 </div>
              )}

              {/* MESSAGES TAB */}
              {activeTab === 'messages' && (
                 <div className="space-y-4">
                    {messages.length > 0 ? messages.map(m => (
                       <div key={m.id} className={`p-6 rounded-2xl border flex gap-6 ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold text-lg">
                            {(m.name && m.name.length > 0) ? m.name[0].toUpperCase() : '?'}
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between mb-1">
                                <h4 className="font-bold">{m.subject}</h4>
                                <span className="text-xs opacity-40">{new Date(m.created_at).toLocaleDateString()}</span>
                             </div>
                             <p className="text-sm opacity-60 mb-2">{m.name} ({m.email})</p>
                             <p className="opacity-80 leading-relaxed">{m.message}</p>
                          </div>
                       </div>
                    )) : (
                      <div className="text-center opacity-30 py-10">No messages</div>
                    )}
                 </div>
              )}

              {/* UPDATES TAB */}
              {activeTab === 'updates' && (
                 <div className="grid lg:grid-cols-3 gap-8">
                   <div className={`lg:col-span-1 p-6 rounded-2xl border h-fit ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-200'}`}>
                     <h2 className="text-xl font-bold mb-4">Post Global Update</h2>
                     <form onSubmit={handlePostNotification} className="space-y-4">
                       <input name="title" required className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-[#252525] border-white/10' : 'bg-gray-50'}`} placeholder="Title" />
                       <select name="type" className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-[#252525] border-white/10' : 'bg-gray-50'}`}>
                         <option value="offer">Special Offer</option>
                         <option value="news">News</option>
                         <option value="alert">Alert</option>
                       </select>
                       <textarea name="message" required rows={3} className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-[#252525] border-white/10' : 'bg-gray-50'}`} placeholder="Message..."></textarea>
                       <button className="w-full bg-[#6366F1] text-white font-bold py-3 rounded-xl hover:bg-[#5558DD] transition-colors">Push Update</button>
                     </form>
                   </div>
                    <div className="lg:col-span-2 space-y-2">
                       {notifications.length > 0 ? notifications.map(n => (
                          <div key={n.id} className={`p-4 rounded-xl border flex justify-between items-center ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white'}`}>
                             <div>
                               <p className="font-bold flex items-center gap-2">
                                 {n.title} 
                                 <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${
                                   n.type === 'offer' ? 'bg-orange-500/20 text-orange-500' :
                                   n.type === 'alert' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                                 }`}>{n.type}</span>
                               </p>
                               <p className="text-xs opacity-50">{n.message}</p>
                             </div>
                             <button 
                               onClick={() => handleDeleteNotification(n.id)} 
                               className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all text-xs font-bold"
                             >
                                Delete
                             </button>
                          </div>
                       )) : (
                         <div className="text-center p-8 opacity-30 italic border-2 border-dashed rounded-2xl">No active notifications</div>
                       )}
                    </div>
                 </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// Sub-components
const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-[#6366F1] text-white' : 'opacity-50 hover:opacity-100'}`}>
    <Icon size={18} /> {label}
  </button>
);

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className={`${color} rounded-2xl p-5 text-white shadow-lg`}>
    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4"><Icon size={20} /></div>
    <p className="text-sm opacity-80 mb-1">{label}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;