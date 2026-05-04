import React, { useState } from 'react';
import { ArrowRight, Volume2, CheckCircle2, XCircle, CheckCircle } from 'lucide-react';
import { curriculum } from '../data/curriculum';
import { useAuth } from '../components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface LessonViewProps {
  lessonId: string | null;
  setCurrentTab: (tab: string) => void;
}

import { motion } from 'motion/react';

export function LessonView({ lessonId, setCurrentTab }: LessonViewProps) {
  const lesson = curriculum.find(l => l.id === lessonId);
  const { user, userData } = useAuth();
  
  // Exercise states
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [blankAnswers, setBlankAnswers] = useState<Record<number, string>>({});
  const [matchingState, setMatchingState] = useState<Record<number, { selectedFr?: string, selectedAr?: string, matches: Record<string, string> }>>({});
  
  const [isCompleting, setIsCompleting] = useState(false);

  if (!lesson) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p>لم يتم العثور على الدرس.</p>
        <button onClick={() => setCurrentTab('curriculum')} className="mt-4 text-amber-500 underline">العودة للدروس</button>
      </div>
    );
  }

  const playAudio = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    window.speechSynthesis.speak(utterance);
  };

  const handleMultipleChoice = (exIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [exIndex]: answer }));
  };

  const handleBlankChange = (exIndex: number, value: string) => {
    setBlankAnswers(prev => ({ ...prev, [exIndex]: value }));
  };

  const handleMatchingClick = (exIndex: number, text: string, type: 'fr' | 'ar', pairs: {fr: string, ar: string}[]) => {
    setMatchingState(prev => {
      const state = prev[exIndex] || { matches: {} };
      const newState = { ...state };
      
      if (type === 'fr') newState.selectedFr = text;
      if (type === 'ar') newState.selectedAr = text;

      if (newState.selectedFr && newState.selectedAr) {
        // Check match
        const pair = pairs.find(p => p.fr === newState.selectedFr && p.ar === newState.selectedAr);
        if (pair) {
          newState.matches[newState.selectedFr] = newState.selectedAr;
        }
        // Reset selection
        newState.selectedFr = undefined;
        newState.selectedAr = undefined;
      }
      
      return { ...prev, [exIndex]: newState };
    });
  };

  const isCompleted = userData?.completedLessons?.includes(lessonId) || false;

  const handleCompleteLesson = async () => {
    if (!user || isCompleted || !lessonId || isCompleting) return;
    
    setIsCompleting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedLessons = [...(userData?.completedLessons || []), lessonId];
      await updateDoc(userRef, {
        completedLessons: updatedLessons,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12 mt-6"
    >
      <button 
        onClick={() => setCurrentTab('curriculum')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة للمنهج</span>
      </button>

      <div className="bg-gradient-to-b from-[#0f0f11] to-[#0a0a0b] rounded-3xl p-6 md:p-10 border border-white/5 relative overflow-hidden">
        <span className="absolute top-0 right-0 bg-white/10 text-amber-500 border-b border-l border-white/10 text-xs font-bold px-4 py-2 rounded-bl-xl uppercase tracking-widest">
          مستوى {lesson.level}
        </span>
        <h1 className="text-2xl md:text-4xl font-serif text-white mt-8 md:mt-4 mb-4">{lesson.title}</h1>
        <p className="text-base md:text-lg text-slate-400 border-b border-white/10 pb-6 md:pb-8 mb-6 md:mb-8">{lesson.description}</p>
        
        <div className="text-slate-300 text-base md:text-lg leading-loose mb-10 md:mb-12">
          <p>{lesson.content}</p>
        </div>

        <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
          <span>المفردات والعبارات</span>
          <span className="text-xs sm:text-sm font-normal text-slate-500">(اضغط على الأيقونة للاستماع)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-12 md:mb-16">
          {lesson.vocabulary.map((vocab, index) => (
            <div key={index} className="bg-white/5 p-4 md:p-5 rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
              <div>
                <p className="font-serif italic text-white mb-1 french-text text-lg md:text-xl">{vocab.fr}</p>
                <p className="text-slate-400 text-xs md:text-sm">{vocab.ar}</p>
              </div>
              <button 
                onClick={() => playAudio(vocab.fr)}
                className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-colors flex-shrink-0 border border-amber-500/30"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {lesson.exercises && lesson.exercises.length > 0 && (
          <div className="border-t border-white/10 pt-8 md:pt-10">
             <h3 className="text-xl md:text-2xl font-serif text-white mb-6 md:mb-8">تمارين تفاعلية</h3>
             <div className="space-y-6 md:space-y-10">
               {lesson.exercises.map((ex, index) => {
                 if (ex.type === 'multiple_choice') {
                   const isCorrect = selectedAnswers[index] === ex.answer;
                   const isAnswered = selectedAnswers[index] !== undefined;
                   return (
                     <div key={index} className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10">
                       <p className="text-base md:text-lg text-slate-200 mb-4 md:mb-6">{index + 1}. {ex.question}</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                         {ex.options.map((opt, i) => {
                           const isSelected = selectedAnswers[index] === opt;
                           const showCorrect = isAnswered && opt === ex.answer;
                           const showWrong = isAnswered && isSelected && !isCorrect;
                           
                           let btnClass = "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10";
                           if (showCorrect) btnClass = "bg-green-500/20 border-green-500/50 text-green-400";
                           else if (showWrong) btnClass = "bg-red-500/20 border-red-500/50 text-red-400";
                           else if (isSelected) btnClass = "bg-amber-500/20 border-amber-500/50 text-amber-500";

                           return (
                             <button
                               key={i}
                               disabled={isAnswered}
                               onClick={() => handleMultipleChoice(index, opt)}
                               className={`p-3 md:p-4 rounded-xl border transition-all text-start flex justify-between items-center ${btnClass} font-serif text-base md:text-lg tracking-wide`}
                             >
                               <span>{opt}</span>
                               {showCorrect && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                               {showWrong && <XCircle className="w-5 h-5 flex-shrink-0" />}
                             </button>
                           );
                         })}
                       </div>
                     </div>
                   );
                 }
                 
                 if (ex.type === 'fill_blanks') {
                   const isAnswered = blankAnswers[index] !== undefined && blankAnswers[index] !== '';
                   const isCorrect = isAnswered && blankAnswers[index].toLowerCase().trim() === ex.answer.toLowerCase();
                   return (
                     <div key={index} className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10">
                       <p className="text-base md:text-lg text-slate-200 mb-4 md:mb-6">{index + 1}. أكمل الفراغ {ex.hint && <span className="text-xs md:text-sm text-slate-500">({ex.hint})</span>}</p>
                       <div className="flex items-center gap-2 md:gap-4 flex-wrap text-lg md:text-xl font-serif text-white">
                         {ex.text.split('_____').map((part, i, arr) => (
                           <React.Fragment key={i}>
                             <span>{part}</span>
                             {i < arr.length - 1 && (
                               <input 
                                 type="text"
                                 value={blankAnswers[index] || ''}
                                 onChange={(e) => handleBlankChange(index, e.target.value)}
                                 className={`w-24 md:w-32 bg-[#0a0a0b] border-b-2 outline-none text-center px-1 md:px-2 py-1 transition-colors ${
                                   isAnswered 
                                     ? isCorrect 
                                       ? 'border-green-500 text-green-400' 
                                       : 'border-red-500 text-red-400'
                                     : 'border-amber-500/50 focus:border-amber-500 text-amber-500'
                                 }`}
                               />
                             )}
                           </React.Fragment>
                         ))}
                       </div>
                     </div>
                   );
                 }

                 if (ex.type === 'matching') {
                   const state = matchingState[index] || { matches: {} };
                   const isAllMatched = Object.keys(state.matches).length === ex.pairs.length;
                   return (
                     <div key={index} className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10">
                       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2">
                         <p className="text-base md:text-lg text-slate-200">{index + 1}. صل الكلمة بترجمتها</p>
                         {isAllMatched && <span className="text-xs md:text-sm font-bold px-3 py-1 bg-green-500/20 text-green-400 rounded-full self-start sm:self-auto">ممتاز!</span>}
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 md:gap-8">
                         <div className="space-y-2 md:space-y-3">
                           {ex.pairs.map((pair, i) => {
                             const isMatched = state.matches[pair.fr];
                             const isSelected = state.selectedFr === pair.fr;
                             return (
                               <button
                                 key={`fr-${i}`}
                                 disabled={Boolean(isMatched)}
                                 onClick={() => handleMatchingClick(index, pair.fr, 'fr', ex.pairs)}
                                 className={`w-full p-3 md:p-4 rounded-xl border transition-all text-center font-serif text-base md:text-lg ${
                                   isMatched ? 'bg-green-500/10 border-green-500/30 text-green-500/50' : 
                                   isSelected ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 
                                   'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                 }`}
                               >
                                 {pair.fr}
                               </button>
                             );
                           })}
                         </div>
                         <div className="space-y-2 md:space-y-3">
                           {/* Shuffle arabic pairs roughly for matching UI */}
                           {[...ex.pairs].sort((a,b) => a.ar.localeCompare(b.ar)).map((pair, i) => {
                             const isMatched = Object.values(state.matches).includes(pair.ar);
                             const isSelected = state.selectedAr === pair.ar;
                             return (
                               <button
                                 key={`ar-${i}`}
                                 disabled={isMatched}
                                 onClick={() => handleMatchingClick(index, pair.ar, 'ar', ex.pairs)}
                                 className={`w-full p-3 md:p-4 rounded-xl border transition-all text-center text-sm md:text-base ${
                                   isMatched ? 'bg-green-500/10 border-green-500/30 text-green-500/50' : 
                                   isSelected ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 
                                   'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                 }`}
                               >
                                 {pair.ar}
                               </button>
                             );
                           })}
                         </div>
                       </div>
                     </div>
                   );
                 }
                 
                 return null;
               })}
             </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-white/10 flex-wrap gap-4">
        <button
          onClick={handleCompleteLesson}
          disabled={isCompleted || isCompleting}
          className={`px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 ${
            isCompleted 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
              : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>اكتمل الدرس</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>{isCompleting ? 'جاري الحفظ...' : 'تحديد كمكتمل'}</span>
            </>
          )}
        </button>

        <button 
          onClick={() => setCurrentTab('chat')}
          className="bg-amber-600 hover:bg-amber-500 text-black px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2"
        >
          <span>تطبيق عملي مع المساعد</span>
        </button>
      </div>
    </motion.div>
  );
}
