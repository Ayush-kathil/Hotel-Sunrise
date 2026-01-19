import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Bell, Tag, Camera, MapPin, Calendar, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [showOffers, setShowOffers] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      // 1. Get Profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof || user);

      // 2. Get Bookings
      const { data: books } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('check_in', { ascending: false });
      setBookings(books || []);
    };
    getData();
  }, [navigate]);

  // --- PHOTO UPLOAD ---
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      
      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success("Profile photo updated!");
      
    } catch (error: any) {
      toast.error("Upload failed", { description: error.message });
    } finally {
      setUploading(false);
    }
  };

  // --- CANCEL BOOKING (NEW) ---
  const handleCancelBooking = async (bookingId: string, roomNumber: number) => {
    if (!confirm("Are you sure you want to cancel this reservation? This cannot be undone.")) return;

    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
      if (error) throw error;

      toast.success("Booking Cancelled", { description: `Room #${roomNumber} is now free.` });
      // Update UI immediately
      setBookings(bookings.filter(b => b.id !== bookingId));

    } catch (error: any) {
      toast.error("Cancellation Failed", { description: error.message });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#fcfbf9] pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
        
        {/* --- LEFT: PROFILE CARD --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100 text-center relative overflow-hidden">
            <div className="relative w-32 h-32 mx-auto mb-4 group">
               <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl bg-zinc-100">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300"><User size={40} /></div>
                  )}
               </div>
               <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-[#d4af37] text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Camera size={16} />
               </button>
               <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
            </div>

            <h2 className="text-2xl font-serif font-bold">{profile.full_name || 'Guest'}</h2>
            <p className="text-zinc-500 text-sm mb-6">{profile.email}</p>
            
            <button onClick={handleLogout} className="w-full py-3 border border-zinc-200 rounded-xl font-bold text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
               <LogOut size={16} /> Sign Out
            </button>
          </div>

          <button onClick={() => setShowOffers(!showOffers)} className="w-full bg-black text-white p-6 rounded-2xl flex items-center justify-between shadow-lg hover:bg-[#d4af37] transition-colors group">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><Bell size={20} /></div>
                <div className="text-left">
                   <p className="font-bold">Notifications</p>
                   <p className="text-xs text-zinc-400 group-hover:text-black">View offers & alerts</p>
                </div>
             </div>
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </button>
        </div>

        {/* --- RIGHT: CONTENT AREA --- */}
        <div className="lg:col-span-2 space-y-6">
           
           <AnimatePresence>
             {showOffers && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="bg-gradient-to-r from-[#d4af37] to-[#b89628] p-8 rounded-[2rem] text-black relative mb-6">
                     <div className="absolute top-0 right-0 p-8 opacity-10"><Tag size={100} /></div>
                     <h3 className="text-2xl font-serif font-bold mb-2">Exclusive Member Offer</h3>
                     <p className="mb-6 max-w-md">Get 15% off spa treatments during your next stay. Use code <span className="font-bold font-mono bg-black/10 px-2 py-1 rounded">SPA15</span></p>
                     <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold">Claim Now</button>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

           <h3 className="text-2xl font-serif font-bold ml-2">My Bookings</h3>
           
           {bookings.length === 0 ? (
             <div className="bg-white p-12 rounded-[2rem] text-center text-zinc-400 border border-zinc-100">
                <Calendar size={40} className="mx-auto mb-4 opacity-20" />
                <p>No bookings yet.</p>
             </div>
           ) : (
             <div className="space-y-4">
               {bookings.map(booking => (
                 <div key={booking.id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex flex-col items-center justify-center shrink-0">
                       <span className="text-xs font-bold text-zinc-400 uppercase">{new Date(booking.check_in).toLocaleString('default', { month: 'short' })}</span>
                       <span className="text-2xl font-serif font-bold">{new Date(booking.check_in).getDate()}</span>
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-lg">{booking.room_name}</h4>
                       <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
                          <span className="flex items-center gap-1"><MapPin size={14} /> Room {booking.room_number}</span>
                          <span className="flex items-center gap-1"><Star size={14} /> {booking.nights} Nights</span>
                       </div>
                    </div>
                    
                    {/* STATUS & CANCEL BUTTON */}
                    <div className="text-right flex flex-col items-end gap-2">
                       <p className="font-bold text-xl">₹{booking.total_price.toLocaleString()}</p>
                       <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Confirmed</span>
                       
                       <button 
                         onClick={() => handleCancelBooking(booking.id, booking.room_number)}
                         className="flex items-center gap-1 text-red-500 text-[10px] font-bold hover:bg-red-50 px-2 py-1 rounded-lg transition-colors border border-red-100 mt-1"
                       >
                         <Trash2 size={12} /> Cancel
                       </button>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};
export default Profile;