import { useCallback, useEffect, useRef, useState } from 'react';
import { MOCK_SPEECH_LOGS, STAGE1_ORDER } from './mockData';
import { submitUserOpening } from '../../api/debatesApi';
import { buildApiUrl } from '../../api';

// ── 글자 길이 기반 랜덤 딜레이 ────────────────────────────────────────────────
function getRenderDelay(text) {
  const base = 900;
  const byLength = Math.min((text?.length ?? 0) * 12, 2200);
  const jitter = Math.floor(Math.random() * 700);
  return base + byLength + jitter;
}

/**
 * SSE 수신 시 speakerId + stance → 표시 라벨 변환 (agentCount 기반 동적 매핑)
 *
 * 규칙:
 *   con  측 AI: agent_1 ~ agent_N           → "반대 1" ~ "반대 N"
 *   pro  측 AI: agent_(N+1) ~ agent_(2N-1)  → "찬성 1" ~ "찬성 (N-1)"
 *   사용자:     "나"
 *
 * @param {string} speakerId  - e.g. "agent_1", "agent_5", "user"
 * @param {string} stance     - "pro" | "con"
 * @param {number} agentCount - 1:1=1, 2:2=2, 3:3=3
 */
function getAgentLabel(speakerId, stance, agentCount) {
  if (!speakerId) return 'AI';
  if (speakerId === 'user' || speakerId === '사용자') return '나';
  const match = speakerId.match(/agent_(\d+)/);
  if (!match) return speakerId;
  const num = parseInt(match[1], 10);
  if (stance === 'con') return `반대 ${num}`;
  const proIndex = num - agentCount;
  return `찬성 ${proIndex}`;
}

/**
 * 토론 로그 훅 — 에이전트 발언을 큐로 순차 렌더링하고 마지막에 사용자 입력을 받는다.
 *
 * 반환값:
 *   logs             — 현재 화면에 표시할 로그 배열
 *   isTyping         — 타이핑 중인 발화자 이름 (null이면 미표시)
 *   awaitingUserTurn — 에이전트 큐가 끝나 사용자 입력을 받을 수 있는 상태
 *   openingComplete  — 사용자가 입론을 제출해 입론 단계가 끝난 상태
 *   error            — 오류 메시지
 *   submitOpening    — 사용자 입론 제출 함수
 */
export function useDebateLogs(sessionId, agentCount = 2, userStance = 'pro') {
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [isTyping, setIsTyping] = useState(null);          // null | string
  const [awaitingUserTurn, setAwaitingUserTurn] = useState(false);
  const [openingComplete, setOpeningComplete] = useState(false);
  const [debateComplete, setDebateComplete] = useState(false);
  const [error, setError] = useState(null);

  const queueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const queueAwaitUserRef = useRef(false);
  const queueOnCompleteRef = useRef(null);
  const timerRef = useRef(null);
  const esRef = useRef(null);

  // ── 타이머 정리 ─────────────────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── SSE 정리 ────────────────────────────────────────────────────────────────
  const closeEventSource = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
  }, []);

  // ── 큐 재생 ─────────────────────────────────────────────────────────────────
  // useRef로 최신 함수 참조를 유지해 stale closure를 방지한다
  const playNextRef = useRef(null);
  playNextRef.current = () => {
    if (queueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsTyping(null);
      setAwaitingUserTurn(queueAwaitUserRef.current);
      // 큐 완료 콜백 실행
      const cb = queueOnCompleteRef.current;
      queueOnCompleteRef.current = null;
      cb?.();
      return;
    }

    isPlayingRef.current = true;
    const next = queueRef.current.shift();

    if (next.moderator) {
      timerRef.current = setTimeout(() => {
        setVisibleLogs((prev) => [...prev, next]);
        timerRef.current = setTimeout(() => playNextRef.current?.(), 450);
      }, 300);
      return;
    }

    // 타이핑 인디케이터 표시
    setIsTyping(next.speaker ?? '...');

    const delay = getRenderDelay(next.text ?? '');
    timerRef.current = setTimeout(() => {
      setIsTyping(null);
      setVisibleLogs((prev) => [...prev, next]);
      // 다음 메시지 전 짧은 pause
      timerRef.current = setTimeout(() => playNextRef.current?.(), 350);
    }, delay);
  };

  const startQueue = useCallback((agentLogs, options = {}) => {
    queueRef.current = [...agentLogs];
    queueAwaitUserRef.current = options.awaitUser ?? false;
    queueOnCompleteRef.current = options.onComplete ?? null;
    setAwaitingUserTurn(false);
    if (!isPlayingRef.current) {
      playNextRef.current?.();
    }
  }, []);

  // ── 상태 초기화 ─────────────────────────────────────────────────────────────
  const resetState = useCallback(() => {
    clearTimer();
    closeEventSource();
    queueRef.current = [];
    isPlayingRef.current = false;
    queueAwaitUserRef.current = false;
    queueOnCompleteRef.current = null;
    setVisibleLogs([]);
    setIsTyping(null);
    setAwaitingUserTurn(false);
    setOpeningComplete(false);
    setDebateComplete(false);
    setError(null);
  }, [clearTimer, closeEventSource]);

  // ── Mock 모드 ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionId) return;

    resetState();

    const userTurnIdx = STAGE1_ORDER.findIndex((e) => e.isUser);
    const moderatorLogs = MOCK_SPEECH_LOGS.filter((l) => l.moderator && l.stage === 1);
    const agentLogs = MOCK_SPEECH_LOGS.filter(
      (l) => l.stage === 1 && !l.moderator && l.turnNumber !== userTurnIdx,
    );

    // 사회자 발언은 즉시 표시
    setVisibleLogs(moderatorLogs);

    // 짧은 초기 지연 후 에이전트 큐 시작
    timerRef.current = setTimeout(() => {
      startQueue(agentLogs, { awaitUser: true });
    }, 800);

    return () => clearTimer();
  }, [sessionId, resetState, startQueue, clearTimer]);

  // ── SSE 모드 ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;

    resetState();

    const es = new EventSource(buildApiUrl(`/api/debates/${sessionId}/opening/run`));
    esRef.current = es;

    es.onmessage = (event) => {
      let raw;
      try { raw = JSON.parse(event.data); } catch { return; }

      if (raw.type === 'done') {
        closeEventSource();
        return;
      }

      // SSE로 받은 로그를 큐에 추가하고 큐 재생
      const stance = raw.stance?.toLowerCase() ?? 'pro';
      const log = {
        id: raw.turn,
        stage: 1,
        side: stance,
        speaker: getAgentLabel(raw.speakerId, stance, agentCount),
        type: '입론',
        turnNumber: raw.turn,
        phase: raw.phase,
        toolsUsed: [],
        text: raw.content,
      };
      queueRef.current.push(log);
      queueAwaitUserRef.current = true;
      if (!isPlayingRef.current) {
        playNextRef.current?.();
      }
    };

    es.onerror = () => {
      setError('SSE 연결 오류');
      closeEventSource();
    };

    return () => {
      clearTimer();
      closeEventSource();
    };
  }, [sessionId, resetState, closeEventSource, clearTimer]);

  // ── 사용자 입론 제출 ─────────────────────────────────────────────────────────
  const submitOpening = useCallback(
    async (content) => {
      // 사용자 입론 로그 생성 — Mock(STAGE1_ORDER) vs SSE(agentCount 기반) 분기
      const userLog = sessionId
        ? {
            id: `user-opening-${Date.now()}`,
            stage: 1,
            side: userStance,
            speaker: '나',
            type: '입론',
            turnNumber: agentCount === 1 ? 1 : agentCount === 3 ? 4 : 3, // 1:1→1, 3:3→4, 2:2→3
            phase: 'opening',
            toolsUsed: [],
            text: content,
            isUser: true,
          }
        : (() => {
            const userEntry = STAGE1_ORDER.find((e) => e.isUser);
            return {
              id: `user-opening-${Date.now()}`,
              stage: 1,
              side: userEntry?.side ?? 'pro',
              speaker: userEntry?.label ?? '나',
              type: '입론',
              turnNumber: STAGE1_ORDER.findIndex((e) => e.isUser),
              phase: 'opening',
              toolsUsed: [],
              text: content,
              isUser: true,
            };
          })();
      setVisibleLogs((prev) => [...prev, userLog]);
      setAwaitingUserTurn(false);
      setOpeningComplete(true);

      if (!sessionId) {
        const postOpeningLogs = MOCK_SPEECH_LOGS.filter((log) => log.stage >= 2);
        timerRef.current = setTimeout(() => {
          startQueue(postOpeningLogs, {
            awaitUser: false,
            onComplete: () => setDebateComplete(true),
          });
        }, 700);
        return;
      }

      if (sessionId) {
        try {
          await submitUserOpening({ sessionId, content });
        } catch (e) {
          setError(e?.message ?? '입론 제출 중 오류가 발생했습니다.');
        }
      }
    },
    [sessionId, startQueue],
  );

  return {
    logs: visibleLogs,
    isTyping,
    awaitingUserTurn,
    openingComplete,
    debateComplete,
    openingSubmitted: openingComplete, // 하위 호환
    loading: isTyping !== null,        // isTyping이 state라 reactive함
    error,
    submitOpening,
  };
}
