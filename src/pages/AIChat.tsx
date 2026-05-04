import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';

import { motion } from 'motion/react';

export function AIChat() {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: "Bonjour ! Je m'appelle Étoile. Comment ça va aujourd'hui ? (مرحباً! اسمي إيتوال. كيف حالك اليوم؟)" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatWithAI(userMessage, messages);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'حدث خطأ، يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-160px)] bg-[#0d0d0e] rounded-3xl border border-white/10 overflow-hidden mt-2"
    >
      {/* Chat header */}
      <div className="bg-[#0f0f11] border-b border-white/5 p-4 md:p-5 flex items-center gap-3 md:gap-4 relative shrink-0">
         <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30">
            <Bot className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
         </div>
         <div>
           <h3 className="text-lg md:text-xl font-serif text-white">Étoile</h3>
           <p className="text-[10px] uppercase font-mono tracking-widest text-amber-500/70 mt-1">متاح الآن - الذكاء الاصطناعي</p>
         </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-white/5 border border-white/10 text-slate-400'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-4 h-4 md:w-5 md:h-5" />}
            </div>
            
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 md:px-6 md:py-4 relative overflow-hidden ${msg.role === 'user' ? 'bg-amber-600 text-black rounded-tr-sm border border-amber-500/50' : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'}`}>
              {msg.role === 'bot' && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>}
              {msg.role === 'bot' && <p className="text-[10px] text-amber-500/70 font-mono mb-1 md:mb-2 uppercase tracking-widest">AI: Étoile</p>}
              <p className={`whitespace-pre-wrap leading-relaxed text-sm md:text-base ${msg.role === 'bot' ? 'font-serif md:text-lg tracking-wide' : ''}`} dir="auto">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 md:gap-4">
             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
               <Bot className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
             </div>
             <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 md:px-6 md:py-4 flex items-center gap-2 md:gap-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-amber-500 animate-spin" />
                <span className="text-slate-400 text-[10px] md:text-xs font-mono uppercase tracking-widest">جاري التفكير...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 md:p-5 bg-[#0f0f11] border-t border-white/5 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            dir="auto"
            type="text"
            className="flex-1 bg-[#0a0a0b] border border-white/10 rounded-full px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-slate-200 pl-14 md:pl-16 placeholder:text-slate-500 text-sm md:text-base"
            placeholder="اكتب رسالتك بالفرنسية..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute left-1 md:left-2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${input.trim() && !isLoading ? 'bg-amber-600 text-black hover:bg-amber-500' : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
          >
            <Send className="w-4 h-4 md:w-5 md:h-5 rtl:-scale-x-100" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
