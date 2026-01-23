import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  LayoutDashboard, BedDouble, CalendarDays, Paintbrush, Users, LogOut,
  Search, Bell, CheckCircle, Clock, AlertCircle, MoreVertical, Hash 
} from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ 
     totalRooms: 40, available: 40, occupied: 0, cleaning: 0, 
     cleanersAvailable: 1 
  });
  const [rooms, setRooms] = useState<any[]>([]);
  const [housekeeping, setHousekeeping] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      // 1. Rooms
      const { data: rData } = await supabase.from('rooms').select('*').order('room_number', { ascending: true });
      if (rData) {
         setRooms(rData);
         setStats({
            totalRooms: rData.length,
            available: rData.filter(r => r.status === 'available').length,
            occupied: rData.filter(r => r.status === 'occupied').length,
            cleaning: rData.filter(r => r.status === 'cleaning').length,
            cleanersAvailable: 1 // Mock for now
         });
      }

      // 2. Housekeeping
      const { data: hData } = await supabase.from('housekeeping').select('*').order('created_at', { ascending: false });
      if (hData) setHousekeeping(hData);
      
      // 3. Reservations (Bookings)
      const { data: bData } = await supabase.from('bookings').select('*, profiles(full_name, phone)').order('check_in', { ascending: false });
      if (bData) setReservations(bData);
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#F4F5F7] font-sans text-zinc-900">
      
      {/* SIDEBAR (Black Theme) */}
      <aside className="w-64 bg-[#141414] text-white flex flex-col flex-shrink-0">
         <div className="p-6">
            <h1 className="text-[#d4af37] font-serif font-bold text-xl tracking-wider">ROYAL VILLAS</h1>
            <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Hotel Management</p>
         </div>

         <div className="px-6 mb-8">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
               <div className="w-10 h-10 bg-[#d4af37] rounded-lg flex items-center justify-center text-black font-bold">A</div>
               <div>
                  <p className="font-bold text-sm">Admin</p>
                  <p className="text-[10px] text-stone-400">Manager</p>
               </div>
            </div>
         </div>

         <nav className="flex-1 px-3 space-y-1">
            <SidebarLink icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarLink icon={BedDouble} label="Rooms" active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')} />
            <SidebarLink icon={CalendarDays} label="Reservations" active={activeTab === 'reservations'} onClick={() => setActiveTab('reservations')} />
            <SidebarLink icon={Paintbrush} label="Housekeeping" active={activeTab === 'housekeeping'} onClick={() => setActiveTab('housekeeping')} />
            <SidebarLink icon={Users} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
         </nav>

         <div className="p-6">
            <button onClick={handleLogout} className="flex items-center gap-3 text-stone-400 hover:text-white transition-colors text-sm font-bold">
               <LogOut size={16} /> Logout
            </button>
         </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
         {/* Top Header */}
         <header className="bg-white px-8 py-5 border-b border-zinc-100 flex justify-between items-center sticky top-0 z-20">
            <h2 className="text-2xl font-bold font-serif capitalize">{activeTab}</h2>
            <div className="flex items-center gap-4">
               <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type="text" placeholder="Search..." className="bg-zinc-50 pl-10 pr-4 py-2.5 rounded-full text-sm outline-none focus:ring-1 focus:ring-[#d4af37] w-64 border border-zinc-100" />
               </div>
               <button className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-600 hover:bg-[#d4af37] hover:text-white transition-colors relative">
                  <Bell size={18} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
               </button>
            </div>
         </header>

         <div className="p-8">
            
            {/* VIEW: DASHBOARD */}
            {activeTab === 'dashboard' && (
               <div className="space-y-8">
                  {/* Welcome Banner */}
                  <div className="bg-[#EFE8D8] p-8 rounded-[2rem] flex justify-between items-center relative overflow-hidden">
                     <div className="relative z-10">
                        <p className="text-stone-500 font-bold text-sm mb-1">Welcome back,</p>
                        <h1 className="text-4xl font-serif font-bold text-[#3E3221]">Admin 👋</h1>
                     </div>
                     <button className="bg-white/50 backdrop-blur-md px-6 py-3 rounded-xl text-sm font-bold text-[#5C4B35] shadow-sm relative z-10">Today's Overview</button>
                     <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                        <BedDouble size={200} />
                     </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                     <StatCard icon={BedDouble} label="Total Rooms" value={stats.totalRooms} color="bg-[#FFF8E7] text-[#B89628]" />
                     <StatCard icon={CheckCircle} label="Available" value={stats.available} color="bg-[#E7FFF3] text-[#1A9E58]" />
                     <StatCard icon={BedDouble} label="Occupied" value={stats.occupied} color="bg-[#FFF0EF] text-[#D93025]" />
                     <StatCard icon={Paintbrush} label="Cleaning Needed" value={stats.cleaning} color="bg-[#EFF8FF] text-[#1A73E8]" />
                     <StatCard icon={Users} label="Cleaners Available" value={stats.cleanersAvailable} color="bg-[#FFF3E0] text-[#E37400]" />
                  </div>
               </div>
            )}

            {/* VIEW: ROOMS */}
            {activeTab === 'rooms' && (
              <div className="space-y-8">
                 <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-xl font-bold">Floor 1</h3>
                       <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Available</span>
                          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"/> Occupied</span>
                          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/> Cleaning</span>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                       {rooms.filter(r => r.floor === 1).map(room => <RoomCard key={room.id} room={room} /> )}
                    </div>
                 </div>

                 <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100">
                    <h3 className="text-xl font-bold mb-8">Floor 2</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                       {rooms.filter(r => r.floor === 2).map(room => <RoomCard key={room.id} room={room} /> )}
                    </div>
                 </div>
              </div>
            )}

            {/* VIEW: RESERVATIONS */}
            {activeTab === 'reservations' && (
               <div className="grid lg:grid-cols-3 gap-8">
                  {/* Form */}
                  <div className="col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100 h-fit">
                     <h3 className="text-xl font-bold mb-6">New Reservation</h3>
                     <form className="space-y-5">
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-zinc-500 uppercase">Guest Name</label>
                           <input type="text" className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl focus:ring-1 focus:ring-black outline-none" placeholder="Enter Guest Name" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-zinc-500 uppercase">Check-In</label>
                           <input type="datetime-local" className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl focus:ring-1 focus:ring-black outline-none" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-zinc-500 uppercase">Room</label>
                           <select className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl focus:ring-1 focus:ring-black outline-none">
                              <option>Select Room</option>
                              {rooms.filter(r => r.status === 'available').map(r => <option key={r.id} value={r.room_number}>{r.room_number} - {r.type}</option>)}
                           </select>
                        </div>
                        <button className="w-full bg-[#5244F5] text-white font-bold py-4 rounded-xl hover:bg-[#4336c9] transition-colors shadow-lg shadow-indigo-200">
                           Confirm Reservation
                        </button>
                     </form>
                  </div>

                  {/* List */}
                  <div className="col-span-2 bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden">
                     <table className="w-full text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                           <tr>
                              <th className="p-6">Guest</th>
                              <th className="p-6">Status</th>
                              <th className="p-6">Room</th>
                              <th className="p-6">Date</th>
                              <th className="p-6 text-right">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                           {reservations.map(res => (
                              <tr key={res.id} className="hover:bg-zinc-50/50 transition-colors">
                                 <td className="p-6 font-bold">{res.profiles?.full_name || 'Guest'}</td>
                                 <td className="p-6"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">Confirmed</span></td>
                                 <td className="p-6"><span className="font-mono bg-zinc-100 px-2 py-1 rounded text-xs">{res.room_number}</span></td>
                                 <td className="p-6 text-sm text-zinc-500">{new Date(res.check_in).toLocaleDateString()}</td>
                                 <td className="p-6 text-right"><MoreVertical size={16} className="ml-auto text-zinc-400 cursor-pointer" /></td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {/* VIEW: HOUSEKEEPING */}
            {activeTab === 'housekeeping' && (
               <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden">
                  <div className="p-8 border-b border-zinc-50 flex justify-between items-center">
                     <h3 className="text-xl font-bold">Housekeeping Schedule</h3>
                     <span className="bg-zinc-100 px-4 py-2 rounded-xl text-xs font-bold text-zinc-600">Cleaners: 1</span>
                  </div>
                  <table className="w-full text-left">
                     <thead className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        <tr>
                           <th className="p-6">Room</th>
                           <th className="p-6">Housekeeper</th>
                           <th className="p-6">Status</th>
                           <th className="p-6 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-50">
                        {housekeeping.length > 0 ? housekeeping.map(task => (
                           <tr key={task.id}>
                              <td className="p-6 font-bold">{task.room_number}</td>
                              <td className="p-6">{task.housekeeper_name || 'Unassigned'}</td>
                              <td className="p-6"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{task.status}</span></td>
                              <td className="p-6 text-right"><button className="text-xs font-bold text-blue-600 hover:underline">Manage</button></td>
                           </tr>
                        )) : (
                           <tr><td colSpan={4} className="p-8 text-center text-zinc-400 italic">No cleaning tasks pending.</td></tr>
                        )}
                        {/* Mock Data for visuals if empty */}
                        {housekeeping.length === 0 && [101, 103, 104].map(room => (
                           <tr key={room}>
                              <td className="p-6 font-bold">{room}</td>
                              <td className="p-6 text-zinc-500">Cleaner1</td>
                              <td className="p-6"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">Completed</span></td>
                              <td className="p-6 text-right"><CheckCircle size={16} className="ml-auto text-green-500" /></td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

         </div>
      </main>
    </div>
  );
};

// --- SUB COMPONENTS ---
const SidebarLink = ({ icon: Icon, label, active, onClick }: any) => (
   <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-bold border-l-4 transition-all ${active ? 'border-[#d4af37] bg-white/5 text-white' : 'border-transparent text-stone-500 hover:text-stone-300 hover:bg-white/5'}`}>
      <Icon size={18} /> {label}
   </button>
);

const StatCard = ({ icon: Icon, label, value, color }: any) => (
   <div className={`p-6 rounded-2xl flex flex-col justify-between h-32 ${color.split(' ')[0]}`}>
      <div className="flex justify-between items-start">
         <div className="text-3xl font-bold text-zinc-900">{value}</div>
         <Icon size={20} className={color.split(' ')[1]} />
      </div>
      <div className="font-bold text-xs uppercase tracking-wide opacity-70">{label}</div>
   </div>
);

const RoomCard = ({ room }: any) => (
   <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex flex-col items-center text-center group hover:shadow-md transition-all cursor-pointer">
      <div className="font-bold text-lg mb-1">{room.room_number}</div>
      <div className="text-[10px] font-bold uppercase text-zinc-400 mb-3">{room.type}</div>
      <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-full ${
         room.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 
         room.status === 'occupied' ? 'bg-red-100 text-red-700' : 
         'bg-blue-100 text-blue-700'
      }`}>
         {room.status}
      </div>
   </div>
);

export default AdminDashboard;