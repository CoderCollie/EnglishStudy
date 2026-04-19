import React, { useState, useEffect, useRef } from 'react';
import chapters from './chapter_data.json';

// 모든 챕터의 variation을 1차원 배열(단일 카드 덱)로 평탄화(Flatten)
const flashcards = chapters.flatMap((ch) =>
  ch.variations.map((v, i) => ({
    ...v,
    chapterTitle: ch.title,
    coreMeaning: ch.coreMeaning,
    variationNum: i + 1,
    totalVariations: ch.variations.length,
  }))
);

function App() {
  // 단일 인덱스 상태로 모든 카드 제어
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentCardIdx];
  const totalCards = flashcards.length;

  // 버전 정보
  const appVersion = `v1.0.0`;

  // 터치 상태 정밀 제어
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchEndX = useRef(null);
  const touchEndY = useRef(null);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextCard();
      if (e.key === 'ArrowLeft') prevCard();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCardIdx, isFlipped]);

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentCardIdx((prev) => (prev + 1) % totalCards);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentCardIdx((prev) => (prev - 1 + totalCards) % totalCards);
  };

  // 정밀 스와이프 핸들러
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || !touchStartY.current || !touchEndY.current) return;
    
    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 40;
    
    // 가로 스와이프 우선 판정 (터치 잠금)
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) nextCard();
        else prevCard();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  // 상단 진행률 바(Progress Bar) 너비 계산
  const progressPercentage = ((currentCardIdx + 1) / totalCards) * 100;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-noto text-sm md:text-base selection:bg-blue-500/30 flex-col">
      
      {/* Top Progress Bar */}
      <div className="w-full h-1 bg-slate-800">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-800 bg-slate-900/30">
        <div>
          <h1 className="text-lg md:text-xl font-black text-blue-500 tracking-tighter italic uppercase leading-none">English Study</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Infinite Flashcards</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{appVersion}</div>
          <div className="text-sm font-bold text-slate-300 font-mono mt-1">
            <span className="text-blue-400">{currentCardIdx + 1}</span> / {totalCards}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          <div className="max-w-4xl w-full flex-1 flex flex-col">
            
            {/* Context Info (Desktop & Tablet) */}
            <div className="hidden md:flex flex-col items-center mb-8 text-center">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border border-slate-700">
                {currentCard.chapterTitle.split(': ')[1] || currentCard.chapterTitle}
              </span>
              <div className="bg-slate-900/50 rounded-2xl p-4 inline-block border border-slate-800 backdrop-blur-md">
                <p className="text-slate-500 text-[10px] mb-1 font-black uppercase tracking-[0.3em]">Base Goal</p>
                <p className="text-blue-300 text-base font-medium italic">"{currentCard.coreMeaning.kr}"</p>
              </div>
            </div>

            {/* Flashcard (touch-action: pan-y 적용) */}
            <div 
              className="flex-1 flex flex-col items-center justify-center py-2 md:py-4 min-h-[450px] touch-action-none" 
              style={{ touchAction: 'pan-y' }}
              onTouchStart={handleTouchStart} 
              onTouchMove={handleTouchMove} 
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative w-full max-w-lg aspect-[4/5] md:max-h-[500px] md:h-[450px] perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                  
                  {/* FRONT: ENGLISH SENTENCE */}
                  <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 md:p-12 flex flex-col items-center justify-center text-center border-b-8 border-indigo-950">
                    {/* Mobile Only Context Badge */}
                    <div className="md:hidden absolute top-6 px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold text-blue-100 uppercase tracking-widest border border-white/20 w-4/5 truncate">
                      {currentCard.chapterTitle.split(': ')[1] || currentCard.chapterTitle}
                    </div>
                    
                    <h3 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight mt-4">
                      "{currentCard.sentence}"
                    </h3>
                    
                    <div className="mt-12 p-3 rounded-2xl bg-black/20 border border-white/10 shadow-inner">
                       <p className="text-[10px] text-blue-200 uppercase font-bold tracking-tight">Tap to Reveal Meaning</p>
                    </div>
                  </div>

                  {/* BACK: KOREAN & ANALYSIS */}
                  <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white text-slate-900 rounded-[2.5rem] shadow-2xl p-6 md:p-10 flex flex-col overflow-y-auto border-4 border-blue-100 text-left">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Analysis</span>
                    <p className="text-xl md:text-2xl font-bold mb-4 leading-tight text-slate-800">
                      "{currentCard.meaning}"
                    </p>
                    <div className="space-y-4 mt-2">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-blue-600 text-[10px] font-black uppercase mb-1 tracking-widest italic">Literal</p>
                        <p className="text-sm md:text-base text-slate-600 font-medium">{currentCard.literalTranslation}</p>
                      </div>
                      <div className="px-1 pb-4">
                        <p className="text-orange-500 text-[10px] font-black uppercase mb-2 tracking-widest italic font-bold">Nuance Analysis</p>
                        <p className="text-xs md:text-sm leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                          {currentCard.nuance}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-8 md:mt-12 flex items-center justify-between w-full max-w-sm px-4">
                <button onClick={(e) => { e.stopPropagation(); prevCard(); }} className="p-4 rounded-2xl bg-slate-900 hover:bg-blue-600 transition-all shadow-xl border border-slate-800 active:scale-95 group flex-shrink-0">
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                
                <div className="flex flex-col items-center mx-4">
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Swipe to navigate</div>
                  <div className="text-xs font-mono text-slate-500 bg-slate-900 px-4 py-1.5 rounded-xl border border-slate-800 shadow-inner whitespace-nowrap">
                    Card <span className="text-blue-400 font-bold">{currentCardIdx + 1}</span> of {totalCards}
                  </div>
                </div>

                <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className="p-4 rounded-2xl bg-slate-900 hover:bg-blue-600 transition-all shadow-xl border border-slate-800 active:scale-95 group flex-shrink-0">
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              <p className="hidden md:block mt-6 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">Use Arrow Keys • Space to flip</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
