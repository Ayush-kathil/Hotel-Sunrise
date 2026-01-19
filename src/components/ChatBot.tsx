import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([
    { role: 'bot', text: "Hello! I am the Sunrise AI Concierge. How can I assist you today?" }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    // Call Supabase Function (The AI Brain)
    const { data, error } = await supabase.functions.invoke('ask-gemini', {
      body: { question: userText }
    });

    setLoading(false);
    
    if (error || !data) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble reaching the front desk. Please try again later." }]);
    } else {
      setMessages(prev => [...prev, { role: 'bot', text: data.answer }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="bg-white w-80 h-96 rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col mb-4">
            
            {/* Header */}
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#d4af37]" />
                <span className="font-bold text-sm">Sunrise Concierge</span>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={18} /></button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fcfbf9]">
              {messages.map((msg, i) => (
                <div key={i} className={`p-3 rounded-xl text-sm max-w-[85%] leading-relaxed ${msg.role === 'user' ? 'bg-black text-white ml-auto rounded-tr-none' : 'bg-zinc-200 text-black mr-auto rounded-tl-none'}`}>
                  {msg.text}
                </div>
              ))}
              {loading && <div className="text-zinc-400 text-xs animate-pulse ml-2 flex items-center gap-1">Typing...</div>}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-zinc-100 flex gap-2">
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask about rooms, pool..." className="flex-1 text-sm outline-none px-2" />
              <button disabled={loading} className="w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center text-black hover:scale-110 transition shadow-sm"><Send size={14} /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#d4af37] hover:text-black transition-all">
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}