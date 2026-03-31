import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import ChatPanel from './ChatPanel';
import StepperPanel from './StepperPanel';
import AnalysisPanel from './AnalysisPanel';
import NotePanel from './NotePanel';
import { useDebateLogs } from './useDebateLogs';
import {
  STAGE1_ORDER,
  STAGE2_ROUNDS,
  STAGE3_LOOP,
  STAGE3_MAX_CYCLES,
  ANALYSIS_BY_STAGE,
} from './mockData';

/**
 * @param {function} onBack - 뒤로가기 콜백
 * @param {string|null} sessionId - 백엔드 세션 ID (  없으면 Mock 사용)
 */
export default function DebatePage({ onBack = () => console.log('back'), sessionId = null }) {
  const [currentStage, setCurrentStage] = useState(1);
  const [stage1TurnIdx] = useState(3);
  const [stage2Round]   = useState(2);
  const [stage3TurnIdx] = useState(3);
  const [stage3Cycle]   = useState(1);
  const [myTurnOverride, setMyTurnOverride] = useState(true);

  const { logs, loading, error, submitOpening, openingSubmitted, openingComplete } = useDebateLogs(sessionId);

  useEffect(() => {
    if (openingComplete) {
      setCurrentStage((prev) => (prev < 2 ? 2 : prev));
    }
  }, [openingComplete]);

  const isMyTurn  = currentStage < 5 && myTurnOverride;
  const isProSide = currentStage === 4;

  const getTurnDesc = () => {
    if (currentStage === 1) return `입론 ${stage1TurnIdx + 1}/4 — ${STAGE1_ORDER[stage1TurnIdx].label} 발언 중`;
    if (currentStage === 2) return `연쇄 논박 ${STAGE2_ROUNDS[stage2Round].round}차 — ${STAGE2_ROUNDS[stage2Round].desc}`;
    if (currentStage === 3) return `자유 논박 ${stage3Cycle}사이클 — ${STAGE3_LOOP[stage3TurnIdx].label} 발언 중`;
    if (currentStage === 4) return '역할 반전 — 반대 2 (나) → 찬성측 논리 방어';
    return '판정단 분석 진행 중';
  };

  const getProgressInfo = () => {
    if (currentStage === 1) return { label: `입론 ${stage1TurnIdx + 1}/${STAGE1_ORDER.length}`, pct: (stage1TurnIdx + 1) / STAGE1_ORDER.length };
    if (currentStage === 2) return { label: `논박 ${STAGE2_ROUNDS[stage2Round].round}/4`, pct: STAGE2_ROUNDS[stage2Round].round / 4 };
    if (currentStage === 3) return { label: `사이클 ${stage3Cycle}/${STAGE3_MAX_CYCLES}`, pct: stage3Cycle / STAGE3_MAX_CYCLES };
    return null;
  };

  const progress          = getProgressInfo();
  const analysis          = ANALYSIS_BY_STAGE[currentStage];
  const showLiveAnalysis  = currentStage === 2 || currentStage === 3;

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

      <main className="h-full p-4 lg:p-5 relative max-w-[1920px] mx-auto">

        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 shadow-sm text-stone-600 hover:scale-105 transition-transform"
        >
          <ArrowLeft size={16} />
        </button>

        {/* 메인 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-4 h-full pl-10">

          {/* 왼쪽: 채팅 패널 */}
          <div className="flex flex-col h-full min-h-0">
            <ChatPanel
              logs={logs}
              currentStage={currentStage}
              isMyTurn={isMyTurn}
              isProSide={isProSide}
              onSubmitOpening={submitOpening}
              openingLoading={loading}
              openingError={error}
              openingSubmitted={openingSubmitted}
              openingComplete={openingComplete}
            />
          </div>

          {/* 오른쪽: 사이드바 */}
          <aside className="flex flex-col gap-4 h-full min-h-0 overflow-y-auto hide-scrollbar">
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
            />
            <NotePanel />
          </aside>

        </div>
      </main>
    </div>
  );
}
