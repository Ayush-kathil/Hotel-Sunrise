import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  LayoutDashboard, BedDouble, CalendarDays, Paintbrush, Users, LogOut,
  Search, Bell, CheckCircle, MoreVertical, Plus, Trash2, X, Filter 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FORMS
  const [resForm, setResForm] = useState({ guestName: '', checkIn: '', duration: '1', roomCategory: '' });
  const [notifForm, setNotifForm] = useState({ title: '', type: 'offer', message: '' });

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
            cleanersAvailable: 1 
         });
      }

      // 2. Housekeeping
      const { data: hData } = await supabase.from('housekeeping').select('*').order('created_at', { ascending: false });
      if (hData) setHousekeeping(hData);
      
      // 3. Reservations (Bookings)
      const { data: bData } = await supabase.from('bookings').select('*, profiles(full_name, phone)').order('check_in', { ascending: false });
      if (bData) setReservations(bData);

      // 4. Notifications
      const { data: nData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (nData) setNotifications(nData);
    };
    fetchData();
  }, []);

  // HANDLERS
  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
       const startDate = new Date(resForm.checkIn);
       const endDate = new Date(startDate);
       endDate.setDate(startDate.getDate() + parseInt(resForm.duration));

       // 1. Check Availability
       const { data: assignedRoomNumber, error: rpcError } = await supabase.rpc('get_available_room', {
          requested_category: resForm.roomCategory,
          check_in_date: startDate.toISOString(),
          check_out_date: endDate.toISOString()
       });

       if (rpcError) throw rpcError;
       if (!assignedRoomNumber) throw new Error("No rooms available in this category for the selected dates.");

       // 2. Create Booking
       const roomPrice = rooms.find(r => r.category === resForm.roomCategory)?.price || 0;
       const { error: bookError } = await supabase.from('bookings').insert([{
           user_id: (await supabase.auth.getUser()).data.user?.id, 
           room_number: assignedRoomNumber,
           room_name: resForm.roomCategory,
           mobile_number: 'N/A', 
           check_in: startDate,
           check_out: endDate,
           nights: parseInt(resForm.duration),
           total_price: roomPrice * parseInt(resForm.duration),
           status: 'confirmed'
       }]);

       if (bookError) throw bookError;

       toast.success("Reservation Created", { description: `Room ${assignedRoomNumber} assigned.` });
       setResForm({ guestName: '', checkIn: '', duration: '1', roomCategory: '' });
       
       // Optimistic Update
       const { data: newBData } = await supabase.from('bookings').select('*, profiles(full_name, phone)').order('check_in', { ascending: false });
       if (newBData) setReservations(newBData);

    } catch (err: any) {
       toast.error("Failed", { description: err.message });
    } finally {
       setIsSubmitting(false);
    }
  };

  const handlePostNotification = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      const { error } = await supabase.from('notifications').insert([notifForm]);
      if (error) {
         toast.error("Error", { description: error.message });
      } else {
         toast.success("Posted", { description: "Notification is live." });
         setNotifForm({ title: '', type: 'offer', message: '' });
         const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
         if (data) setNotifications(data);
      }
      setIsSubmitting(false);
  };

  const handleDeleteNotif = async (id: string) => {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (!error) {
         setNotifications(prev => prev.filter(n => n.id !== id));
         toast.success("Deleted");
      }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#fcfbf9] font-sans text-zinc-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="w-72 bg-[#121212] text-white flex flex-col flex-shrink-0 relative overflow-hidden z-20 shadow-2xl"
      >
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] rounded-full blur-[150px] opacity-10 pointer-events-none" />
         
         <div className="p-8">
            <motion.h1 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
               className="text-[#d4af37] font-serif font-bold text-2xl tracking-wider mb-2"
            >
               ROYAL VILLAS
            </motion.h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Admin Console</p>
         </div>

         <div className="px-6 mb-8">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
               <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#8a711f] rounded-xl flex items-center justify-center text-black font-bold shadow-lg shadow-[#d4af37]/20">A</div>
               <div>
                  <p className="font-bold text-sm text-zinc-100">Administrator</p>
                  <p className="text-[10px] text-zinc-500 font-medium">Full Access</p>
               </div>
            </div>
         </div>

         <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            <SidebarLink icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarLink icon={BedDouble} label="Rooms" active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')} />
            <SidebarLink icon={CalendarDays} label="Reservations" active={activeTab === 'reservations'} onClick={() => setActiveTab('reservations')} />
            <SidebarLink icon={Paintbrush} label="Housekeeping" active={activeTab === 'housekeeping'} onClick={() => setActiveTab('housekeeping')} />
            <SidebarLink icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
            <SidebarLink icon={Users} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
         </nav>

         <div className="p-6 border-t border-white/5">
            <button onClick={handleLogout} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm font-bold w-full px-4 py-3 rounded-xl hover:bg-white/5 group">
               <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Logout
            </button>
         </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto relative scrollbar-hide">
         {/* Top Header */}
         <header className="sticky top-0 z-30 px-8 py-6 bg-[#fcfbf9]/80 backdrop-blur-md flex justify-between items-center border-b border-zinc-200/50">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
               <h2 className="text-2xl font-serif font-bold capitalize text-zinc-800">{activeTab}</h2>
            </motion.div>
            
            <div className="flex items-center gap-4">
               <div className="relative group">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#d4af37] transition-colors" />
                  <input type="text" placeholder="Search..." className="bg-white pl-10 pr-4 py-2.5 rounded-full text-sm outline-none border border-zinc-200 focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/5 w-64 transition-all shadow-sm" />
               </div>
               <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-zinc-600 hover:text-[#d4af37] border border-zinc-200 transition-all shadow-sm hover:shadow-md relative">
                  <Bell size={18} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
               </button>
            </div>
         </header>

         <div className="p-8 pb-32">
            <AnimatePresence mode="wait">
               
               {/* VIEW: DASHBOARD */}
               {activeTab === 'dashboard' && (
                  <motion.div key="dashboard" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-8">
                     {/* Welcome Banner */}
                     <motion.div variants={itemVariants} className="bg-[#EFE8D8] p-10 rounded-[2.5rem] flex justify-between items-center relative overflow-hidden shadow-lg border border-[#e5dcc5]">
                        <div className="relative z-10">
                           <p className="text-[#8c7b64] font-bold text-sm mb-1 uppercase tracking-wider">Overview</p>
                           <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3E3221]">Welcome back, Admin</h1>
                        </div>
                        <div className="flex gap-4 relative z-10">
                           <button className="bg-white/60 backdrop-blur-md px-6 py-3 rounded-full text-sm font-bold text-[#5C4B35] shadow-sm hover:bg-white transition-colors">Download Report</button>
                        </div>
                        <div className="absolute -right-10 -bottom-10 opacity-[0.07] pointer-events-none rotate-12">
                           <BedDouble size={300} />
                        </div>
                     </motion.div>

                     {/* Stats Grid */}
                     <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <StatCard delay={0.1} icon={BedDouble} label="Total Rooms" value={stats.totalRooms} color="bg-[#FFF8E7] text-[#B89628]" />
                        <StatCard delay={0.2} icon={CheckCircle} label="Available" value={stats.available} color="bg-[#E7FFF3] text-[#1A9E58]" />
                        <StatCard delay={0.3} icon={BedDouble} label="Occupied" value={stats.occupied} color="bg-[#FFF0EF] text-[#D93025]" />
                        <StatCard delay={0.4} icon={Paintbrush} label="Cleaning" value={stats.cleaning} color="bg-[#EFF8FF] text-[#1A73E8]" />
                        <StatCard delay={0.5} icon={Users} label="Staff Active" value={stats.cleanersAvailable} color="bg-[#FFF3E0] text-[#E37400]" />
                     </div>
                  </motion.div>
               )}

               {/* VIEW: ROOMS */}
               {activeTab === 'rooms' && (
                 <motion.div key="rooms" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-8">
                    {[1, 2, 3, 4, 5].map((floor) => (
                       <motion.div key={floor} variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center mb-8 border-b border-zinc-50 pb-4">
                             <h3 className="text-xl font-bold font-serif">Floor 0{floor}</h3>
                             <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                {floor === 1 ? 'Garden Suites' : floor === 5 ? 'Royal Penthouses' : 'Standard Rooms'}
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                             {rooms.filter(r => r.floor === floor).map(room => <RoomCard key={room.id} room={room} /> )}
                             {rooms.filter(r => r.floor === floor).length === 0 && <span className="col-span-4 text-zinc-300 italic">No rooms initialized on this floor</span>}
                          </div>
                       </motion.div>
                    ))}
                 </motion.div>
               )}

               {/* VIEW: RESERVATIONS */}
               {activeTab === 'reservations' && (
                  <motion.div key="reservations" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="grid lg:grid-cols-3 gap-8">
                     {/* Form */}
                     <motion.div variants={itemVariants} className="col-span-1 bg-white p-8 rounded-[2.5rem] shadow-lg border border-zinc-100 h-fit sticky top-24">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="w-10 h-10 rounded-full bg-[#f4f0e6] flex items-center justify-center text-[#d4af37]"><Plus size={20} /></div>
                           <h3 className="text-xl font-bold font-serif">New Reservation</h3>
                        </div>
                        <form onSubmit={handleCreateReservation} className="space-y-5">
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">Guest Name</label>
                              <input type="text" required value={resForm.guestName} onChange={e => setResForm({...resForm, guestName: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-2xl focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all focus:bg-white" placeholder="John Doe" />
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">Check-In</label>
                                 <input type="date" required value={resForm.checkIn} onChange={e => setResForm({...resForm, checkIn: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-2xl focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all focus:bg-white text-sm" />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">Nights</label>
                                 <input type="number" min="1" required value={resForm.duration} onChange={e => setResForm({...resForm, duration: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-2xl focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all focus:bg-white text-sm" />
                              </div>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">Room Category</label>
                              <select required value={resForm.roomCategory} onChange={e => setResForm({...resForm, roomCategory: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-2xl focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all focus:bg-white appearance-none cursor-pointer">
                                 <option value="">Select Category</option>
                                 {Array.from(new Set(rooms.map(r => r.category))).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                           </div>
                           <button type="submit" disabled={isSubmitting} className="w-full bg-[#121212] text-white font-bold py-4 rounded-2xl hover:bg-[#d4af37] hover:text-black transition-all shadow-lg flex justify-center items-center gap-2 mt-4 active:scale-95">
                              {isSubmitting ? "Processing..." : "Confirm Booking"}
                           </button>
                        </form>
                     </motion.div>

                     {/* List */}
                     <div className="col-span-2 space-y-4">
                        {reservations.map((res) => (
                           <motion.div variants={itemVariants} key={res.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 flex items-center justify-between group hover:shadow-md transition-all">
                              <div className="flex items-center gap-6">
                                 <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex flex-col items-center justify-center border border-zinc-100">
                                    <span className="text-xs font-bold text-zinc-400 uppercase">{new Date(res.check_in).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-xl font-serif font-bold text-zinc-800">{new Date(res.check_in).getDate()}</span>
                                 </div>
                                 <div>
                                    <h4 className="font-bold text-lg text-zinc-900">{res.profiles?.full_name || 'Guest'}</h4>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium mt-1">
                                       Room {res.room_number || 'N/A'} • {res.room_name}
                                    </p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6">
                                 <span className="px-4 py-2 bg-[#f0fdf4] text-[#166534] rounded-full text-xs font-bold uppercase tracking-wider hidden md:block">Confirmed</span>
                                 <button className="p-3 rounded-full hover:bg-zinc-50 text-zinc-400 hover:text-zinc-600 transition-colors">
                                    <MoreVertical size={20} />
                                 </button>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  </motion.div>
               )}

               {/* VIEW: HOUSEKEEPING */}
               {activeTab === 'housekeeping' && (
                  <motion.div key="housekeeping" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 overflow-hidden">
                     <div className="p-8 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/30">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Paintbrush size={20} /></div>
                           <h3 className="text-xl font-serif font-bold">Housekeeping Schedule</h3>
                        </div>
                        <span className="bg-white border border-zinc-200 px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 shadow-sm">Staff Active: 1</span>
                     </div>
                     <table className="w-full text-left">
                        <thead className="bg-zinc-50/50 border-b border-zinc-100 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                           <tr>
                              <th className="p-6 pl-8">Room Info</th>
                              <th className="p-6">Assigned To</th>
                              <th className="p-6">Status</th>
                              <th className="p-6 text-right pr-8">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                           {housekeeping.length > 0 ? housekeeping.map((task, i) => (
                              <motion.tr variants={itemVariants} key={task.id} className="hover:bg-zinc-50/50 transition-colors">
                                 <td className="p-6 pl-8">
                                    <span className="font-bold text-lg block">{task.room_number}</span>
                                    <span className="text-[10px] text-zinc-400 uppercase">Floor {String(task.room_number)[0]}</span>
                                 </td>
                                 <td className="p-6">
                                    <div className="flex items-center gap-2">
                                       <div className="w-6 h-6 rounded-full bg-zinc-200" />
                                       <span className="font-medium text-sm">{task.housekeeper_name || 'Unassigned'}</span>
                                    </div>
                                 </td>
                                 <td className="p-6"><span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>{task.status}</span></td>
                                 <td className="p-6 text-right pr-8"><button className="text-xs font-bold text-zinc-400 hover:text-black underline decoration-zinc-200 underline-offset-4">Details</button></td>
                              </motion.tr>
                           )) : (
                              // Demo Content for Empty State
                              [101, 103, 104, 205].map((room, i) => (
                                 <motion.tr variants={itemVariants} key={room} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="p-6 pl-8">
                                       <span className="font-bold text-lg block">{room}</span>
                                       <span className="text-[10px] text-zinc-400 uppercase">Floor {String(room)[0]}</span>
                                    </td>
                                    <td className="p-6"><span className="text-sm text-zinc-500">Sarah M.</span></td>
                                    <td className="p-6"><span className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">Cleaned</span></td>
                                    <td className="p-6 text-right pr-8"><CheckCircle size={18} className="ml-auto text-emerald-400" /></td>
                                 </motion.tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </motion.div>
               )}

               {/* VIEW: NOTIFICATIONS */}
               {activeTab === 'notifications' && (
                  <motion.div key="notifications" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="grid lg:grid-cols-3 gap-8">
                     {/* FORM */}
                     <motion.div variants={itemVariants} className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-lg sticky top-24">
                           <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><Bell size={20} /></div>
                              <h3 className="text-xl font-bold font-serif">Broadcast Update</h3>
                           </div>
                           <form onSubmit={handlePostNotification} className="space-y-4">
                              <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">Title</label>
                                 <input type="text" required value={notifForm.title} onChange={e=>setNotifForm({...notifForm, title: e.target.value})} className="w-full bg-zinc-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-[#d4af37]/20 mt-1 outline-none transition-all placeholder:text-zinc-400" placeholder="e.g. Summer Sale" />
                              </div>
                              <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">Type</label>
                                 <select value={notifForm.type} onChange={e=>setNotifForm({...notifForm, type: e.target.value})} className="w-full bg-zinc-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-[#d4af37]/20 mt-1 outline-none transition-all appearance-none cursor-pointer">
                                    <option value="offer">Special Offer</option>
                                    <option value="news">Announcement</option>
                                    <option value="alert">Alert</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">Message</label>
                                 <textarea required rows={4} value={notifForm.message} onChange={e=>setNotifForm({...notifForm, message: e.target.value})} className="w-full bg-zinc-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-[#d4af37]/20 mt-1 outline-none transition-all placeholder:text-zinc-400 resize-none" placeholder="Enter details..." />
                              </div>
                              <button disabled={isSubmitting} className="w-full bg-[#121212] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#d4af37] hover:text-black transition-all shadow-lg active:scale-95">
                                 {isSubmitting ? "Posting..." : "Post Update"} 
                              </button>
                           </form>
                        </div>
                     </motion.div>

                     {/* LIST */}
                     <div className="lg:col-span-2 space-y-4">
                        <AnimatePresence>
                           {notifications.map((n: any) => (
                              <motion.div 
                                 key={n.id} variants={itemVariants} layout
                                 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                 className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm flex justify-between items-start group hover:shadow-lg transition-all"
                              >
                                 <div className="flex gap-5">
                                    <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shrink-0 border-4 border-white shadow-lg ${
                                       n.type==='offer' ? 'bg-amber-100 text-amber-600' : 
                                       n.type==='alert' ? 'bg-red-100 text-red-500' : 
                                       'bg-blue-100 text-blue-500'
                                    }`}>
                                       <Bell size={22} fill="currentColor" className="opacity-20 absolute" />
                                       <Bell size={22} className="relative z-10" />
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-3 mb-2">
                                          <h4 className="font-bold text-lg text-zinc-900">{n.title}</h4>
                                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide border ${
                                             n.type==='offer' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                             n.type==='alert' ? 'bg-red-50 text-red-700 border-red-100' : 
                                             'bg-blue-50 text-blue-700 border-blue-100'
                                          }`}>
                                             {n.type}
                                          </span>
                                       </div>
                                       <p className="text-zinc-600 text-sm leading-relaxed">{n.message}</p>
                                       <p className="text-[10px] text-zinc-400 mt-3 font-medium uppercase tracking-wider">{new Date(n.created_at).toLocaleString()}</p>
                                    </div>
                                 </div>
                                 <button onClick={() => handleDeleteNotif(n.id)} className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                    <Trash2 size={18} />
                                 </button>
                              </motion.div>
                           ))}
                        </AnimatePresence>
                        {notifications.length === 0 && (
                           <motion.div variants={itemVariants} className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-[2.5rem]">
                              <Bell size={40} className="mx-auto text-zinc-200 mb-4" />
                              <p className="text-zinc-400 font-bold">No active notifications</p>
                           </motion.div>
                        )}
                     </div>
                  </motion.div>
               )}

            </AnimatePresence>
         </div>
      </main>
    </div>
  );
};

// --- SUB COMPONENTS ---

const SidebarLink = ({ icon: Icon, label, active, onClick }: any) => (
   <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 mb-1 text-sm font-bold rounded-xl transition-all relative group ${active ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-100 hover:bg-white/5'}`}>
      <Icon size={18} className={`transition-colors ${active ? 'text-[#d4af37]' : 'text-zinc-600 group-hover:text-zinc-400'}`} /> 
      {label}
      {active && <motion.div layoutId="activePill" className="absolute left-0 w-1 h-6 bg-[#d4af37] rounded-r-full" />}
   </button>
);

const StatCard = ({ icon: Icon, label, value, color, delay }: any) => (
   <motion.div 
      variants={itemVariants}
      className={`p-6 rounded-[2rem] flex flex-col justify-between h-36 ${color.split(' ')[0]} border border-white/50 shadow-sm hover:scale-105 transition-transform`}
   >
      <div className="flex justify-between items-start">
         <div className="text-4xl font-bold font-serif">{value}</div>
         <div className={`p-2 rounded-full bg-white/40 backdrop-blur-sm ${color.split(' ')[1]}`}>
            <Icon size={20} />
         </div>
      </div>
      <div className={`font-bold text-xs uppercase tracking-wider opacity-60 ${color.split(' ')[1]}`}>{label}</div>
   </motion.div>
);

const RoomCard = ({ room }: any) => (
   <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex flex-col items-center text-center group transition-all relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 ${
         room.status === 'available' ? 'bg-emerald-500' : 
         room.status === 'occupied' ? 'bg-red-500' : 
         'bg-blue-500'
      }`} />
      
      <div className="font-bold text-xl mb-1 mt-2 text-zinc-800">{room.room_number}</div>
      <div className="text-[9px] font-bold uppercase text-zinc-400 mb-4 tracking-wider line-clamp-1">{room.category}</div>
      
      <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-full border ${
         room.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
         room.status === 'occupied' ? 'bg-red-50 text-red-700 border-red-100' : 
         'bg-blue-50 text-blue-700 border-blue-100'
      }`}>
         {room.status}
      </div>
   </motion.div>
);

export default AdminDashboard;