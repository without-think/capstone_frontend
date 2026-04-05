import { TYPE_STYLES } from './mockData';
import { renderMarkdown } from './markdownRenderer';

export default function SpeechBubble({ log }) {
  if (log.moderator) {
    return (
      <div className="flex flex-col items-center gap-1 py-0.5">
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-stone-200/60" />
          <span className="text-[12px] font-bold text-stone-400 shrink-0">사회자</span>
          <div className="flex-1 h-px bg-stone-200/60" />
        </div>
        <p className="text-[14px] font-medium text-stone-500 leading-relaxed text-center max-w-[92%] px-2 py-1">
          {log.text}
        </p>
      </div>
    );
  }

  const isMine = log.speaker.includes('나');
  const speakerShortLabel = log.speaker
    .replace('찬성', '찬')
    .replace('반대', '반')
    .replace(' (나)', '');
  const avatarTone = isMine
    ? 'bg-stone-800 text-white'
    : log.side === 'pro'
      ? 'bg-blue-100 text-blue-700 border border-blue-200'
      : 'bg-rose-100 text-rose-700 border border-rose-200';
  const bubbleTone = isMine
    ? 'bg-stone-800 text-white rounded-[20px] rounded-tr-[6px]'
    : log.side === 'pro'
      ? 'bg-white/94 border border-blue-300/90 text-stone-800 rounded-[20px] rounded-tl-[6px] backdrop-blur-sm'
      : 'bg-white/94 border border-rose-300/90 text-stone-800 rounded-[20px] rounded-tl-[6px] backdrop-blur-sm';
  const bubbleMetaTone = isMine ? 'text-white/50' : 'text-stone-400';
  const typeBadgeTone = isMine ? 'bg-white/20 text-white' : TYPE_STYLES[log.type] || 'bg-stone-100 text-stone-600';

  return (
    <div className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start gap-2 max-w-[88%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold ${avatarTone}`}>
          {speakerShortLabel}
        </div>
        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
          {/* 말풍선 */}
          <div className={`relative px-4 py-3 text-[15px] leading-relaxed shadow-[0_8px_20px_rgba(0,0,0,0.03)] ${bubbleTone}`}>
            {/* 상단 배지 행: 유형 + 논증 구조 */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full shrink-0 ${typeBadgeTone}`}>
                {log.type}
              </span>
              <span className={`text-[12px] font-semibold ${bubbleMetaTone}`}>
                {log.speaker} → {log.stage === 2 ? '상대 토론자' : '전체 토론자'}
              </span>
            </div>

            {/* 본문 */}
            <div className="font-medium text-[15px]">
              {renderMarkdown(log.text, isMine)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
