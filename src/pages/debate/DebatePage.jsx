import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import ChatPanel from './ChatPanel';
import StepperPanel from './StepperPanel';
import AnalysisPanel from './AnalysisPanel';
import ConflictBarPanel from './ConflictBarPanel';
import Stage3OpponentModal from './Stage3OpponentModal';
import { useDebateLogs } from './useDebateLogs';
import {
  STAGE1_ORDER,
  STAGE2_ROUNDS,
  STAGE3_MAX_CYCLES,
  STAGE3_PAIRED_AGENT_LABEL,
  ANALYSIS_BY_STAGE,
  ANALYSIS_BY_SPEAKER,
  STAGE3_MOCK_RESPONSES,
} from './mockData';

/**
 * @param {function} onBack - 뒤로가기 콜백
 * @param {function} onExit - 토론 종료 후 다음 단계 이동 콜백
 * @param {string|null} sessionId - 백엔드 세션 ID (  없으면 Mock 사용)
 */
export default function DebatePage({
  onBack = () => console.log('back'),
  onExit = () => console.log('exit'),
  sessionId = null,
  agentCount = 2,
  userStance = 'pro',
}) {
  const [currentStage, setCurrentStage] = useState(1);
  const [stage1TurnIdx] = useState(3);
  const [stage2Round]   = useState(2);
  const [stage3Cycle]   = useState(1);
  const [myTurnOverride, setMyTurnOverride] = useState(true);
  const [stage3Opponent, setStage3Opponent] = useState(null);
  const [stage3Messages, setStage3Messages] = useState([]);
  const [stage3Typing, setStage3Typing] = useState(null);
  const stage3ResponseIdx = useRef(0);

  const { logs, loading, error, isTyping, awaitingUserTurn, submitOpening, openingSubmitted, openingComplete, debateComplete } = useDebateLogs(sessionId, agentCount, userStance);

  useEffect(() => {
    if (openingComplete) {
      setCurrentStage((prev) => (prev < 2 ? 2 : prev));
    }
  }, [openingComplete]);

  useEffect(() => {
    const maxVisibleStage = logs.reduce((max, log) => {
      if (typeof log.stage !== 'number') return max;
      return Math.max(max, log.stage);
    }, 1);

    setCurrentStage((prev) => (maxVisibleStage > prev ? maxVisibleStage : prev));
  }, [logs]);

  // stage 1(입론): 에이전트 큐가 끝난 후 사용자 입력 활성화
  // 그 외 단계: myTurnOverride로 제어
  const isMyTurn  = currentStage === 1 ? awaitingUserTurn : (currentStage < 5 && myTurnOverride);
  const isProSide = currentStage === 4;

  const getTurnDesc = () => {
    if (currentStage === 1) return `입론 ${stage1TurnIdx + 1}/4 — ${STAGE1_ORDER[stage1TurnIdx].label} 발언 중`;
    if (currentStage === 2) return `연쇄 논박 ${STAGE2_ROUNDS[stage2Round].round}차 — ${STAGE2_ROUNDS[stage2Round].desc}`;
    if (currentStage === 3) return `자유 논박 ${stage3Cycle}사이클 — 사용자 ↔ ${STAGE3_PAIRED_AGENT_LABEL}`;
    if (currentStage === 4) return '역할 반전 — 반대 2 (나) → 찬성측 논리 방어';
    return '판정단 분석 진행 중';
  };

  const getProgressInfo = () => {
    if (currentStage === 1) return { label: `입론 ${stage1TurnIdx + 1}/${STAGE1_ORDER.length}`, pct: (stage1TurnIdx + 1) / STAGE1_ORDER.length };
    if (currentStage === 2) return { label: `논박 ${STAGE2_ROUNDS[stage2Round].round}/4`, pct: STAGE2_ROUNDS[stage2Round].round / 4 };
    if (currentStage === 3) return { label: `사이클 ${stage3Cycle}/${STAGE3_MAX_CYCLES}`, pct: stage3Cycle / STAGE3_MAX_CYCLES };
    return null;
  };

  const progress         = getProgressInfo();
  const showLiveAnalysis = currentStage < 5;

  const getSpeakerAnalysis = () => {
    if (currentStage === 1) {
      const speaker = STAGE1_ORDER[stage1TurnIdx];
      return ANALYSIS_BY_SPEAKER[speaker?.id] ?? ANALYSIS_BY_STAGE[1];
    }
    if (currentStage === 2) {
      return ANALYSIS_BY_SPEAKER[`round${stage2Round + 1}`] ?? ANALYSIS_BY_STAGE[2];
    }
    return ANALYSIS_BY_STAGE[currentStage];
  };
  const analysis = getSpeakerAnalysis();

  const getSpeakerLabel = () => {
    if (currentStage === 1) {
      const speaker = STAGE1_ORDER[stage1TurnIdx];
      return speaker ? `입론 · ${speaker.label}` : null;
    }
    if (currentStage === 2) {
      const round = STAGE2_ROUNDS[stage2Round];
      return round ? `연쇄 논박 · ${round.attackerLabel}` : null;
    }
    if (currentStage === 3) return `자유 논박 · 사이클 ${stage3Cycle}`;
    if (currentStage === 4) return '역할 반전 발언 중';
    return null;
  };
  const speakerLabel = getSpeakerLabel();

  const handleStage3Submit = (entries) => {
    // entries: [{ type, content }, ...] — 답변·공격 동시 전송
    const userMsgs = entries.map(({ type, content }, i) => ({
      id: `s3-user-${Date.now()}-${i}`,
      stage: 3,
      side: 'pro',
      speaker: '나',
      type,
      text: content,
      isUser: true,
    }));
    setStage3Messages((prev) => [...prev, ...userMsgs]);
    setMyTurnOverride(false);

    // 상대 타이핑 인디케이터
    const opponentLabel = stage3Opponent?.label ?? '상대';
    setStage3Typing(opponentLabel);

    // mock 응답 딜레이 (2~3 초)
    const delay = 2000 + Math.random() * 1000;
    setTimeout(() => {
      const resp = STAGE3_MOCK_RESPONSES[stage3ResponseIdx.current % STAGE3_MOCK_RESPONSES.length];
      stage3ResponseIdx.current += 1;
      setStage3Messages((prev) => [
        ...prev,
        {
          id: `s3-opp-${Date.now()}`,
          stage: 3,
          side: 'con',
          speaker: opponentLabel,
          type: resp.type,
          text: resp.text,
          isUser: false,
        },
      ]);
      setStage3Typing(null);
      setMyTurnOverride(true);
    }, delay);
  };

  const mergedLogs = [...logs, ...stage3Messages];
  const showStage3Modal = currentStage === 3 && !stage3Opponent;

  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(135deg,#F5F5F4,#E7E5E4)] text-stone-800 font-sans selection:bg-stone-200 selection:text-stone-900">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes subtle-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
        .animate-subtle-pulse { animation: subtle-pulse 2s ease-in-out infinite; }
      `}</style>

      {showStage3Modal && (
        <Stage3OpponentModal onSelect={(opp) => setStage3Opponent(opp)} />
      )}

      <main className="relative mx-auto h-full max-w-[1920px] p-3 sm:p-4 lg:p-5">

        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 shadow-sm text-stone-600 hover:scale-105 transition-transform"
        >
          <ArrowLeft size={16} />
        </button>

        {/* 메인 레이아웃 */}
        <div className="grid h-full grid-cols-1 gap-4 pl-10 lg:grid-cols-[2.5fr_1fr]">

          {/* 왼쪽: 채팅 패널 */}
          <div className="flex flex-col h-full min-h-0">
            <ChatPanel
              logs={mergedLogs}
              currentStage={currentStage}
              isMyTurn={isMyTurn}
              isProSide={isProSide}
              isTyping={stage3Typing ?? isTyping}
              onSubmitOpening={submitOpening}
              openingLoading={loading}
              openingError={error}
              openingSubmitted={openingSubmitted}
              openingComplete={openingComplete}
              onSubmitStage3={handleStage3Submit}
              stage3Opponent={stage3Opponent}
            />
          </div>

          {/* 오른쪽: 사이드바 */}
          <aside className="hidden lg:flex lg:min-h-0 lg:flex-col lg:gap-4 lg:overflow-y-auto hide-scrollbar">
            <StepperPanel
              currentStage={currentStage}
              setCurrentStage={setCurrentStage}
              getTurnDesc={getTurnDesc}
              progress={progress}
              isMyTurn={isMyTurn}
              myTurnOverride={myTurnOverride}
              setMyTurnOverride={setMyTurnOverride}
            />
            <AnalysisPanel
              showLiveAnalysis={showLiveAnalysis}
              analysis={analysis}
              speakerLabel={speakerLabel}
            />
            <ConflictBarPanel currentStage={currentStage} />
          </aside>

        </div>

        <div className={`fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] sm:bottom-10 ${
          debateComplete ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-90 pointer-events-none'
        }`}>
          {debateComplete && (
            <button
              type="button"
              onClick={onExit}
              className="flex items-center gap-4 rounded-full bg-stone-900 px-7 py-3.5 text-base font-bold text-white shadow-2xl transition-all hover:scale-105 hover:bg-black active:scale-95 sm:px-12 sm:py-5 sm:text-xl"
            >
              토론 종료
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
