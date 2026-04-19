import React, { useState, useEffect, useRef } from 'react';
import chapters from './chapter_data.json';

// 데이터 평탄화 (1,000문장 덱 생성)
const rawFlashcards = chapters.flatMap((ch) =>
  ch.variations.map((v, i) => ({
    ...v,
    chapterTitle: ch.title,
    coreMeaning: ch.coreMeaning,
    uniqueId: `${ch.id}-${i}`,
  }))
);

function App() {
  // --- 버전 관리 ---
  const appVersion = `v1.3.1`;
  
  // --- 상태 관리 ---
  const [deck, setDeck] = useState(rawFlashcards);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showStats, setShowStats] = useState(false); // 통계 대시보드 노출 여부
  const [knownCardIds, setKnownCardIds] = useState(() => {
    const saved = localStorage.getItem('known_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const currentCard = deck[currentIdx];
  const totalCards = deck.length;
  const knownCount = knownCardIds.length;
  const remainingCount = totalCards - knownCount;
  const progressPercent = Math.round((knownCount / totalCards) * 100);

  // --- 유틸리티: 셔플 ---
  const shuffleDeck = () => {
    const shuffled = [...rawFlashcards].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIdx(0);
    setIsFlipped(false);
    setShowStats(false);
  };

  // --- 안키 스타일 로직 ---
  const markAsKnown = (id) => {
    const updated = [...new Set([...knownCardIds, id])];
    setKnownCardIds(updated);
    localStorage.setItem('known_cards', JSON.stringify(updated));
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % totalCards);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev - 1 + totalCards) % totalCards);
  };

  // --- 키보드 네비게이션 ---
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
  }, [currentIdx, isFlipped]);

  // --- 스와이프 제스처 ---
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (!touchStartX.current || !touchStartY.current) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && Math.abs(deltaX) > 40) {
      if (deltaX > 0) nextCard();
      else prevCard();
    }
    touchStartX.current = null; touchStartY.current = null;
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-noto flex-col fixed inset-0 overscroll-none select-none">
      
      {/* Top Progress Bar */}
      <div className="w-full h-1 bg-slate-800 flex-shrink-0 relative z-50">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 md:px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex-shrink-0 relative z-50">
        <div className="flex flex-col">
          <h1 className="text-lg font-black text-blue-500 tracking-tighter italic leading-none uppercase">Anki English</h1>
          <span className="text-[9px] font-mono text-slate-600 mt-1 uppercase tracking-widest">{appVersion}</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Dashboard Button */}
          <button 
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              showStats ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Stats</span>
          </button>
          
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-blue-400">
            {currentIdx + 1}/{totalCards}
          </div>
        </div>
      </div>

      {/* Stats Dashboard Overlay */}
      {showStats && (
        <div className="absolute top-20 right-4 md:right-8 z-[100] w-64 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 backdrop-blur-xl animate-in fade-in zoom-in duration-200">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Learning Progress</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-400">Memorized</span>
              <span className="text-xl font-black text-green-500 font-mono">{knownCount}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-400">Left to go</span>
              <span className="text-xl font-black text-slate-300 font-mono">{remainingCount}</span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-blue-400">COMPLETION</span>
                <span className="text-blue-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowStats(false)}
            className="w-full mt-6 py-2 rounded-xl bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          
          {/* Flashcard */}
          <div 
            className="w-full max-w-lg aspect-[4/5] perspective-1000 cursor-pointer max-h-[550px]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
              
              {/* FRONT */}
              <div className="absolute w-full h-full backface-hidden bg-slate-900/80 rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center justify-center text-center border border-white/5">
                <div className="absolute top-6 px-3 py-1 rounded-full bg-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] border border-white/5 max-w-[80%] truncate">
                  {currentCard.chapterTitle.split(': ')[1] || currentCard.chapterTitle}
                </div>
                <h3 className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-white mb-6 px-4">
                  "{currentCard.sentence}"
                </h3>
                <div className="mt-8 px-5 py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest shadow-inner">
                  Tap to Reveal
                </div>
              </div>

              {/* BACK */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white text-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 text-left">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Nuance Analysis</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${knownCardIds.includes(currentCard.uniqueId) ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                      {knownCardIds.includes(currentCard.uniqueId) ? 'MEMORIZED' : 'LEARNING'}
                    </span>
                  </div>
                  <p className="text-xl md:text-2xl font-black text-slate-800 mb-6 leading-tight italic">"{currentCard.meaning}"</p>
                  <div className="space-y-5">
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                      <p className="text-blue-600 text-[9px] font-black uppercase mb-1 tracking-widest italic">Literal</p>
                      <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed">{currentCard.literalTranslation}</p>
                    </div>
                    <div>
                      <p className="text-orange-500 text-[9px] font-black uppercase mb-1 tracking-widest italic">Vocabulary & Nuance</p>
                      <p className="text-xs md:text-sm leading-relaxed text-slate-700 whitespace-pre-line font-medium">{currentCard.nuance}</p>
                    </div>
                  </div>
                </div>
                {/* ANKI ACTIONS */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className="flex-1 py-4 rounded-2xl bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">Again</button>
                  <button onClick={(e) => { e.stopPropagation(); markAsKnown(currentCard.uniqueId); }} className="flex-1 py-4 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all">Easy</button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation Area (Prime UX Space) */}
          <div className="mt-8 w-full max-w-sm flex items-center justify-between gap-4 flex-shrink-0">
            <button 
              onClick={prevCard}
              className="p-4 rounded-2xl bg-slate-900/50 text-slate-500 hover:text-white transition-colors active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            {/* CENTRAL SHUFFLE BUTTON */}
            <button 
              onClick={shuffleDeck}
              className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-400 transition-all active:scale-95 shadow-xl group"
            >
              <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.001 0 01-15.357-2m15.357 2H15" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Shuffle Deck</span>
            </button>

            <button 
              onClick={nextCard}
              className="p-4 rounded-2xl bg-slate-900/50 text-slate-500 hover:text-white transition-colors active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          
          <p className="hidden md:block mt-6 text-slate-700 text-[9px] font-black uppercase tracking-[0.3em]">Space to flip • Arrows to navigate</p>
        </div>
      </div>
    </div>
  );
}

export default App;
