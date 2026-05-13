import React, { useState, useMemo } from 'react';
import { learningPaths, LearningPath } from '../data/learningPaths';
import { Compass, Clock, GraduationCap, Plane, Briefcase, ChevronRight, BookOpen, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/FirebaseProvider';

interface LearningPathsProps {
  setCurrentTab: (tab: string) => void;
  setCurrentLesson: (lessonId: string) => void;
}

export function LearningPaths({ setCurrentTab, setCurrentLesson }: LearningPathsProps) {
  const { userData } = useAuth();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const recommendedPath = useMemo(() => {
    if (!userData?.currentLevel || !userData?.learningGoal) return null;
    return learningPaths.find(p => p.level === userData.currentLevel && p.goal === userData.learningGoal);
  }, [userData]);

  const filteredPaths = learningPaths.filter(path => {
    const goalMatch = !selectedGoal || path.goal === selectedGoal;
    const levelMatch = !selectedLevel || path.level === selectedLevel;
    return goalMatch && levelMatch;
  });

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'Travel': return <Plane className="w-5 h-5" />;
      case 'Work': return <Briefcase className="w-5 h-5" />;
      case 'Study': return <GraduationCap className="w-5 h-5" />;
      default: return <Compass className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">مسارات التعلم المخصصة</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">اختر المسار الذي يناسب أهدافك ومستواك الحالي لنضع لك خطة دراسية متكاملة.</p>
      </div>

      {/* Recommendation Section */}
      <AnimatePresence>
        {recommendedPath && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 bg-amber-500 text-black px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-br-xl flex items-center gap-2">
              <Star className="w-3 h-3 fill-current" />
              <span>موصى به لك</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-serif text-white">{recommendedPath.title}</h3>
                <p className="text-slate-400">{recommendedPath.description}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <Clock className="w-3 h-3" />
                    <span>{recommendedPath.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10">
                    <GraduationCap className="w-3 h-3" />
                    <span>المستوى: {recommendedPath.level}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  const firstLessonId = recommendedPath.modules[0].lessonIds[0];
                  setCurrentLesson(firstLessonId);
                  setCurrentTab('lesson_view');
                }}
                className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-3 shrink-0"
              >
                <span>ابدأ رحلتك المخصصة</span>
                <ChevronRight className="w-5 h-5 translate-x-[-2px]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block pr-2">الهدف من التعلم</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Travel', label: 'سفر', icon: Plane },
              { id: 'Work', label: 'عمل', icon: Briefcase },
              { id: 'Study', label: 'دراسة', icon: GraduationCap }
            ].map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${
                  selectedGoal === goal.id ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <goal.icon className="w-6 h-6" />
                <span className="text-sm font-bold">{goal.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block pr-2">المستوى الحالي</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Beginner', label: 'مبتدئ' },
              { id: 'Intermediate', label: 'متوسط' },
              { id: 'Advanced', label: 'متقدم' }
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(selectedLevel === level.id ? null : level.id)}
                className={`p-4 rounded-2xl flex items-center justify-center border transition-all ${
                  selectedLevel === level.id ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span className="text-sm font-bold">{level.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Path List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPaths.map((path) => (
            <motion.div
              key={path.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0f0f11] border border-white/5 rounded-3xl overflow-hidden flex flex-col group cursor-pointer hover:border-amber-500/30 transition-all shadow-xl"
            >
              <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                    {getGoalIcon(path.goal)}
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{path.duration}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{path.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{path.description}</p>
                </div>

                <div className="space-y-3">
                  {path.modules.map((mod, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-mono text-amber-500">{idx + 1}</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-200">{mod.title}</p>
                        <p className="text-[10px] text-slate-500">{mod.lessonIds.length} دروس</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  // For demo, we just jump to the first lesson of the first module
                  const firstLessonId = path.modules[0].lessonIds[0];
                  setCurrentLesson(firstLessonId);
                  setCurrentTab('lesson_view');
                }}
                className="bg-white/5 p-4 border-t border-white/5 flex items-center justify-between group-hover:bg-amber-500 group-hover:text-black transition-all"
              >
                <span className="text-sm font-bold">ابدأ المسار الآن</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-[-4px]" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPaths.length === 0 && (
        <div className="py-20 text-center">
          <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-50" />
          <p className="text-slate-500">لا توجد مسارات مطابقة لهذه الفلاتر حالياً.</p>
        </div>
      )}
    </div>
  );
}
