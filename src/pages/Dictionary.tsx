import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Book, Library, Loader2, PlayCircle, BookA } from 'lucide-react';
import { lookupDictionaryWord } from '../services/geminiService';

const COMMON_VERBS = [
  {
    infinitive: 'Être',
    translation: 'يكون',
    conjugations: {
      'Présent (المضارع)': [
        { pronoun: 'Je', form: 'suis' },
        { pronoun: 'Tu', form: 'es' },
        { pronoun: 'Il/Elle', form: 'est' },
        { pronoun: 'Nous', form: 'sommes' },
        { pronoun: 'Vous', form: 'êtes' },
        { pronoun: 'Ils/Elles', form: 'sont' },
      ]
    },
    examples: ['Je suis content. (أنا سعيد)']
  },
  {
    infinitive: 'Avoir',
    translation: 'يملك',
    conjugations: {
      'Présent (المضارع)': [
        { pronoun: "J'", form: 'ai' },
        { pronoun: 'Tu', form: 'as' },
        { pronoun: 'Il/Elle', form: 'a' },
        { pronoun: 'Nous', form: 'avons' },
        { pronoun: 'Vous', form: 'avez' },
        { pronoun: 'Ils/Elles', form: 'ont' },
      ]
    },
    examples: ["J'ai une idée. (لدي فكرة)"]
  },
  {
    infinitive: 'Aller',
    translation: 'يذهب',
    conjugations: {
      'Présent (المضارع)': [
        { pronoun: 'Je', form: 'vais' },
        { pronoun: 'Tu', form: 'vas' },
        { pronoun: 'Il/Elle', form: 'va' },
        { pronoun: 'Nous', form: 'allons' },
        { pronoun: 'Vous', form: 'allez' },
        { pronoun: 'Ils/Elles', form: 'vont' },
      ]
    },
    examples: ["Je vais à l'école. (أنا أذهب إلى المدرسة)"]
  },
  {
    infinitive: 'Faire',
    translation: 'يفعل / يعمل',
    conjugations: {
      'Présent (المضارع)': [
        { pronoun: 'Je', form: 'fais' },
        { pronoun: 'Tu', form: 'fais' },
        { pronoun: 'Il/Elle', form: 'fait' },
        { pronoun: 'Nous', form: 'faisons' },
        { pronoun: 'Vous', form: 'faites' },
        { pronoun: 'Ils/Elles', form: 'font' },
      ]
    },
    examples: ['Que fais-tu ? (ماذا تفعل؟)']
  }
];

export function Dictionary() {
  const [activeTab, setActiveTab] = useState<'dict' | 'verbs'>('dict');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const addToRecent = (word: string) => {
    const updated = [word, ...recentSearches.filter(w => w !== word)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = async (e: React.FormEvent, query?: string) => {
    if (e) e.preventDefault();
    const q = query || searchQuery.trim();
    if (!q) return;
    
    setSearchQuery(q);
    setIsLoading(true);
    setError('');
    setResult(null);

    const data = await lookupDictionaryWord(q);
    if (data) {
      setResult(data);
      addToRecent(q);
    } else {
      setError('تعذر العثور على الكلمة. تأكد من صحة الكتابة، أو حاول مرة أخرى.');
    }
    
    setIsLoading(false);
  };

  const playAudio = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 mt-6 pb-12"
    >
      <div className="flex gap-4 mb-4 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('dict')}
          className={`px-6 py-2 rounded-full font-bold transition-all text-sm uppercase tracking-wider ${
            activeTab === 'dict' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          القاموس
        </button>
        <button
          onClick={() => setActiveTab('verbs')}
          className={`px-6 py-2 rounded-full font-bold transition-all text-sm uppercase tracking-wider ${
            activeTab === 'verbs' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          تصريف الأفعال
        </button>
      </div>

      {activeTab === 'dict' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-[#0f0f11] to-[#0a0a0b] rounded-3xl p-6 md:p-10 border border-white/5 relative overflow-hidden">
            <h1 className="text-2xl md:text-3xl font-serif text-white mb-2">قاموس L'Académie</h1>
            <p className="text-slate-400 text-sm md:text-base mb-8">ابحث عن أي كلمة فرنسية لمعرفة معناها وتصريفها</p>
            
            <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  dir="auto"
                  placeholder="Exemple: bonjour..."
                  className="w-full bg-[#0a0a0b] border border-white/10 rounded-2xl pr-12 pl-4 py-4 md:py-5 focus:outline-none focus:border-amber-500/50 text-slate-200 placeholder:text-slate-600 transition-colors text-base md:text-lg french-text font-serif italic"
                />
              </div>
              <button 
                type="submit"
                disabled={!searchQuery.trim() || isLoading}
                className="bg-amber-600 text-black px-6 py-4 md:py-5 rounded-2xl font-bold disabled:opacity-50 transition-colors uppercase tracking-widest text-sm sm:w-auto w-full flex justify-center"
              >
                بحث
              </button>
            </form>

            {isLoading && (
              <div className="flex items-center justify-center py-12 gap-3 text-amber-500">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-mono text-sm uppercase tracking-widest">جاري البحث...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-500/5 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
                {error}
              </div>
            )}
            
            {!result && !isLoading && recentSearches.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">عمليات البحث الأخيرة</h3>
                    <div className="flex flex-wrap gap-2">
                        {recentSearches.map(word => (
                            <button key={word} onClick={() => handleSearch(null as any, word)} className="px-4 py-2 bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-500 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all font-serif italic text-lg">
                                {word}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {result && !isLoading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-8"
              >
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/5">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-serif text-white mb-2 french-text italic tracking-wide">{result.word}</h2>
                    <span className="text-xs md:text-sm px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full lowercase inline-block mt-2 md:mt-0">
                      {result.type}
                    </span>
                  </div>
                  <button 
                    onClick={() => playAudio(result.word)}
                    className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 flex items-center justify-center text-amber-500 rounded-full hover:bg-amber-500/20 transition-colors border border-amber-500/30 shrink-0"
                  >
                    <PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 mb-2">الترجمة</h3>
                    <p className="text-xl md:text-2xl text-slate-200">{result.translation}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 mb-2">التعريف</h3>
                    <p className="text-base md:text-lg text-slate-400 leading-relaxed">{result.definition}</p>
                  </div>

                  {result.examples && result.examples.length > 0 && (
                    <div className="pt-4">
                      <h3 className="text-[10px] md:text-xs uppercase tracking-widest text-amber-500/70 mb-4">أمثلة</h3>
                      <div className="space-y-4">
                        {result.examples.map((ex: any, i: number) => (
                          <div key={i} className="bg-[#0a0a0b] p-4 rounded-xl border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-amber-500/50"></div>
                            <p className="font-serif italic text-white text-base md:text-lg mb-1">{ex.fr}</p>
                            <p className="text-slate-500 text-xs md:text-sm">{ex.ar}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'verbs' && (
        <div className="bg-gradient-to-b from-[#0f0f11] to-[#0a0a0b] rounded-3xl p-6 md:p-10 border border-white/5">
          <h1 className="text-2xl md:text-3xl font-serif text-white mb-2">تصريف الأفعال الشائعة</h1>
          <p className="text-slate-400 text-sm md:text-base mb-8">راجع تصريفات أهم الأفعال في اللغة الفرنسية لتكوين الجمل بشكل صحيح</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {COMMON_VERBS.map((verb, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6">
                <div className="flex justify-between items-end mb-6 pb-4 border-b border-white/5">
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif text-amber-500 italic mb-1">{verb.infinitive}</h2>
                    <p className="text-slate-400 text-xs md:text-sm">{verb.translation}</p>
                  </div>
                  <button onClick={() => playAudio(verb.infinitive)} className="text-slate-500 hover:text-amber-500 transition-colors pb-1">
                    <PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
                
                {Object.entries(verb.conjugations).map(([tense, forms], i) => (
                  <div key={i} className="mb-4">
                    <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">{tense}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {forms.map((f, j) => (
                        <div key={j} className="flex gap-2 p-2 bg-[#0a0a0b] rounded border border-white/5 text-sm">
                          <span className="text-slate-500 w-12">{f.pronoun}</span>
                          <span className="text-white font-serif">{f.form}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {verb.examples && verb.examples.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <h3 className="text-[10px] uppercase tracking-widest text-amber-500/70 mb-2">مثال</h3>
                    <p className="text-sm font-serif italic text-slate-300">{verb.examples[0]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
