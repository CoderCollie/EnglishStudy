import React, { useState, useEffect, useRef } from 'react';
import chapters from './chapter_data.json';

function App() {
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [currentVarIdx, setCurrentVarIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 스와이프 제스처를 위한 상태 변수
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

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
    setIsSidebarOpen(false); // 모바일에서 챕터 선택 시 사이드바 닫기
  };

  // 모바일 스와이프 이벤트 핸들러
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // 최소 스와이프 인식 거리

    if (distance > minSwipeDistance) {
      nextVar(); // 왼쪽으로 스와이프 -> 다음 문장
    } else if (distance < -minSwipeDistance) {
      prevVar(); // 오른쪽으로 스와이프 -> 이전 문장
    }

    // 상태 초기화
    touchStartX.current = null;
    touchEndX.current = null;
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
            
            {/* Header (Desktop & Tablet) */}
            <div className="hidden md:block mb-10 text-center">
              <h2 className="text-3xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                {currentChapter.title}
              </h2>
              <div className="bg-slate-900/50 rounded-2xl p-5 inline-block border border-slate-800 backdrop-blur-md">
                <p className="text-slate-400 text-sm mb-1 font-mono uppercase tracking-widest">Base Target</p>
                <p className="text-blue-300 text-lg font-medium italic">"{currentChapter.coreMeaning.kr}"</p>
              </div>
            </div>

            {/* Flashcard with Swipe Handlers */}
            <div 
              className="flex-1 flex flex-col items-center justify-center py-2 md:py-4 min-h-[450px]"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="relative w-full max-w-lg aspect-[4/5] md:h-[450px] perspective-1000 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className={`w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                  
                  {/* FRONT: ENGLISH SENTENCE FIRST (Active Recall) */}
                  <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 md:p-12 flex flex-col items-center justify-center text-center border-b-8 border-indigo-900">
                    <div className="absolute top-8 px-4 py-1 rounded-full bg-white/10 text-[10px] font-black text-blue-100 uppercase tracking-widest border border-white/20">
                      Variation {currentVarIdx + 1}/10
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight">
                      "{currentVar.sentence}"
                    </h3>
                    <div className="mt-12 p-3 rounded-2xl bg-black/20 border border-white/10">
                       <p className="text-[10px] text-blue-200 uppercase font-bold tracking-tight">Tap to Reveal Analysis</p>
                    </div>
                  </div>

                  {/* BACK: KOREAN MEANING & NUANCE ANALYSIS */}
                  <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white text-slate-900 rounded-[2.5rem] shadow-2xl p-6 md:p-10 flex flex-col overflow-y-auto border-4 border-blue-100">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Analysis</span>
                    
                    <p className="text-xl md:text-2xl font-bold mb-4 leading-tight text-slate-800">
                      "{currentVar.meaning}"
                    </p>
                    
                    <div className="space-y-4 mt-2">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-blue-600 text-[10px] font-black uppercase mb-1 tracking-widest">Literal Translation</p>
                        <p className="text-sm md:text-base text-slate-600">{currentVar.literalTranslation}</p>
                      </div>
                      <div className="px-2 pb-4">
                        <p className="text-orange-500 text-[10px] font-black uppercase mb-2 tracking-widest">Vocabulary & Nuance</p>
                        <p className="text-xs md:text-sm leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                          {currentVar.nuance}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Controls */}
              <div className="mt-8 md:mt-12 flex items-center gap-4 md:gap-8">
                {/* Desktop Prev Button */}
                <button onClick={(e) => { e.stopPropagation(); prevVar(); }} className="hidden md:block p-4 rounded-2xl bg-slate-900 hover:bg-blue-600 transition-all shadow-xl border border-slate-800 active:scale-95 group">
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                
                {/* Dots / Status Indicator */}
                <div className="flex flex-col items-center">
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Swipe to navigate</div>
                  <div className="flex gap-1.5 items-center bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentVarIdx ? 'bg-blue-500 scale-125' : 'bg-slate-700'}`} />
                    ))}
                  </div>
                </div>

                {/* Desktop Next Button */}
                <button onClick={(e) => { e.stopPropagation(); nextVar(); }} className="hidden md:block p-4 rounded-2xl bg-slate-900 hover:bg-blue-600 transition-all shadow-xl border border-slate-800 active:scale-95 group">
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
