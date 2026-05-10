import React, { useState, useEffect, useMemo } from 'react';
import { Gamepad2, Timer, Trophy, RotateCcw, Brain, CheckCircle2, XCircle, ArrowLeftRight, ChevronRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { curriculum } from '../data/curriculum';
import { sounds } from '../lib/sounds';
import { useAuth } from '../components/FirebaseProvider';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

type Difficulty = 'easy' | 'medium' | 'hard';

export function Games() {
  const { user, userData } = useAuth();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [showDifficultyScreen, setShowDifficultyScreen] = useState<string | null>(null);
  
  const handleStartGame = (id: string) => {
    setShowDifficultyScreen(id);
  };

  const confirmStartGame = () => {
    if (showDifficultyScreen) {
      setActiveGame(showDifficultyScreen);
      setShowDifficultyScreen(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AnimatePresence mode="wait">
        {!activeGame && !showDifficultyScreen ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
               <h2 className="text-3xl md:text-4xl font-serif text-white mb-2">الألعاب التفاعلية</h2>
               <p className="text-slate-400 text-lg max-w-2xl mx-auto">تعلم الفرنسية بمتعة! اختبر سرعة بديهتك ودقة ذاكرتك في تحديات متنوعة.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <GameCard 
                id="flashcard-quiz"
                title="بطاقات التعليم"
                description="اختبر ذاكرتك ببطاقات تعليمية سريعة لتعلم كلمات فرنسية جديدة ومراجعة ما تعلمته."
                icon={<Brain className="w-8 h-8 text-green-500" />}
                color="bg-green-500"
                onClick={() => handleStartGame('flashcard-quiz')}
              />
              <GameCard 
                id="sentence-builder"
                title="باني الجمل"
                description="رتب الكلمات المبعثرة لتكوين جمل فرنسية صحيحة نحوياً وتدرب على تركيب الجمل."
                icon={<ArrowLeftRight className="w-8 h-8 text-indigo-500" />}
                color="bg-indigo-500"
                onClick={() => handleStartGame('sentence-builder')}
              />
              <GameCard 
                id="speed-listening"
                title="أسرع أذن"
                description="استمع للكلمات واسرع في اختيار المعنى الصحيح لتدريب الأذن."
                icon={<Timer className="w-8 h-8 text-amber-500" />}
                color="bg-amber-500"
                onClick={() => handleStartGame('speed-listening')}
                comingSoon
              />
            </div>
          </motion.div>
        ) : showDifficultyScreen ? (
          <motion.div
             key="difficulty"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="max-w-xl mx-auto space-y-8 mt-12"
          >
             <button
               onClick={() => setShowDifficultyScreen(null)}
               className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-sm"
             >
               <ChevronRight className="w-5 h-5" />
               <span>العودة للألعاب</span>
             </button>

             <div className="bg-[#0f0f11] border border-white/5 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <Settings className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-3xl font-serif text-white mb-2">اختر مستوى الصعوبة</h3>
                <p className="text-slate-400 mb-8">اختر المستوى المناسب لمهاراتك الحالية لتحصل على أفضل تجربة للعبة.</p>

                <div className="space-y-4">
                  {[
                    { id: 'easy', label: 'سهل (للمبتدئين)', pointsMultiplier: 1, color: 'text-green-500', border: 'border-green-500' },
                    { id: 'medium', label: 'متوسط (تحدي معتدل)', pointsMultiplier: 2, color: 'text-amber-500', border: 'border-amber-500' },
                    { id: 'hard', label: 'صعب (للمحترفين)', pointsMultiplier: 3, color: 'text-red-500', border: 'border-red-500' }
                  ].map(diff => (
                    <button
                      key={diff.id}
                      onClick={() => setSelectedDifficulty(diff.id as Difficulty)}
                      className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                        selectedDifficulty === diff.id 
                          ? `${diff.border} bg-white/5` 
                          : 'border-white/5 bg-transparent hover:border-white/20'
                      }`}
                    >
                      <span className={`font-bold text-lg ${selectedDifficulty === diff.id ? diff.color : 'text-slate-300'}`}>{diff.label}</span>
                      <span className="text-sm font-mono bg-white/5 px-3 py-1 rounded-full text-slate-400">×{diff.pointsMultiplier} نقاط</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={confirmStartGame}
                  className="w-full mt-8 bg-white text-black font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Gamepad2 className="w-5 h-5" />
                  <span>بدء اللعبة الآن</span>
                </button>
             </div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="max-w-4xl mx-auto"
          >
            {activeGame === 'flashcard-quiz' && <FlashcardQuizGame difficulty={selectedDifficulty} onExit={() => setActiveGame(null)} />}
            {activeGame === 'sentence-builder' && <SentenceBuilderGame difficulty={selectedDifficulty} onExit={() => setActiveGame(null)} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GameCard({ id, title, description, icon, color, onClick, comingSoon }: any) {
  return (
    <div 
      className={`bg-[#0f0f11] border border-white/5 rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden group transition-all ${comingSoon ? 'opacity-50 grayscale' : 'hover:border-white/20 cursor-pointer active:scale-[0.98]'}`}
      onClick={!comingSoon ? onClick : undefined}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${color}/5 blur-3xl rounded-full -mr-16 -mt-16`} />
      
      <div className="flex justify-between items-start">
        <div className={`w-16 h-16 rounded-2xl ${color}/10 border border-${color}/20 flex items-center justify-center`}>
          {icon}
        </div>
        {comingSoon && <span className="text-[10px] bg-white/10 text-slate-500 px-3 py-1 rounded-full font-bold uppercase tracking-widest">قريباً</span>}
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-500 leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
        {!comingSoon ? (
          <>
            <span className={color.replace('bg-', 'text-')}>ابدأ اللعب</span>
            <Gamepad2 className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
          </>
        ) : (
          <span className="text-slate-600">غير متاح حالياً</span>
        )}
      </div>
    </div>
  );
}

function FlashcardQuizGame({ difficulty, onExit }: { difficulty: Difficulty, onExit: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const words = useMemo(() => curriculum.flatMap(l => l.vocabulary).sort(() => Math.random() - 0.5), []);
  
  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex(prev => (prev + 1) % words.length);                
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10">
        <h2 className="text-2xl font-serif text-white">بطاقات التعليم</h2>
        <button onClick={onExit} className="p-2 text-slate-500 hover:text-white transition-colors">
          <Gamepad2 className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex justify-center p-8">
         <div 
           className="w-full max-w-sm h-64 bg-[#0f0f11] border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer p-6 text-center transform transition-all duration-500 preserve-3d"
           onClick={() => setFlipped(!flipped)}
           style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
         >
            <div className="absolute w-full h-full flex flex-col items-center justify-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                <p className="text-3xl font-serif text-white">{words[currentIndex].fr}</p>
            </div>
            <div className="absolute w-full h-full flex flex-col items-center justify-center backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <p className="text-3xl font-serif text-amber-500">{words[currentIndex].ar}</p>
            </div>
         </div>
      </div>

      <div className="flex justify-center">
        <button onClick={handleNext} className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">
          التالي
        </button>
      </div>
    </div>
  );
}

const GAME_SENTENCES = [
  { fr: 'Bonjour comment allez vous', ar: 'مرحباً، كيف حالك؟' },
  { fr: 'Je voudrais un café', ar: 'أريد قهوة' },
  { fr: 'Où est la gare', ar: 'أين هي محطة القطار؟' },
  { fr: 'J\'aime beaucoup la France', ar: 'أنا أحب فرنسا كثيراً' },
  { fr: 'Quel est votre nom', ar: 'ما هو اسمك؟' },
  { fr: 'Il fait très beau aujourd\'hui', ar: 'الجو جميل جداً اليوم' },
  { fr: 'Je parle un peu français', ar: 'أنا أتحدث القليل من الفرنسية' },
  { fr: 'Merci pour votre aide', ar: 'شكراً لمساعدتك' },
  { fr: 'Pouvez vous m\'aider', ar: 'هل يمكنك مساعدتي؟' },
  { fr: 'Combien ça coûte', ar: 'كم يكلف هذا؟' }
];

function SentenceBuilderGame({ difficulty, onExit }: { difficulty: Difficulty, onExit: () => void }) {
  const { user } = useAuth();
  const [sentences, setSentences] = useState<{fr: string[], frBase: string, ar: string}[]>([]);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');

  const config = useMemo(() => {
    switch (difficulty) {
      case 'easy': return { sentencesCount: 3, multiplier: 1, showHint: true };
      case 'medium': return { sentencesCount: 5, multiplier: 2, showHint: false };
      case 'hard': return { sentencesCount: 8, multiplier: 3, showHint: false };
      default: return { sentencesCount: 3, multiplier: 1, showHint: true };
    }
  }, [difficulty]);

  useEffect(() => {
    // Generate sentences to build based on phrases in GAME_SENTENCES
    const selected = GAME_SENTENCES
      .sort(() => Math.random() - 0.5)
      .slice(0, config.sentencesCount)
      .map(p => ({
        frBase: p.fr,
        fr: p.fr.split(' ').sort(() => Math.random() - 0.5), // Scatter words
        ar: p.ar
      }));
    setSentences(selected);
    setCurrentSentenceIdx(0);
    setSelectedWords([]);
    setScore(0);
    setGameState('playing');
  }, [config]);

  const currentSentence = sentences[currentSentenceIdx];

  const handleWordSelect = (word: string) => {
    setSelectedWords(prev => [...prev, word]);
    sounds.playSelect();
  };

  const handleWordRemove = (index: number) => {
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    sounds.playSelect();
  };

  const checkSentence = () => {
    const builtSentence = selectedWords.join(' ');
    if (builtSentence === currentSentence.frBase) {
      sounds.playMatchSuccess();
      setScore(prev => prev + 1);
      setTimeout(() => {
        if (currentSentenceIdx + 1 < sentences.length) {
          setCurrentSentenceIdx(prev => prev + 1);
          setSelectedWords([]);
        } else {
          setGameState('gameover');
          if (user && score + 1 > 0) {
            updateDoc(doc(db, 'users', user.uid), {
              points: increment((score + 1) * 10 * config.multiplier),
              updatedAt: serverTimestamp()
            }).catch(console.error);
          }
        }
      }, 1000);
    } else {
      sounds.playSelect(); // Using select instead of error
      setSelectedWords([]);
    }
  };

  if (gameState === 'gameover') {
    return (
      <div className="bg-[#0f0f11] border border-white/5 rounded-3xl p-12 text-center space-y-8 shadow-2xl">
        <Trophy className="w-20 h-20 text-indigo-500 mx-auto mb-4" />
        <div>
          <h2 className="text-4xl font-serif text-white mb-2">أحسنت!</h2>
          <p className="text-slate-400">لقد أكملت بناء {score} جملة بنجاح.</p>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="bg-indigo-500/10 px-6 py-3 rounded-full border border-indigo-500/20">
            <span className="text-indigo-500 font-bold">+{score * 10 * config.multiplier} نقطة تمت إضافتها</span>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setScore(0);
                setCurrentSentenceIdx(0);
                setSelectedWords([]);
                setGameState('playing');
                // regenerate sentences
                 const selected = GAME_SENTENCES
                   .sort(() => Math.random() - 0.5)
                   .slice(0, config.sentencesCount)
                   .map(p => ({
                     frBase: p.fr,
                     fr: p.fr.split(' ').sort(() => Math.random() - 0.5),
                     ar: p.ar
                   }));
                 setSentences(selected);
              }}
              className="bg-indigo-500 text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-400 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              <span>إعادة المحاولة</span>
            </button>
            <button 
              onClick={onExit}
              className="bg-white/5 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              الخروج
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSentence) return null;

  const availableWords = currentSentence.fr.filter((word, index) => {
    const selectedCount = selectedWords.filter(w => w === word).length;
    const totalCount = currentSentence.fr.filter(w => w === word).length;
    return selectedCount < totalCount;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">التقدم</p>
            <p className="text-2xl font-serif text-white leading-none">{currentSentenceIdx + 1} / {sentences.length}</p>
          </div>
        </div>
        
        <button onClick={onExit} className="p-2 text-slate-500 hover:text-white transition-colors">
          <Gamepad2 className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-[#0f0f11] border border-white/5 rounded-3xl p-8 space-y-8">
        <div className="text-center space-y-4">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">ترجم الجملة التالية:</p>
          <p className="text-2xl md:text-3xl text-white font-serif">{currentSentence.ar}</p>
          {config.showHint && (
            <p className="text-indigo-400 text-sm mt-2">عليك ترتيب الكلمات لتشكيل ترجمة صحيحة.</p>
          )}
        </div>

        {/* Selected Words Area */}
        <div className="min-h-[100px] p-6 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-wrap gap-3 items-center justify-center">
          {selectedWords.length === 0 && (
             <span className="text-slate-500 text-sm italic">اضغط على الكلمات بالأسفل لترتيبها هنا...</span>
          )}
          {selectedWords.map((word, idx) => (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={idx}
              onClick={() => handleWordRemove(idx)}
              className="bg-indigo-500 text-black px-4 py-2 rounded-xl font-serif text-lg font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform"
            >
              {word}
            </motion.button>
          ))}
        </div>

        {/* Available Words Area */}
        <div className="flex flex-wrap gap-3 justify-center">
          {availableWords.map((word, idx) => (
            <button
              key={`${word}-${idx}`}
              onClick={() => handleWordSelect(word)}
              className="bg-white/10 text-white px-4 py-2 rounded-xl font-serif text-lg hover:bg-white/20 transition-colors border border-white/10"
            >
              {word}
            </button>
          ))}
        </div>

        <div className="pt-8 flex justify-center">
          <button
            onClick={checkSentence}
            disabled={selectedWords.length !== currentSentence.fr.length}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              selectedWords.length === currentSentence.fr.length
                ? 'bg-indigo-500 hover:bg-indigo-400 text-black'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>تحقق من الإجابة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
