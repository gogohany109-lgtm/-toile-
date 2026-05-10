export interface CultureArticle {
  id: string;
  title: string;
  category: 'Customs' | 'History' | 'Art' | 'Literature' | 'Music';
  description: string;
  content: string;
  image?: string;
  videoUrl?: string;
  externalLink?: string;
  keyVocabulary?: { fr: string; ar: string }[];
}

export const cultureArticles: CultureArticle[] = [
  {
    id: 'history-paris',
    title: 'تاريخ باريس: من مخيم لوتيتيا إلى مدينة الأنوار',
    category: 'History',
    description: 'رحلة عبر الزمن في تاريخ العاصمة الفرنسية العريق.',
    content: 'باريس ليست مجرد مدينة، بل هي كتاب تاريخ مفتوح. بدأت كقرية صغيرة تسكنها قبائل لوتيتيا على ضفاف نهر السين، لتتحول عبر العصور إلى إمبراطورية ثم إلى عاصمة الثقافة والفن. يروي كل شارع ومبنى في باريس قصة من العصور الوسطى، مرورا بالثورة الفرنسية، وحتى العصر الحديث.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000',
    keyVocabulary: [
      { fr: 'La capitale', ar: 'العاصمة' },
      { fr: 'L\'histoire', ar: 'التاريخ' },
      { fr: 'Le fleuve', ar: 'النهر' },
      { fr: 'Le siècle', ar: 'القرن' }
    ]
  },
  {
    id: 'art-louvre',
    title: 'متحف اللوفر: كنوز الفن العالمي',
    category: 'Art',
    description: 'استكشف أهم القطع الفنية في أكبر متحف فنون في العالم.',
    content: 'يعد اللوفر أيقونة فنية ومعمارية، يضم آلاف القطع من حضارات مختلفة، وأشهرها الموناليزا. كان هذا المبنى المهيب قصراً للملوك قبل أن يُحول إلى متحف وطني خلال الثورة الفرنسية. يتميز بهرمه الزجاجي الذي يشكل مدخلاً للمتحف ويعكس تزاوجاً فريداً بين العراقة والحداثة.',
    image: 'https://images.unsplash.com/photo-1544413647-ad540939226e?auto=format&fit=crop&q=80&w=1000',
    keyVocabulary: [
      { fr: 'Le musée', ar: 'المتحف' },
      { fr: 'L\'art', ar: 'الفن' },
      { fr: 'Une œuvre', ar: 'عمل فني / لوحة' },
      { fr: 'Le patrimoine', ar: 'التراث' }
    ]
  },
  {
    id: 'food-baguette',
    title: 'تقاليد المطبخ الفرنسي: سر الخبز والمخبوزات',
    category: 'Customs',
    description: 'لماذا يحتل الخبز (Baguette) مكانة مقدسة في قلوب الفرنسيين؟',
    content: 'في فرنسا، يعتبر شراء الخبز الطازج يومياً طقساً لا يمكن التخلي عنه. اليونسكو صنفت مهارات صنع الباقيت ضمن التراث الثقافي غير المادي للبشرية. المخبز "Boulangerie" ليس مجرد متجر، بل هو نقطة التقاء يومية تعكس حيوية الحياة في الأحياء الفرنسية.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1000',
    keyVocabulary: [
      { fr: 'La baguette', ar: 'الخبز الفرنسي الطويل' },
      { fr: 'La boulangerie', ar: 'المخبز' },
      { fr: 'La tradition', ar: 'التقليد' },
      { fr: 'Le repas', ar: 'الوجبة' }
    ]
  }
];
