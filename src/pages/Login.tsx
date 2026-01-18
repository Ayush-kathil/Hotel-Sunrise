import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Chrome, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [isOn, setIsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // NEW
  const [isSignUp, setIsSignUp] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/');
    });
  }, [navigate]);

  const toggleLight = () => setIsOn(!isOn);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        // --- SIGN UP VALIDATION ---
        if (password !== confirmPassword) {
            toast.error("Passwords do not match", { description: "Please check and try again." });
            setLoading(false);
            return;
        }
        if (password.length < 6) {
            toast.error("Password too weak", { description: "Must be at least 6 characters." });
            setLoading(false);
            return;
        }

        // --- SIGN UP LOGIC ---
        const { error } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: { 
            data: { full_name: 'New Member' },
            emailRedirectTo: window.location.origin // Ensure they come back here after clicking email
          } 
        });
        if (error) throw error;
        
        // Success Toast
        toast.success("Verification Email Sent!", {
          description: "Please check your inbox to verify your account before logging in.",
          duration: 6000, // Show longer so they read it
          icon: <CheckCircle className="text-green-500" />
        });
        
        // Switch back to login view so they can login after verifying
        setIsSignUp(false); 

      } else {
        // --- SIGN IN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
             // Specific error for unverified emails
             if (error.message.includes("Email not confirmed")) {
                 throw new Error("Please verify your email address first.");
             }
             throw error;
        }

        toast.success("Welcome back!", {
          description: "You have successfully logged in."
        });
        navigate('/');
      }
    } catch (error: any) {
      toast.error("Access Denied", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' }
    });
    if (error) {
      toast.error("Google Login Failed", { description: error.message });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out flex flex-col items-center justify-center relative overflow-hidden ${isOn ? 'bg-[#e0e0e0]' : 'bg-zinc-950'}`}>
      
      {/* --- THE LAMP STRING --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center cursor-pointer group" onClick={toggleLight}>
        <div className="absolute inset-0 w-20 h-full -z-10" />
        <motion.div 
          className="w-0.5 bg-zinc-800"
          animate={{ height: isOn ? 100 : 130 }} 
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        />
        <motion.div 
          whileTap={{ y: 20 }}
          className={`w-3 h-6 rounded-full shadow-lg border-2 transition-colors duration-300 ${isOn ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_15px_rgba(255,255,0,0.8)]' : 'bg-zinc-800 border-zinc-700'}`}
        />
      </div>

      <AnimatePresence>
        {!isOn && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute top-40 text-zinc-500 text-xs tracking-widest uppercase font-bold pointer-events-none"
          >
            Pull the string to login
          </motion.p>
        )}
      </AnimatePresence>

      <div 
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1000px] pointer-events-none transition-opacity duration-700 ${isOn ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)' }}
      />

      {isOn && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md p-8 z-10 relative"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-black mb-2">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
            <p className="text-zinc-500 text-sm">{isSignUp ? "Join us for exclusive stays" : "Please sign in to continue"}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 focus-within:bg-white transition-colors shadow-sm">
              <Mail size={18} className="text-zinc-400 shrink-0" />
              <input 
                type="email" required placeholder="Email address"
                className="bg-transparent w-full outline-none text-black placeholder:text-zinc-400"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 focus-within:bg-white transition-colors shadow-sm">
              <Lock size={18} className="text-zinc-400 shrink-0" />
              <input 
                type="password" required placeholder="Password"
                className="bg-transparent w-full outline-none text-black placeholder:text-zinc-400"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* --- CONFIRM PASSWORD (Only visible during Sign Up) --- */}
            <AnimatePresence>
                {isSignUp && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 focus-within:bg-white transition-colors shadow-sm mb-1">
                            <Lock size={18} className="text-zinc-400 shrink-0" />
                            <input 
                                type="password" required={isSignUp} placeholder="Confirm Password"
                                className="bg-transparent w-full outline-none text-black placeholder:text-zinc-400"
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Verify & Join' : 'Sign In')}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 opacity-50">
            <div className="h-[1px] bg-black/10 flex-1"></div>
            <span className="text-[10px] uppercase text-black/40 tracking-widest">Or</span>
            <div className="h-[1px] bg-black/10 flex-1"></div>
          </div>

          <button 
            type="button" onClick={handleGoogleLogin}
            className="w-full bg-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors shadow-sm"
          >
            <Chrome size={18} className="text-blue-500" /> 
            <span className="font-medium text-zinc-700">Continue with Google</span>
          </button>

          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => { setIsSignUp(!isSignUp); setConfirmPassword(''); }}
              className="text-xs text-zinc-500 hover:text-black underline"
            >
              {isSignUp ? 'Already a member? Login' : 'New here? Create an account'}
            </button>
          </div>

        </motion.div>
      )}
    </div>
  );
};

export default Login;