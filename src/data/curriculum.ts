export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type Exercise = 
  | { type: 'multiple_choice'; question: string; options: string[]; answer: string }
  | { type: 'fill_blanks'; text: string; answer: string; hint?: string }
  | { type: 'matching'; pairs: { fr: string; ar: string }[] }
  | { type: 'sentence_ordering'; words: string[]; answer: string[] }
  | { type: 'listening'; audioText: string; question: string; options: string[]; answer: string };

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: Level;
  content: string;
  vocabulary: { fr: string; ar: string }[];
  exercises?: Exercise[];
}

export const curriculum: Lesson[] = [
  // ---------------- BEGINNER (A1/A2) ----------------
  {
    id: 'l1',
    title: 'الأبجدية والنطق الأساسي',
    description: 'الألف باء الفرنسية والقواعد الأساسية للنطق الصحيح.',
    level: 'A1',
    content: 'في هذا الدرس سنتعلم نطق الحروف الأبجدية الفرنسية والتفريق بين الحروف الصوتية والحروف الساكنة. من الضروري معرفة نطق كل حرف لتسهيل قراءة الكلمات.',
    vocabulary: [
      { fr: 'Alphabet', ar: 'الأبجدية' },
      { fr: 'Voyelle', ar: 'حرف صوتي' },
      { fr: 'Consonne', ar: 'حرف ساكن' }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'كم عدد الحروف الصوتية المعتادة في اللغة الفرنسية (باستثناء y و h)؟',
        options: ['5', '6', '7', '8'],
        answer: '6'
      },
      {
        type: 'listening',
        audioText: 'Alphabet',
        question: 'ما هي الكلمة التي سمعتها؟',
        options: ['Alphabet', 'Consonne', 'Voyelle'],
        answer: 'Alphabet'
      }
    ]
  },
  {
    id: 'l2',
    title: 'التحيات وقواعد أساسية',
    description: 'تعريف عن النفس، التحيات، والجمل الأولى ومفردات شائعة.',
    level: 'A1',
    content: 'ستتعلم كيف تلقي التحية وتقدم نفسك باللغة الفرنسية. من المهم التفريق بين التحية الرسمية وغير الرسمية وكيفية استخدام الضمائر الأساسية.',
    vocabulary: [
      { fr: 'Bonjour', ar: 'صباح الخير / مرحباً' },
      { fr: 'Bonsoir', ar: 'مساء الخير' },
      { fr: 'Salut', ar: 'مرحباً (غير رسمية)' },
      { fr: 'Je suis', ar: 'أنا أكون' },
      { fr: 'Merci', ar: 'شكراً' }
    ],
    exercises: [
      {
        type: 'matching',
        pairs: [
          { fr: 'Bonjour', ar: 'صباح الخير' },
          { fr: 'Je suis', ar: 'أنا' },
          { fr: 'Salut', ar: 'مرحباً (غير رسمية)' }
        ]
      },
      {
        type: 'sentence_ordering',
        words: ['suis', 'Je', 'étudiant.'],
        answer: ['Je', 'suis', 'étudiant.']
      }
    ]
  },
  {
    id: 'l3',
    title: 'في المطعم ومفردات الطعام',
    description: 'كيفية طلب الطعام وفهم قائمة الطعام ومفردات التذوق.',
    level: 'A2',
    content: 'عند الذهاب إلى مطعم في فرنسا، هناك عبارات معتادة تستخدم للطلب والتحدث مع النادل.',
    vocabulary: [
      { fr: 'La carte', ar: 'قائمة الطعام' },
      { fr: "L'addition", ar: 'الفاتورة' },
      { fr: 'Je voudrais...', ar: 'أود / أريد...' },
      { fr: 'Une table pour deux', ar: 'طاولة لشخصين' }
    ],
    exercises: [
      {
        type: 'fill_blanks',
        text: 'Je _____ une table pour deux.',
        answer: 'voudrais',
        hint: 'أريد / أود'
      },
      {
        type: 'listening',
        audioText: 'Je voudrais une table pour deux.',
        question: 'اختر الترجمة الصحيحة لما سمعته:',
        options: ['أريد طاولة لشخص واحد', 'أريد طاولة لشخصين', 'أين الحساب من فضلك؟'],
        answer: 'أريد طاولة لشخصين'
      }
    ]
  },

  // ---------------- INTERMEDIATE (B1/B2) ----------------
  {
    id: 'l4',
    title: 'تعبيرات أكثر تعقيداً والأزمنة',
    description: 'فهم أعمق للقواعد: الماضي المركب والمستقبل البسيط.',
    level: 'B1',
    content: 'المستوى المتوسط يركز على الانتقال من الجمل البسيطة إلى الجمل المركبة واستخدام الأزمنة بدقة.',
    vocabulary: [
      { fr: 'Hier', ar: 'أمس' },
      { fr: "J'ai mangé", ar: 'لقد أكلت' },
      { fr: 'Demain', ar: 'غداً' }
    ],
    exercises: [
      {
        type: 'sentence_ordering',
        words: ['mangé', "J'ai", 'une pomme', 'hier.'],
        answer: ["J'ai", 'mangé', 'une pomme', 'hier.']
      },
      {
        type: 'multiple_choice',
        question: 'ما هو الزمن المستخدم في جملة "J\'ai mangé"؟',
        options: ['Le futur simple', 'Le présent', 'Le passé composé', 'L\'imparfait'],
        answer: 'Le passé composé'
      }
    ]
  },
  {
    id: 'l5',
    title: 'توسيع المفردات والمواقف الاجتماعية',
    description: 'النقاش عن البيئة والتكنولوجيا والسفر والتعبير عن الرأي.',
    level: 'B2',
    content: 'يهدف هذا الدرس إلى زيادة حصيلتك اللغوية في مواضيع متنوعة كالبيئة والمجتمع وكيفية إبداء الأسباب والحجج.',
    vocabulary: [
      { fr: 'L\'environnement', ar: 'البيئة' },
      { fr: 'À mon avis', ar: 'في رأيي' },
      { fr: 'Cependant', ar: 'على أية حال / مع ذلك' }
    ],
    exercises: [
      {
        type: 'fill_blanks',
        text: '_____ , il faut agir vite.',
        answer: 'Cependant',
        hint: 'ومع ذلك'
      }
    ]
  },

  // ---------------- ADVANCED (C1/C2) ----------------
  {
    id: 'l6',
    title: 'فهم نصوص معقدة وتعابير اصطلاحية',
    description: 'قراءة الصحف والأدب واللغة المجازية.',
    level: 'C1',
    content: 'في هذا المستوى ستبدأ بتذوق اللغة الفرنسية والتعرف على التعابير الاصطلاحية وفهم المعاني الضمنية.',
    vocabulary: [
      { fr: 'Avoir le cafard', ar: 'الشعور بالاكتئاب (تعبير مجازي)' },
      { fr: 'Coup de foudre', ar: 'الحب من أول نظرة (تعبير مجازي)' },
      { fr: 'Faire la grasse matinée', ar: 'النوم لوقت متأخر' }
    ],
    exercises: [
      {
        type: 'matching',
        pairs: [
          { fr: 'Avoir le cafard', ar: 'الشعور بالحزن' },
          { fr: 'Coup de foudre', ar: 'الحب من أول نظرة' },
          { fr: 'Faire la grasse matinée', ar: 'النوم طويلاً' }
        ]
      }
    ]
  },
  {
    id: 'l7',
    title: 'طلاقة في المحادثة والنقاش الفلسفي',
    description: 'مهارات التفاوض، دحض الحجج، والتعبير عن أفكار تجريدية.',
    level: 'C2',
    content: 'المستوى النهائي للطلاقة. التعامل مع اللغة كمتحدث أصلي وإجادة الصياغة الأسلوبية المعقدة.',
    vocabulary: [
      { fr: 'Indéniablement', ar: 'بشكل لا ينكر' },
      { fr: 'Nonobstant', ar: 'بالرغم من ذلك' },
      { fr: 'Élucider', ar: 'توضيح / إلقاء الضوء على' }
    ],
    exercises: [
      {
        type: 'sentence_ordering',
        words: ['sujet', 'Il', 'faut', 'élucider', 'ce'],
        answer: ['Il', 'faut', 'élucider', 'ce', 'sujet']
      }
    ]
  }
];
