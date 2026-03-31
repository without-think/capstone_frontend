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
