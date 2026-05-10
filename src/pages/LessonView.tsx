import React, { useState } from 'react';
import { ArrowRight, Volume2, CheckCircle2, XCircle, CheckCircle, Sparkles, Loader2, RefreshCw, BookOpenText } from 'lucide-react';
import { curriculum } from '../data/curriculum';
import { useAuth } from '../components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../lib/sounds';
import { GoogleGenAI } from "@google/genai";
import { lookupDictionaryWord } from '../services/geminiService';

interface LessonViewProps {
  lessonId: string | null;
  setCurrentTab: (tab: string) => void;
}

export function LessonView({ lessonId, setCurrentTab }: LessonViewProps) {
  const lesson = curriculum.find(l => l.id === lessonId);
  const { user, userData } = useAuth();
  
  // Exercise states
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [blankAnswers, setBlankAnswers] = useState<Record<number, string>>({});
  const [matchingState, setMatchingState] = useState<Record<number, { selectedFr?: string, selectedAr?: string, matches: Record<string, string> }>>({});
  const [sentenceOrderingState, setSentenceOrderingState] = useState<Record<number, { selected: string[], available: string[] }>>({});

  
  const [isCompleting, setIsCompleting] = useState(false);
  const [showPointAnim, setShowPointAnim] = useState(false);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [culturalFact, setCulturalFact] = useState<string | null>(null);
  
  const [aiTips, setAiTips] = useState<string | null>(null);
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  
  const handleLookup = async (word: string) => {
    setIsLookingUp(true);
    setLookupResult(null);
    const data = await lookupDictionaryWord(word);
    setLookupResult(data);
    setIsLookingUp(false);
  };
    
  const CULTURAL_FACTS = [
    "هل كنت تعلم؟ فرنسا هي الدولة الأكثر زيارة في العالم بأسره!",
    "برج إيفل كان من المفترض أن يكون مؤقتاً لمدينة باريس لمدة 20 عاماً فقط.",
    "فرنسا تنتج أكثر من 1600 نوع مختلف من الجبن!",
    "اللغة الفرنسية كانت اللغة الرسمية في إنجلترا لأكثر من 300 عام.",
    "متحف اللوفر هو أكبر متحف للفنون والآثار في العالم.",
    "الفرنسيون يستهلكون حوالي 30,000 طن من القواقع (Escargot) سنوياً.",
    "يوجد في باريس شارع واحد فقط يحتوي على لافتة 'STOP'!",
    "الخبز الفرنسي 'الباقيت' (Baguette) محمي بموجب مرسوم قانوني يحدد مكوناته.",
    "في فرنسا، يمكنك الزواج من شخص متوفى (بتصريح رئاسي خاص)!",
    "فرنسا هي أول دولة في العالم تحظر على السوبر ماركت رمي الطعام الصالح للأكل."
  ];

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
    
    const ex = lesson.exercises[exIndex];
    if (ex.type === 'multiple_choice' && ex.answer === answer) {
      sounds.playMatchSuccess();
    } else {
      sounds.playSelect();
    }
  };

  const handleBlankChange = (exIndex: number, value: string) => {
    setBlankAnswers(prev => ({ ...prev, [exIndex]: value }));
  };

  const handleMatchingClick = (exIndex: number, text: string, type: 'fr' | 'ar', pairs: {fr: string, ar: string}[]) => {
    sounds.playSelect();
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
          setTimeout(() => sounds.playMatchSuccess(), 50);
        }
        // Reset selection
        newState.selectedFr = undefined;
        newState.selectedAr = undefined;
      }
      
      return { ...prev, [exIndex]: newState };
    });
  };

  const handleSentenceOrderingClick = (exIndex: number, word: string, from: 'available' | 'selected', originalWords: string[]) => {
    sounds.playSelect();
    setSentenceOrderingState(prev => {
      const state = prev[exIndex] || { selected: [], available: [...originalWords] };
      let newSelected = [...state.selected];
      let newAvailable = [...state.available];

      if (from === 'available') {
        const idx = newAvailable.indexOf(word);
        if (idx !== -1) newAvailable.splice(idx, 1);
        newSelected.push(word);
      } else {
        const idx = newSelected.indexOf(word);
        if (idx !== -1) newSelected.splice(idx, 1);
        newAvailable.push(word);
      }

      // Check if complete and correct
      const isComplete = newAvailable.length === 0;
      return { ...prev, [exIndex]: { selected: newSelected, available: newAvailable, isComplete } };
    });
  };

  const isCompleted = userData?.completedLessons?.includes(lessonId) || false;

  const handleCompleteLesson = async () => {
    if (!user || isCompleted || !lessonId || isCompleting) return;
    
    setIsCompleting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedLessons = [...(userData?.completedLessons || []), lessonId];
      const newPoints = (userData?.points || 0) + 50;
      
      let updatedBadges = [...(userData?.badges || [])];
      
      // Basic badges
      if (updatedLessons.length === 1 && !updatedBadges.includes('البداية الموفقة')) {
        updatedBadges.push('البداية الموفقة');
      }
      if (updatedLessons.length === 5 && !updatedBadges.includes('متعلم الأسبوع')) {
        updatedBadges.push('متعلم الأسبوع');
      }

      // Level mastery badges
      const currentLevelLessons = curriculum.filter(l => l.level === lesson.level);
      const completedCurrentLevel = currentLevelLessons.every(l => updatedLessons.includes(l.id));
      const badgeName = `خبير المستوى ${lesson.level}`;
      if (completedCurrentLevel && !updatedBadges.includes(badgeName)) {
        updatedBadges.push(badgeName);
      }

      // Vocabulary milestones
      const allVocabCount = curriculum
        .filter(l => updatedLessons.includes(l.id))
        .reduce((acc, curr) => acc + curr.vocabulary.length, 0);
      
      if (allVocabCount >= 20 && !updatedBadges.includes('جامع الكلمات')) {
        updatedBadges.push('جامع الكلمات');
      }

      // Detect if new badges were earned to show notification
      const oldBadges = userData?.badges || [];
      const newlyEarned = updatedBadges.filter(b => !oldBadges.includes(b));
      
      await updateDoc(userRef, {
        completedLessons: updatedLessons,
        points: newPoints,
        badges: updatedBadges,
        updatedAt: serverTimestamp()
      });

      setShowPointAnim(true);
      
      // Select random cultural fact
      const randomFact = CULTURAL_FACTS[Math.floor(Math.random() * CULTURAL_FACTS.length)];
      setCulturalFact(randomFact);

      if (newlyEarned.length > 0) {
        setNewBadge(newlyEarned[0]);
        sounds.playBadgeEarned();
        setTimeout(() => setNewBadge(null), 5000);
      } else {
        sounds.playLessonComplete();
      }

      // Award additional measurable badges
      if (updatedLessons.length >= 10 && !updatedBadges.includes('مُتقن المستويات')) {
        updatedBadges.push('مُتقن المستويات');
      }
      if (allVocabCount >= 50 && !updatedBadges.includes('خبير الأفعال')) {
        updatedBadges.push('خبير الأفعال');
      }
      const dailyTarget = userData?.learningGoals?.dailyVocabTarget || 10;
      if (allVocabCount >= dailyTarget && !updatedBadges.includes('مواظب يومي')) {
        updatedBadges.push('مواظب يومي');
      }
      
      // Update with potentially more badges
      if (updatedBadges.length > updatedLessons.length) { // slightly simplified check
         await updateDoc(userRef, { badges: updatedBadges, updatedAt: serverTimestamp() });
      }
      
      setTimeout(() => setShowPointAnim(false), 2000);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444']
      });
      sounds.playLessonComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setIsCompleting(false);
    }
  };

  const generateTips = async () => {
    if (isGeneratingTips) return;
    setIsGeneratingTips(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `أنا أتعلم اللغة الفرنسية في مستوى ${lesson.level}. الدرس الحالي هو: "${lesson.title}". وصف الدرس: "${lesson.description}".
      المفردات التي تعلمتها: ${lesson.vocabulary.map(v => v.fr).join(', ')}.
      من فضلك قدم لي 3 نصائح دراسية ذكية أو ملاحظات ثقافية تتعلق بهذا الموضوع لمساعدتي في إتقانه بشكل أسرع. اجعل الرد باللغة العربية بأسلوب مشجع ومختصر.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiTips(response.text || "عذراً، لم أستطع توليد النصائح في الوقت الحالي. حاول مرة أخرى.");
    } catch (error) {
      console.error('Error generating tips:', error);
      setAiTips("حدث خطأ أثناء محاولة توليد النصائح الذكية.");
    } finally {
      setIsGeneratingTips(false);
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
        {newBadge && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-10 left-0 right-0 z-50 flex justify-center"
          >
            <div className="bg-amber-500 text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 border-2 border-white/20 animate-bounce">
              <span className="text-2xl">🏆</span>
              <span>لقد حصلت على وسام جديد: {newBadge}!</span>
            </div>
          </motion.div>
        )}
        <span className="absolute top-0 right-0 bg-white/10 text-amber-500 border-b border-l border-white/10 text-xs font-bold px-4 py-2 rounded-bl-xl uppercase tracking-widest">
          مستوى {lesson.level}
        </span>
        <h1 className="text-2xl md:text-4xl font-serif text-white mt-8 md:mt-4 mb-4">{lesson.title}</h1>
        <p className="text-base md:text-lg text-slate-400 border-b border-white/10 pb-6 md:pb-8 mb-6 md:mb-8">{lesson.description}</p>
        
        <AnimatePresence>
          {culturalFact && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-6 mb-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-2xl shrink-0">
                  🇫🇷
                </div>
                <div>
                  <h4 className="text-cyan-400 font-bold mb-1">معلومة ثقافية!</h4>
                  <p className="text-slate-200 text-sm md:text-base italic leading-relaxed">{culturalFact}</p>
                </div>
                <button 
                  onClick={() => setCulturalFact(null)}
                  className="mr-auto text-slate-500 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <div className="flex gap-2">
                <button 
                  onClick={() => playAudio(vocab.fr)}
                  className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-colors flex-shrink-0 border border-amber-500/30"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleLookup(vocab.fr)}
                  className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500/20 transition-colors flex-shrink-0 border border-blue-500/30"
                >
                    {isLookingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpenText className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Lookup Result Overlay */}
        <AnimatePresence>
            {lookupResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setLookupResult(null)}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-[#121215] border border-white/10 rounded-3xl p-6 w-full max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-serif text-white">{lookupResult.word}</h3>
                            <button onClick={() => setLookupResult(null)} className="text-slate-500 hover:text-white"><XCircle /></button>
                        </div>
                        <p className="text-blue-400 mb-2 font-bold">{lookupResult.translation}</p>
                        <p className="text-slate-400 mb-6">{lookupResult.definition}</p>
                        {lookupResult.examples?.[0] && (
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="italic text-white mb-1">{lookupResult.examples[0].fr}</p>
                                <p className="text-slate-500 text-sm">{lookupResult.examples[0].ar}</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

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
                 
                 if (ex.type === 'sentence_ordering') {
                    const state = sentenceOrderingState[index] || { selected: [], available: [...ex.words] };
                    const isAllSelected = state.available.length === 0;
                    const isCorrect = isAllSelected && state.selected.join(' ') === ex.answer.join(' ');
                    
                    return (
                      <div key={index} className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2">
                          <p className="text-base md:text-lg text-slate-200">{index + 1}. رتب الكلمات لتكوين جملة صحيحة</p>
                          {isAllSelected && (
                            <span className={`text-xs md:text-sm font-bold px-3 py-1 rounded-full self-start sm:self-auto ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {isCorrect ? 'صحيح!' : 'حاول مرة أخرى'}
                            </span>
                          )}
                        </div>

                        {/* Drop Zone (Selected Words) */}
                        <div className={`min-h-[60px] p-4 rounded-xl border-2 border-dashed mb-6 flex flex-wrap gap-2 ${isAllSelected ? (isCorrect ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5') : 'border-white/20 bg-black/20'}`}>
                          {state.selected.map((word, i) => (
                            <button
                               key={i}
                               onClick={() => handleSentenceOrderingClick(index, word, 'selected', ex.words)}
                               className="px-4 py-2 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg font-serif hover:bg-amber-500/30 transition-colors"
                            >
                               {word}
                            </button>
                          ))}
                          {state.selected.length === 0 && <span className="text-slate-500 my-auto mx-2 text-sm italic">اضغط هنا لإلغاء التحديد...</span>}
                        </div>

                        {/* Available Words Pool */}
                        <div className="flex flex-wrap gap-2 justify-center">
                          {state.available.map((word, i) => (
                            <button
                               key={i}
                               onClick={() => handleSentenceOrderingClick(index, word, 'available', ex.words)}
                               className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg font-serif shadow-sm hover:bg-white/20 hover:scale-105 transition-all"
                            >
                               {word}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (ex.type === 'listening') {
                    const isAnswered = selectedAnswers[index] !== undefined;
                    const isCorrect = selectedAnswers[index] === ex.answer;
                    return (
                      <div key={index} className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10">
                        <div className="flex items-center gap-4 mb-6">
                           <button 
                             onClick={() => playAudio(ex.audioText)}
                             className="w-14 h-14 bg-amber-500 text-black rounded-full flex items-center justify-center hover:bg-amber-400 transition-all shadow-lg active:scale-95 group"
                           >
                              <Volume2 className="w-7 h-7 group-hover:scale-110 transition-transform" />
                           </button>
                           <div>
                             <p className="text-base md:text-lg text-white font-bold leading-none mb-1">{index + 1}. تمرين الاستماع</p>
                             <p className="text-sm text-slate-500">اضغط للاستماع ثم اختر الإجابة الصحيحة</p>
                           </div>
                        </div>
                        
                        <p className="text-slate-200 mb-6 font-medium bg-white/5 p-3 rounded-lg border border-white/5">{ex.question}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          {ex.options.map((opt, i) => {
                            const isSelected = selectedAnswers[index] === opt;
                            const showCorrect = isAnswered && opt === ex.answer;
                            const showWrong = isAnswered && isSelected && !isCorrect;
                            
                            let btnClass = "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10";
                            if (showCorrect) btnClass = "bg-green-500/20 border-green-500/50 text-green-400 font-bold";
                            else if (showWrong) btnClass = "bg-red-500/20 border-red-500/50 text-red-400";
                            else if (isSelected) btnClass = "bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]";

                            return (
                              <button
                                key={i}
                                disabled={isAnswered}
                                onClick={() => handleMultipleChoice(index, opt)}
                                className={`p-4 rounded-xl border transition-all text-start flex justify-between items-center ${btnClass} font-serif`}
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
          className={`px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 relative ${
            isCompleted 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
              : 'bg-amber-600 hover:bg-amber-500 text-black border border-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
          }`}
        >
          {showPointAnim && (
            <motion.span
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -40 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 right-0 left-0 text-center font-bold text-amber-500 text-xl pointer-events-none"
            >
              +50 ⭐
            </motion.span>
          )}
          {isCompleted ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>اكتمل الدرس</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>{isCompleting ? 'جاري الحفظ...' : 'تحديد كمكتمل (+50 نقطة)'}</span>
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

      {/* AI Smart Tips Section */}
      <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-500/50 to-transparent"></div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-white">نصائح دراسية ذكية</h3>
              <p className="text-sm text-slate-500">مقدمة بواسطة الذكاء الاصطناعي بناءً على تقدمك</p>
            </div>
          </div>
          <button 
            onClick={generateTips}
            disabled={isGeneratingTips}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-amber-500 disabled:opacity-50"
          >
            {isGeneratingTips ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>{aiTips ? 'تحديث النصائح' : 'الحصول على نصائح'}</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {aiTips ? (
            <motion.div
              key="tips-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-slate-300 space-y-4 leading-relaxed"
            >
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 italic">
                <p className="whitespace-pre-wrap">{aiTips}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tips-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <p className="text-slate-500 italic max-w-md mx-auto">
                هل تريد بعض النصائح الذكية حول كيفية إتقان هذا الدرس؟ اضغط على الزر أعلاه للحصول على مساعدة من الذكاء الاصطناعي.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
