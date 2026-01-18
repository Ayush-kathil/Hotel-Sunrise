import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserPlus, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorCard, setShowErrorCard] = useState(false); // Controls the Premium Error Card
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const savedRoom = location.state?.room;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowErrorCard(false);

    try {
      if (isSignUp) {
        // --- SIGN UP ---
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.fullName } }
        });
        if (error) throw error;
        toast.success("Account Created!", { description: "Please check your email to verify." });
      } else {
        // --- SIGN IN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
           // Invalid credentials -> Show Premium Error Card
           setShowErrorCard(true);
           setLoading(false);
           return;
        }

        // --- ROLE CHECK (The Logic Fix) ---
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();

        toast.success("Welcome Back");
        
        // Intelligent Redirect
        if (profile?.role === 'admin') {
           navigate('/dashboard'); // Admin -> Dashboard
        } else if (savedRoom) {
           navigate('/booking', { state: { room: savedRoom } }); // Back to booking if interrupted
        } else {
           navigate('/profile'); // Normal User -> Profile
        }
      }
    } catch (error: any) {
      toast.error("Authentication Failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfbf9] relative overflow-hidden px-6">
      
      {/* Background Decoration (PRESERVED) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#d4af37]/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-zinc-900/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/50 relative z-10"
      >
        {/* Toggle Header */}
        <div className="flex justify-center mb-10 bg-zinc-100 p-1 rounded-full w-fit mx-auto">
           <button 
             onClick={() => { setIsSignUp(false); setShowErrorCard(false); }}
             className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${!isSignUp ? 'bg-black text-white shadow-lg' : 'text-zinc-400 hover:text-black'}`}
           >
             Sign In
           </button>
           <button 
             onClick={() => { setIsSignUp(true); setShowErrorCard(false); }}
             className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${isSignUp ? 'bg-black text-white shadow-lg' : 'text-zinc-400 hover:text-black'}`}
           >
             Register
           </button>
        </div>

        <div className="text-center mb-10">
           <h1 className="text-3xl font-serif font-bold mb-2">{isSignUp ? 'Join the Club' : 'Welcome Back'}</h1>
           <p className="text-zinc-400 text-sm">Enter your details to access your account.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
           {isSignUp && (
             <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                <input 
                  type="text" placeholder="Full Name" required 
                  className="w-full bg-zinc-50 border border-zinc-100 p-4 pl-12 rounded-xl outline-none focus:border-[#d4af37] transition-colors"
                  value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
             </div>
           )}

           <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
              <input 
                type="email" placeholder="Email Address" required 
                className="w-full bg-zinc-50 border border-zinc-100 p-4 pl-12 rounded-xl outline-none focus:border-[#d4af37] transition-colors"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
           </div>

           <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
              <input 
                type="password" placeholder="Password" required 
                className="w-full bg-zinc-50 border border-zinc-100 p-4 pl-12 rounded-xl outline-none focus:border-[#d4af37] transition-colors"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              />
           </div>

           <button disabled={loading} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-[#d4af37] transition-all disabled:opacity-50 flex justify-center items-center gap-2 mt-4 shadow-xl">
              {loading ? "Processing..." : (isSignUp ? "Create Account" : "Access Account")} <ArrowRight size={16} />
           </button>
        </form>

        {/* --- PREMIUM "ACCOUNT NOT FOUND" CARD (PRESERVED) --- */}
        <AnimatePresence>
          {showErrorCard && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-8 text-center rounded-[2.5rem]"
            >
               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <XCircle size={32} />
               </div>
               <h3 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Account Not Found</h3>
               <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                 We couldn't find an account with these credentials.
               </p>
               
               <div className="flex flex-col gap-3 w-full">
                 <button 
                   onClick={() => { setShowErrorCard(false); setIsSignUp(true); }}
                   className="w-full py-4 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-black hover:text-white transition-all shadow-lg"
                 >
                   Create New Account
                 </button>
                 <button 
                   onClick={() => setShowErrorCard(false)}
                   className="w-full py-4 bg-zinc-100 text-zinc-500 font-bold rounded-xl hover:bg-zinc-200 transition-all"
                 >
                   Try Again
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default Login;