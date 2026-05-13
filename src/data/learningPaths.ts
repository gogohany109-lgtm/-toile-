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
        lessonIds: ['l_alphabet', 'l_greetings']
      },
      {
        title: 'الأرقام والحياة اليومية',
        description: 'العد والتعامل مع المواقف اليومية.',
        lessonIds: ['l_numbers', 'l_common_phrases']
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
        title: 'العمل والاحترافية',
        description: 'المصطلحات المهنية والتواصل في بيئة العمل.',
        lessonIds: ['l_work_advanced', 'l_food_advanced']
      }
    ]
  },
  {
    id: 'study-advanced',
    title: 'التحضير الأكاديكي المتقدم',
    description: 'تطوير المهارات النقدية والتحليلية للدراسة في الجامعات الفرنسية.',
    level: 'Advanced',
    goal: 'Study',
    duration: '12 أسبوع',
    modules: [
      {
        title: 'الثقافة والتحليل',
        description: 'فهم النصوص والمعاني العميقة.',
        lessonIds: ['l_travel_advanced']
      }
    ]
  }
];
