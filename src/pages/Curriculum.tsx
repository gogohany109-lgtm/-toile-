import React from 'react';
import { curriculum, Level } from '../data/curriculum';
import { BookOpen } from 'lucide-react';

interface CurriculumProps {
  setCurrentTab: (tab: string) => void;
  setCurrentLesson: (lessonId: string) => void;
}

const levelTitles: Record<Level, string> = {
  'A1': 'مبتدئ أول (A1)',
  'A2': 'مبتدئ ثانٍ (A2)',
  'B1': 'متوسط أول (B1)',
  'B2': 'متوسط ثانٍ (B2)',
  'C1': 'متقدم (C1)',
  'C2': 'احتراف (C2)',
};

import { motion } from 'motion/react';

export function Curriculum({ setCurrentTab, setCurrentLesson }: CurriculumProps) {
  // Group curriculum by levels
  const groupedCurriculum = curriculum.reduce((acc, lesson) => {
    if (!acc[lesson.level]) acc[lesson.level] = [];
    acc[lesson.level].push(lesson);
    return acc;
  }, {} as Record<string, typeof curriculum>);

  const handleLessonStart = (id: string) => {
    setCurrentLesson(id);
    setCurrentTab('lesson_view');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 mt-6"
    >
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 italic text-slate-400 mb-8 border-r-4 border-r-amber-500">
        <p>هنا تجد خطة التعلم المنهجية التي تأخذك خطوة بخطوة من مستويات المبتدئين حتى الاحتراف.</p>
      </div>

      <div className="space-y-12">
        {(Object.keys(levelTitles) as Level[]).map((level) => {
          const title = levelTitles[level];
          const lessons = groupedCurriculum[level] || [];
          if (lessons.length === 0) return null; // Skip empty levels for now
          
          return (
            <div key={level} className="space-y-4">
              <h3 className="text-xl font-serif text-white border-b border-white/10 pb-3">
                {title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map(lesson => (
                  <div 
                    key={lesson.id} 
                    className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-amber-500/50 hover:bg-white/10 transition-all cursor-pointer group"
                    onClick={() => handleLessonStart(lesson.id)}
                  >
                    <div className="bg-amber-500/10 text-amber-500 w-12 h-12 flex items-center justify-center rounded-lg mb-4 group-hover:bg-amber-500 group-hover:text-black transition-colors border border-amber-500/20 group-hover:border-amber-500">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-lg text-white mb-2">{lesson.title}</h4>
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{lesson.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
