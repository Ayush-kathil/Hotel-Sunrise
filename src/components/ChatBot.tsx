import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { MessageSquare, X, Send, Sparkles, Loader2, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "Welcome to Sunrise. I am your personal concierge. How may I assist you with your stay?" }
  ]);

  // AUTO-SCROLL REF
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    // Call the AI Brain
    const { data, error } = await supabase.functions.invoke('ask-gemini', {
      body: { question: userText }
    });

    setLoading(false);

    if (error || !data) {
      setMessages((prev) => [...prev, { role: 'bot', text: "I apologize, the concierge desk is currently busy. Please try again in a moment." }]);
    } else {
      setMessages((prev) => [...prev, { role: 'bot', text: data.answer }]);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              fixed z-[60] bg-[#fcfbf9] shadow-2xl overflow-hidden flex flex-col font-sans border border-zinc-200
              /* MOBILE: Full Screen */
              inset-0 w-full h-full rounded-none
              /* DESKTOP: Floating Widget */
              md:bottom-6 md:right-6 md:w-[380px] md:h-[600px] md:rounded-3xl md:inset-auto
            `}
          >
            {/* --- HEADER --- */}
            <div className="bg-[#0a0a0a] text-white p-5 flex justify-between items-center shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <Sparkles size={18} className="text-[#d4af37]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg leading-none">Concierge</h3>
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* --- MESSAGES AREA --- */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                    msg.role === 'user' ? 'bg-black text-white border-black' : 'bg-white text-[#d4af37] border-zinc-200'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                  </div>

                  {/* Bubble */}
                  <div className={`
                    p-4 text-sm leading-relaxed max-w-[80%] shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-black text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white text-zinc-800 border border-zinc-100 rounded-2xl rounded-tl-sm'}
                  `}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-8 h-8 bg-white text-[#d4af37] rounded-full flex items-center justify-center border border-zinc-200 shadow-sm">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-zinc-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </motion.div>
              )}
              
              {/* Invisible Element to Scroll To */}
              <div ref={messagesEndRef} />
            </div>

            {/* --- INPUT AREA --- */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-zinc-100 shrink-0">
              <div className="flex gap-2 items-center bg-zinc-50 border border-zinc-200 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-[#d4af37]/20 focus-within:border-[#d4af37] transition-all">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about dining, rooms, spa..."
                  className="flex-1 bg-transparent border-none outline-none text-sm px-4 text-zinc-800 placeholder:text-zinc-400"
                  disabled={loading}
                />
                <button
                  disabled={loading || !query.trim()}
                  className="w-10 h-10 bg-[#d4af37] text-black rounded-full flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all shadow-md"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                </button>
              </div>
              <div className="text-center mt-2">
                 <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Powered by Gemini AI</span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING BUTTON (Only visible when chat is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-[#d4af37]"
          >
            <MessageSquare size={28} />
            {/* Notification Dot */}
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}