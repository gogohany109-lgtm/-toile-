import React, { useState, useEffect } from 'react';
import { Mic, Square, RefreshCcw, CheckCircle2, PlayCircle, Loader2 } from 'lucide-react';
import { evaluatePronunciation } from '../services/geminiService';
import { useAuth } from '../components/FirebaseProvider';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const PHRASES = [
  { fr: "Bonjour, comment allez-vous ?", ar: "مرحباً، كيف حالك؟" },
  { fr: "Je voudrais un café, s'il vous plaît.", ar: "أريد قهوة من فضلك." },
  { fr: "Où se trouve la gare ?", ar: "أين تقع محطة القطار؟" },
  { fr: "Enchanté de faire votre connaissance.", ar: "سعيد بلقائك." },
  { fr: "Je suis en train d'apprendre le français.", ar: "أنا أتعلم الفرنسية حالياً." }
];

import { motion } from 'motion/react';

export function Pronunciation() {
  const { user, userData } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const currentPhrase = PHRASES[currentIndex];

  // Web Speech API
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'fr-FR';

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsRecording(false);
        handleEvaluate(text);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        
        let errorMsg = 'حدث خطأ أثناء الاستماع.';
        if (event.error === 'not-allowed') {
          errorMsg = 'لم يتم السماح باستخدام الميكروفون. يرجى التأكد من السماح بالوصول للميكروفون في إعدادات المتصفح.';
        } else if (event.error === 'network') {
          errorMsg = 'حدث خطأ في الاتصال. يرجى التأكد من اتصالك بالإنترنت.';
        } else if (event.error === 'no-speech') {
          errorMsg = 'لم يتم التعرف على أي صوت. يرجى المحاولة مرة أخرى والتحدث بصوت واضح.';
        } else if (event.error === 'aborted') {
          errorMsg = 'تم إيقاف الاستماع.';
        } else {
          errorMsg = `حدث خطأ غير متوقع (${event.error}). يرجى المحاولة باستخدام متصفح Chrome.`;
        }
        
        setFeedback(errorMsg);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  const handleStartRecording = () => {
    if (!recognition) {
      alert('عذراً، متصفحك لا يدعم التعرف على الصوت. جرب استخدام متصفح Chrome.');
      return;
    }
    setTranscript('');
    setFeedback(null);
    setIsRecording(true);
    try {
      recognition.start();
    } catch (e) {
      // In case it's already started
      recognition.stop();
      setTimeout(() => recognition.start(), 100);
    }
  };

  const handleStopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleEvaluate = async (textToEvaluate: string) => {
    if (!textToEvaluate) return;
    setIsEvaluating(true);
    try {
      const result = await evaluatePronunciation(currentPhrase.fr, textToEvaluate);
      setFeedback(result);
      
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const newPoints = (userData?.points || 0) + 5;
          await updateDoc(userRef, {
            points: newPoints,
            updatedAt: serverTimestamp()
          });
        } catch(err) {
          console.error("Error updating points", err);
        }
      }
    } catch (error) {
      setFeedback('تعذر جلب التقييم حالياً.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const speakPhrase = () => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(currentPhrase.fr);
    utterance.lang = 'fr-FR';
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PHRASES.length);
    setTranscript('');
    setFeedback(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto py-8 mt-2 md:mt-6"
    >
      <div className="bg-gradient-to-b from-[#0f0f11] to-[#0a0a0b] rounded-3xl p-6 md:p-10 border border-white/5 flex flex-col items-center text-center">
        
        <div className="w-12 h-12 md:w-16 md:h-16 bg-amber-500/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 border border-amber-500/30">
           <Mic className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
        </div>

        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2">مختبر النطق</h2>
        <p className="text-slate-400 text-sm md:text-base mb-8 md:mb-10">استمع للعبارة، ثم اضغط على زر التسجيل لترديدها وسنقوم بتقييم نطقك.</p>

        {/* Phrase Card */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 relative mb-8 md:mb-10 mt-2">
           <button 
             onClick={speakPhrase}
             className="absolute top-2 left-2 md:top-4 md:left-4 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 p-2 md:p-3 rounded-full transition-colors flex items-center justify-center border border-amber-500/20"
             title="الاستماع للعبارة"
           >
             <PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
           </button>
           <h3 className="font-serif italic text-2xl md:text-4xl text-white mb-3 md:mb-4 french-text tracking-wide leading-relaxed mt-6 md:mt-0">{currentPhrase.fr}</h3>
           <p className="text-slate-400 text-base md:text-lg">{currentPhrase.ar}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          {isRecording ? (
            <button 
              onClick={handleStopRecording}
              className="bg-red-500/20 border border-red-500 hover:bg-red-500/30 text-red-400 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all animate-pulse"
            >
              <Square className="w-6 h-6 md:w-8 md:h-8 fill-current" />
            </button>
          ) : (
            <button 
              onClick={handleStartRecording}
              disabled={isEvaluating}
              className="bg-amber-600 hover:bg-amber-500 text-black w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic className="w-8 h-8 md:w-10 md:h-10" />
            </button>
          )}
        </div>

        {isRecording && <p className="text-amber-500 font-mono text-xs uppercase tracking-widest animate-pulse mb-4">جاري الاستماع...</p>}

        {/* Results */}
        <div className="w-full space-y-4">
          {transcript && (
             <div className="bg-white/5 rounded-xl p-5 text-start border border-white/10">
               <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest border-b border-white/10 pb-2">ما سمعناه:</p>
               <p className="text-lg text-slate-200 french-text font-serif italic">{transcript}</p>
             </div>
          )}

          {isEvaluating && (
            <div className="bg-amber-500/5 text-amber-500 border border-amber-500/20 rounded-xl p-4 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-mono text-xs uppercase tracking-widest">جاري تحليل النطق...</span>
            </div>
          )}

          {feedback && !isEvaluating && (
             <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 text-start flex gap-4 items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-amber-500"></div>
                <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold tracking-wide uppercase text-amber-500 mb-2">التقييم:</h4>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{feedback}</p>
                </div>
             </div>
          )}
        </div>

        {/* Next Button */}
        <div className="w-full mt-12 pt-6 border-t border-white/5 flex justify-end">
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 text-slate-400 hover:text-white font-medium transition-colors"
          >
            <span>العبارة التالية</span>
            <RefreshCcw className="w-4 h-4 rtl:-scale-x-100" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
