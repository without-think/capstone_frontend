import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const DEBATE_STORAGE_KEY = 'capstone_debate_session';
function clearDebateStorage() {
  try { sessionStorage.removeItem(DEBATE_STORAGE_KEY); } catch {}
}

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
} from './mockData';

const STAGE_TO_PHASE = {
  1: 'opening',
  2: 'chained_rebuttal',
  3: 'free_rebuttal',
  4: 'role_reversal',
  5: 'synthesis',
};

/**
 * @param {function} onBack       - 뒤로가기 콜백
 * @param {function} onExit       - 토론 종료 후 다음 단계 이동 콜백
 * @param {object|null} debateParams - POST /api/debates 요청 바디 (null이면 Mock 사용)
 *   예: { topic, userStance, userIntensity, debateFormat, agentIntensities, maxCycle }
 */
export default function DebatePage({
  onBack = () => console.log('back'),
  onExit = () => console.log('exit'),
  debateParams = null,
  preparedSessionId = null,
  agentCount = 2,
  userStance = 'pro',
}) {
  const [currentStage, setCurrentStage] = useState(1);
  const [viewStage, setViewStage] = useState(1); // 스테퍼에서 선택한 단계 (보기용)
  const [stage1TurnIdx] = useState(3);
  const [stage2Round]   = useState(2);
  const [stage3Cycle]   = useState(1);
  const [myTurnOverride, setMyTurnOverride] = useState(true);
  const [stage3Opponent, setStage3Opponent] = useState(null);
  const expectedOpponentCount = Math.max(
    1,
    Number(String(debateParams?.debateFormat ?? '').split(':')[0]) || agentCount || 1,
  );

  const {
    logs,
    loading,
    error,
    isTyping,
    awaitingUserTurn,
    submitOpening,
    openingSubmitted,
    openingComplete,
    debateComplete,
    waitingFor,
    stage3CanAttack,
    liveAnalysis,
    submitTurn,
  } = useDebateLogs(debateParams, agentCount, userStance, preparedSessionId);

  const summarizeOpening = (text) => {
    if (!text) return '입론 요약 정보가 없습니다.';
    const stripped = text
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/#+\s*/g, ' ')
      .replace(/\*\*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const firstSentence = stripped.split(/[.!?]\s/)[0]?.trim();
    const summary = firstSentence && firstSentence.length > 10 ? firstSentence : stripped;
    return summary.length > 110 ? `${summary.slice(0, 110)}...` : summary;
  };

  const stage3Opponents = useMemo(() => {
    const opponentSide = userStance === 'pro' ? 'con' : 'pro';
    const openingLogs = logs.filter((log) => log.stage === 1 && !log.moderator && !log.isUser);
    const deduped = openingLogs
      .filter((log) => log.side === opponentSide)
      .filter((log, index, arr) => {
        const key = String(log.speaker ?? log.id);
        return arr.findIndex((x) => String(x.speaker ?? x.id) === key) === index;
      })
      .map((log) => ({
        id: String(log.speaker ?? log.id),
        label: String(log.speaker ?? '상대'),
        stance: summarizeOpening(log.text),
      }));

    return deduped.slice(0, expectedOpponentCount);
  }, [logs, userStance, expectedOpponentCount]);

  useEffect(() => {
    if (currentStage !== 3 || stage3Opponent) return;
    if (expectedOpponentCount === 1 && stage3Opponents.length >= 1) {
      setStage3Opponent(stage3Opponents[0]);
      return;
    }
    if (stage3Opponents.length === 1) {
      setStage3Opponent(stage3Opponents[0]);
    }
  }, [currentStage, stage3Opponents, stage3Opponent, expectedOpponentCount]);

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

  // waitingFor → 자동 단계 전환 및 사용자 턴 활성화
  useEffect(() => {
    if (!waitingFor) return;
    const WAITING_TO_STAGE = {
      user_opening: 1,
      user_rebuttal: 2,
      user_free_rebuttal: 3,
      user_role_reversal: 4,
      user_synthesis: 5,
      user_finalize: 5,
      chained_rebuttal_node: 2,
      free_rebuttal_node: 3,
      role_reversal_node: 4,
      synthesis_discuss_node: 5,
    };
    const stage = WAITING_TO_STAGE[waitingFor];
    if (stage) setCurrentStage((prev) => Math.max(prev, stage));
  }, [waitingFor]);

  // currentStage가 올라가면 viewStage도 자동으로 따라옴
  useEffect(() => {
    setViewStage((prev) => (currentStage > prev ? currentStage : prev));
  }, [currentStage]);

  const isMyTurn = debateParams
    ? awaitingUserTurn
    : (currentStage === 1 || currentStage === 3)
      ? awaitingUserTurn
      : (currentStage < 5 && myTurnOverride);
  const isProSide = userStance === 'pro';
  const isRoleReversalStage = currentStage === 4;
  const effectiveIsProSide = isRoleReversalStage ? !isProSide : isProSide;
  const canUseStage3Attack = !debateParams || (waitingFor === 'user_free_rebuttal' && stage3CanAttack);

  const getTurnDesc = () => {
    if (currentStage === 1) return `입론 ${stage1TurnIdx + 1}/4 — ${STAGE1_ORDER[stage1TurnIdx].label} 발언 중`;
    if (currentStage === 2) return `연쇄 논박 ${STAGE2_ROUNDS[stage2Round].round}차 — ${STAGE2_ROUNDS[stage2Round].desc}`;
    if (currentStage === 3) return `자유 논박 ${stage3Cycle}사이클 — 사용자 ↔ ${stage3Opponent?.label ?? STAGE3_PAIRED_AGENT_LABEL}`;
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
  // SSE 모드: liveAnalysis 우선, 없으면 mock fallback
  const analysis = (debateParams && liveAnalysis) ? liveAnalysis : getSpeakerAnalysis();

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

  // 단계별 사용자 발언 제출 (stages 2~5)
  const handleSubmitTurn = (content, pendingAttack = null) => {
    const phase = STAGE_TO_PHASE[currentStage] ?? 'opening';
    submitTurn(content, phase, pendingAttack);
    setMyTurnOverride(false);
  };

  const mergedLogs = logs;
  const showStage3Modal =
    currentStage === 3 &&
    !stage3Opponent &&
    expectedOpponentCount > 1 &&
    stage3Opponents.length > 1;

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
        <Stage3OpponentModal
          opponents={stage3Opponents}
          onSelect={(opp) => setStage3Opponent(opp)}
        />
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
              waitingFor={waitingFor}
              isFinalize={waitingFor === 'user_finalize'}
              isMyTurn={isMyTurn}
              isProSide={effectiveIsProSide}
              stage3CanAttack={canUseStage3Attack}
              isTyping={isTyping}
              onSubmitOpening={submitOpening}
              openingLoading={loading}
              openingError={error}
              openingSubmitted={openingSubmitted}
              openingComplete={openingComplete}
              onSubmitTurn={handleSubmitTurn}
              stage3Opponent={stage3Opponent}
            />
          </div>

          {/* 오른쪽: 사이드바 */}
          <aside className="hidden lg:flex lg:min-h-0 lg:flex-col lg:gap-4 lg:overflow-y-auto hide-scrollbar">
            <StepperPanel
              currentStage={currentStage}
              viewStage={viewStage}
              setViewStage={setViewStage}
              onScrollToStage={(stageId) => {
                const el = document.getElementById(`stage-anchor-${stageId}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
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
            <ConflictBarPanel
              currentStage={currentStage}
              liveProPercent={liveAnalysis?.proPercent ?? null}
              liveConPercent={liveAnalysis?.conPercent ?? null}
            />
          </aside>

        </div>

        <div className={`fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] sm:bottom-10 ${
          debateComplete ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-90 pointer-events-none'
        }`}>
          {debateComplete && (
            <button
              type="button"
              onClick={() => { clearDebateStorage(); onExit(); }}
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
