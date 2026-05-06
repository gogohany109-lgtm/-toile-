import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from './FirebaseProvider';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export function Layout({ children, currentTab, setCurrentTab }: LayoutProps) {
  const { userData, logOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-slate-200 overflow-hidden font-sans" dir="rtl">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 right-0 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 h-full w-64 lg:w-auto lg:h-full`}>
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            setIsMobileMenuOpen(false);
          }} 
        />
      </div>
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#0d0d0e] to-transparent pointer-events-none" />
        
        <header className="px-4 py-4 md:px-8 md:py-6 w-full flex justify-between items-center z-10 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl md:text-2xl font-serif text-white tracking-tight truncate">
              {currentTab === 'dashboard' && <span className="italic">مرحباً {userData?.displayName?.split(' ')[0]}</span>}
              {currentTab === 'curriculum' && 'المنهج الدراسي'}
              {currentTab === 'chat' && 'تحدث مع Étoile'}
              {currentTab === 'translator' && 'المترجم الفوري'}
              {currentTab === 'pronunciation' && 'مختبر النطق'}
              {currentTab === 'dictionary' && 'القاموس والأفعال'}
              {currentTab === 'profile' && 'أهدافي وملفي'}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className="text-sm font-medium text-slate-400">المستوى:</span>
              <span className="text-sm font-bold text-amber-500 uppercase">{userData?.currentLevel || 'A1'}</span>
            </div>
            
            <button onClick={logOut} className="text-xs text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors font-mono hidden sm:block">
              خروج
            </button>
            <button onClick={logOut} className="text-xs p-2 text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors font-mono sm:hidden bg-white/5 rounded-lg border border-white/10">
              خروج
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:pb-8 z-10 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
