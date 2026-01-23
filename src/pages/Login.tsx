import { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRight, Loader2, ShieldCheck, Chrome, Mail, Key } from 'lucide-react';
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
    <div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-900 selection:bg-[#d4af37] selection:text-white">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full">
         <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[100px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#d4af37]/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white overflow-hidden relative z-10 grid md:grid-cols-2"
      >
        {/* LEFT: IMAGE / WELCOME */}
        <div className="relative overflow-hidden hidden md:flex flex-col justify-between p-12 bg-zinc-900 text-white">
           <div className="absolute inset-0 opacity-60">
              <img src="https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="w-full h-full object-cover" alt="Luxury Hotel" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/40 to-black/90" />
           </div>
           
           <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 mb-6">
                 <span className="font-serif font-bold text-2xl text-[#d4af37]">S</span>
              </div>
              <p className="text-[#d4af37] text-xs font-bold uppercase tracking-widest mb-2">Member Access</p>
              <h2 className="text-4xl font-serif font-bold leading-tight">Unlock a world <br/> of privileges.</h2>
           </div>

           <div className="relative z-10">
              <div className="flex -space-x-3 mb-4">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i+10})`, backgroundSize: 'cover' }} />
                 ))}
                 <div className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-[#d4af37] flex items-center justify-center text-[10px] font-bold text-black">+2k</div>
              </div>
              <p className="text-white/60 text-sm">Join our exclusive community of travelers.</p>
           </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white/50 backdrop-blur-xl">
           <div className="text-center mb-10">
              <h1 className="text-3xl font-serif font-bold text-zinc-900 mb-2">Welcome Back</h1>
              <p className="text-zinc-500 text-sm">Please enter your details to sign in.</p>
           </div>

           {/* Toggle Tabs */}
           <div className="flex p-1 bg-zinc-100 rounded-xl mb-8 relative">
              <motion.div 
                 layoutId="activeTab"
                 className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm"
                 initial={false}
                 animate={{ 
                    left: mode === 'otp' ? '4px' : '50%', 
                    width: 'calc(50% - 4px)'
                 }}
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button 
                 type="button" 
                 onClick={() => { setMode('otp'); setStep('email'); }} 
                 className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide relative z-10 transition-colors ${mode === 'otp' ? 'text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                 Guest Login
              </button>
              <button 
                 type="button" 
                 onClick={() => setMode('password')} 
                 className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide relative z-10 transition-colors ${mode === 'password' ? 'text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                 Admin
              </button>
           </div>

           {/* Google Button */}
           <button 
             type="button" 
             onClick={handleGoogleLogin} 
             className="w-full bg-white border border-zinc-200 text-zinc-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-50 hover:border-zinc-300 transition-all mb-8 shadow-sm hover:shadow-md group"
           >
             <Chrome size={20} className="text-zinc-400 group-hover:text-blue-500 transition-colors" /> 
             <span className="text-sm">Continue with Google</span>
           </button>

           <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest"><span className="bg-white px-3 text-zinc-300">Or using email</span></div>
           </div>

           <AnimatePresence mode="wait">
             {mode === 'otp' ? (
               <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp} className="space-y-5">
                  {step === 'email' ? (
                    <>
                      <div className="relative group">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#d4af37] transition-colors" size={20} />
                         <input type="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 group-focus-within:border-[#d4af37] group-focus-within:bg-white rounded-xl py-4 pl-12 pr-4 text-zinc-900 outline-none transition-all placeholder:text-zinc-400 font-medium" />
                      </div>
                      <div className="flex justify-center h-[65px] opacity-80 hover:opacity-100 transition-opacity">
                        <Turnstile
                          ref={turnstileRef}
                          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                          onSuccess={(token) => { captchaTokenRef.current = token; }}
                          options={{ theme: 'light', size: 'normal' }}
                        />
                      </div>
                    </>
                  ) : (
                     <div className="text-center">
                        <p className="text-sm text-zinc-500 mb-4">We sent a code to <span className="text-zinc-900 font-bold">{email}</span></p>
                        <input autoFocus type="text" required placeholder="• • • • • •" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#d4af37] focus:bg-white rounded-xl py-4 px-4 text-zinc-900 text-center text-2xl tracking-[1em] font-bold outline-none transition-all placeholder:text-zinc-300 placeholder:tracking-normal" />
                     </div>
                  )}
                  <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-[#d4af37] hover:text-black transition-all shadow-lg hover:shadow-[#d4af37]/20 flex items-center justify-center gap-2">
                     {loading ? <Loader2 className="animate-spin" /> : step === 'email' ? <>Send Code <ArrowRight size={18} /></> : <>Verify & Login <ShieldCheck size={18} /></>}
                  </button>
               </motion.form>
             ) : (
               <motion.form key="pass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleAdminLogin} className="space-y-5">
                  <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#d4af37] transition-colors" size={20} />
                      <input type="email" required placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 group-focus-within:border-[#d4af37] group-focus-within:bg-white rounded-xl py-4 pl-12 pr-4 text-zinc-900 outline-none transition-all placeholder:text-zinc-400 font-medium" />
                  </div>
                  <div className="relative group">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#d4af37] transition-colors" size={20} />
                      <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 group-focus-within:border-[#d4af37] group-focus-within:bg-white rounded-xl py-4 pl-12 pr-4 text-zinc-900 outline-none transition-all placeholder:text-zinc-400 font-medium" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-[#d4af37] hover:text-black transition-all shadow-lg hover:shadow-[#d4af37]/20 flex items-center justify-center gap-2">
                     {loading ? <Loader2 className="animate-spin" /> : <>Access Dashboard <ArrowRight size={18} /></>}
                  </button>
               </motion.form>
             )}
           </AnimatePresence>

           <div className="mt-8 text-center">
              <Link to="/" className="text-xs font-bold text-zinc-400 hover:text-black transition-colors uppercase tracking-wider">Back to Home</Link>
           </div>
        </div>
      </motion.div>
    </div>
  );
};
export default Login;