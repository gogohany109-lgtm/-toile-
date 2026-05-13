import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Target, Save, Loader2, BookOpen, Edit2, Check, GraduationCap, BookA } from 'lucide-react';
import { useAuth } from '../components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export function Profile() {
  const { user, userData } = useAuth();
  const [dailyVocabTarget, setDailyVocabTarget] = useState(10);
  const [focusTopics, setFocusTopics] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState<string>('Beginner');
  const [learningGoal, setLearningGoal] = useState<string>('Travel');
  const [reminders, setReminders] = useState<{ time: string; activity: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const TOPIC_OPTIONS = [
    'القواعد (Grammar)',
    'الأفعال (Verbs)',
    'النطق (Pronunciation)',
    'مفردات السفر (Travel)',
    'مفردات العمل (Business)',
    'المحادثة اليومية (Daily UI)'
  ];

  useEffect(() => {
    if (userData?.learningGoals) {
      setDailyVocabTarget(userData.learningGoals.dailyVocabTarget || 10);
      setFocusTopics(userData.learningGoals.focusTopics || []);
      setReminders(userData.learningGoals.reminders || []);
    }
    if (userData?.currentLevel) setCurrentLevel(userData.currentLevel);
    if (userData?.learningGoal) setLearningGoal(userData.learningGoal);
  }, [userData]);
  
  const addReminder = () => {
     setReminders([...reminders, { time: '09:00', activity: 'vocabulary' }]);
  };
  
  const updateReminder = (index: number, field: string, value: string) => {
      const newReminders = [...reminders];
      newReminders[index] = { ...newReminders[index], [field]: value };
      setReminders(newReminders);
  };
  
  const removeReminder = (index: number) => {
      setReminders(reminders.filter((_, i) => i !== index));
  };

  const toggleTopic = (topic: string) => {
    if (focusTopics.includes(topic)) {
      setFocusTopics(focusTopics.filter(t => t !== topic));
    } else {
      if (focusTopics.length < 5) {
        setFocusTopics([...focusTopics, topic]);
      } else {
         setErrorMsg('يمكنك اختيار 5 مواضيع كحد أقصى');
         setTimeout(() => setErrorMsg(''), 3000);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        currentLevel,
        learningGoal,
        learningGoals: {
          dailyVocabTarget,
          focusTopics,
          reminders
        },
        updatedAt: serverTimestamp()
      });
      setSuccessMsg('تم حفظ الأهداف بنجاح!');
      setIsEditingTarget(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrorMsg('حدث خطأ أثناء حفظ الأهداف. يرجى المحاولة مرة أخرى.');
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setIsSaving(false);
    }
  };

  const BADGE_MAP: Record<string, { icon: string, color: string, desc: string }> = {
    'البداية الموفقة': { icon: '🌱', color: 'text-green-500', desc: 'أكملت أول درس لك بنجاح!' },
    'متعلم الأسبوع': { icon: '🔥', color: 'text-orange-500', desc: 'أكملت 5 دروس في أسبوع واحد.' },
    'جامع الكلمات': { icon: '📚', color: 'text-blue-500', desc: 'تعلمت أكثر من 20 مفردة جديدة.' },
    'خبير المستوى A1': { icon: '🥇', color: 'text-amber-500', desc: 'أتقنت جميع دروس المستوى المبتدئ A1.' },
    'خبير المستوى A2': { icon: '🥈', color: 'text-slate-400', desc: 'أتقنت جميع دروس المستوى المبتدئ A2.' },
    'خبير المستوى B1': { icon: '🥉', color: 'text-orange-300', desc: 'أتقنت جميع دروس المستوى المتوسط B1.' },
    'خبير المستوى B2': { icon: '💎', color: 'text-cyan-400', desc: 'أتقنت جميع دروس المستوى المتوسط B2.' },
    'خبير المستوى C1': { icon: '👑', color: 'text-purple-500', desc: 'أتقنت جميع دروس المستوى المتقدم C1.' },
    'خبير المستوى C2': { icon: '🎩', color: 'text-slate-100', desc: 'أتقنت جميع دروس المستوى المتقدم C2.' },
    'صديق الروبوت': { icon: '🤖', color: 'text-cyan-500', desc: 'بدأت أول محادثة لك مع المساعد الذكي Étoile.' },
    'مُتقن المستويات': { icon: '🎓', color: 'text-indigo-400', desc: 'أتممت عدداً كبيراً من الدروس في رحلتك الممتعة.' },
    'خبير الأفعال': { icon: '⚡', color: 'text-yellow-400', desc: 'أظهرت تفوقاً ملحوظاً في تصريف واستخدام الأفعال الفرنسية.' },
    'متحدث طليق': { icon: '🗣️', color: 'text-pink-400', desc: 'تفاعلت بشكل مكثف ومتقدم مع المساعد الذكي Étoile.' },
    'مواظب يومي': { icon: '📅', color: 'text-teal-400', desc: 'حققت هدفك اليومي للمفردات بانتظام.' },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto py-8 mt-2 md:mt-6"
    >
      <div className="bg-gradient-to-b from-[#0f0f11] to-[#0a0a0b] rounded-3xl p-6 md:p-10 border border-white/5">
        
        <div className="flex items-center gap-4 mb-8">
           <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/30">
             <Target className="w-8 h-8 text-amber-500" />
           </div>
           <div>
             <h2 className="text-2xl md:text-3xl font-serif text-white">أهدافي التعليمية</h2>
             <p className="text-slate-400 mt-1">ضبط وتخصيص أهدافك اليومية</p>
           </div>
        </div>

        {/* Gamification Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl mb-2">⭐</span>
            <span className="text-2xl font-mono font-bold text-amber-500">{userData?.points || 0}</span>
            <span className="text-sm text-slate-400">إجمالي النقاط</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl mb-2">🏆</span>
            <span className="text-2xl font-mono font-bold text-amber-500">{userData?.badges?.length || 0}</span>
            <span className="text-sm text-slate-400">الأوسمة المكتسبة</span>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* Level and Goal Selection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 relative overflow-hidden">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">تخصيص رحلة التعلم</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block pr-2">المستوى الحالي</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'Beginner', label: 'مبتدئ (A1/A2)' },
                      { id: 'Intermediate', label: 'متوسط (B1/B2)' },
                      { id: 'Advanced', label: 'متقدم (C1/C2)' }
                    ].map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setCurrentLevel(level.id)}
                        className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                          currentLevel === level.id ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-[#0a0a0b] border-white/10 text-slate-400 hover:border-white/30'
                        }`}
                      >
                        <span className="text-sm font-bold">{level.label}</span>
                        {currentLevel === level.id && <Check className="w-4 h-4 ml-2" />}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block pr-2">الهدف الرئيسي</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'Travel', label: 'السفر والسياحة' },
                      { id: 'Work', label: 'العمل والحياة المهنية' },
                      { id: 'Study', label: 'الدراسة والتحصيل الأكاديمي' }
                    ].map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => setLearningGoal(goal.id)}
                        className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                          learningGoal === goal.id ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-[#0a0a0b] border-white/10 text-slate-400 hover:border-white/30'
                        }`}
                      >
                        <span className="text-sm font-bold">{goal.label}</span>
                        {learningGoal === goal.id && <Check className="w-4 h-4 ml-2" />}
                      </button>
                    ))}
                  </div>
               </div>
             </div>
          </div>

          {/* Target Vocabulary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
             {isEditingTarget && (
               <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 animate-pulse" />
             )}
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <BookOpen className="w-5 h-5 text-amber-500" />
                   <h3 className="text-xl font-bold text-white">الهدف اليومي للمفردات</h3>
                </div>
                {!isEditingTarget ? (
                  <button 
                    onClick={() => setIsEditingTarget(true)}
                    className="flex items-center gap-2 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>تعديل</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 text-xs font-bold bg-amber-500 text-black px-3 py-1 rounded-lg hover:bg-amber-400 transition-colors"
                  >
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    <span>حفظ</span>
                  </button>
                )}
             </div>
             <p className="text-slate-400 mb-6 text-sm">كم كلمة جديدة ترغب في تعلمها يومياً؟</p>
             
             <div className={`flex items-center gap-4 transition-opacity ${!isEditingTarget ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'}`}>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  step="5"
                  value={dailyVocabTarget}
                  disabled={!isEditingTarget}
                  onChange={(e) => setDailyVocabTarget(parseInt(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="w-16 text-center text-2xl font-serif text-white drop-shadow-md">
                   {dailyVocabTarget}
                </span>
             </div>
          </div>

          {/* Focus Topics */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold text-white">مواضيع التركيز</h3>
             </div>
             <p className="text-slate-400 mb-6 text-sm">اختر المواضيع التي تريد التركيز عليها في المحادثات والدروس المستقبلية (حتى 5 مواضيع).</p>
             
             <div className="flex flex-wrap gap-3">
               {TOPIC_OPTIONS.map((topic, i) => {
                 const isSelected = focusTopics.includes(topic);
                 return (
                   <button
                     key={i}
                     onClick={() => toggleTopic(topic)}
                     className={`px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                       isSelected 
                         ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
                         : 'bg-[#0a0a0b] border-white/10 text-slate-300 hover:border-white/30'
                     }`}
                   >
                     {topic}
                   </button>
                 );
               })}
             </div>
          </div>

          {/* Daily Reminders */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⏰</span>
                <h3 className="text-xl font-bold text-white">تذكيرات الممارسة اليومية</h3>
             </div>
             <p className="text-slate-400 mb-6 text-sm">قم بضبط وقت ممارسة يومي لتصلك تذكيرات بالمتابعة.</p>
             
             <div className="space-y-4">
               {reminders.map((reminder, index) => (
                   <div key={index} className="flex items-center gap-4 bg-[#0a0a0b] p-4 rounded-xl border border-white/5">
                      <input 
                        type="time" 
                        value={reminder.time}
                        onChange={(e) => updateReminder(index, 'time', e.target.value)}
                        className="bg-transparent text-white font-mono p-2 rounded border border-white/10" 
                      />
                      <select 
                        value={reminder.activity}
                        onChange={(e) => updateReminder(index, 'activity', e.target.value)}
                        className="bg-transparent text-white p-2 rounded border border-white/10 flex-1"
                      >
                        <option value="vocabulary">مراجعة المفردات</option>
                        <option value="grammar">ممارسة القواعد</option>
                        <option value="speaking">تمارين التحدث</option>
                      </select>
                      <button onClick={() => removeReminder(index)} className="text-red-500 font-bold p-2 hover:bg-red-500/10 rounded-lg">حذف</button>
                   </div>
               ))}
               <button onClick={addReminder} className="w-full text-amber-500 font-bold p-3 hover:bg-amber-500/10 rounded-xl border border-dashed border-amber-500/30">+ إضافة تذكير جديد</button>
             </div>
          </div>

          {/* Badges & Achievements */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🏆</span>
                <h3 className="text-xl font-bold text-white">الأوسمة والإنجازات</h3>
             </div>
             
             {userData?.badges && userData.badges.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {userData.badges.map((badgeName: string, i: number) => {
                   const badge = BADGE_MAP[badgeName] || { icon: '🏅', color: 'text-amber-500', desc: 'إنجاز رائع في رحلتك!' };
                   return (
                     <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group">
                       <div className="text-3xl group-hover:scale-110 transition-transform">{badge.icon}</div>
                       <div>
                         <h4 className={`font-bold ${badge.color}`}>{badgeName}</h4>
                         <p className="text-xs text-slate-500 mt-1">{badge.desc}</p>
                       </div>
                     </div>
                   );
                 })}
               </div>
             ) : (
               <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
                 <p className="text-slate-500 italic">لم تكتسب أي أوسمة بعد. ابدأ بأول درس لك!</p>
               </div>
             )}
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
               {errorMsg}
            </div>
          )}
          
          {successMsg && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
               {successMsg}
            </div>
          )}

          {/* Save Button */}
          <button
             onClick={handleSave}
             disabled={isSaving}
             className="w-full bg-amber-600 hover:bg-amber-500 text-black py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2"
          >
             {isSaving ? (
               <>
                 <Loader2 className="w-5 h-5 animate-spin" />
                 <span>جاري الحفظ...</span>
               </>
             ) : (
               <>
                 <Save className="w-5 h-5" />
                 <span>حفظ الأهداف</span>
               </>
             )}
          </button>
        </div>

      </div>
    </motion.div>
  );
}
