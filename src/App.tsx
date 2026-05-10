/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ReminderManager } from './components/ReminderManager';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Curriculum } from './pages/Curriculum';
import { LessonView } from './pages/LessonView';
import { AIChat } from './pages/AIChat';
import { Translator } from './pages/Translator';
import { Pronunciation } from './pages/Pronunciation';
import { Dictionary } from './pages/Dictionary';
import { Profile } from './pages/Profile';
import { LearningPaths } from './pages/LearningPaths';
import { Culture } from './pages/Culture';
import { Games } from './pages/Games';
import { Grammar } from './pages/Grammar';
import { useAuth } from './components/FirebaseProvider';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const { user, loading, error, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-amber-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-slate-200 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-gradient-to-b from-[#0f0f11] to-[#0a0a0b] border border-white/5 rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 flex opacity-30">
            <div className="h-full w-1/3 bg-[#002654]"></div>
            <div className="h-full w-1/3 bg-white"></div>
            <div className="h-full w-1/3 bg-[#ED2939]"></div>
          </div>
          
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-amber-500/30">
            <span className="text-3xl sm:text-4xl">🇫🇷</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-serif italic text-amber-500 mb-2 tracking-tight">L'Académie</h1>
          <p className="text-slate-400 mb-8 sm:mb-10 text-sm sm:text-base">منصتك الذكية لتعلم اللغة الفرنسية</p>
          
          <button 
            onClick={signIn}
            className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 sm:py-4 rounded-xl transition-colors uppercase tracking-widest text-xs sm:text-sm"
          >
            سجل الدخول باستخدام Google
          </button>

          {error && (
            <p className="mt-4 text-red-400 text-xs sm:text-sm">{error}</p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      <ReminderManager />
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
        className="min-h-full"
      >
        {currentTab === 'dashboard' && (
          <Dashboard setCurrentTab={setCurrentTab} setCurrentLesson={setCurrentLesson} />
        )}
        {currentTab === 'curriculum' && (
          <Curriculum setCurrentTab={setCurrentTab} setCurrentLesson={setCurrentLesson} />
        )}
        {currentTab === 'lesson_view' && (
          <LessonView lessonId={currentLesson} setCurrentTab={setCurrentTab} />
        )}
        {currentTab === 'chat' && (
          <AIChat />
        )}
        {currentTab === 'translator' && (
          <Translator />
        )}
        {currentTab === 'pronunciation' && (
          <Pronunciation />
        )}
        {currentTab === 'dictionary' && (
          <Dictionary />
        )}
        {currentTab === 'learning_paths' && (
          <LearningPaths setCurrentTab={setCurrentTab} setCurrentLesson={setCurrentLesson} />
        )}
        {currentTab === 'culture' && (
          <Culture />
        )}
        {currentTab === 'games' && (
          <Games />
        )}
        {currentTab === 'grammar' && (
          <Grammar />
        )}
        {currentTab === 'profile' && (
          <Profile />
        )}
      </motion.div>
    </Layout>
  );
}

