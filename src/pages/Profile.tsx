import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Bell, Tag, Camera, MapPin, Calendar, Star, Trash2, Edit2, Save, X, Phone } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [showOffers, setShowOffers] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      // 1. Get Profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const currentProfile = prof || user;
      setProfile(currentProfile);
      setEditForm({ 
         full_name: currentProfile.full_name || '', 
         phone: currentProfile.phone || '' 
      });

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

  // --- UPDATE PROFILE ---
  const handleSaveProfile = async () => {
     try {
        setSaving(true);
        const { error } = await supabase
           .from('profiles')
           .update({ 
               full_name: editForm.full_name,
               phone: editForm.phone
           })
           .eq('id', profile.id);

        if (error) throw error;

        setProfile({ ...profile, ...editForm });
        setIsEditing(false);
        toast.success("Profile Updated", { description: "Your details have been saved." });

     } catch (err: any) {
        toast.error("Update Failed", { description: err.message });
     } finally {
        setSaving(false);
     }
  };

  // --- CANCEL BOOKING ---
  const handleCancelBooking = async (booking: any) => {
    if (!confirm("Are you sure you want to cancel this reservation? This cannot be undone.")) return;

    try {
      toast.info("Processing cancellation...");

      // 1. Send Email Notification via Edge Function
      const { error: fnError } = await supabase.functions.invoke('cancel-booking', {
        body: {
          email: profile.email,
          name: profile.full_name || 'Guest',
          booking_id: booking.id,
          room_name: booking.room_name,
          refund_amount: booking.total_price 
        }
      });

      if (fnError) console.error("Email notification failed:", fnError);

      // 2. Delete from Database
      const { error } = await supabase.from('bookings').delete().eq('id', booking.id);
      if (error) throw error;

      toast.success("Booking Cancelled", { description: `Room #${booking.room_number} is now free.` });
      setBookings(bookings.filter(b => b.id !== booking.id));

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
    <div className="min-h-screen bg-[#fcfbf9] pt-24 pb-12 px-4 font-sans text-zinc-900 selection:bg-[#d4af37] selection:text-white">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">
        
        {/* --- LEFT: PROFILE CARD (4 Cols) --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-zinc-100 text-center relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-32 bg-zinc-900/5 group-hover:bg-[#d4af37]/10 transition-colors duration-500" />
            
            <div className="relative z-10">
                <div className="relative w-32 h-32 mx-auto mb-6">
                   <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl bg-zinc-100 relative">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300"><User size={40} /></div>
                      )}
                      {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"/></div>}
                   </div>
                   <button disabled={uploading} onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-black text-white p-2.5 rounded-full shadow-lg hover:bg-[#d4af37] transition-all hover:scale-110">
                      <Camera size={16} />
                   </button>
                   <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                </div>

                {!isEditing ? (
                    <div className="mb-8">
                        <h2 className="text-3xl font-serif font-bold mb-1">{profile.full_name || 'Guest'}</h2>
                        <p className="text-zinc-500 text-sm mb-4">{profile.email}</p>
                        {profile.phone && <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-50 rounded-full text-xs font-bold text-zinc-600 border border-zinc-100"><Phone size={12} /> {profile.phone}</div>}
                        
                        <button onClick={() => setIsEditing(true)} className="mt-6 text-xs font-bold uppercase tracking-widest text-[#d4af37] hover:text-black transition-colors flex items-center justify-center gap-2 mx-auto">
                            <Edit2 size={12} /> Edit Profile
                        </button>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 space-y-4">
                        <input 
                           type="text" 
                           value={editForm.full_name} 
                           onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                           placeholder="Full Name"
                           className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#d4af37]/20 outline-none placeholder:font-normal"
                        />
                         <input 
                           type="tel" 
                           value={editForm.phone} 
                           onChange={e => setEditForm({...editForm, phone: e.target.value})}
                           placeholder="Phone Number"
                           className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#d4af37]/20 outline-none placeholder:font-normal"
                        />
                        <div className="flex gap-2 justify-center pt-2">
                             <button onClick={() => setIsEditing(false)} className="p-2 border border-zinc-200 rounded-full hover:bg-zinc-100 transition-colors"><X size={16}/></button>
                             <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37] transition-colors flex items-center gap-2">
                                {saving ? "Saving..." : <><Save size={14} /> Save</>} 
                             </button>
                        </div>
                    </motion.div>
                )}
                
                <div className="h-px bg-zinc-100 my-6" />

                <button onClick={handleLogout} className="w-full py-4 border border-zinc-200 rounded-2xl font-bold text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2 text-zinc-600 group">
                   <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
                </button>
            </div>
          </div>

          <button onClick={() => setShowOffers(!showOffers)} className="w-full bg-black text-white p-8 rounded-[2.5rem] flex items-center justify-between shadow-xl hover:bg-[#d4af37] transition-all group overflow-hidden relative">
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"><Bell size={24} /></div>
                <div className="text-left">
                   <p className="font-serif font-bold text-lg">Notifications</p>
                   <p className="text-xs text-white/60 group-hover:text-black/60 uppercase tracking-wider">Latest Offers</p>
                </div>
             </div>
             <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse relative z-10 box-content border-4 border-black group-hover:border-[#d4af37]" />
          </button>
        </div>

        {/* --- RIGHT: CONTENT AREA (8 Cols) --- */}
        <div className="lg:col-span-8 space-y-8">
           
           <AnimatePresence>
             {showOffers && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="bg-gradient-to-br from-[#d4af37] to-[#b89628] p-10 rounded-[2.5rem] text-white relative shadow-lg overflow-hidden">
                     <div className="absolute -right-10 -bottom-10 opacity-20"><Tag size={200} /></div>
                     <span className="inline-block px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">Member Exclusive</span>
                     <h3 className="text-4xl font-serif font-bold mb-4">Spa Sanctuary</h3>
                     <p className="mb-8 max-w-lg text-white/90 text-lg">Indulge in our signature antigravity massage therapy. Members get an exclusive 15% privilege.</p>
                     
                     <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl font-mono text-xl font-bold tracking-widest border border-white/30">SPA15</div>
                        <button className="bg-black text-white px-8 py-4 rounded-xl text-sm font-bold hover:bg-white hover:text-black transition-colors shadow-lg">Redeem Offer</button>
                     </div>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

           <div>
               <div className="flex items-center justify-between mb-8 pl-2">
                  <h3 className="text-3xl font-serif font-bold">My Reservations</h3>
                  <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-xs font-bold">{bookings.length} Active</span>
               </div>
           
               {bookings.length === 0 ? (
                 <div className="bg-white p-20 rounded-[2.5rem] text-center text-zinc-300 border border-zinc-100 flex flex-col items-center">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6"><Calendar size={32} /></div>
                    <h4 className="text-xl font-serif font-bold text-zinc-900 mb-2">No Upcoming Stays</h4>
                    <p className="text-sm max-w-xs mx-auto mb-8">Your journey to relaxation hasn't started yet. Book your first stay today.</p>
                    <button onClick={() => navigate('/rooms')} className="bg-black text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37] transition-colors">Book a Room</button>
                 </div>
               ) : (
                 <div className="space-y-6">
                   {bookings.map(booking => (
                     <div key={booking.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col md:flex-row gap-8 items-start md:items-center group">
                        
                        {/* Date Box */}
                        <div className="w-full md:w-24 h-24 bg-zinc-900 text-white rounded-[1.5rem] flex flex-col items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                           <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{new Date(booking.check_in).toLocaleString('default', { month: 'short' })}</span>
                           <span className="text-3xl font-serif font-bold">{new Date(booking.check_in).getDate()}</span>
                           <span className="text-[10px] opacity-40 mt-1">{new Date(booking.check_in).getFullYear()}</span>
                        </div>

                        <div className="flex-1 space-y-2">
                           <div className="flex items-center gap-2">
                              <span className="bg-[#d4af37]/10 text-[#d4af37] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Upcoming</span>
                           </div>
                           <h4 className="font-serif font-bold text-2xl">{booking.room_name}</h4>
                           <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 font-medium">
                              <span className="flex items-center gap-1.5"><MapPin size={16} className="text-zinc-300" /> Room {booking.room_number || 'TBA'}</span>
                              <span className="flex items-center gap-1.5"><Star size={16} className="text-zinc-300" /> {booking.nights} Nights</span>
                              <span className="flex items-center gap-1.5"><User size={16} className="text-zinc-300" /> {booking.guests} Guests</span>
                           </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="w-full md:w-auto text-right flex flex-col items-end gap-3 md:pl-8 md:border-l border-zinc-100">
                           <div>
                              <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Total Paid</span>
                              <p className="font-serif font-bold text-2xl">₹{booking.total_price.toLocaleString()}</p>
                           </div>
                           
                           <button 
                             onClick={() => handleCancelBooking(booking)}
                             className="flex items-center gap-2 text-red-500 text-xs font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-red-100/50 w-full md:w-auto justify-center"
                           >
                             <Trash2 size={14} /> Cancel Reservation
                           </button>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
           </div>
        </div>

      </div>
    </div>
  );
};
export default Profile;