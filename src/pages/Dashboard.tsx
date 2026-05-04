import React, { useMemo } from 'react';
import { BookOpen, MessageCircle, Mic, ArrowLeft, Target } from 'lucide-react';
import { curriculum } from '../data/curriculum';
import { motion } from 'motion/react';
import { useAuth } from '../components/FirebaseProvider';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
  setCurrentLesson: (lessonId: string) => void;
}

export function Dashboard({ setCurrentTab, setCurrentLesson }: DashboardProps) {
  const { userData } = useAuth();
  
  const completedLessons = userData?.completedLessons || [];
  
  const nextLesson = useMemo(() => {
    // Find the first lesson that is not completed
    const incompleteLesson = curriculum.find(lesson => !completedLessons.includes(lesson.id));
    return incompleteLesson || curriculum[0]; // Fallback to first if all completed
  }, [completedLessons]);
  
  const progressPercentage = Math.round((completedLessons.length / curriculum.length) * 100) || 0;

  const handleLessonStart = () => {
    setCurrentLesson(nextLesson.id);
    setCurrentTab('lesson_view');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8 mt-2 md:mt-6"
    >
      {/* Progress Overview */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
         <div className="flex justify-between items-center mb-4">
           <h4 className="text-lg font-serif text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              <span>معدل التقدم العام</span>
           </h4>
           <span className="text-amber-500 font-bold">{progressPercentage}%</span>
         </div>
         <div className="w-full h-2 bg-[#0a0a0b] rounded-full overflow-hidden border border-white/5">
           <div 
             className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out"
             style={{ width: `${progressPercentage}%` }}
           />
         </div>
         <p className="text-slate-400 text-sm mt-3">لقد أتممت {completedLessons.length} من أصل {curriculum.length} دروس.</p>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#0f0f11] to-[#0a0a0b] rounded-3xl p-6 md:p-10 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        {/* French Flag Decorative */}
        <div className="absolute top-0 right-0 w-full h-1 flex opacity-30">
          <div className="h-full w-1/3 bg-[#002654]"></div>
          <div className="h-full w-1/3 bg-white"></div>
          <div className="h-full w-1/3 bg-[#ED2939]"></div>
        </div>

        <div className="space-y-4 max-w-xl z-10 text-center md:text-right w-full">
          <h3 className="text-2xl md:text-4xl font-serif text-white mb-4 md:mb-6">الدرس التالي: <span className="italic text-amber-500 block md:inline mt-2 md:mt-0">{nextLesson.title}</span></h3>
          <p className="text-slate-400 leading-relaxed text-base md:text-lg mb-6 md:mb-8">
            {nextLesson.description}
          </p>
          <button 
            onClick={handleLessonStart}
            className="mt-2 md:mt-4 w-full md:w-auto bg-amber-600 hover:bg-amber-500 text-black px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition-colors flex items-center justify-center gap-2"
          >
            <span>ابدأ الدرس الآن</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden md:flex w-40 h-40 md:w-48 md:h-48 bg-amber-500/5 rounded-full items-center justify-center border-4 border-amber-500/10 z-10 flex-shrink-0">
          <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-amber-500" />
        </div>
      </div>

      {/* Quick Actions */}
      <h4 className="text-xl md:text-2xl font-serif text-white mt-8 md:mt-12 mb-4 md:mb-6">ممارسات يومية موصى بها</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <button 
          onClick={() => setCurrentTab('chat')}
          className="bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-start group"
        >
          <div className="bg-amber-500/10 p-3 md:p-4 rounded-xl group-hover:bg-amber-500/20 transition-colors border border-amber-500/20 shrink-0">
            <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
          </div>
          <div>
            <h5 className="text-base md:text-lg font-bold text-white mb-2">محادثة حرة</h5>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              تحدث مع المساعد الذكي Étoile باللغة الفرنسية لتحسين طلاقتك وتوسيع مفرداتك.
            </p>
          </div>
        </button>

        <button 
          onClick={() => setCurrentTab('pronunciation')}
          className="bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-start group"
        >
          <div className="bg-amber-500/10 p-3 md:p-4 rounded-xl group-hover:bg-amber-500/20 transition-colors border border-amber-500/20 shrink-0">
            <Mic className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
          </div>
          <div>
            <h5 className="text-base md:text-lg font-bold text-white mb-2">تدريب النطق</h5>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              استمع لعبارات فرنسية شائعة ورددها، وسيقوم الذكاء الاصطناعي بتقييم وتصحيح نطقك.
            </p>
          </div>
        </button>
      </div>
    </motion.div>
  );
}
