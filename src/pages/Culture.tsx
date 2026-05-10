import React, { useState } from 'react';
import { cultureArticles, CultureArticle } from '../data/culture';
import { MapPin, History, Palette, Book, Music, ExternalLink, ChevronLeft, BookOpenText, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { lookupDictionaryWord } from '../services/geminiService';

export function Culture() {
  const [selectedArticle, setSelectedArticle] = useState<CultureArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const handleLookup = async (word: string) => {
    setIsLookingUp(true);
    setLookupResult(null);
    const data = await lookupDictionaryWord(word);
    setLookupResult(data);
    setIsLookingUp(false);
  };

  const categories = [
    { id: 'Customs', label: 'عادات وتقاليد', icon: MapPin },
    { id: 'History', label: 'تاريخ', icon: History },
    { id: 'Art', label: 'فنون', icon: Palette },
    { id: 'Literature', label: 'أدب', icon: Book },
    { id: 'Music', label: 'موسيقى', icon: Music }
  ];

  const filteredArticles = activeCategory 
    ? cultureArticles.filter(a => a.category === activeCategory)
    : cultureArticles;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <AnimatePresence mode="wait">
        {!selectedArticle ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-indigo-500/20 to-transparent border border-indigo-500/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <h2 className="text-3xl md:text-4xl font-serif text-white mb-2">نافذة على فرنسا</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">اكتشف جمال الثقافة الفرنسية من خلال مقالات وحقائق شيقة عن الفن والتاريخ والتقاليد.</p>
            </div>

            {/* Categories */}
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-6 py-3 rounded-full border transition-all whitespace-nowrap text-sm font-bold ${
                  !activeCategory ? 'bg-indigo-500 border-indigo-500 text-black' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                الكل
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-3 rounded-full border transition-all whitespace-nowrap text-sm font-bold flex items-center gap-2 ${
                    activeCategory === cat.id ? 'bg-indigo-500 border-indigo-500 text-black' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="bg-[#0f0f11] border border-white/5 rounded-3xl overflow-hidden group cursor-pointer hover:border-indigo-500/30 transition-all flex flex-col h-full"
                >
                  {article.image && (
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] to-transparent opacity-60" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-indigo-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                          {categories.find(c => c.id === article.category)?.label}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight">{article.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed flex-1 line-clamp-3">{article.description}</p>
                    <div className="pt-4 flex items-center text-indigo-500 text-xs font-bold uppercase tracking-widest gap-2">
                      <span>اقرأ المزيد</span>
                      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="article"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
              <span>العودة للمقالات</span>
            </button>

            <div className="space-y-6">
              {selectedArticle.image && (
                <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl relative">
                  <img 
                    src={selectedArticle.image} 
                    alt={selectedArticle.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-8 right-8 text-white">
                    <span className="bg-indigo-500 text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">
                      {categories.find(c => c.id === selectedArticle.category)?.label}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-serif text-white">{selectedArticle.title}</h1>
                  </div>
                </div>
              )}

               {!selectedArticle.image && (
                 <h1 className="text-3xl md:text-5xl font-serif text-white">{selectedArticle.title}</h1>
               )}

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
                <div className="prose prose-invert prose-indigo max-w-none">
                  <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">{selectedArticle.content}</p>
                </div>

                {selectedArticle.keyVocabulary && selectedArticle.keyVocabulary.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                       <Book className="w-5 h-5 text-indigo-500" />
                       مفردات هامة
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedArticle.keyVocabulary.map((vocab, idx) => (
                        <div key={idx} className="bg-[#0f0f11] p-4 rounded-xl border border-white/5 flex justify-between items-center group hover:border-indigo-500/30 transition-colors">
                           <span className="font-serif text-lg text-white group-hover:text-indigo-400 transition-colors">{vocab.fr}</span>
                           <button 
                             onClick={() => handleLookup(vocab.fr)}
                             className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500/20 transition-colors border border-blue-500/30"
                           >
                            {isLookingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpenText className="w-5 h-5" />}
                           </button>
                        </div>
                      ))}
                    </div>

                    {/* Lookup Result Overlay */}
                    <AnimatePresence>
                        {lookupResult && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setLookupResult(null)}>
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-[#121215] border border-white/10 rounded-3xl p-6 w-full max-w-lg"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-2xl font-serif text-white">{lookupResult.word}</h3>
                                        <button onClick={() => setLookupResult(null)} className="text-slate-500 hover:text-white"><XCircle /></button>
                                    </div>
                                    <p className="text-blue-400 mb-2 font-bold">{lookupResult.translation}</p>
                                    <p className="text-slate-400 mb-6">{lookupResult.definition}</p>
                                    {lookupResult.examples?.[0] && (
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <p className="italic text-white mb-1">{lookupResult.examples[0].fr}</p>
                                            <p className="text-slate-500 text-sm">{lookupResult.examples[0].ar}</p>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                  </div>
                )}

                {selectedArticle.videoUrl && (
                  <div className="mt-12 pt-8 border-t border-white/10">
                     <h3 className="text-xl font-bold text-white mb-6">فيديو متعلق</h3>
                     <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10">
                        <iframe 
                          src={selectedArticle.videoUrl.replace('watch?v=', 'embed/')} 
                          title="YouTube video player" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                     </div>
                  </div>
                )}

                {selectedArticle.externalLink && (
                  <div className="mt-12 pt-8 border-t border-white/10">
                    <a 
                      href={selectedArticle.externalLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-white/5 px-6 py-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all text-indigo-400 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">مصدر خارجي</p>
                        <p className="text-sm font-bold">شاهد المزيد عن هذا الموضوع</p>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
