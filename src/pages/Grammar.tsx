import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle, Lightbulb, PlayCircle, Library, Volume2 } from 'lucide-react';
import { useAuth } from '../components/FirebaseProvider';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

interface Exercise {
  id: number;
  type: 'mcq' | 'fill' | 'match' | 'listening';
  question: string;
  options?: string[];
  answer: string | string[];
  pairs?: { left: string; right: string }[];
  audioText?: string;
}

interface GrammarTopic {
  id: string;
  title: string;
  description: string;
  content: string;
  smartTip: string;
  exercises: Exercise[];
}

const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: 'articles',
    title: 'أدوات المعرفة والنكرة (Les Articles)',
    description: 'تعرف على كيفية استخدام أدوات التعريف (ال، -) مع الأسماء.',
    content: `في اللغة الفرنسية، الأسماء دائماً ما تسبقها أداة تحدد جنسها (مذكر/مؤنث) وعددها (مفرد/جمع).

**أدوات المعرفة (L'article défini):** تدل على شيء محدد (مثل "ال" في العربية).
- **Le**: للمفرد المذكر. مثال: **Le** garçon (الولد)
- **La**: للمفرد المؤنث. مثال: **La** fille (البنت)
- **L'**: للمفرد بنوعيه إذا بدأ بحرف علة (a, e, i, o, u, y أو h صامتة). مثال: **L'**école (المدرسة)
- **Les**: للجمع بنوعيه. مثال: **Les** livres (الكتب)

**أدوات النكرة (L'article indéfini):** تدل على شيء غير محدد.
- **Un**: للمفرد المذكر. مثال: **Un** chat (قط)
- **Une**: للمفرد المؤنث. مثال: **Une** voiture (سيارة)
- **Des**: للجمع بنوعيه. مثال: **Des** pommes (تفاح)`,
    smartTip: 'تذكر دائماً أن الأداة تتبع الاسم في الجنس والعدد، وليس العربِيَّة! فكلمة "شمس" مؤنثة في العربية لكنها مذكر في الفرنسية (le soleil).',
    exercises: [
      { id: 1, type: 'mcq', question: 'ما هي الأداة الصحيحة لكلمة "école" (مدرسة)؟', options: ['Le', 'La', 'L\''], answer: 'L\'' },
      { id: 2, type: 'fill', question: 'أكمل: _____ chat.', answer: 'Un' },
      { id: 6, type: 'listening', question: 'استمع للأداة واختر الصحيح:', audioText: 'Le', options: ['Le', 'La'], answer: 'Le' }
    ]
  },
  {
    id: 'gender',
    title: 'المذكر والمؤنث (Le Genre)',
    description: 'القواعد الأساسية لمعرفة وتحويل جنس الأسماء والصفات.',
    content: `الأسماء في اللغة الفرنسية إما مذكر (Masculin) أو مؤنث (Féminin)، ولا يوجد محايد.

غالباً، يتم تحويل الكلمة من المذكر إلى المؤنث بإضافة حرف **e** في النهاية، رغم وجود استثناءات عديدة.

**أمثلة:**
- un petit garçon (ولد صغير) -> une petit**e** fille (بنت صغيرة)
- un ami (صديق) -> une ami**e** (صديقة)
- intelligent (ذكي) -> intelligent**e** (ذكية)

**نهايات شائعة للأسماء المؤنثة:**
- (-tion): La nation (الأمة)
- (-ité): La vérité (الحقيقة)
- (-esse): La vitesse (السرعة)

**نهايات شائعة للأسماء المذكرة:**
- (-ment): Le gouvernement (الحكومة)
- (-age): Le courage (الشجاعة)`,
    smartTip: 'العديد من الكلمات تنتهي بـ "e" في المذكر، لذا لا تفترض أنها مؤنثة دائماً! اعتمد على الأداة (le/la) لحفظ جنس الاسم.',
    exercises: [
      { id: 3, type: 'match', question: 'طابق المذكر بالمؤنث', answer: '', pairs: [{left: 'garçon', right: 'fille'}, {left: 'ami', right: 'amie'}] }
    ]
  },
  {
    id: 'plural',
    title: 'صيغة الجمع (Le Pluriel)',
    description: 'كيفية تحويل الكلمات من المفرد إلى الجمع.',
    content: `القاعدة العامة في اللغة الفرنسية لتحويل الكلمة إلى جمع هي إضافة حرف **s** في النهاية. حرف الـ **s** لا يُنطق عادةً.

**أمثلة:**
- un livre (كتاب) -> des livre**s** (كتب)
- la maison (المنزل) -> les maison**s** (المنازل)

**استثناءات هامة:**
1. الكلمات المنتهية بـ **-s, -x, -z** لا تتغير في الجمع:
   - un pays (بلد) -> des pays (بلدان)
   - un choix (خيار) -> des choix (خيارات)
2. الكلمات المنتهية بـ **-al** تُجمع بـ **-aux**:
   - un cheval (حصان) -> des chev**aux** (أحصنة)
3. الكلمات المنتهية بـ **-eau, -au, -eu** تُجمع بإضافة **x**:
   - un bateau (قارب) -> des bateau**x** (قوارب)
   - un feu (نار) -> des feu**x** (نيران)`,
    smartTip: 'دائماً انظر لنهاية الكلمة المفرد. إذا انتهت بـ "eau" فاعلم أن الجمع سيحتاج "x"، وليس مجرد "s"!',
    exercises: [
      { id: 4, type: 'mcq', question: 'ما هو جمع كلمة "cheval"؟', options: ['chevals', 'chevaux', 'chevalx'], answer: 'chevaux' }
    ]
  },
  {
    id: 'sentence',
    title: 'بناء الجملة (La Phrase)',
    description: 'ترتيب الكلمات الأساسي في الجملة الفرنسية.',
    content: `تتبع الجملة الفرنسية البسيطة نفس الترتيب الأساسي للغة الإنجليزية: **فاعل + فعل + مفعول به (SVO)**.

**Sujet (فاعل) + Verbe (فعل) + Objet (مفعول به)**

**مثال:**
- **Je** (فاعل - أنا) + **mange** (فعل - آكل) + **une pomme** (مفعول به - تفاحة).

**الجملة المنفية (La Négation):**
لنفي الجملة، نضع الفعل بين كلمتي **ne** و **pas**.
- Je **ne** mange **pas** une pomme. (أنا لا آكل تفاحة).
- Il **n'**est **pas** français. (هو ليس فرنسياً - تم اختصار ne إلى n' بسبب حرف العلة).

**الصفات (Les Adjectifs):**
في الفرنسية، تأتي معظم الصفات **بعد** الاسم (عكس الإنجليزية، ومشابهة للعربية). وتتبع الصفة الاسم في التذكير والتأنيث والجمع.
- Un livre **intéressant** (كتاب مثير للاهتمام).
- Une voiture **rouge** (سيارة حمراء).`,
    smartTip: 'لنفي الجملة، نضع الفعل بين "ne" و "pas". أما بخصوص الصفات: تذكر أن معظمها يأتي بعد الاسم (عكس الإنجليزية)، ويجب أن تطابق الاسم في النوع والعدد (مثل: un livre intéressant / une voiture rouge). خطأ شائع هو نسيان مطابقة الصفة إذا كان الاسم مؤنثاً أو جمعاً!',
    exercises: [
        { id: 5, type: 'fill', question: 'انف الجملة: Je mange une pomme. -> Je _____ mange _____ une pomme.', answer: ['ne', 'pas'] }
    ]
  },
  {
    id: 'passe-compose',
    title: 'الزمن الماضي المركب (Le Passé Composé)',
    description: 'تعلم كيفية التحدث عن الأحداث التي وقعت وانتهت في الماضي.',
    content: `الزمن الماضي المركب يستخدم للتعبير عن حدث وقع وانتهى في الماضي.
    
    **يتكون Passé Composé من:**
    **فعل مساعد (أو avoir أو être) + اسم المفعول (Participe Passé)**
    
    **1. مع avoir (معظم الأفعال):**
    - J'**ai mangé** (أكلتُ)
    - Tu **as fini** (أنهيتَ)
    
    **2. مع être (أفعال الحركة والتحول):**
    - Je **suis allé** (ذهبتُ - مذكر)
    - Elle **est allée** (ذهبتْ - مؤنث)
    
    **القاعدة الأساسية لاسم المفعول:**
    - أفعال المجموعة الأولى (-er) -> (-é): manger -> mangé
    - أفعال المجموعة الثانية (-ir) -> (-i): finir -> fini
    - أفعال المجموعة الثالثة (-re) -> (-u): vendre -> vendu`,
    smartTip: 'عند استخدام "être" كفعل مساعد، يجب أن يطابق اسم المفعول الفاعل في النوع (إضافة "e" للمؤنث) والعدد (إضافة "s" للجمع). أما الأفعال الشائعة مع "avoir" مثل "faire" أو "prendre"، فاسم المفعول منها غالباً غير منتظم (fait, pris).',
    exercises: [
        { id: 7, type: 'mcq', question: 'كيف يُصرف فعل "manger" في Passé Composé مع "Je"؟', options: ['Je ai mangée', 'J\'ai mangé', 'Je suis mangé'], answer: 'J\'ai mangé' }
    ]
  }
];

const MatchingExercise = ({ pairs }: { pairs: { left: string; right: string }[] }) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<string[]>([]); // stores right side matched keys

  const handleLeftClick = (left: string) => setSelectedLeft(left);
  const handleRightClick = (right: string) => {
    if (!selectedLeft) return;
    const isMatch = pairs.find(p => p.left === selectedLeft && p.right === right);
    if (isMatch) {
      setMatches([...matches, right]);                
      setSelectedLeft(null);
    } else {
      alert('خطأ، حاول مرة أخرى');
      setSelectedLeft(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        {pairs.map(p => (
          <button key={p.left} onClick={() => handleLeftClick(p.left)} className={`w-full p-3 rounded-lg ${selectedLeft === p.left ? 'bg-blue-500' : 'bg-white/10'}`}>
            {p.left}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {pairs.map(p => (
           <button key={p.right} onClick={() => handleRightClick(p.right)} className={`w-full p-3 rounded-lg ${matches.includes(p.right) ? 'bg-green-600' : 'bg-white/10'}`} disabled={matches.includes(p.right)}>
            {p.right}
          </button>
        ))}
      </div>
    </div>
  );
};

export function Grammar() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { user } = useAuth();

  const speak = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'fr-FR';
    window.speechSynthesis.speak(speech);
  };

  const handleTopicCompletion = async (topicId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ['grammarProgress.' + topicId]: { completed: true, lastAttempted: new Date().toISOString() }
      });
      alert('تم حفظ تقدمك!');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء حفظ التقدم');
    }
  };

  const activeTopic = GRAMMAR_TOPICS.find(t => t.id === selectedTopic);

  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Bold text handling
      const formattedText = paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <span key={i} className="font-bold text-amber-500">{part.slice(2, -2)}</span>;
        }
        return part;
      });

      return (
        <p key={index} className="text-slate-300 text-lg leading-relaxed mb-4 whitespace-pre-wrap">
          {formattedText}
        </p>
      );
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20">
          <Library className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-white tracking-tight">قواعد اللغة (La Grammaire)</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">تعلم القواعد الأساسية للغة الفرنسية لبناء جمل صحيحة والتحدث بثقة.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-3 md:col-span-1">
          {GRAMMAR_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`w-full text-right p-4 rounded-2xl border transition-all ${
                selectedTopic === topic.id 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-[#0f0f11] border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              <span className="font-bold block mb-1">{topic.title}</span>
              {selectedTopic !== topic.id && (
                <span className="text-xs opacity-70 line-clamp-1">{topic.description}</span>
              )}
            </button>
          ))}
          {!selectedTopic && (
             <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 mt-4 text-center">
                <Lightbulb className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-blue-200 text-sm">اختر درساً من القائمة للبدء بالتعلم.</p>
             </div>
          )}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            {activeTopic ? (
              <motion.div
                key={activeTopic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-[#0f0f11] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-50"></div>
                
                <h2 className="text-2xl md:text-3xl font-serif text-white mb-2">{activeTopic.title}</h2>
                <p className="text-blue-400 mb-8 pb-6 border-b border-white/10">{activeTopic.description}</p>
                
                <button 
                  onClick={() => handleTopicCompletion(activeTopic.id)}
                  className="mb-8 flex items-center gap-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-xl border border-green-600/30 hover:bg-green-600/30 transition-all font-bold"
                >
                  <CheckCircle className="w-5 h-5" />
                  تم إتمام الدرس
                </button>
                
                <div className="prose prose-invert prose-blue max-w-none mb-8">
                  {formatContent(activeTopic.content)}
                </div>

                {/* Smart Tip */}
                <details className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8">
                  <summary className="font-bold text-amber-500 cursor-pointer flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    نصيحة ذكية من المساعد
                  </summary>
                  <div className="text-amber-200 mt-4 leading-relaxed bg-black/20 p-4 rounded-xl">
                    {activeTopic.smartTip}
                  </div>
                </details>

                {/* Exercises */}
                <div className="space-y-6 mt-12 bg-white/5 p-8 rounded-3xl">
                    <h3 className="text-2xl font-bold text-white mb-6">تمارين تفاعلية</h3>
                    {activeTopic.exercises.map(ex => (
                        <div key={ex.id} className="bg-[#1a1a20] p-6 rounded-2xl border border-white/5">
                            <p className="text-white font-bold mb-4">{ex.question}</p>
                            {ex.type === 'mcq' && (
                                <div className="grid grid-cols-2 gap-3">
                                    {ex.options?.map(opt => (
                                        <button 
                                          key={opt}
                                          className="p-3 bg-white/5 hover:bg-blue-600 rounded-xl text-white transition-colors"
                                          onClick={() => alert(opt === ex.answer ? 'صحيح! 🎉' : 'خطأ، حاول مجدداً.')}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {ex.type === 'fill' && (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">الإجابة:</span>                
                                <input className="bg-white/5 border border-white/10 rounded-lg p-2 text-white flex-1" 
                                       onBlur={(e) => {
                                          const ans = Array.isArray(ex.answer) ? ex.answer.join(' ') : ex.answer;
                                          alert(e.target.value === ans ? 'صحيح!' : 'خطأ.');
                                       }}/>
                              </div>
                            )}
                            {ex.type === 'match' && ex.pairs && <MatchingExercise pairs={ex.pairs} />}
                        </div>
                    ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-white/5"
              >
                <BookOpen className="w-16 h-16 text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">مكتبة القواعد</h3>
                <p className="text-slate-500 max-w-md">القواعد هي الأساس الذي تُبنى عليه اللغة. استكشف الدروس المتوفرة لتكوين فهم أعمق للغة الفرنسية.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
