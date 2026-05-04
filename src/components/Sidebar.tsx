import React from 'react';
import { Home, BookOpen, MessageCircle, Mic, Star, BookA, Target } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: Home },
    { id: 'curriculum', label: 'الدروس', icon: BookOpen },
    { id: 'chat', label: 'ممارسة المحادثة', icon: MessageCircle },
    { id: 'pronunciation', label: 'مختبر النطق', icon: Mic },
    { id: 'dictionary', label: 'القاموس والأفعال', icon: BookA },
    { id: 'profile', label: 'أهدافي وملفي', icon: Target },
  ];

  return (
    <aside className="w-64 bg-[#0d0d0e] border-e border-white/5 flex flex-col h-full z-10 transition-all">
      <div className="flex items-center gap-3 p-6 border-b border-white/5">
        <div className="w-10 h-10 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-500">
          <Star className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-serif italic text-amber-500 tracking-tight">Étoile</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-white/10 text-amber-500 font-semibold' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-amber-500' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 bg-white/5 border-t border-white/10 m-4 rounded-xl">
        <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">
          صُنع بحب لتعلم الفرنسية
        </p>
      </div>
    </aside>
  );
}
