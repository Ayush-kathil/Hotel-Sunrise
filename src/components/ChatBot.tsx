import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { MessageSquare, X, Send, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "Welcome to Sunrise. I am your personal concierge. How may I assist you?" }
  ]);

  // REFS
  const constraintsRef = useRef(null); // For dragging boundaries
  const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling
  const chatWindowRef = useRef<HTMLDivElement>(null); // For detecting clicks outside

  // 1. AUTO-SCROLL TO NEW MESSAGES
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 2. AUTO-CLOSE ON CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If chat is open AND click is NOT inside the chat window
      if (isOpen && chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Add listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 3. LOCAL "BRAIN" (Training on Routes)
  const processLocalResponse = (text: string): string | null => {
    const lowerText = text.toLowerCase();

    // FILTER: Inappropriate Content
    const badWords = ['spa', 'girls', 'massage'];
    if (badWords.some(word => lowerText.includes(word))) {
      return "I apologize, but I cannot assist with that request. I am here to help with Hotel Sunrise reservations and services.";
    }

    // ROUTE: Cancellation
    if (lowerText.includes('cancel') || lowerText.includes('refund')) {
      return "To cancel a booking, please go to your Profile (User Icon) > 'My Bookings'. Select the active booking to cancel. Note: Cancellations within 24h of check-in are non-refundable.";
    }
    
    // ROUTE: Booking / Rooms
    if (lowerText.includes('book') || lowerText.includes('reservation') || lowerText.includes('room') || lowerText.includes('suite') || lowerText.includes('price') || lowerText.includes('cost')) {
      return "You can view our suites and make a reservation by clicking 'Rooms' in the top navigation bar. We offer Garden, Deluxe, and Family suites.";
    }

    // ROUTE: Dining
    if (lowerText.includes('food') || lowerText.includes('eat') || lowerText.includes('restaurant') || lowerText.includes('dining') || lowerText.includes('menu') || lowerText.includes('dinner') || lowerText.includes('breakfast')) {
      return "Our 'Golden Spoon' restaurant offers exquisite fine dining. You can view the menu or reserve a table by navigating to the 'Dining' page.";
    }

    // ROUTE: Events
    if (lowerText.includes('wedding') || lowerText.includes('event') || lowerText.includes('meeting') || lowerText.includes('conference') || lowerText.includes('party')) {
      return "We host world-class events. Please visit the 'Events' page to submit an inquiry form for weddings or corporate summits.";
    }

    // ROUTE: Contact / Support
    if (lowerText.includes('contact') || lowerText.includes('call') || lowerText.includes('phone') || lowerText.includes('email') || lowerText.includes('help')) {
      return "Our concierge team is available 24/7. Visit the 'Contact' page, call +91 987 654 3210, or email concierge@sunrise.com.";
    }

    // ROUTE: Login / Account
    if (lowerText.includes('login') || lowerText.includes('sign in') || lowerText.includes('account') || lowerText.includes('profile')) {
      return "You can access your account by clicking the User Icon in the top right corner. From there, you can manage bookings and view your profile.";
    }
    
    // If no local match, return null to trigger Gemini AI
    return null; 
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    // A. Try Local Route Training First
    const localReply = processLocalResponse(userText);
    
    if (localReply) {
      // Simulate thinking time for realism
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'bot', text: localReply }]);
        setLoading(false);
      }, 600);
      return;
    }

    // B. Fallback to Real Gemini AI
    try {
      const { data, error } = await supabase.functions.invoke('ask-gemini', {
        body: { question: userText }
      });

      if (error || !data) throw new Error("API Error");
      
      setMessages((prev) => [...prev, { role: 'bot', text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: "I apologize, I am currently having trouble connecting to the server. Please check your internet connection." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. INVISIBLE CONTAINER FOR DRAG CONSTRAINTS (Whole Screen) */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" />

      {/* 2. CHAT WINDOW (Draggable Container Wrapper if needed, or fixed position) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef} // Attached Ref for Click Outside detection
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[400px] md:h-[600px] z-[101] flex flex-col bg-[#fcfbf9] md:rounded-[2rem] shadow-2xl border border-zinc-200 overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="bg-[#0a0a0a] text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <Sparkles size={18} className="text-[#d4af37]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">Concierge</h3>
                  <span className="text-[10px] text-green-400 font-bold tracking-widest uppercase">● Online</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                {/* Mobile: Down Arrow, Desktop: X */}
                <span className="md:hidden"><ChevronDown /></span>
                <span className="hidden md:block"><X size={18} /></span>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 scroll-smooth">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${msg.role === 'user' ? 'bg-black text-white' : 'bg-[#d4af37] text-black'}`}>
                    {msg.role === 'user' ? 'ME' : 'AI'}
                  </div>
                  <div className={`p-3 text-sm max-w-[80%] ${msg.role === 'user' ? 'bg-black text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-sm shadow-sm'}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && <div className="text-xs text-zinc-400 pl-12 animate-pulse">Concierge is typing...</div>}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-zinc-100 shrink-0">
              <div className="flex gap-2 bg-zinc-100 rounded-full px-2 py-2 border border-transparent focus-within:border-[#d4af37] focus-within:bg-white transition-all">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about rooms, dining, or events..."
                  className="flex-1 bg-transparent border-none outline-none text-sm px-3 text-zinc-900"
                />
                <button disabled={loading} className="w-10 h-10 bg-[#d4af37] text-black rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. DRAGGABLE TOGGLE BUTTON */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            drag
            dragConstraints={constraintsRef} // Keeps it inside screen
            dragMomentum={false} // Stops it sliding away after drag
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] touch-none" // 'touch-none' enables mobile dragging
          >
            <button
              onClick={(e) => {
                 // Prevent click if dragging happened (optional enhancement, but usually distinct enough)
                 setIsOpen(true);
                 e.stopPropagation(); // Stop click from bubbling up
              }}
              className="w-16 h-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-[#d4af37] relative group"
            >
              <MessageSquare size={28} className="group-hover:text-[#d4af37] transition-colors"/>
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-pulse" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}