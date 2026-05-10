import React, { useState, useEffect, useRef } from 'react';
import { Languages, ArrowRightLeft, Volume2, Copy, Check, Loader2, X, RotateCcw, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ai } from '../services/geminiService';

export function Translator() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState<'ar' | 'fr'>('ar');
  const [copied, setCopied] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<{id: number, input: string, output: string, source: 'ar' | 'fr', target: 'ar' | 'fr'}[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
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
      if (recognitionRef.current) {
        recognitionRef.current.lang = sourceLang === 'fr' ? 'fr-FR' : 'ar-SA';
        setIsListening(true);
        recognitionRef.current.start();
      } else {
        alert('خاصية الإملاء غير مدعومة في متصفحك.');
      }
    }
  };

  useEffect(() => {
    const hintDismissed = localStorage.getItem('translator-hint-dismissed');
    if (!hintDismissed) {
      setShowHint(true);
    }
    
    // Load history
    const savedHistory = localStorage.getItem('translation-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const dismissHint = () => {
    localStorage.setItem('translator-hint-dismissed', 'true');
    setShowHint(false);
  };

  const saveToHistory = (input: string, output: string, source: 'ar' | 'fr', target: 'ar' | 'fr') => {
    if (!input.trim() || !output.trim()) return;
    
    setHistory(prev => {
      // Avoid duplicate consecutive entries
      if (prev.length > 0 && prev[0].input === input && prev[0].source === source) return prev;
      
      const newEntry = { id: Date.now(), input, output, source, target };
      const updated = [newEntry, ...prev].slice(0, 5);
      localStorage.setItem('translation-history', JSON.stringify(updated));
      return updated;
    });
  };

  const targetLang = sourceLang === 'ar' ? 'fr' : 'ar';

  const handleSwap = () => {
    setSourceLang(targetLang);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }

    setIsTranslating(true);
    try {
      const prompt = sourceLang === 'ar' 
        ? `ترجم النص التالي من العربية إلى الفرنسية. قم بإرجاع الترجمة فقط دون أي إضافات: "${inputText}"`
        : `ترجم النص التالي من الفرنسية إلى العربية. قم بإرجاع الترجمة فقط دون أي إضافات: "${inputText}"`;
        
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: prompt
      });
      const translated = response.text?.trim() || '';
      setOutputText(translated);
      saveToHistory(inputText, translated, sourceLang, targetLang);
    } catch (error) {
      console.error('Translation error:', error);
      setOutputText('حدث خطأ أثناء الترجمة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputText.trim()) {
        handleTranslate();
      } else {
        setOutputText('');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [inputText, sourceLang]);

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakText = (text: string, lang: 'ar' | 'fr') => {
    if (!window.speechSynthesis || !text) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'fr' ? 'fr-FR' : 'ar-SA';
    
    // Try to find a specific voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang === 'fr' ? 'fr' : 'ar'));
    if (voice) {
      utterance.voice = voice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <AnimatePresence>
        {showHint && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-2xl overflow-hidden"
          >
            <div className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-amber-200/90 leading-relaxed">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="w-5 h-5 text-amber-500" />
                </div>
                <p>
                  <span className="font-bold text-amber-500">نصيحة ذكية:</span> استخدم زر "التبديل" (Swap) لتدريب نفسك على صياغة الجمل في كلا الاتجاهين، ولا تنسَ النقر على أيقونة السماعة لسماع النطق البشري، فهي سر تحسين مهارة الاستماع والنطق لديك!
                </p>
              </div>
              <button 
                onClick={dismissHint}
                className="text-amber-500/50 hover:text-amber-500 p-2 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-serif text-white">المترجم الفوري</h3>
            <p className="text-slate-400 text-sm mt-1">ترجمة سريعة ودقيقة بين العربية والفرنسية</p>
          </div>
        </div>

        {/* Translation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0a0a0b] border border-white/10 rounded-xl p-2 mb-6 gap-2">
          <div className="flex-1 text-center py-3 font-semibold text-white bg-white/5 rounded-lg border border-white/5">
            {sourceLang === 'ar' ? 'العربية' : 'الفرنسية'}
          </div>
          
          <button 
            onClick={handleSwap}
            className="p-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-full transition-colors border border-amber-500/20"
            title="تبديل اللغات"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 text-center py-3 font-semibold text-slate-300 bg-white/5 rounded-lg border border-white/5">
            {targetLang === 'ar' ? 'العربية' : 'الفرنسية'}
          </div>
        </div>

        {/* Text Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
          {/* Input Area */}
          <div className="flex flex-col relative rounded-xl border border-white/10 bg-[#0a0a0b] overflow-hidden focus-within:border-amber-500/50 transition-colors">
            <textarea
              className="flex-1 bg-transparent p-6 text-white resize-none outline-none text-lg leading-relaxed placeholder:text-slate-600"
              placeholder="أدخل النص هنا..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              dir={sourceLang === 'ar' ? 'rtl' : 'ltr'}
            ></textarea>
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-slate-500">
              <span className="text-xs font-mono">{inputText.length} حرف</span>
              <div className="flex gap-2">
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-white/10 hover:text-amber-500'}`}
                  title={isListening ? 'ايقاف الاستماع' : 'إملاء صوتي'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                {inputText && (
                  <button 
                    onClick={() => speakText(inputText, sourceLang)}
                    className="p-2 hover:bg-white/10 hover:text-amber-500 rounded-lg transition-colors"
                    title="استماع"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Output Area */}
          <div className="flex flex-col relative rounded-xl border border-white/10 bg-[#0f0f11] overflow-hidden">
            {isTranslating && (
              <div className="absolute top-4 left-4 z-10">
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
              </div>
            )}
            <textarea
              className="flex-1 bg-transparent p-6 text-slate-200 resize-none outline-none text-lg leading-relaxed"
              placeholder="الترجمة ستظهر هنا..."
              value={outputText}
              readOnly
              dir={targetLang === 'ar' ? 'rtl' : 'ltr'}
            ></textarea>
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pt-2 border-t border-white/5">
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  disabled={!outputText}
                  className={`p-2 rounded-lg transition-colors flex items-center justify-center ${copied ? 'bg-green-500/20 text-green-500' : 'hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'}`}
                  title="نسخ"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => speakText(outputText, targetLang)}
                  disabled={!outputText}
                  className="p-2 hover:bg-white/10 text-slate-400 hover:text-amber-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="استماع"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">
                Powered by AI
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Translation History */}
      <AnimatePresence>
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h4 className="text-lg font-serif text-white">السجل الأخير</h4>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {history.map((item) => (
                <div 
                  key={item.id}
                  className="bg-[#0a0a0b] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-amber-500/30 transition-all"
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="text-slate-500 text-xs" dir={item.source === 'ar' ? 'rtl' : 'ltr'}>{item.input}</p>
                    <p className="text-white text-sm font-medium" dir={item.target === 'ar' ? 'rtl' : 'ltr'}>{item.output}</p>
                  </div>
                  <button
                    onClick={() => speakText(item.output, item.target)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-amber-500/20 hover:text-amber-500 transition-all"
                    title="استماع"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
