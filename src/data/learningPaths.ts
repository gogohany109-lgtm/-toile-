export interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: 'Travel' | 'Work' | 'Study';
  duration: string;
  modules: {
    title: string;
    description: string;
    lessonIds: string[];
  }[];
}

export const learningPaths: LearningPath[] = [
  {
    id: 'travel-beginner',
    title: 'مسار السفر للمبتدئين',
    description: 'تعلم الأساسيات الضرورية لرحلتك القادمة إلى فرنسا، من المطار إلى الفندق.',
    level: 'Beginner',
    goal: 'Travel',
    duration: '4 أسابيع',
    modules: [
      {
        title: 'اللقاء والترحيب',
        description: 'كيف تبدأ محادثة بسيطة وتعرف بنفسك.',
        lessonIds: ['basics-1', 'greetings']
      },
      {
        title: 'في المطعم وفي الفندق',
        description: 'طلب الطعام وحجز الغرف.',
        lessonIds: ['restaurant', 'hotel']
      }
    ]
  },
  {
    id: 'work-intermediate',
    title: 'الفرنسية للأعمال والمكاتب',
    description: 'عزز مهاراتك اللغوية في بيئة العمل الاحترافية والمراسلات الرسمية.',
    level: 'Intermediate',
    goal: 'Work',
    duration: '8 أسابيع',
    modules: [
      {
        title: 'الاجتماعات والمراسلات',
        description: 'المشاركة في الاجتماعات وكتابة رسائل البريد الإلكتروني.',
        lessonIds: ['meetings', 'emails']
      }
    ]
  },
  {
    id: 'study-advanced',
    title: 'التحضير الأكاديمي والجامعي',
    description: 'تطوير المهارات النقدية والتحليلية للدراسة في الجامعات الفرنسية.',
    level: 'Advanced',
    goal: 'Study',
    duration: '12 أسبوع',
    modules: [
      {
        title: 'الكتابة الأكاديمية',
        description: 'كتابة المقالات والبحوث الجامعية.',
        lessonIds: ['academic-writing']
      }
    ]
  }
];
