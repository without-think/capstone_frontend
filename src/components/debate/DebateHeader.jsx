import { useEffect, useRef } from 'react';

const STAGE_ORDER = ['입론', '연쇄논박', '자유논박', '역할반전', '종합'];
const STEP_TO_IDX = { '입론': 0, '연쇄논박': 1, '반박': 1, '자유논박': 2, '역할반전': 3, '종합': 4 };

const SIDE_STYLE = {
  pro:   { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  con:   { bg: 'bg-rose-100',   text: 'text-rose-700',   dot: 'bg-rose-400' },
  cross: { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400' },
  USER:  { bg: 'bg-stone-200',  text: 'text-stone-700',  dot: 'bg-stone-500' },
};

const DebateHeader = ({ topic, currentTurnData, turns, turnIdx }) => {
  const { step, turn, total, speaker, type } = currentTurnData;
  const stageIdx = STEP_TO_IDX[step] ?? 0;
  const isMyTurn = type === 'USER';
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current?.querySelector(`[data-turn="${turnIdx}"]`);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [turnIdx]);

  return (
    <div className="shrink-0 bg-white/70 backdrop-blur-md border-b border-stone-200/70 px-8 py-4">
      <div className="max-w-7xl mx-auto">

        {/* 주제 + 턴 뱃지 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider mb-0.5">토론 주제</p>
            <h2 className="text-stone-800 font-bold text-lg leading-tight">{topic}</h2>
          </div>
          <span className={`mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap
            ${isMyTurn ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-500'}`}>
            {isMyTurn && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
            턴 {turn}/{total} · {isMyTurn ? `${speaker}(나) 발언 차례` : `${speaker} 발언 중`}
          </span>
        </div>

        {/* 5단계 진행 바 */}
        <div className="flex items-center mb-4">
          {STAGE_ORDER.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i < stageIdx ? 'bg-blue-400' :
                  i === stageIdx ? 'bg-blue-500 ring-[3px] ring-blue-100' :
                  'bg-stone-200'
                }`} />
                <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                  i === stageIdx ? 'text-blue-600 font-semibold' : 'text-stone-400'
                }`}>{s}</span>
              </div>
              {i < STAGE_ORDER.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-4 ${i < stageIdx ? 'bg-blue-300' : 'bg-stone-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* 상세 턴 순서 — 현재 단계 턴만 표시 */}
        {turns && (
          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1"
          >
            {turns.filter(t => t.stageIdx === stageIdx).map((t) => {
              const i = turns.indexOf(t);
              const isPast    = i < turnIdx;
              const isCurrent = i === turnIdx;
              const isUser    = t.type === 'USER';
              const sideKey   = t.side === 'cross' ? 'cross' : isUser ? 'USER' : t.side;
              const style     = SIDE_STYLE[sideKey] ?? SIDE_STYLE.cross;

              const subLabel = t.desc
                ? t.desc
                : t.cycle
                ? `${t.cycle}R`
                : t.reversed
                ? `(${t.side === 'pro' ? '찬성역' : '반대역'})`
                : null;

              return (
                <div
                  key={t.turn}
                  data-turn={i}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all duration-300
                    ${isCurrent
                      ? `${style.bg} ${style.text} border-transparent shadow-sm scale-105 ring-2 ring-offset-1 ${isUser ? 'ring-stone-400' : sideKey === 'pro' ? 'ring-blue-300' : sideKey === 'con' ? 'ring-rose-300' : 'ring-amber-300'}`
                      : isPast
                      ? 'bg-stone-50 text-stone-300 border-stone-100 opacity-50'
                      : 'bg-white/60 text-stone-400 border-stone-200'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCurrent ? style.dot : isPast ? 'bg-stone-300' : 'bg-stone-200'}`} />
                  <span className="text-[10px] text-inherit opacity-60 font-normal">{t.turn}</span>
                  <span>{t.speaker}</span>
                  {isUser && <span className="text-[10px] opacity-70">(나)</span>}
                  {subLabel && <span className="text-[10px] opacity-60 font-normal">{subLabel}</span>}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default DebateHeader;
