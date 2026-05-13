export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type Exercise = 
  | { type: 'multiple_choice'; question: string; options: string[]; answer: string }
  | { type: 'image_match'; question: string; options: { id: string; text: string; image: string }[]; answer: string }
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
  vocabulary: { 
    fr: string; 
    ar: string;
    example?: { fr: string; ar: string };
  }[];
  exercises?: Exercise[];
}

export const curriculum: Lesson[] = [
  // ---------------- BEGINNER (A1/A2) ----------------
  {
    id: 'l_alphabet',
    title: 'الأبجدية والنطق الأساسي',
    description: 'الألف باء الفرنسية والقواعد الأساسية للنطق الصحيح مع تمارين تفاعلية.',
    level: 'A1',
    content: 'في هذا الدرس سنتعلم نطق الحروف الأبجدية الفرنسية وعددها 26 حرفاً. التفريق بين الحروف الصوتية (Voyelles) والحروف الساكنة (Consonnes) هو الخطوة الأولى لإتقان النطق.',
    vocabulary: [
      { fr: 'L\'alphabet', ar: 'الأبجدية' },
      { fr: 'Voyelle', ar: 'حرف صوتي' },
      { fr: 'Consonne', ar: 'حرف ساكن' },
      { fr: 'Épeler', ar: 'يتهجى' }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'كم عدد الحروف الصوتية في اللغة الفرنسية؟',
        options: ['5', '6', '7', '8'],
        answer: '6'
      },
      {
        type: 'listening',
        audioText: 'A B C D',
        question: 'ما هي الحروف التي سمعتها؟',
        options: ['A B C D', 'E F G H', 'I J K L'],
        answer: 'A B C D'
      }
    ]
  },
  {
    id: 'l_greetings',
    title: 'التحيات والتعارف',
    description: 'تعلم كيف تلقي التحية وتقدم نفسك للآخرين بعبارات بسيطة.',
    level: 'A1',
    content: 'الفرنسيون يقدّرون كثيراً استخدام التحيات المناسبة. "Bonjour" هي التحية الأكثر شيوعاً وتستخدم طوال اليوم حتى المساء.',
    vocabulary: [
      { fr: 'Bonjour', ar: 'صباح الخير / مرحباً' },
      { fr: 'Bonsoir', ar: 'مساء الخير' },
      { fr: 'Comment ça va ?', ar: 'كيف حالك؟' },
      { fr: 'Je m\'appelle...', ar: 'اسمي هو...' },
      { fr: 'Enchanté(e)', ar: 'تشرفنا' }
    ],
    exercises: [
      {
        type: 'matching',
        pairs: [
          { fr: 'Bonjour', ar: 'صباح الخير' },
          { fr: 'Comment ça va ?', ar: 'كيف حالك؟' },
          { fr: 'Merci', ar: 'شكراً' }
        ]
      },
      {
        type: 'image_match',
        question: 'اختر الصورة المناسبة للتحية "Bonjour" (الصباح):',
        options: [
          { id: '1', text: 'صباح', image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=200&h=200&fit=crop' },
          { id: '2', text: 'ليل', image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=200&h=200&fit=crop' },
          { id: '3', text: 'طعام', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop' }
        ],
        answer: '1'
      },
      {
        type: 'fill_blanks',
        text: 'Je _____ Ahmed.',
        answer: 'm\'appelle',
        hint: 'اسمي هو'
      }
    ]
  },
  {
    id: 'l_numbers',
    title: 'الأرقام من 0 إلى 20',
    description: 'العد الأساسي في اللغة الفرنسية وحفظ الأرقام الأولى.',
    level: 'A1',
    content: 'الأرقام أساسية في كل لغة. في هذا الدرس سنركز على أول عشرين رقماً، وهي اللبنة الأساسية للعد الأكبر.',
    vocabulary: [
      { fr: 'Un', ar: 'واحد' },
      { fr: 'Deux', ar: 'اثنان' },
      { fr: 'Trois', ar: 'ثلاثة' },
      { fr: 'Dix', ar: 'عشرة' },
      { fr: 'Vingt', ar: 'عشرون' }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'ما هو الرقم 5 بالفرنسية؟',
        options: ['Quatre', 'Cinq', 'Six', 'Sept'],
        answer: 'Cinq'
      },
      {
        type: 'sentence_ordering',
        words: ['un', 'deux', 'trois', 'quatre'],
        answer: ['un', 'deux', 'trois', 'quatre']
      }
    ]
  },
  {
    id: 'l_common_phrases',
    title: 'عبارات شائعة للحياة اليومية',
    description: 'أهم الجمل التي ستحتاجها في مواقف يومية بسيطة.',
    level: 'A1',
    content: 'هناك عبارات قصيرة تجعل تواصلك أيسر، مثل طلب الإذن أو السؤال عن المكان.',
    vocabulary: [
      { fr: 'S\'il vous plaît', ar: 'من فضلك (رسمي)' },
      { fr: 'Où est... ?', ar: 'أين هو... ؟' },
      { fr: 'Pardon', ar: 'عذراً' },
      { fr: 'Je ne comprends pas', ar: 'أنا لا أفهم' }
    ],
    exercises: [
      {
        type: 'fill_blanks',
        text: '_____ est la gare ?',
        answer: 'Où',
        hint: 'أين'
      }
    ]
  },
  {
    id: 'l_food_advanced',
    title: 'عالم الطعام والمائدة والمطاعم',
    description: 'مفردات متقدمة عن الطعام، التذوق، وتجربة المطاعم الراقية.',
    level: 'B2',
    content: 'المطبخ الفرنسي هو جزء لا يتجزأ من الثقافة. تعلم كيفية وصف النكهات وتقنيات الطهي المختلفة.',
    vocabulary: [
      { 
        fr: 'Gastronomie', 
        ar: 'فن الطهي / الغستروونوميا',
        example: { fr: 'La gastronomie française est inscrite au patrimoine de l\'UNESCO.', ar: 'تم إدراج فن الطهي الفرنسي ضمن تراث اليونسكو.' }
      },
      { 
        fr: 'Assaisonnement', 
        ar: 'تتبيل',
        example: { fr: 'L\'assaisonnement de cette salade est parfait.', ar: 'تتبيل هذه السلطة مثالي.' }
      },
      { 
        fr: 'Croustillant', 
        ar: 'مقرمش',
        example: { fr: 'J\'adore le pain bien croustillant.', ar: 'أنا أعشق الخبز المقرمش جيداً.' }
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'ما معنى كلمة "Croustillant"؟',
        options: ['حامض', 'مقرمش', 'حار', 'مالح'],
        answer: 'مقرمش'
      }
    ]
  },
  {
    id: 'l_travel_advanced',
    title: 'السفر والاستكشاف العالمي',
    description: 'خطط لرحلاتك، استكشف الثقافات، وتحدث عن تجارب السفر المتقدمة.',
    level: 'B2',
    content: 'السفر يتطلب مفردات تتعلق بالحجوزات، التأمين، ووصف المعالم السياحية بدقة.',
    vocabulary: [
      { 
        fr: 'Itinéraire', 
        ar: 'مسار الرحلة',
        example: { fr: 'Nous avons préparé un itinéraire pour visiter Paris.', ar: 'لقد أعددنا مسار رحلة لزيارة باريس.' }
      },
      { 
        fr: 'Dépaysement', 
        ar: 'تغيير الجو / الشعور بالغربة الممتعة',
        example: { fr: 'Ce voyage en Asie m\'a offert un vrai dépaysement.', ar: 'هذه الرحلة إلى آسيا قدمت لي تغييراً حقيقياً في الجو.' }
      }
    ],
    exercises: [
      {
        type: 'sentence_ordering',
        words: ['mon', 'Voilà', 'itinéraire', 'de', 'voyage.'],
        answer: ['Voilà', 'mon', 'itinéraire', 'de', 'voyage.']
      }
    ]
  },
  {
    id: 'l_common_mistakes',
    title: 'أخطاء شائعة في الفرنسية',
    description: 'تعرف على الأخطاء الأكثر تكراراً لدى المتعلمين وكيفية تجنبها.',
    level: 'A2',
    content: 'كثير من المتعلمين يقعون في فخ "الترجمة الحرفية" أو خلط القواعد. هذا الدرس يجمع أهم الأخطاء التي يجب عليك تجنبها لتبدو أكثر احترافية.',
    vocabulary: [
      { 
        fr: 'Faux ami', 
        ar: 'صديق كاذب (كلمة متشابهة في النطق ومختلفة في المعنى)',
        example: { fr: 'Attention aux faux amis entre le français et l\'anglais.', ar: 'احذر من الأصدقاء الكاذبين بين الفرنسية والإنجليزية.' }
      },
      { 
        fr: 'Contresens', 
        ar: 'سوء فهم / عكس المعنى المقصود',
        example: { fr: 'Une mauvaise traduction peut causer un contresens.', ar: 'ترجمة سيئة قد تتسبب في سوء فهم.' }
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'ما هو "Faux ami"؟',
        options: ['صديق حقيقي', 'كلمة بنفس النطق ومعنى مختلف', 'خطأ نحوي', 'فعل غير منتظم'],
        answer: 'كلمة بنفس النطق ومعنى مختلف'
      }
    ]
  },
  {
    id: 'l_work_advanced',
    title: 'العمل والحياة المهنية',
    description: 'المصطلحات المهنية، كتابة السيرة الذاتية، وإدارة الاجتماعات بالفرنسية.',
    level: 'C1',
    content: 'في البيئة الاحترافية، الدقة في استخدام الكلمات تعكس احترافيتك. تعلم مصطلحات الشركات والتفاوض.',
    vocabulary: [
      { 
        fr: 'Ressources humaines', 
        ar: 'الموارد البشرية',
        example: { fr: 'Il travaille au département des ressources humaines.', ar: 'هو يعمل في قسم الموارد البشرية.' }
      },
      { 
        fr: 'Compétences', 
        ar: 'مهارات / كفاءات',
        example: { fr: 'Quelles sont vos compétences principales ?', ar: 'ما هي مهاراتك الأساسية؟' }
      },
      { 
        fr: 'Télétravail', 
        ar: 'العمل عن بعد',
        example: { fr: 'Le télétravail est devenu très courant.', ar: 'أصبح العمل عن بعد شائعاً جداً.' }
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'ما هو المصطلح المقابل لـ "العمل عن بعد"؟',
        options: ['Travail d\'équipe', 'Télétravail', 'Bénévolat', 'Stage'],
        answer: 'Télétravail'
      }
    ]
  }
];
