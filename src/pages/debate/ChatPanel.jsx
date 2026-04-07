import { useEffect, useRef } from 'react';
import SpeechBubble from './SpeechBubble';
import InputComposer from './InputComposer';

export default function ChatPanel({
  logs,
  currentStage,
  isMyTurn,
  isProSide,
  onSubmitOpening,
  openingLoading,
  openingError,
  openingSubmitted,
  openingComplete,
}) {
  const scrollRef = useRef(null);
  const hasStage1Moderator = logs.some((log) => log.stage === 1 && log.moderator);
  const openingModeratorGuide = {
    id: 'opening-moderator-guide',
    stage: 1,
    moderator: true,
    text: '1단계 입론입니다. 핵심 주장만 쓰지 말고, 웹검색으로 통계나 사례를 조금 찾아 근거를 보강해보세요. 확인한 자료가 있다면 논거에 자연스럽게 녹여서 발표하면 됩니다.',
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, currentStage]);

  return (
    <section className="rounded-[32px] border border-white/80 bg-white/60 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.04)] flex flex-col h-full overflow-hidden">
      {/* 스크롤 영역 */}
      <div
        ref={scrollRef}
        className="hide-scrollbar flex-1 overflow-y-auto p-4 space-y-4"
      >
        {currentStage === 1 && !hasStage1Moderator && (
          <SpeechBubble log={openingModeratorGuide} />
        )}
        {logs
          .filter((log) => log.stage <= currentStage)
          .map((log) => (
            <SpeechBubble key={log.id} log={log} />
          ))}
      </div>

      {/* 입력 영역 */}
      {currentStage < 5 && (
        <div className="px-3 pb-3 pt-0 bg-transparent">
          <div className={`rounded-[28px] p-2 transition-all duration-300 border shadow-sm ${
            isMyTurn
              ? isProSide
                ? 'border-blue-200 bg-blue-50/40 shadow-[0_4px_20px_rgba(59,130,246,0.08)]'
                : 'border-rose-200 bg-rose-50/40 shadow-[0_4px_20px_rgba(225,29,72,0.08)]'
              : 'border-transparent bg-white/90'
          }`}>
            <InputComposer
              isMyTurn={isMyTurn}
              isProSide={isProSide}
              currentStage={currentStage}
              onSubmitOpening={onSubmitOpening}
              openingLoading={openingLoading}
              openingError={openingError}
              openingSubmitted={openingSubmitted}
              openingComplete={openingComplete}
            />
          </div>
        </div>
      )}
    </section>
  );
}
