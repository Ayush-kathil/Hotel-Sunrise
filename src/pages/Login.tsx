import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [lightOn, setLightOn] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true); // Toggle for Login vs Signup
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 1. Handle Google Login (Works for both new and existing)
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      saveUser(result.user);
    } catch (error: any) {
      alert("Google Login Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Email/Password Login & Signup
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLoginMode) {
        // --- EXISTING USER LOGIC ---
        const result = await signInWithEmailAndPassword(auth, email, password);
        saveUser(result.user);
      } else {
        // --- NEW USER LOGIC ---
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Add their name to their profile
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name });
        }
        saveUser({ ...result.user, displayName: name });
      }
    } catch (error: any) {
      alert("Error: " + error.message);
      setLoading(false);
    }
  };

  // Helper to save data and redirect
  const saveUser = (user: any) => {
    localStorage.setItem('sunriseUser', user.displayName || 'Guest');
    localStorage.setItem('sunriseEmail', user.email || '');
    setLightOn(true); // Turn on light for effect
    setTimeout(() => navigate('/'), 1000);
  };

  return (
    <div className={`h-screen w-full flex justify-center items-center transition-colors duration-700 overflow-hidden relative ${lightOn ? 'bg-zinc-900' : 'bg-black'}`}>
      
      {/* LAMP ASSEMBLY */}
      <div className="lamp-assembly">
        <div className="cord"></div>
        <div className="arm-top"></div>
        <div className="joint"></div>
        <div className="arm-bottom"></div>
        <div className="shade"></div>
        <div className={`bulb-glow ${lightOn ? 'on' : ''}`}></div>
        <div className="string" onClick={() => setLightOn(!lightOn)}>
           <div className="knob"></div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, rotateY: 90 }}
        animate={{ opacity: lightOn ? 1 : 0, rotateY: lightOn ? 0 : 90 }}
        transition={{ duration: 0.8 }}
        className="bg-zinc-950/90 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-zinc-800 w-[400px] text-center z-30 shadow-2xl"
      >
        <h2 className="text-white font-serif text-3xl mb-2">
          {isLoginMode ? 'Welcome Back' : 'Join Sunrise'}
        </h2>
        <p className="text-zinc-500 mb-8 text-sm">
          {isLoginMode ? 'Enter your details to sign in.' : 'Start your luxury journey today.'}
        </p>
        
        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 text-left">
          
          {/* Show Name field ONLY for New Users */}
          <AnimatePresence>
            {!isLoginMode && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="relative overflow-hidden"
              >
                <User className="absolute left-3 top-3 text-zinc-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-3 pl-10 text-white outline-none focus:border-[#d4af37] transition-colors"
                  required={!isLoginMode}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-zinc-500" size={18} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-3 pl-10 text-white outline-none focus:border-[#d4af37] transition-colors"
              required 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-zinc-500" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-3 pl-10 text-white outline-none focus:border-[#d4af37] transition-colors"
              required 
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-[#d4af37] hover:text-white transition-all flex justify-center items-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isLoginMode ? 'SIGN IN' : 'CREATE ACCOUNT'} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-[1px] bg-zinc-800 flex-1"></div>
          <span className="text-zinc-600 text-xs uppercase">Or continue with</span>
          <div className="h-[1px] bg-zinc-800 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-zinc-900 border border-zinc-800 text-white py-3 rounded-xl font-medium hover:bg-zinc-800 transition-all flex justify-center items-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Google
        </button>

        {/* TOGGLE LINK FOR NEW/EXISTING USER */}
        <p className="mt-8 text-zinc-500 text-sm">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-[#d4af37] font-bold hover:underline ml-1"
          >
            {isLoginMode ? 'Sign Up' : 'Login'}
          </button>
        </p>

      </motion.div>
    </div>
  );
};

export default Login;