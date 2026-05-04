import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Target, Save, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '../components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export function Profile() {
  const { user, userData } = useAuth();
  const [dailyVocabTarget, setDailyVocabTarget] = useState(10);
  const [focusTopics, setFocusTopics] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
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
    }
  }, [userData]);

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
        learningGoals: {
          dailyVocabTarget,
          focusTopics
        },
        updatedAt: serverTimestamp()
      });
      setSuccessMsg('تم حفظ الأهداف بنجاح!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrorMsg('حدث خطأ أثناء حفظ الأهداف. يرجى المحاولة مرة أخرى.');
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setIsSaving(false);
    }
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

        <div className="space-y-8">
          
          {/* Target Vocabulary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold text-white">الهدف اليومي للمفردات</h3>
             </div>
             <p className="text-slate-400 mb-6 text-sm">كم كلمة جديدة ترغب في تعلمها يومياً؟</p>
             
             <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  step="5"
                  value={dailyVocabTarget}
                  onChange={(e) => setDailyVocabTarget(parseInt(e.target.value))}
                  className="flex-1 accent-amber-500"
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
