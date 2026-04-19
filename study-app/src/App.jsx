import React, { useState, useEffect, useRef, useMemo } from 'react';
import chapters from './chapter_data.json';

// 모든 챕터의 variation을 1차원 배열로 평탄화
const rawFlashcards = chapters.flatMap((ch) =>
  ch.variations.map((v, i) => ({
    ...v,
    chapterTitle: ch.title,
    coreMeaning: ch.coreMeaning,
    uniqueId: `${ch.id}-${i}`, // 카드 고유 식별자
  }))
);

function App() {
  // --- 버전 관리 (GEMINI.md 준수) ---
  const appVersion = `v1.3.0`;

  // --- 상태 관리 ---

  const [deck, setDeck] = useState(rawFlashcards);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCardIds, setKnownCardIds] = useState(() => {
    const saved = localStorage.getItem('known_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const currentCard = deck[currentIdx];
  const totalCards = deck.length;

  // --- 유틸리티: 셔플 ---
  const shuffleDeck = () => {
    const shuffled = [...rawFlashcards].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIdx(0);
    setIsFlipped(false);
  };

  // --- 안키 스타일 로직: 상태 저장 ---
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
    
    // 가로 이동이 세로 이동보다 클 때만 스와이프 인정
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && Math.abs(deltaX) > 40) {
      if (deltaX > 0) nextCard();
      else prevCard();
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-noto flex-col fixed inset-0 overscroll-none">
      
      {/* Top Progress Bar */}
      <div className="w-full h-1 bg-slate-800 flex-shrink-0">
        <div 
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${((currentIdx + 1) / totalCards) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 md:px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex-shrink-0">
        <div className="flex flex-col">
          <h1 className="text-lg font-black text-blue-500 tracking-tighter italic leading-none">ANKI STUDY</h1>
          <span className="text-[9px] font-mono text-slate-600 mt-1 uppercase tracking-widest">{appVersion}</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={shuffleDeck}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-400 border border-slate-700 active:scale-95 transition-all"
          >
            SHUFFLE
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-blue-400">
            {currentIdx + 1}/{totalCards}
          </div>
        </div>
      </div>

      {/* Card Deck Area (고정된 영역) */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4">
        
        <div className="flex-1 flex flex-col items-center justify-center">
          
          {/* Main Flashcard */}
          <div 
            className="w-full max-w-lg aspect-[4/5] perspective-1000 cursor-pointer max-h-[550px]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
              
              {/* FRONT: English */}
              <div className="absolute w-full h-full backface-hidden bg-slate-900/80 rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center justify-center text-center border border-white/5">
                <div className="absolute top-6 px-3 py-1 rounded-full bg-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] border border-white/5 max-w-[80%] truncate">
                  {currentCard.chapterTitle.split(': ')[1] || currentCard.chapterTitle}
                </div>
                <h3 className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-white mb-6 px-4">
                  "{currentCard.sentence}"
                </h3>
                <div className="mt-8 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest shadow-inner">
                  Tap to Reveal
                </div>
              </div>

              {/* BACK: Analysis (Scrollable within the card) */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white text-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 text-left">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">Nuance Analysis</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded leading-none ${knownCardIds.includes(currentCard.uniqueId) ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                      {knownCardIds.includes(currentCard.uniqueId) ? 'MEMORIZED' : 'LEARNING'}
                    </span>
                  </div>
                  
                  <p className="text-xl md:text-2xl font-black text-slate-800 mb-6 leading-tight">
                    "{currentCard.meaning}"
                  </p>
                  
                  <div className="space-y-5">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-blue-600 text-[9px] font-black uppercase mb-1 tracking-widest italic leading-none">Literal</p>
                      <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">{currentCard.literalTranslation}</p>
                    </div>
                    <div className="px-1">
                      <p className="text-orange-500 text-[9px] font-black uppercase mb-2 tracking-widest italic leading-none">Vocabulary & Nuance</p>
                      <p className="text-xs md:text-sm leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                        {currentCard.nuance}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ANKI ACTION BUTTONS */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 flex-shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); nextCard(); }}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm"
                  >
                    Again
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); markAsKnown(currentCard.uniqueId); }}
                    className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all"
                  >
                    Easy
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Controls Overlay (Bottom) */}
          <div className="mt-8 flex flex-col items-center flex-shrink-0">
            <div className="flex gap-3 mb-3">
              <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20 shadow-sm">
                Known: {knownCardIds.length}
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-500/10 px-2.5 py-1 rounded-lg border border-slate-500/20 shadow-sm">
                Left: {totalCards - knownCardIds.length}
              </span>
            </div>
            <div className="flex items-center gap-10">
               <button onClick={prevCard} className="p-3 text-slate-600 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
               <div className="h-1 w-1 rounded-full bg-slate-800" />
               <button onClick={nextCard} className="p-3 text-slate-600 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
