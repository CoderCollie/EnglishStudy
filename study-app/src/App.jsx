import React, { useState, useEffect } from 'react';
import chapters from './chapter_data.json';

function App() {
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [currentVarIdx, setCurrentVarIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentChapter = chapters[currentChapterIdx];
  const currentVar = currentChapter.variations[currentVarIdx];

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextVar();
      if (e.key === 'ArrowLeft') prevVar();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVarIdx, isFlipped]);

  const nextVar = () => {
    setIsFlipped(false);
    setCurrentVarIdx((prev) => (prev + 1) % currentChapter.variations.length);
  };

  const prevVar = () => {
    setIsFlipped(false);
    setCurrentVarIdx((prev) => (prev - 1 + currentChapter.variations.length) % currentChapter.variations.length);
  };

  const changeChapter = (idx) => {
    setCurrentChapterIdx(idx);
    setCurrentVarIdx(0);
    setIsFlipped(false);
    setIsSidebarOpen(false); // 모바일에서 선택 시 사이드바 닫기
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-noto">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-blue-500 tracking-tighter italic">REFACTOR</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">English Basic 100</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
          {chapters.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => changeChapter(idx)}
              className={`w-full text-left px-6 py-4 hover:bg-slate-800 transition-all border-b border-slate-800/30 group ${
                currentChapterIdx === idx ? 'bg-slate-800 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center">
                <span className={`text-[10px] font-mono mr-3 ${currentChapterIdx === idx ? 'text-blue-400' : 'text-slate-600'}`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className={`text-sm font-medium transition-colors ${currentChapterIdx === idx ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {ch.title.split(': ')[1] || ch.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        {/* Top Mobile Bar */}
        <div className="md:hidden flex items-center p-4 bg-slate-900/50 border-b border-slate-800">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-blue-400 hover:bg-slate-800 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <div className="ml-4 truncate">
            <span className="text-xs text-slate-500 block uppercase font-bold tracking-tighter">Current Chapter</span>
            <span className="text-sm font-bold text-slate-200">{currentChapter.title.split(': ')[1]}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          <div className="max-w-4xl w-full flex-1 flex flex-col">
            {/* Header (Desktop) */}
            <div className="hidden md:block mb-10 text-center">
              <h2 className="text-3xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                {currentChapter.title}
              </h2>
              <div className="bg-slate-900/50 rounded-2xl p-5 inline-block border border-slate-800 backdrop-blur-md">
                <p className="text-blue-300 text-lg font-medium italic">"{currentChapter.coreMeaning.kr}"</p>
                <p className="text-slate-500 text-xs mt-2 font-mono uppercase tracking-widest">{currentChapter.coreMeaning.en}</p>
              </div>
            </div>

            {/* Flashcard */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 min-h-[450px]">
              <div 
                className="relative w-full max-w-lg aspect-[4/5] md:h-[450px] perspective-1000 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className={`w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                  
                  {/* Front: Question */}
                  <div className="absolute w-full h-full backface-hidden bg-white text-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 md:p-12 flex flex-col items-center justify-center text-center border-b-8 border-slate-200">
                    <div className="absolute top-8 px-4 py-1 rounded-full bg-blue-50 text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100">
                      Korean Context
                    </div>
                    <p className="text-2xl md:text-4xl font-bold leading-tight text-slate-800">
                      "{currentVar.meaning}"
                    </p>
                    <div className="mt-8 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                       <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Tap to Reveal Refactored Code</p>
                    </div>
                  </div>

                  {/* Back: Answer */}
                  <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2.5rem] shadow-2xl p-6 md:p-10 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-tighter border border-white/10">
                        Variation {currentVarIdx + 1}/10
                      </span>
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold mb-8 leading-tight tracking-tight">
                      {currentVar.sentence}
                    </h3>
                    <div className="space-y-6">
                      <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                        <p className="text-blue-200 text-[10px] font-black uppercase mb-2 tracking-widest">Literal Translation</p>
                        <p className="text-sm md:text-base leading-relaxed opacity-90">{currentVar.literalTranslation}</p>
                      </div>
                      <div className="px-2">
                        <p className="text-blue-200 text-[10px] font-black uppercase mb-2 tracking-widest">Vocabulary & Nuance</p>
                        <p className="text-xs md:text-sm leading-relaxed text-blue-50 whitespace-pre-line font-medium">
                          {currentVar.nuance}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-8 md:mt-12 flex items-center gap-4 md:gap-8">
                <button onClick={(e) => { e.stopPropagation(); prevVar(); }} className="p-4 rounded-2xl bg-slate-900 hover:bg-blue-600 transition-all shadow-xl border border-slate-800 active:scale-95 group">
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div className="flex flex-col items-center">
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Sentence</div>
                  <div className="text-xl font-mono font-bold text-blue-500 bg-slate-900 px-6 py-1 rounded-xl border border-slate-800 shadow-inner">
                    {currentVarIdx + 1}<span className="text-slate-700 mx-1">/</span>10
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); nextVar(); }} className="p-4 rounded-2xl bg-slate-900 hover:bg-blue-600 transition-all shadow-xl border border-slate-800 active:scale-95 group">
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              <p className="hidden md:block mt-6 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Arrows to navigate • Space to flip</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
