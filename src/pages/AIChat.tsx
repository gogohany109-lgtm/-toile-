import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Languages, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { chatWithAI, translateMessageToFrench, translateMessageToArabic } from '../services/geminiService';
import { useAuth } from '../components/FirebaseProvider';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { sounds } from '../lib/sounds';

import { motion, AnimatePresence } from 'motion/react';

export function AIChat() {
  const { user, userData } = useAuth();
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string, translatedText?: string}[]>([
    { role: 'bot', text: "Bonjour ! Je m'appelle Étoile. Comment ça va aujourd'hui ? (مرحباً! اسمي إيتوال. كيف حالك اليوم؟)" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatingIds, setTranslatingIds] = useState<Record<number, boolean>>({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [personality, setPersonality] = useState<'friendly' | 'formal' | 'playful'>('friendly');
  const [themeColor, setThemeColor] = useState<'amber' | 'indigo' | 'emerald' | 'rose'>('amber');
  const [showHint, setShowHint] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const hintDismissed = localStorage.getItem('chat-hint-dismissed');
    if (!hintDismissed) {
      setShowHint(true);
    }
    const savedTheme = localStorage.getItem('chat-theme-color');
    if (savedTheme && ['amber', 'indigo', 'emerald', 'rose'].includes(savedTheme)) {
      setThemeColor(savedTheme as any);
    }
  }, []);

  const changeTheme = (color: typeof themeColor) => {
    setThemeColor(color);
    localStorage.setItem('chat-theme-color', color);
  };

  const dismissHint = () => {
    localStorage.setItem('chat-hint-dismissed', 'true');
    setShowHint(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'fr-FR'; // Default to French for learning
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const speakText = (text: string, index: number) => {
    if (typeof window === 'undefined') return;
    
    if (isSpeaking === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    
    utterance.onend = () => {
      setIsSpeaking(null);
    };

    setIsSpeaking(index);
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isTranslating]);

  const handleTranslateBot = async (index: number, text: string) => {
    setTranslatingIds(prev => ({ ...prev, [index]: true }));
    try {
      const translated = await translateMessageToArabic(text);
      setMessages(prev => {
        const newMsg = [...prev];
        newMsg[index].translatedText = translated;
        return newMsg;
      });
    } catch(err) {
      console.error(err);
    } finally {
      setTranslatingIds(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || isTranslating) return;

    const userMessage = input.trim();
    setInput('');
    const currentMessages = [...messages, { role: 'user' as const, text: userMessage }];
    setMessages(currentMessages);
    
    // Check if the message contains Arabic characters
    const hasArabic = /[\u0600-\u06FF]/.test(userMessage);
    
    let messageToSend = userMessage;

    if (hasArabic) {
      setIsTranslating(true);
      try {
        const translated = await translateMessageToFrench(userMessage);
        messageToSend = translated;
        currentMessages[currentMessages.length - 1].translatedText = translated;
        setMessages([...currentMessages]);
      } catch (err) {
        console.error("Translation failed", err);
      } finally {
        setIsTranslating(false);
      }
    }

    setIsLoading(true);

    try {
      const response = await chatWithAI(messageToSend, currentMessages, personality);
      const newBotMsg = { role: 'bot' as const, text: response };
      setMessages(prev => [...prev, newBotMsg]);
      
      // Award badge if first time chatting
      if (user && userData && (!userData.badges || !userData.badges.includes('صديق الروبوت'))) {
        const userRef = doc(db, 'users', user.uid);
        const updatedBadges = [...(userData.badges || []), 'صديق الروبوت'];
        updateDoc(userRef, { 
          badges: updatedBadges,
          updatedAt: serverTimestamp()
        }).catch(console.error);
        sounds.playBadgeEarned();
      }

      // Award 'Fluent Speaker' for frequent chatting (15 messages)
      if (user && userData && messages.length >= 15 && !userData.badges?.includes('متحدث طليق')) {
        const userRef = doc(db, 'users', user.uid);
        const updatedBadges = [...(userData.badges || []), 'متحدث طليق'];
        updateDoc(userRef, { 
          badges: updatedBadges,
          updatedAt: serverTimestamp()
        }).catch(console.error);
        sounds.playBadgeEarned();
      }

      // Auto-speak if the response was small
      if (response.length < 200) {
        speakText(response, currentMessages.length);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'حدث خطأ، يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      setInput(prev => prev + '\n');
    } else if (e.key === 'Escape') {
      if (isListening) {
        toggleListening();
      }
    }
  };

  const colors = {
    amber: { accent: 'amber-500', bg: 'bg-amber-600', hover: 'hover:bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/30', ring: 'focus:ring-amber-500/50', bubble: 'bg-amber-500/10', userBubble: 'bg-amber-600' },
    indigo: { accent: 'indigo-500', bg: 'bg-indigo-600', hover: 'hover:bg-indigo-600', text: 'text-indigo-500', border: 'border-indigo-500/30', ring: 'focus:ring-indigo-500/50', bubble: 'bg-indigo-500/10', userBubble: 'bg-indigo-600' },
    emerald: { accent: 'emerald-500', bg: 'bg-emerald-600', hover: 'hover:bg-emerald-600', text: 'text-emerald-500', border: 'border-emerald-500/30', ring: 'focus:ring-emerald-500/50', bubble: 'bg-emerald-500/10', userBubble: 'bg-emerald-600' },
    rose: { accent: 'rose-500', bg: 'bg-rose-600', hover: 'hover:bg-rose-600', text: 'text-rose-500', border: 'border-rose-500/30', ring: 'focus:ring-rose-500/50', bubble: 'bg-rose-500/10', userBubble: 'bg-rose-600' },
  };

  const theme = colors[themeColor];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-160px)] bg-[#0d0d0e] rounded-3xl border border-white/10 overflow-hidden mt-2"
    >
      {/* Chat header */}
      <div className="bg-[#0f0f11] border-b border-white/5 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
         <div className="flex items-center justify-between md:justify-start gap-4">
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 md:w-12 md:h-12 ${theme.bubble} rounded-full flex items-center justify-center border ${theme.border}`}>
                  <Bot className={`w-5 h-5 md:w-6 md:h-6 ${theme.text}`} />
               </div>
               <div>
                 <h3 className="text-lg md:text-xl font-serif text-white">Étoile</h3>
                 <p className={`text-[10px] uppercase font-mono tracking-widest ${theme.text}/70 mt-1`}>متاح الآن - الذكاء الاصطناعي</p>
               </div>
            </div>

            {/* Color Theme Selector */}
            <div className="flex items-center gap-2 ml-auto md:ml-4">
              <span className="text-[10px] text-slate-500 uppercase font-bold hidden sm:inline">سمة المحادثة</span>
              <div className="flex items-center gap-1.5 p-1.5 bg-white/5 rounded-xl border border-white/10">
                {(['amber', 'indigo', 'emerald', 'rose'] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => changeTheme(color)}
                    className={`w-4 h-4 rounded-full transition-all ${colors[color].bg} ${themeColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f0f11] scale-110' : 'opacity-40 hover:opacity-100'}`}
                    title={color}
                  />
                ))}
              </div>
            </div>
         </div>

         {/* Personality Selector */}
         <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-center">
            {[
              { id: 'friendly' as const, label: 'ودود', icon: '😊' },
              { id: 'formal' as const, label: 'رسمي', icon: '💼' },
              { id: 'playful' as const, label: 'مرح', icon: '🎨' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPersonality(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${personality === p.id ? `${theme.bg} text-black shadow-lg shadow-${theme.accent}/20` : 'text-slate-400 hover:text-white'}`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
         </div>
      </div>

      {/* Onboarding Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`${theme.bubble} border-b ${theme.border} overflow-hidden`}
          >
            <div className="p-3 md:p-4 flex items-center justify-between gap-4">
              <div className={`flex items-center gap-3 text-xs md:text-sm ${theme.text}/90 leading-tight`}>
                <div className={`w-8 h-8 rounded-lg ${theme.bg}/20 flex items-center justify-center shrink-0`}>
                  <Languages className={`w-4 h-4 ${theme.text}`} />
                </div>
                <p>
                  <span className={`font-bold ${theme.text}`}>نصيحة:</span> اضغط على الميكروفون للتحدث بالفرنسية، أو اختر لوناً جديداً للمحادثة من شريط السمات في الأعلى!
                </p>
              </div>
              <button 
                onClick={dismissHint}
                className={`${theme.text}/50 hover:${theme.text} p-1 transition-colors`}
                title="إغلاق"
              >
                <Loader2 className="w-4 h-4 rotate-45" /> {/* Close icon substitute */}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? `${theme.bubble} ${theme.text} border ${theme.border}` : 'bg-white/5 border border-white/10 text-slate-400'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-4 h-4 md:w-5 md:h-5" />}
            </div>
            
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 md:px-6 md:py-4 relative overflow-hidden flex flex-col gap-2 ${msg.role === 'user' ? `${theme.userBubble} text-black rounded-tr-sm border border-white/20` : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'}`}>
              {msg.role === 'bot' && <div className={`absolute top-0 left-0 w-1 h-full ${theme.bg}`}></div>}
              {msg.role === 'bot' && (
                <div className="flex justify-between items-start mb-1 md:mb-2">
                  <p className={`text-[10px] ${theme.text}/70 font-mono uppercase tracking-widest`}>AI: Étoile</p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => speakText(msg.text, idx)}
                      className={`transition-colors ${isSpeaking === idx ? theme.text : `text-slate-500 hover:${theme.text}`}`}
                      title="استماع للنطق"
                    >
                      {isSpeaking === idx ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    {!msg.translatedText && (
                      <button 
                        onClick={() => handleTranslateBot(idx, msg.text)}
                        disabled={translatingIds[idx]}
                        className={`text-slate-500 hover:${theme.text} transition-colors`}
                        title="ترجمة إلى العربية"
                      >
                        {translatingIds[idx] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              <p className={`whitespace-pre-wrap leading-relaxed text-sm md:text-base ${msg.role === 'bot' ? 'font-serif md:text-lg tracking-wide' : ''}`} dir="auto">
                {msg.text}
              </p>
              
              {msg.translatedText && (
                <div className="mt-2 pt-2 border-t border-black/10 flex flex-col gap-1">
                  <div className="flex items-center gap-1 opacity-60">
                    <Languages className="w-3 h-3" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">{msg.role === 'user' ? 'Traduction' : 'الترجمة'}</span>
                  </div>
                  <p className={`text-sm md:text-base leading-relaxed opacity-90 ${msg.role === 'user' ? 'font-serif' : 'font-sans'}`} dir={msg.role === 'user' ? 'ltr' : 'rtl'}>
                    {msg.translatedText}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        {(isTranslating || isLoading) && (
          <div className={`flex gap-2 md:gap-4 ${isTranslating ? 'flex-row-reverse opacity-70' : ''}`}>
             <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isTranslating ? `${theme.bubble} ${theme.text} border ${theme.border}` : 'bg-white/5 border border-white/10 text-slate-400'}`}>
               {isTranslating ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />}
             </div>
             <div className={`rounded-2xl px-4 py-3 md:px-6 md:py-4 flex items-center gap-2 md:gap-3 relative overflow-hidden ${isTranslating ? `${theme.userBubble}/50 text-black rounded-tr-sm border border-white/20` : 'bg-white/5 border border-white/10 rounded-tl-sm'}`}>
                {!isTranslating && <div className={`absolute top-0 left-0 w-1 h-full ${theme.bg}/50`}></div>}
                <Loader2 className={`w-4 h-4 md:w-5 md:h-5 animate-spin ${isTranslating ? 'text-black/50' : theme.text}`} />
                <span className={`text-[10px] md:text-xs font-mono uppercase tracking-widest ${isTranslating ? 'text-black/60' : 'text-slate-400'}`}>
                  {isTranslating ? 'جاري الترجمة...' : 'جاري التفكير...'}
                </span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 md:p-5 bg-[#0f0f11] border-t border-white/5 shrink-0">
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : `bg-white/5 ${theme.text} hover:bg-white/10`}`}
            title={isListening ? 'جاري الاستماع...' : 'تحدث بالفرنسية'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            dir="auto"
            type="text"
            className={`flex-1 bg-[#0a0a0b] border border-white/10 rounded-full px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:ring-1 ${theme.ring} focus:border-${theme.accent} transition-all text-slate-200 pl-14 md:pl-16 pr-4 placeholder:text-slate-500 text-sm md:text-base`}
            placeholder={isListening ? 'أنا أستمع إليك...' : "اكتب رسالتك بالفرنسية (أو بالعربية للترجمة)..."}
            value={input}
            onKeyDown={handleKeyDown}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isTranslating}
          />
          <button 
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || isTranslating}
            className={`absolute left-1 md:left-2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${input.trim() && !isLoading && !isTranslating ? `${theme.bg} text-black ${theme.hover}` : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
          >
            <Send className="w-4 h-4 md:w-5 md:h-5 rtl:-scale-x-100" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
