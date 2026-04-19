import React, { useState, useEffect, useRef } from 'react';
import chapters from './chapter_data.json';

const rawFlashcards = chapters.flatMap((ch) =>
  ch.variations.map((v, i) => ({
    ...v,
    chapterTitle: ch.title,
    coreMeaning: ch.coreMeaning,
    uniqueId: `${ch.id}-${i}`,
  }))
);

function App() {
  // --- 버전 관리 (v1.4.1) ---
  const appVersion = `v1.4.1`;
  
  const [deck, setDeck] = useState(rawFlashcards);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [newUpdateAvailable, setNewUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  const [knownCardIds, setKnownCardIds] = useState(() => {
    const saved = localStorage.getItem('known_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const currentCard = deck[currentIdx];
  const totalCards = deck.length;
  const knownCount = knownCardIds.length;
  const remainingCount = totalCards - knownCount;
  const progressPercent = Math.round((knownCount / totalCards) * 100);

  // --- 업데이트 감지 리스너 ---
  useEffect(() => {
    const handleUpdate = (e) => {
      setNewUpdateAvailable(true);
      setWaitingWorker(e.detail.waiting);
    };
    window.addEventListener('swUpdateAvailable', handleUpdate);
    return () => window.removeEventListener('swUpdateAvailable', handleUpdate);
  }, []);

  const applyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage('SKIP_WAITING');
    }
    window.location.reload();
  };

  // --- 강력 강제 업데이트 (Nuclear Option) ---
  const handleForceUpdate = async () => {
    if (window.confirm(`최신 버전(${appVersion})으로 강제 업데이트를 진행할까요?\n(암기 진도는 유지됩니다)`)) {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }
      // 캐시 스토리지 삭제
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      window.location.href = window.location.href + '?update=' + Date.now();
    }
  };

  const shuffleDeck = () => {
    const shuffled = [...rawFlashcards].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIdx(0);
    setIsFlipped(false);
    setShowStats(false);
  };

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
      
      {/* Update Toast */}
      {newUpdateAvailable && (
        <div className="absolute top-[var(--safe-top)] left-0 right-0 z-[200] p-4 animate-in slide-in-from-top duration-500">
          <div className="max-w-md mx-auto bg-blue-600 rounded-2xl shadow-2xl p-4 flex items-center justify-between border border-blue-400">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg animate-pulse">✨</div>
              <p className="text-xs font-bold text-white uppercase tracking-tight">New Version Ready</p>
            </div>
            <button onClick={applyUpdate} className="px-4 py-2 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors shadow-lg">Update Now</button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-800 flex-shrink-0 relative z-50">
        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 md:px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex-shrink-0 relative z-50"
        style={{ paddingTop: 'calc(var(--safe-top) + 12px)', paddingBottom: '12px' }}
      >
        <div className="flex flex-col items-start">
          <h1 className="text-lg font-black text-blue-500 tracking-tighter italic leading-none uppercase">Anki English</h1>
          {/* VERSION BUTTON (Click to Force Update) */}
          <button 
            onClick={handleForceUpdate}
            className="text-[9px] font-mono text-slate-600 mt-1 uppercase tracking-widest hover:text-blue-400 transition-colors active:scale-95"
          >
            {appVersion} <span className="ml-1 opacity-50 underline decoration-dotted">Force Update</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              showStats ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Stats</span>
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-blue-400">{currentIdx + 1}/{totalCards}</div>
        </div>
      </div>

      {/* Stats Overlay */}
      {showStats && (
        <div className="absolute right-4 md:right-8 z-[100] w-64 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 backdrop-blur-xl animate-in fade-in zoom-in duration-200" style={{ top: 'calc(var(--safe-top) + 80px)' }}>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Learning Progress</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-end"><span className="text-xs text-slate-400">Memorized</span><span className="text-xl font-black text-green-500 font-mono">{knownCount}</span></div>
            <div className="flex justify-between items-end"><span className="text-xs text-slate-400">Left to go</span><span className="text-xl font-black text-slate-300 font-mono">{remainingCount}</span></div>
            <div className="pt-2"><div className="flex justify-between text-[10px] font-bold mb-1"><span className="text-blue-400">COMPLETION</span><span className="text-blue-400">{progressPercent}%</span></div><div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${progressPercent}%` }} /></div></div>
          </div>
          <button onClick={() => setShowStats(false)} className="w-full mt-6 py-2 rounded-xl bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Close</button>
        </div>
      )}

      {/* Flashcard Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-lg aspect-[4/5] perspective-1000 cursor-pointer max-h-[500px]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
              <div className="absolute w-full h-full backface-hidden bg-slate-900/80 rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center justify-center text-center border border-white/5">
                <div className="absolute top-6 px-3 py-1 rounded-full bg-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] border border-white/5 max-w-[80%] truncate">{currentCard.chapterTitle.split(': ')[1] || currentCard.chapterTitle}</div>
                <h3 className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-white mb-6 px-4">"{currentCard.sentence}"</h3>
                <div className="mt-8 px-5 py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest shadow-inner">Tap to Reveal</div>
              </div>
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white text-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 text-left">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Nuance Analysis</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${knownCardIds.includes(currentCard.uniqueId) ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>{knownCardIds.includes(currentCard.uniqueId) ? 'MEMORIZED' : 'LEARNING'}</span>
                  </div>
                  <p className="text-xl md:text-2xl font-black text-slate-800 mb-6 leading-tight italic">"{currentCard.meaning}"</p>
                  <div className="space-y-5">
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100"><p className="text-blue-600 text-[9px] font-black uppercase mb-1 tracking-widest italic leading-none">Literal</p><p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed">{currentCard.literalTranslation}</p></div>
                    <div><p className="text-orange-500 text-[9px] font-black uppercase mb-1 tracking-widest italic leading-none">Vocabulary & Nuance</p><p className="text-xs md:text-sm leading-relaxed text-slate-700 whitespace-pre-line font-medium">{currentCard.nuance}</p></div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className="flex-1 py-4 rounded-2xl bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">Again</button>
                  <button onClick={(e) => { e.stopPropagation(); markAsKnown(currentCard.uniqueId); }} className="flex-1 py-4 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all">Easy</button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 w-full max-w-sm flex items-center justify-between gap-4 flex-shrink-0" style={{ marginBottom: 'var(--safe-bottom)' }}>
            <button onClick={prevCard} className="p-4 rounded-2xl bg-slate-900/50 text-slate-500 active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
            <button onClick={shuffleDeck} className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-blue-400 active:scale-95 shadow-xl group"><svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.001 0 01-15.357-2m15.357 2H15" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg><span className="text-xs font-black uppercase tracking-[0.2em]">Shuffle</span></button>
            <button onClick={nextCard} className="p-4 rounded-2xl bg-slate-900/50 text-slate-500 active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
