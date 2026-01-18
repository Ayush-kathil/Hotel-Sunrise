import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { User, Phone, Mail, LogOut, Save, ShieldCheck, MapPin } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  // 1. Fetch User Data
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { user } = session;
      setUser(user);
      setEmail(user.email || '');

      // Get profile data from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || user.user_metadata.full_name || '');
        setMobile(profile.mobile || '');
      } else {
        // Fallback if no profile row exists yet
        setFullName(user.user_metadata.full_name || '');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  // 2. Save Changes & Redirect
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!user) return;

    // Use "upsert" to update if exists, or create if missing
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName,
        mobile: mobile,
        email: email, 
        updated_at: new Date().toISOString(),
      });

    if (error) {
      alert("Error saving profile: " + error.message);
      setSaving(false); // Stop loading only if there is an error
    } else {
      // SUCCESS: Redirect to Home Page immediately
      navigate('/'); 
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fcfbf9]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#fcfbf9] pt-24 pb-12 font-sans px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex justify-between items-end"
        >
          <div>
            <h1 className="text-4xl font-serif text-black mb-2">My Account</h1>
            <p className="text-zinc-500">Manage your personal details.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-full transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Sidebar Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 h-fit"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-6 text-2xl font-serif font-bold">
                 {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <h2 className="text-xl font-bold mb-1">{fullName || 'Guest User'}</h2>
              <span className="px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-bold uppercase tracking-widest rounded-full">
                Gold Member
              </span>
            </div>
          </motion.div>

          {/* Main Form */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
             className="lg:col-span-2"
          >
            <form onSubmit={handleSave} className="bg-white p-10 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 space-y-8">
              
              <h3 className="text-xl font-serif font-bold border-b border-zinc-100 pb-4 mb-6">Personal Details</h3>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-2 flex items-center gap-2">
                     <User size={14} /> Full Name
                   </label>
                   <input 
                     type="text" 
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all" 
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-2 flex items-center gap-2">
                     <Mail size={14} /> Email Address
                   </label>
                   <input 
                     type="email" 
                     value={email}
                     disabled
                     className="w-full bg-zinc-100 border border-zinc-200 p-4 rounded-xl outline-none text-zinc-500 cursor-not-allowed" 
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-2 flex items-center gap-2">
                     <Phone size={14} /> Mobile Number
                   </label>
                   <input 
                     type="tel" 
                     value={mobile}
                     onChange={(e) => setMobile(e.target.value)}
                     placeholder="+91 000 000 0000"
                     className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all" 
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-2 flex items-center gap-2">
                     <MapPin size={14} /> Location
                   </label>
                   <input 
                     type="text" 
                     disabled
                     placeholder="India"
                     className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none" 
                   />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <ShieldCheck size={14} /> Data is encrypted
                 </div>
                 <button 
                   disabled={saving}
                   className="px-8 py-4 bg-black text-white font-bold rounded-xl hover:bg-[#d4af37] transition-all flex items-center gap-3 disabled:opacity-70"
                 >
                   {saving ? 'Saving...' : 'Save & Continue'} <Save size={18} />
                 </button>
              </div>

            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;