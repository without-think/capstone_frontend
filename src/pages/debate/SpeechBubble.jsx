import { TYPE_STYLES } from './mockData';
import { renderMarkdown } from './markdownRenderer';

export default function SpeechBubble({ log }) {
  if (log.moderator) {
    return (
      <div className="flex flex-col items-center gap-1 py-0.5">
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-stone-200/60" />
          <span className="text-[10px] font-bold text-stone-400 shrink-0">사회자 · {log.time}</span>
          <div className="flex-1 h-px bg-stone-200/60" />
        </div>
        <p className="text-[12px] font-medium text-stone-500 leading-relaxed text-center max-w-[90%] bg-stone-100/60 rounded-2xl px-4 py-2.5">
          {log.text}
        </p>
      </div>
    );
  }

  const isMine = log.speaker.includes('나');

  return (
    <div className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[85%] ${isMine ? 'items-end' : 'items-start'}`}>

        {/* 이름 및 시각 */}
        <div className={`flex items-center gap-2 mb-1 px-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className={`text-[11px] font-bold ${isMine ? 'text-stone-800' : 'text-stone-600'}`}>
            {log.speaker}
          </span>
          <span className="text-[10px] font-semibold text-stone-400">{log.time}</span>
        </div>

        {/* 말풍선 */}
        <div className={`relative px-4 py-3 text-[13px] leading-relaxed shadow-[0_8px_20px_rgba(0,0,0,0.03)] ${
          isMine
            ? 'bg-stone-800 text-white rounded-[20px] rounded-tr-[6px]'
            : 'bg-white/94 border border-white/80 text-stone-800 rounded-[20px] rounded-tl-[6px] backdrop-blur-sm'
        }`}>
          {/* 상단 배지 행: 유형 + 논증 구조 */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              isMine ? 'bg-white/20 text-white' : TYPE_STYLES[log.type] || 'bg-stone-100 text-stone-600'
            }`}>
              {log.type}
            </span>
            <span className={`text-[10px] font-semibold ${isMine ? 'text-white/50' : 'text-stone-400'}`}>
              {log.speaker} → {log.stage === 2 ? '상대 토론자' : '전체 토론자'}
            </span>
          </div>

          {/* 본문 */}
          <div className="font-medium text-[13px]">
            {renderMarkdown(log.text, isMine)}
          </div>
        </div>
      </div>
    </div>
  );
}
