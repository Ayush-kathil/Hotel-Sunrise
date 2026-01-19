import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, KeyRound } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromRoom = location.state?.room; // Remember where they came from

  // --- STATE ---
  const [mode, setMode] = useState<'otp' | 'password'>('otp'); // 'otp' = Guest, 'password' = Admin
  const [step, setStep] = useState<'email' | 'verify'>('email'); // For OTP flow
  const [loading, setLoading] = useState(false);
  
  // Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // For Admin
  const [otp, setOtp] = useState(''); // For Guest

  // --- 1. HANDLE GUEST LOGIN (OTP) ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      
      setStep('verify'); // Move to Step 2
      toast.success("Code sent!", { description: `Check ${email} for your access code.` });
    } catch (error: any) {
      toast.error("Error sending code", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      // SUCCESS
      toast.success("Welcome back!");
      navigate(fromRoom ? '/booking' : '/profile', { state: { room: fromRoom } });

    } catch (error: any) {
      toast.error("Invalid Code", { description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLE ADMIN LOGIN (PASSWORD) ---
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if actually admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'admin') {
        toast.success("Admin Access Granted");
        navigate('/admin');
      } else {
        toast.success("Welcome back");
        navigate('/profile');
      }

    } catch (error: any) {
      toast.error("Login Failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-black/80 to-transparent"></div>
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#d4af37] rounded-full blur-[120px] opacity-20 animate-pulse"></div>

      {/* LOGIN CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden relative z-10"
      >
        
        {/* HEADER */}
        <div className="p-8 text-center border-b border-white/5">
          <div className="w-16 h-16 bg-[#d4af37] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <Lock className="text-black" size={28} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Welcome</h1>
          <p className="text-zinc-400 text-sm">
            {mode === 'otp' ? 'Secure passwordless access' : 'Administrative login'}
          </p>
        </div>

        {/* TABS */}
        <div className="flex p-2 bg-black/20 mx-8 mt-6 rounded-xl">
          <button 
            onClick={() => { setMode('otp'); setStep('email'); }} 
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'otp' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            Guest Access
          </button>
          <button 
            onClick={() => setMode('password')} 
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'password' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            Admin Login
          </button>
        </div>

        {/* FORMS */}
        <div className="p-8">
          <AnimatePresence mode="wait">

            {/* --- GUEST OTP MODE --- */}
            {mode === 'otp' && (
              <motion.div 
                key="otp" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
              >
                {step === 'email' ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                      <input 
                        type="email" 
                        required
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                      />
                    </div>
                    <button disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-[#d4af37] transition-colors flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="animate-spin" /> : <>Send Access Code <ArrowRight size={18} /></>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="text-center mb-6">
                      <p className="text-zinc-400 text-xs">Code sent to <span className="text-white">{email}</span></p>
                      <button type="button" onClick={() => setStep('email')} className="text-[#d4af37] text-xs hover:underline">Change Email</button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                      <input 
                        type="text" 
                        required
                        placeholder="Enter 6-digit code" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37] transition-colors tracking-widest text-center text-lg font-bold"
                      />
                    </div>
                    <button disabled={loading} className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="animate-spin" /> : <>Verify & Login <ShieldCheck size={18} /></>}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* --- ADMIN PASSWORD MODE --- */}
            {mode === 'password' && (
              <motion.div 
                key="password" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
              >
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input 
                      type="email" 
                      required
                      placeholder="Admin Email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input 
                      type="password" 
                      required
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                  <button disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <>Access Dashboard <ArrowRight size={18} /></>}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-black/20 border-t border-white/5 text-center">
          <p className="text-zinc-600 text-xs">
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;