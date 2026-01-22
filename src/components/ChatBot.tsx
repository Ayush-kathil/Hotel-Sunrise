import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { MessageSquare, X, Send, Sparkles, Loader2, User, Bot, HelpCircle, Utensils, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

// PREMIUM QUICK VALUES
const QUICK_ACTIONS = [
  { label: "Book a Room", icon: <Calendar size={12} />, prompt: "I would like to book a room. What are your available suites?" },
  { label: "Dining Options", icon: <Utensils size={12} />, prompt: "What dining options do you have available?" },
  { label: "Concierge Services", icon: <HelpCircle size={12} />, prompt: "What concierge services do you offer?" }
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "Welcome to **Sunrise**. I am your personal AI concierge. How may I elevate your stay today?" }
  ]);

  // REFS
  const constraintsRef = useRef(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // AUTO-SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // AUTO-CLOSE ON CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent, overrideText?: string) => {
    e.preventDefault();
    const textToSend = overrideText || query;
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: textToSend }]);
    setQuery('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ask-gemini', {
        body: { question: textToSend }
      });

      if (error || !data) throw new Error("API Error");
      
      setMessages((prev) => [...prev, { role: 'bot', text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: "I apologize, I am currently having trouble connecting to the concierge desk. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className="fixed z-[101] flex flex-col overflow-hidden font-sans border border-white/40 shadow-2xl backdrop-blur-xl
              md:bottom-24 md:right-6 md:w-[400px] md:h-[600px] md:rounded-[2rem]
              bottom-4 right-4 w-[calc(100vw-32px)] sm:w-[380px] h-[500px] max-h-[80vh] rounded-[2rem]"
            style={{
              background: "linear-gradient(135deg, rgba(252, 251, 249, 0.95) 0%, rgba(245, 245, 240, 0.98) 100%)", // Light Cream
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(212, 175, 55, 0.1)" // Soft shadow + Gold tint border from css
            }}
          >
            {/* --- PREMIUM HEADER --- */}
            <div className="relative overflow-hidden p-5 shrink-0 border-b border-[#d4af37]/10">
               <div className="flex justify-between items-center z-10 relative">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#fcfbf9] p-[2px] shadow-sm">
                       <div className="w-full h-full bg-[#fcfbf9] rounded-full flex items-center justify-center">
                          <Sparkles size={16} className="text-[#d4af37] animate-pulse" />
                       </div>
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-black tracking-wide font-bold">Concierge</h3>
                      <div className="flex items-center gap-1.5 opacity-60">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                         <span className="text-[9px] text-black uppercase tracking-widest font-semibold">Online</span>
                      </div>
                    </div>
                 </div>
                 <button 
                  onClick={() => setIsOpen(false)} 
                  className="w-8 h-8 flex items-center justify-center text-black/30 hover:text-black hover:bg-black/5 rounded-full transition-all"
                 >
                   <X size={18} />
                 </button>
               </div>
            </div>

            {/* --- MESSAGES AREA --- */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">              
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ${msg.role === 'user' ? 'bg-black text-white' : 'bg-[#d4af37] text-white'}`}>
                     {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                  </div>

                  {/* Bubble */}
                  <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 text-sm leading-relaxed shadow-sm relative 
                      ${msg.role === 'user' 
                        ? 'bg-black text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white text-zinc-800 border border-[#efece5] rounded-2xl rounded-tl-sm'
                      }`}
                    >
                      {msg.role === 'bot' ? (
                         <div className="prose prose-sm prose-p:my-0 prose-strong:text-[#d4af37] prose-a:text-[#d4af37]">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                         </div>
                      ) : (
                         msg.text
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center shrink-0 shadow-sm border border-white">
                      <Bot size={16} className="text-white" />
                   </div>
                   <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-[#efece5] flex items-center gap-2 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce" />
                   </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* --- QUICK ACTIONS --- */}
            {messages.length < 3 && !loading && (
               <div className="px-5 pb-2 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
                  {QUICK_ACTIONS.map((action, i) => (
                     <button 
                        key={i}
                        onClick={(e) => handleSend(e, action.prompt)}
                        className="flex items-center gap-2 bg-white border border-[#efece5] hover:border-[#d4af37] hover:text-[#d4af37] text-xs text-zinc-500 px-3 py-2 rounded-full whitespace-nowrap transition-all shadow-sm"
                     >
                        {action.icon} {action.label}
                     </button>
                  ))}
               </div>
            )}

            {/* --- INPUT AREA --- */}
            <div className="p-4 bg-white/60 backdrop-blur-md border-t border-[#d4af37]/10 shrink-0">
               <form onSubmit={(e) => handleSend(e)} className="relative">
                 <input
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   placeholder="Type a message..."
                   className="w-full bg-white border border-[#efece5] rounded-full py-3 pl-5 pr-14 text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 transition-all"
                 />
                 <button 
                   disabled={loading || !query.trim()} 
                   className="absolute right-2 top-1.5 w-9 h-9 bg-[#d4af37] text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                 >
                   {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className={query.trim() ? "ml-0.5" : ""} />}
                 </button>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TRIGGER BUTTON --- */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragMomentum={false}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] touch-none"
          >
            <button
              onClick={(e) => { setIsOpen(true); e.stopPropagation(); }}
              className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-black border border-[#d4af37] shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden"
            >
              {/* Button Sheen Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <MessageSquare size={28} className="text-white relative z-10 group-hover:text-[#d4af37] transition-colors duration-300"/>
              
              {/* Notification Dot */}
              <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-pulse z-20" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}