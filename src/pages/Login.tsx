import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Lock, ArrowRight, Loader2, ShieldCheck, Chrome } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromRoom = location.state?.room;

  const [mode, setMode] = useState<'otp' | 'password'>('otp');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const captchaTokenRef = useRef<string | null>(null);
  const turnstileRef = useRef<any>(null);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/profile` }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error("Google Login Failed", { description: error.message });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = captchaTokenRef.current;
    if (!token) {
      toast.error("Please wait for the captcha to verify.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email, 
        options: { shouldCreateUser: true, captchaToken: token } 
      });
      
      if (error) throw error;
      setStep('verify');
      toast.success("Code sent!", { description: `Check ${email}` });
      
    } catch (error: any) {
      toast.error("Error", { description: error.message });
      turnstileRef.current?.reset(); 
      captchaTokenRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
      toast.success("Welcome back!");
      navigate(fromRoom ? '/booking' : '/profile', { state: { room: fromRoom } });
    } catch (error: any) {
      toast.error("Invalid Code");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      if (profile?.role === 'admin') navigate('/admin');
      else navigate('/profile');
      
    } catch (error: any) {
      toast.error("Login Failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80')] bg-cover bg-center opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl relative z-10 overflow-hidden">
        
        <div className="p-8 pb-0 text-center">
          <div className="w-16 h-16 bg-[#d4af37] rounded-2xl mx-auto mb-6 flex items-center justify-center text-black shadow-lg">
             <Lock size={28} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Welcome</h1>
          <p className="text-zinc-400 text-sm mb-6">Sign in to access your account</p>
          
          {/* FIX: Added type="button" */}
          <button type="button" onClick={handleGoogleLogin} className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors mb-6">
            <Chrome size={20} /> Continue with Google
          </button>

          <div className="relative mb-6">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
             <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#18181b] px-2 text-zinc-500 rounded-full">Or continue with email</span></div>
          </div>
        </div>

        {/* TOGGLE */}
        <div className="flex bg-black/30 mx-8 p-1 rounded-xl mb-6">
           {/* FIX: Added type="button" */}
           <button type="button" onClick={() => { setMode('otp'); setStep('email'); }} className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${mode === 'otp' ? 'bg-[#d4af37] text-black' : 'text-zinc-500 hover:text-white'}`}>Guest</button>
           <button type="button" onClick={() => setMode('password')} className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${mode === 'password' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Admin</button>
        </div>

        <div className="px-8 pb-8">
          <AnimatePresence mode="wait">
            {mode === 'otp' ? (
              <motion.form key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp} className="space-y-4">
                 {step === 'email' ? (
                   <>
                     <input type="email" required placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white focus:border-[#d4af37] outline-none" />
                     <div className="flex justify-center py-2 h-[65px]">
                       <Turnstile
                         ref={turnstileRef}
                         siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                         onSuccess={(token) => { captchaTokenRef.current = token; }}
                         options={{ theme: 'dark', size: 'normal' }}
                       />
                     </div>
                   </>
                 ) : (
                    <input type="text" required placeholder="Enter Code" value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white text-center tracking-widest font-bold focus:border-[#d4af37] outline-none" />
                 )}
                 {/* FIX: Added type="submit" */}
                 <button type="submit" disabled={loading} className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : step === 'email' ? <>Send Code <ArrowRight size={18} /></> : <>Verify <ShieldCheck size={18} /></>}
                 </button>
              </motion.form>
            ) : (
              <motion.form key="pass" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleAdminLogin} className="space-y-4">
                 <input type="email" required placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white outline-none" />
                 <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white outline-none" />
                 {/* FIX: Added type="submit" */}
                 <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <>Login <ArrowRight size={18} /></>}
                 </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
export default Login;