import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Calendar, DollarSign, Bell, LogOut, Download, Search, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// --- SIMPLE EXPORT FUNCTION (Integrated directly) ---
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
  const [activeTab, setActiveTab] = useState('bookings');
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, inquiries: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }

    // FETCH DATA
    const { data: bData } = await supabase
      .from('bookings')
      .select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false });

    const { data: iData } = await supabase
      .from('event_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    // SET STATE
    const totalRev = bData?.reduce((acc, item) => acc + (Number(item.total_price) || 0), 0) || 0;
    setBookings(bData || []);
    setInquiries(iData || []);
    setStats({ revenue: totalRev, bookings: bData?.length || 0, inquiries: iData?.length || 0 });
    setLoading(false);
  };

  const handleExport = () => {
    const report = bookings.map(b => ({
       Guest: b.profiles?.full_name || 'Guest',
       Email: b.profiles?.email || 'N/A',
       Room: b.room_name,
       CheckIn: b.check_in,
       CheckOut: b.check_out || 'N/A', // Handle missing dates
       Nights: b.nights || 1,
       Price: b.total_price,
       DateBooked: new Date(b.created_at).toLocaleDateString()
    }));
    downloadCSV(report, "Sunrise_Bookings_Report");
    toast.success("Excel Downloaded");
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Admin Suite...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-zinc-900 text-white p-6 hidden md:flex flex-col">
        <h1 className="text-xl font-bold font-serif mb-12 text-[#d4af37]">SUNRISE ADMIN</h1>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'bookings' ? 'bg-[#d4af37] text-black font-bold' : 'text-zinc-400 hover:text-white'}`}>
             <Calendar size={18} /> Bookings
          </button>
          <button onClick={() => setActiveTab('inquiries')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inquiries' ? 'bg-[#d4af37] text-black font-bold' : 'text-zinc-400 hover:text-white'}`}>
             <Bell size={18} /> Inquiries
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
         <header className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif font-bold">
               {activeTab === 'bookings' ? 'All Reservations' : 'Inbox & Messages'}
            </h2>
            <button onClick={handleExport} className="bg-black text-white px-6 py-2 rounded-full font-bold text-xs uppercase flex items-center gap-2 hover:bg-[#d4af37] transition-all">
               <Download size={16} /> Export Data
            </button>
         </header>

         {/* STATS ROW */}
         <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
               <p className="text-xs font-bold uppercase text-zinc-400">Total Revenue</p>
               <p className="text-2xl font-serif font-bold text-green-600">₹{stats.revenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
               <p className="text-xs font-bold uppercase text-zinc-400">Total Bookings</p>
               <p className="text-2xl font-serif font-bold">{stats.bookings}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
               <p className="text-xs font-bold uppercase text-zinc-400">New Messages</p>
               <p className="text-2xl font-serif font-bold">{stats.inquiries}</p>
            </div>
         </div>

         {/* BOOKINGS TAB */}
         {activeTab === 'bookings' && (
            <div className="space-y-4">
               {bookings.map(b => (
                  <div key={b.id} className="bg-white p-6 rounded-2xl border border-zinc-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-zinc-500">
                           {b.profiles?.full_name?.[0] || 'G'}
                        </div>
                        <div>
                           <p className="font-bold text-zinc-900">{b.room_name}</p>
                           <p className="text-xs text-zinc-500">{b.profiles?.email}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold uppercase text-zinc-400">Dates</p>
                        <p className="text-sm font-medium">{b.check_in} → {b.check_out || '?'}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold uppercase text-zinc-400">Total</p>
                        <p className="text-lg font-bold text-[#d4af37]">₹{b.total_price?.toLocaleString()}</p>
                     </div>
                     <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {b.status}
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* INQUIRIES TAB */}
         {activeTab === 'inquiries' && (
            <div className="grid gap-4">
               {inquiries.map(i => (
                  <div key={i.id} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                     <div className="flex justify-between mb-2">
                        <span className="bg-zinc-100 px-3 py-1 rounded-full text-xs font-bold">{i.event_type || 'General'}</span>
                        <span className="text-xs text-zinc-400">{new Date(i.created_at).toLocaleDateString()}</span>
                     </div>
                     <h3 className="font-bold">{i.name} <span className="text-zinc-400 font-normal">({i.email})</span></h3>
                     <p className="mt-2 text-zinc-600 bg-zinc-50 p-3 rounded-lg text-sm">{i.message}</p>
                     <a href={`mailto:${i.email}`} className="inline-block mt-3 text-xs font-bold uppercase text-[#d4af37] hover:underline">Reply to Guest</a>
                  </div>
               ))}
            </div>
         )}
      </main>
    </div>
  );
};

export default AdminDashboard;