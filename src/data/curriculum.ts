export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type Exercise = 
  | { type: 'multiple_choice'; question: string; options: string[]; answer: string }
  | { type: 'fill_blanks'; text: string; answer: string; hint?: string }
  | { type: 'matching'; pairs: { fr: string; ar: string }[] };

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
  {
    id: 'l1',
    title: 'التحيات والتعارف',
    description: 'تعلم كيف تلقي التحية وتقدم نفسك باللغة الفرنسية.',
    level: 'A1',
    content: 'في هذا الدرس سنتعلم أساسيات التحية في اللغة الفرنسية. من المهم التفريق بين التحية الرسمية وغير الرسمية.',
    vocabulary: [
      { fr: 'Bonjour', ar: 'صباح الخير / مرحباً' },
      { fr: 'Bonsoir', ar: 'مساء الخير' },
      { fr: 'Salut', ar: 'مرحباً (غير رسمية)' },
      { fr: 'Au revoir', ar: 'إلى اللقاء' },
      { fr: 'Merci', ar: 'شكراً' },
      { fr: "S'il vous plaît", ar: 'من فضلك' }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'كيف تقول "مرحباً" بشكل غير رسمي؟',
        options: ['Bonjour', 'Bonsoir', 'Salut', 'Merci'],
        answer: 'Salut'
      },
      {
        type: 'fill_blanks',
        text: "S'il _____ plaît.",
        answer: "vous",
        hint: 'من فضلك'
      },
      {
        type: 'matching',
        pairs: [
          { fr: 'Bonjour', ar: 'صباح الخير' },
          { fr: 'Merci', ar: 'شكراً' },
          { fr: 'Au revoir', ar: 'إلى اللقاء' }
        ]
      }
    ]
  },
  {
    id: 'l2',
    title: 'الأرقام والأيام',
    description: 'تعلم الأرقام من 1 إلى 20 وأيام الأسبوع.',
    level: 'A1',
    content: 'الأرقام وأيام الأسبوع أساسية في المحادثات اليومية لتحديد المواعيد.',
    vocabulary: [
      { fr: 'Un, Deux, Trois', ar: 'واحد، اثنان، ثلاثة' },
      { fr: 'Lundi', ar: 'الاثنين' },
      { fr: 'Mardi', ar: 'الثلاثاء' },
      { fr: "Aujourd'hui", ar: 'اليوم' }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'أي من التالي يعني "الاثنين"؟',
        options: ['Mardi', 'Lundi', 'Un', 'Trois'],
        answer: 'Lundi'
      }
    ]
  },
  {
    id: 'l3',
    title: 'في المطعم',
    description: 'كيفية طلب الطعام وفهم قائمة الطعام.',
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
      }
    ]
  },
  {
    id: 'l4',
    title: 'مناقشة الأخبار والآراء',
    description: 'التعبير عن رأيك في مواضيع مختلفة بحرية.',
    level: 'B1',
    content: 'في هذا المستوى، ستبدأ في التعبير عن الآراء المعقدة واستخدام روابط الجمل بشكل صحيح.',
    vocabulary: [
      { fr: 'À mon avis', ar: 'في رأيي' },
      { fr: 'Je pense que', ar: 'أعتقد أن' },
      { fr: 'Cependant', ar: 'على أية حال / مع ذلك' }
    ]
  }
];
