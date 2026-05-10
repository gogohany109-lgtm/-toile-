import React, { useState, useMemo, useEffect } from 'react';
import { curriculum, Level } from '../data/curriculum';
import { BookOpen, CheckCircle2, Search, Check, ChevronLeft, Coffee, MapPin, MessageSquare, ShoppingCart, Users, GraduationCap, Plane, Utensils, Music, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { sounds } from '../lib/sounds';
import confetti from 'canvas-confetti';

interface CurriculumProps {
  setCurrentTab: (tab: string) => void;
  setCurrentLesson: (lessonId: string) => void;
}

const levelTitles: Record<Level, string> = {
  'A1': 'مبتدئ أول (A1)',
  'A2': 'مبتدئ ثانٍ (A2)',
  'B1': 'متوسط أول (B1)',
  'B2': 'متوسط ثانٍ (B2)',
  'C1': 'متقدم (C1)',
  'C2': 'احتراف (C2)',
};

const getLessonIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('تقديم') || t.includes('التحية') || t.includes('مرحباً')) return <MessageSquare className="w-6 h-6" />;
  if (t.includes('سفر') || t.includes('مطار') || t.includes('باريس')) return <Plane className="w-6 h-6" />;
  if (t.includes('مطعم') || t.includes('أكل') || t.includes('طعام')) return <Utensils className="w-6 h-6" />;
  if (t.includes('تسوق') || t.includes('سعر') || t.includes('شراء')) return <ShoppingCart className="w-6 h-6" />;
  if (t.includes('عمل') || t.includes('مهن') || t.includes('مكتب')) return <GraduationCap className="w-6 h-6" />;
  if (t.includes('عائلة') || t.includes('أصدقاء') || t.includes('أشخاص')) return <Users className="w-6 h-6" />;
  if (t.includes('موسيقى') || t.includes('فن') || t.includes('ترفيه')) return <Music className="w-6 h-6" />;
  if (t.includes('صحة') || t.includes('جسم') || t.includes('مخفي')) return <Heart className="w-6 h-6" />;
  if (t.includes('قهوة') || t.includes('مقهى') || t.includes('صباح')) return <Coffee className="w-6 h-6" />;
  if (t.includes('وصف') || t.includes('اتجاهات') || t.includes('خريطة')) return <MapPin className="w-6 h-6" />;
  return <BookOpen className="w-6 h-6" />;
};

import { motion, AnimatePresence } from 'motion/react';

export function Curriculum({ setCurrentTab, setCurrentLesson }: CurriculumProps) {
  const { user, userData } = useAuth();
  const completedLessons = userData?.completedLessons || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [toastContent, setToastContent] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase().trim();
    
    const possibleKeywords = new Set<string>();
    
    curriculum.forEach(lesson => {
      if (lesson.title.toLowerCase().includes(query)) {
        possibleKeywords.add(lesson.title);
      }
      
      lesson.vocabulary.slice(0, 2).forEach(v => {
        if (v.fr.toLowerCase().includes(query)) possibleKeywords.add(v.fr);
        if (v.ar.includes(query)) possibleKeywords.add(v.ar);
      });
    });

    return Array.from(possibleKeywords).slice(0, 5);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Filter and group curriculum by levels
  const groupedCurriculum = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = query 
      ? curriculum.filter(lesson => 
          lesson.title.toLowerCase().includes(query) || 
          lesson.description.toLowerCase().includes(query) ||
          lesson.vocabulary.some(v => v.fr.toLowerCase().includes(query) || v.ar.includes(query))
        )
      : curriculum;

    return filtered.reduce((acc, lesson) => {
      if (!acc[lesson.level]) acc[lesson.level] = [];
      acc[lesson.level].push(lesson);
      return acc;
    }, {} as Record<string, typeof curriculum>);
  }, [searchQuery]);

  const handleLessonStart = (id: string) => {
    sounds.playSelect();
    setCurrentLesson(id);
    setCurrentTab('lesson_view');
  };

  const GRAMMAR_LINKS: Record<string, { label: string, id: string }> = {
    'l2': { label: 'بناء الجملة', id: 'sentence' },
    'l3': { label: 'أدوات المعرفة والنكرة', id: 'articles' },
    'l4': { label: 'بناء الجملة', id: 'sentence' },
  };

  const navigateToGrammar = (topicId: string) => {
      setCurrentTab('grammar');
  }

  const handleSwipeComplete = async (lesson: typeof curriculum[0]) => {
    if (!user || completedLessons.includes(lesson.id)) return;

    sounds.playLessonComplete();
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#ffffff']
    });

    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedLessons = [...completedLessons, lesson.id];
      const newPoints = (userData?.points || 0) + 50;
      
      let updatedBadges = [...(userData?.badges || [])];
      
      if (updatedLessons.length === 1 && !updatedBadges.includes('البداية الموفقة')) {
        updatedBadges.push('البداية الموفقة');
      }
      if (updatedLessons.length === 5 && !updatedBadges.includes('متعلم الأسبوع')) {
        updatedBadges.push('متعلم الأسبوع');
      }

      const allVocabCount = curriculum
        .filter(l => updatedLessons.includes(l.id))
        .reduce((acc, curr) => acc + curr.vocabulary.length, 0);
      
      if (allVocabCount >= 20 && !updatedBadges.includes('جامع الكلمات')) {
        updatedBadges.push('جامع الكلمات');
      }
      
      await updateDoc(userRef, {
        completedLessons: updatedLessons,
        points: newPoints,
        badges: updatedBadges,
        updatedAt: serverTimestamp()
      });

      setToastContent(lesson.title);
      setTimeout(() => setToastContent(null), 4000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 mt-6"
    >
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 italic text-slate-400 mb-8 border-r-4 border-r-amber-500">
        <p>هنا تجد خطة التعلم المنهجية التي تأخذك خطوة بخطوة من مستويات المبتدئين حتى الاحتراف.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 z-50">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="ابحث عن درس أو موضوع..."
          value={searchQuery}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors shadow-lg"
        />

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#121215] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[60]"
            >
              <div className="p-2 flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="flex items-center gap-2 bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-500 px-3 py-1.5 rounded-lg border border-white/5 hover:border-amber-500/30 transition-all text-sm group"
                  >
                    <Search className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {Object.keys(groupedCurriculum).length === 0 && searchQuery && (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-slate-400">لم يتم العثور على نتائج للبحث عن "{searchQuery}"</p>
        </div>
      )}

      <div className="space-y-12">
        {(Object.keys(levelTitles) as Level[]).map((level) => {
          const title = levelTitles[level];
          const lessons = groupedCurriculum[level] || [];
          if (lessons.length === 0) return null; // Skip empty levels for now
          
          return (
            <div key={level} className="space-y-4">
              <h3 className="text-xl font-serif text-white border-b border-white/10 pb-3 flex justify-between items-center">
                <span>{title}</span>
                <span className="text-sm font-sans font-normal text-slate-400">
                  {lessons.filter(l => completedLessons.includes(l.id)).length} / {lessons.length} مكتمل
                </span>
              </h3>
              
              {/* Progress bar for level */}
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2 mb-4">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(lessons.filter(l => completedLessons.includes(l.id)).length / lessons.length) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson, i) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isFirstIncomplete = !isCompleted && lessons.findIndex(l => !completedLessons.includes(l.id)) === i;
                  
                  return (
                    <div key={lesson.id} className="relative">
                      {/* Swipe Indicator Background */}
                      <div className="swipe-bg absolute inset-0 bg-green-500/20 rounded-xl flex items-center pr-6 overflow-hidden opacity-0 transition-opacity duration-200">
                        <div className="flex items-center gap-2 text-green-500">
                          <Check className="w-8 h-8" />
                          <span className="font-bold">إكمال الدرس</span>
                        </div>
                      </div>

                      {showSwipeHint && isFirstIncomplete && (
                        <motion.div 
                          animate={{ x: [0, 15, 0], opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500/50 z-20 pointer-events-none flex flex-col items-center"
                        >
                          <ChevronLeft className="w-8 h-8" />
                          <span className="text-[10px] whitespace-nowrap">اسحب للإكمال</span>
                        </motion.div>
                      )}

                      <motion.div 
                        drag={isCompleted ? false : "x"}
                        dragConstraints={{ left: 0, right: 200 }}
                        dragElastic={0.1}
                        whileHover={{ y: -4 }}
                        onDrag={(e, info) => {
                          const indicator = e.target as HTMLElement;
                          const parent = indicator.parentElement;
                          if (parent) {
                            const bg = parent.querySelector('.swipe-bg') as HTMLElement;
                            if (bg) {
                              const opacity = Math.min(info.offset.x / 150, 1);
                              bg.style.opacity = opacity.toString();
                            }
                          }
                        }}
                        onDragEnd={(_, info) => {
                          if (info.offset.x > 150) {
                            handleSwipeComplete(lesson);
                          }
                        }}
                        className={`rounded-2xl p-6 border transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden z-10 ${
                          isCompleted 
                            ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40 hover:bg-green-500/10' 
                            : 'bg-gradient-to-br from-[#121215] to-[#0a0a0b] border-white/10 hover:border-amber-500/50 hover:from-[#1a1a20] hover:to-[#0f0f12] shadow-sm hover:shadow-amber-500/10'
                        }`}
                        onClick={() => handleLessonStart(lesson.id)}
                      >
                        {/* Interactive hover beam */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {GRAMMAR_LINKS[lesson.id] && (
                           <div className="mb-4">
                             <button onClick={(e) => { e.stopPropagation(); navigateToGrammar(GRAMMAR_LINKS[lesson.id].id); }}
                                     className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-1 font-bold uppercase">
                               <BookOpen className="w-3 h-3" />
                               راجع: {GRAMMAR_LINKS[lesson.id].label}
                             </button>
                           </div>
                        )}

                        {isCompleted && (
                          <motion.div 
                             initial={{ scale: 0, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             transition={{ type: "spring", stiffness: 500, damping: 20 }}
                             className="absolute top-4 left-4 bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                          >
                             <CheckCircle2 className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-bold uppercase tracking-widest leading-none">مكتمل</span>
                          </motion.div>
                        )}
                        <div className={`w-14 h-14 flex items-center justify-center rounded-xl mb-5 transition-all duration-300 border ${
                          isCompleted
                            ? 'bg-green-500/10 text-green-500 border-green-500/20 group-hover:scale-110 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                            : 'bg-amber-500/5 text-amber-500 border-white/5 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        }`}>
                          {getLessonIcon(lesson.title)}
                        </div>
                        <h4 className="font-bold text-xl text-white mb-2 group-hover:text-amber-500 transition-colors">{lesson.title}</h4>
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{lesson.description}</p>
                        
                        {/* Lesson metadata footer */}
                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between opacity-100 translate-y-0 duration-300">
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{lesson.vocabulary.length} كلمة</span>
                          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest group-hover:opacity-100 opacity-0 transition-opacity">بدء الدرس ←</span>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {toastContent && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[100]"
          >
            <div className="bg-[#1a1a20] border border-green-500/30 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-4 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h5 className="text-white font-bold text-sm mb-0.5">أحسنت صنعاً! 🎉</h5>
                <p className="text-slate-400 text-xs line-clamp-1">تم إكمال: {toastContent}</p>
              </div>
              <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-mono">النقاط</span>
                <span className="text-green-500 font-bold font-serif">+50</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
