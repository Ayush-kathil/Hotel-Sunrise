import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Chrome, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [isOn, setIsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    
    const action = isSignUp 
      ? supabase.auth.signUp({ 
          email, 
          password, 
          options: { data: { full_name: 'New Member' } } 
        })
      : supabase.auth.signInWithPassword({ email, password });

    const { error } = await action;

    if (error) {
      alert(error.message);
    } else {
      if (isSignUp) alert("Account created! Check your email.");
      navigate('/');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' }
    });
    if (error) alert(error.message);
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out flex flex-col items-center justify-center relative overflow-hidden ${isOn ? 'bg-[#e0e0e0]' : 'bg-zinc-950'}`}>
      
      {/* --- THE LAMP STRING (Clickable Area) --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center cursor-pointer group" onClick={toggleLight}>
        {/* Invisible larger hit area for easier clicking */}
        <div className="absolute inset-0 w-20 h-full -z-10" />
        
        {/* The Cord */}
        <motion.div 
          className="w-0.5 bg-zinc-800"
          animate={{ height: isOn ? 100 : 130 }} 
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        />
        {/* The Handle */}
        <motion.div 
          whileTap={{ y: 20 }}
          className={`w-3 h-6 rounded-full shadow-lg border-2 transition-colors duration-300 ${isOn ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_15px_rgba(255,255,0,0.8)]' : 'bg-zinc-800 border-zinc-700'}`}
        />
      </div>

      {/* --- INSTRUCTION TEXT --- */}
      <AnimatePresence>
        {!isOn && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-40 text-zinc-500 text-xs tracking-widest uppercase font-bold pointer-events-none"
          >
            Pull the string to login
          </motion.p>
        )}
      </AnimatePresence>

      {/* --- LIGHTING EFFECT (The Cone) --- */}
      <div 
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1000px] pointer-events-none transition-opacity duration-700 ${isOn ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)'
        }}
      />

      {/* --- LOGIN FORM (Border removed, blends into light) --- */}
      {isOn && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md p-8 z-10 relative"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-black mb-2">Welcome Back</h2>
            <p className="text-zinc-500 text-sm">Please sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 focus-within:bg-white transition-colors shadow-sm">
              <Mail size={18} className="text-zinc-400" />
              <input 
                type="email" 
                placeholder="Email address"
                className="bg-transparent w-full outline-none text-black placeholder:text-zinc-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 focus-within:bg-white transition-colors shadow-sm">
              <Lock size={18} className="text-zinc-400" />
              <input 
                type="password" 
                placeholder="Password"
                className="bg-transparent w-full outline-none text-black placeholder:text-zinc-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 opacity-50">
            <div className="h-[1px] bg-black/10 flex-1"></div>
            <span className="text-[10px] uppercase text-black/40 tracking-widest">Or</span>
            <div className="h-[1px] bg-black/10 flex-1"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors shadow-sm"
          >
            <Chrome size={18} className="text-blue-500" /> 
            <span className="font-medium text-zinc-700">Continue with Google</span>
          </button>

          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
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