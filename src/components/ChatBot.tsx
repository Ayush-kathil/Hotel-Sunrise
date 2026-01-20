import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { MessageSquare, X, Send, Sparkles, Loader2, User, Bot, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "Welcome to Sunrise. I am your personal concierge. How may I assist you?" }
  ]);

  // REF FOR DRAGGING CONSTRAINTS
  const constraintsRef = useRef(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const processLocalResponse = (text: string): string | null => {
    const lowerText = text.toLowerCase();

    // 1. VULGARITY / INAPPROPRIATE CONTENT FILTER
    const badWords = ['sex', 'porn', 'nude', 'xxx', 'fuck', 'shit', 'ass', 'bitch', 'stupid', 'idiot'];
    if (badWords.some(word => lowerText.includes(word))) {
      return "I apologize, but I cannot answer that type of question. I am here to assist you with Hotel Sunrise queries only. Please maintain a respectful tone.";
    }

    // 2. ROUTE GUIDANCE
    // Cancellation
    if (lowerText.includes('cancel') || lowerText.includes('refund')) {
      return "To cancel a booking, please navigate to your Profile (top right icon) > 'My Bookings'. Select the active booking you wish to cancel. Note that cancellations within 24 hours of check-in may be non-refundable.";
    }
    
    // Booking
    if (lowerText.includes('book') || lowerText.includes('reservation') || lowerText.includes('room') || lowerText.includes('price')) {
      return "You can book a stay by clicking 'Rooms' in the navigation menu. We offer Garden, Deluxe, and Family suites. Simply select your dates to see real-time availability and pricing.";
    }

    // Contact
    if (lowerText.includes('contact') || lowerText.includes('call') || lowerText.includes('phone') || lowerText.includes('email') || lowerText.includes('support')) {
      return "You can reach our 24/7 concierge team via the 'Contact' page. Alternatively, call us at +1 (555) 012-3456 or email concierge@hotelsunrise.com.";
    }

    // Location / Address
    if (lowerText.includes('where') || lowerText.includes('location') || lowerText.includes('address') || lowerText.includes('map')) {
      return "Hotel Sunrise is located at 123 Ocean Drive, Paradise City. You can view our exact location on the 'Contact' page map.";
    }

    // 3. SCOPE ENFORCEMENT (General Fallback for obviously unrelated things could go here, but strict keyword matching is risky. 
    // We will let the AI handle nuanced "out of scope" questions, but we can catch obvious ones if needed.)
    
    return null; // No local match, proceed to AI
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    // 1. Try Local Response First
    const localReply = processLocalResponse(userText);
    if (localReply) {
      // Simulate a small delay for natural feel
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'bot', text: localReply }]);
        setLoading(false);
      }, 600);
      return;
    }

    // 2. Fallback to AI
    try {
      const { data, error } = await supabase.functions.invoke('ask-gemini', {
        body: { question: userText }
      });

      if (error || !data) {
        throw new Error("API Error");
      }
      
      setMessages((prev) => [...prev, { role: 'bot', text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: "I apologize, I am having trouble connecting to the server at the moment. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. INVISIBLE CONTAINER FOR DRAG CONSTRAINTS (Whole Screen) */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" />

      {/* 2. CHAT WINDOW (Full Screen on Mobile / Card on Desktop) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
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

            {/* Messages */}
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

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-zinc-100 shrink-0">
              <div className="flex gap-2 bg-zinc-100 rounded-full px-2 py-2 border border-transparent focus-within:border-[#d4af37] focus-within:bg-white transition-all">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent border-none outline-none text-sm px-3 text-zinc-900"
                />
                <button disabled={loading} className="w-10 h-10 bg-[#d4af37] text-black rounded-full flex items-center justify-center shadow-md">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. DRAGGABLE FLOATING BUTTON */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            drag
            dragConstraints={constraintsRef} // Keeps it inside screen
            dragMomentum={false} // Stops it sliding away
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] touch-none" // touch-none is vital for mobile dragging
          >
            <button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-[#d4af37] relative"
            >
              <MessageSquare size={28} />
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-pulse" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}