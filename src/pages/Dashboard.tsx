import React, { useMemo, useState } from 'react';
import { BookOpen, MessageCircle, Mic, ArrowLeft, Target, Share2, Check } from 'lucide-react';
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
  
  const dailyTarget = userData?.learningGoals?.dailyVocabTarget || 10;
  const totalWordsLearned = useMemo(() => {
    return curriculum
      .filter(l => completedLessons.includes(l.id))
      .reduce((acc, curr) => acc + curr.vocabulary.length, 0);
  }, [completedLessons]);
  
  // For a real app, we'd track "today's" words. Here, we'll show progress relative to the goal.
  // We'll simulate "today's progress" by showing the remainder of total words vs target if not reached.
  const dailyProgress = Math.min(Math.round((totalWordsLearned / dailyTarget) * 100), 100);

  const [isCopied, setIsCopied] = useState(false);

  const handleLessonStart = () => {
    setCurrentLesson(nextLesson.id);
    setCurrentTab('lesson_view');
  };

  const shareProgress = () => {
    const text = `أنا أتعلم الفرنسية على منصة Étoile! لقد أتممت ${completedLessons.length} دروس واكتسبت ${userData?.points || 0} نقطة و المتبقي من الخطة ${curriculum.length - completedLessons.length} دروس! 🎉 هل يمكنك التفوق عليّ؟`;
    if (navigator.share) {
      navigator.share({
        title: 'تقدمي في تعلم الفرنسية',
        text: text,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const welcomeData = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    if (hour >= 5 && hour < 12) timeGreeting = 'صباح الخير';
    else if (hour >= 12 && hour < 17) timeGreeting = 'طاب يومك';
    else timeGreeting = 'مساء الخير';

    const name = userData?.displayName?.split(' ')[0] || 'مرحباً';
    const points = userData?.points || 0;
    const completedCount = completedLessons.length;

    let subMsg = 'جاهز لمتابعة رحلة تعلم الفرنسية؟';
    if (completedCount === 0) subMsg = 'أهلاً بك! لنبدأ أول خطوة في رحلتك الممتعة اليوم.';
    else if (points > 0 && points < 500) subMsg = `رائع! لقد جمعت ${points} نقطة، استمر في هذا النشاط!`;
    else if (points >= 500) subMsg = `مذهل! لقد أصبحت من المتعلمين المتميزين بـ ${points} نقطة.`;

    return { title: `${timeGreeting}، ${name}`, sub: subMsg };
  }, [userData, completedLessons]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8 mt-2 md:mt-6"
    >
      {/* Personalized Welcome */}
      <div className="mb-2">
        <h2 className="text-3xl md:text-5xl font-serif text-white mb-2">{welcomeData.title}</h2>
        <p className="text-slate-400 text-lg">{welcomeData.sub}</p>
      </div>
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
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

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
           <div className="flex justify-between items-center mb-4">
             <h4 className="text-lg font-serif text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-500" />
                <span>هدف المفردات اليومي</span>
             </h4>
             <span className="text-green-500 font-bold">{dailyProgress}%</span>
           </div>
           <div className="w-full h-2 bg-[#0a0a0b] rounded-full overflow-hidden border border-white/5">
             <div 
               className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
               style={{ width: `${dailyProgress}%` }}
             />
           </div>
           <div className="flex justify-between items-center mt-3">
             <p className="text-slate-400 text-sm">هدفك: {dailyTarget} كلمة. تعلمت حتى الآن {totalWordsLearned}.</p>
             {dailyProgress === 100 && <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-bold">تم الإنجاز! 🎉</span>}
           </div>
        </div>
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

      {/* Gamification / Leaderboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-8 md:mt-12">
        
        {/* Badges */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <h4 className="text-xl font-serif text-white">الأوسمة</h4>
            <span className="text-xs font-mono bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full">{userData?.badges?.length || 0}</span>
          </div>
          
          <div className="space-y-4">
            {(userData?.badges && userData.badges.length > 0) ? (
              userData.badges.map((badge: string, i: number) => (
                <div key={i} className="flex items-center gap-4 bg-[#0a0a0b] p-3 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-xl shadow-lg border border-amber-500/20">
                    🏆
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white max-w-[140px] truncate">{badge || 'وسام التميز'}</h5>
                    <p className="text-xs text-slate-400">مكتسب</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 px-4 bg-[#0a0a0b] rounded-xl border border-dashed border-white/10">
                <p className="text-slate-500 text-sm">أكمل دروساً لتربح الأوسمة!</p>
              </div>
            )}
            
            {/* Show an upcoming badge hint */}
            {(!userData?.badges || userData.badges.length < 5) && (
              <div className="flex items-center gap-4 bg-[#0a0a0b]/50 p-3 rounded-xl border border-white/5 opacity-50 grayscale">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">
                  🔒
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">متعلم الأسبوع</h5>
                  <p className="text-xs text-slate-400">أكمل 5 دروس</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#0f0f11] to-[#0a0a0b] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-br-full pointer-events-none" />
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-serif text-white">لوحة الشرف (Top 3)</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">ترتيبك الحالي:</span>
              <span className="text-sm font-bold text-amber-500 px-3 py-1 bg-amber-500/10 rounded-lg">#4</span>
            </div>
          </div>
          
          <div className="space-y-3 relative z-10">
            {/* Mock Leaderboard Users */}
            {[
              { name: 'Sarah M.', points: 1250, level: 'B1', rank: 1 },
              { name: 'Ahmed A.', points: 980, level: 'A2', rank: 2 },
              { name: 'Nour K.', points: 840, level: 'A2', rank: 3 },
            ].map((usr, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                {usr.rank === 1 && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${usr.rank === 1 ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-[#0a0a0b] text-slate-400 border border-white/10'}`}>
                    {usr.rank}
                  </div>
                  <div>
                    <h5 className="text-white font-medium">{usr.name}</h5>
                    <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded uppercase">{usr.level}</span>
                  </div>
                </div>
                <div className="text-amber-500 font-mono font-bold">
                  {usr.points} <span className="text-xs text-amber-500/50">نقطة</span>
                </div>
              </div>
            ))}
            
            {/* Current User */}
            <div className="flex items-center justify-between p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 mt-4 relative">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-500 rotate-45" />
              <div className="flex items-center gap-4 pl-4">
                <div className="w-8 h-8 rounded-full bg-[#0a0a0b] flex items-center justify-center font-bold text-sm text-slate-400 border border-white/10">
                  4
                </div>
                <div>
                  <h5 className="text-amber-400 font-medium">أنت ({userData?.displayName?.split(' ')[0] || 'المستخدم'})</h5>
                  <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded uppercase">{userData?.currentLevel || 'A1'}</span>
                </div>
              </div>
              <div className="text-amber-500 font-mono font-bold">
                {userData?.points || 0} <span className="text-xs text-amber-500/50">نقطة</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </motion.div>
  );
}
