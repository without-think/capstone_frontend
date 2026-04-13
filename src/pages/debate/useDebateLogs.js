import { useCallback, useEffect, useRef, useState } from 'react';
import { MOCK_SPEECH_LOGS, STAGE1_ORDER } from './mockData';
import { buildApiUrl } from '../../api';

// ── 글자 길이 기반 랜덤 딜레이 ────────────────────────────────────────────────
function getRenderDelay(text) {
  const base = 900;
  const byLength = Math.min((text?.length ?? 0) * 12, 2200);
  const jitter = Math.floor(Math.random() * 700);
  return base + byLength + jitter;
}

// ── fetch 기반 SSE 읽기 (POST 지원) ─────────────────────────────────────────
// EventSource는 GET만 지원하므로 fetch + ReadableStream으로 구현
async function* readSSE(url, options, signal) {
  const res = await fetch(url, { ...options, signal });
  if (!res.ok) throw new Error(`SSE ${res.status}: ${url}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE는 빈 줄('\n\n')로 이벤트를 구분
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop(); // 마지막 미완성 블록은 다음 청크로 이월

      for (const block of blocks) {
        if (!block.trim()) continue;
        const lines = block.split('\n');
        let eventType = 'message';
        let data = '';
        for (const line of lines) {
          if (line.startsWith('event:')) eventType = line.slice(6).trim();
          else if (line.startsWith('data:')) data += line.slice(5).trim();
        }
        if (data) yield { type: eventType, data };
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ── SSE entry → log 객체 변환 ────────────────────────────────────────────────
function getAgentLabel(speakerId, stance, agentCount) {
  if (!speakerId) return 'AI';
  if (speakerId === 'user' || speakerId === '사용자') return '나';
  const match = speakerId.match(/agent_(\d+)/);
  if (!match) return speakerId;
  const num = parseInt(match[1], 10);
  if (stance === 'con') return `반대 ${num}`;
  return `찬성 ${num - agentCount}`;
}

function buildLogFromSSE(raw, agentCount) {
  const stance = raw.stance?.toLowerCase() ?? 'pro';
  return {
    id: raw.turn ?? `entry-${Date.now()}`,
    stage: raw.stage ?? 1,
    side: stance,
    speaker: getAgentLabel(raw.speakerId, stance, agentCount),
    type: raw.type ?? '입론',
    turnNumber: raw.turn,
    text: raw.content,
  };
}

/**
 * 토론 로그 훅
 *
 * @param {object|null} debateParams  - null이면 Mock 모드, object이면 SSE 모드
 *   SSE 모드 예시: { topicId, agentCount, userStance, ... }
 * @param {number} agentCount
 * @param {string} userStance  - 'pro' | 'con'
 *
 * 반환값:
 *   logs             — 화면에 표시할 로그 배열
 *   isTyping         — 타이핑 중인 발화자 이름 (null이면 미표시)
 *   awaitingUserTurn — 사용자 입력 받을 수 있는 상태
 *   openingComplete  — 입론 단계 완료
 *   debateComplete   — 전체 토론 완료
 *   sessionId        — SSE에서 수신한 세션 ID (mock은 null)
 *   error            — 오류 메시지
 *   submitOpening    — 사용자 입론 제출 함수
 */
export function useDebateLogs(debateParams, agentCount = 2, userStance = 'pro') {
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [isTyping, setIsTyping] = useState(null);
  const [awaitingUserTurn, setAwaitingUserTurn] = useState(false);
  const [openingComplete, setOpeningComplete] = useState(false);
  const [debateComplete, setDebateComplete] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const queueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const queueAwaitUserRef = useRef(false);
  const queueOnCompleteRef = useRef(null);
  const timerRef = useRef(null);
  const abortRef = useRef(null);

  // ── 타이머 정리 ─────────────────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  // ── 큐 재생 ─────────────────────────────────────────────────────────────────
  const playNextRef = useRef(null);
  playNextRef.current = () => {
    if (queueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsTyping(null);
      setAwaitingUserTurn(queueAwaitUserRef.current);
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

    setIsTyping(next.speaker ?? '...');
    const delay = getRenderDelay(next.text ?? '');
    timerRef.current = setTimeout(() => {
      setIsTyping(null);
      setVisibleLogs((prev) => [...prev, next]);
      timerRef.current = setTimeout(() => playNextRef.current?.(), 350);
    }, delay);
  };

  const startQueue = useCallback((logs, options = {}) => {
    queueRef.current = [...logs];
    queueAwaitUserRef.current = options.awaitUser ?? false;
    queueOnCompleteRef.current = options.onComplete ?? null;
    setAwaitingUserTurn(false);
    if (!isPlayingRef.current) playNextRef.current?.();
  }, []);

  // ── 상태 초기화 ─────────────────────────────────────────────────────────────
  const resetState = useCallback(() => {
    clearTimer();
    abortRef.current?.abort();
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
    setSessionId(null);
  }, [clearTimer]);

  // ── Mock 모드 ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (debateParams) return;

    resetState();

    const userTurnIdx = STAGE1_ORDER.findIndex((e) => e.isUser);
    const moderatorLogs = MOCK_SPEECH_LOGS.filter((l) => l.moderator && l.stage === 1);
    const agentLogs = MOCK_SPEECH_LOGS.filter(
      (l) => l.stage === 1 && !l.moderator && l.turnNumber !== userTurnIdx,
    );

    setVisibleLogs(moderatorLogs);
    timerRef.current = setTimeout(() => {
      startQueue(agentLogs, { awaitUser: true });
    }, 800);

    return () => clearTimer();
  }, [debateParams, resetState, startQueue, clearTimer]);

  // ── SSE 모드: POST /api/debates ──────────────────────────────────────────────
  // debateParams가 있으면 fetch+ReadableStream으로 SSE 수신
  useEffect(() => {
    if (!debateParams) return;

    resetState();

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      try {
        for await (const { type, data } of readSSE(
          buildApiUrl('/api/debates'),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
            body: JSON.stringify(debateParams),
          },
          ctrl.signal,
        )) {
          const raw = JSON.parse(data);

          if (type === 'session') {
            // 첫 번째 이벤트: 세션 ID 수신
            setSessionId(raw.sessionId);
          } else if (type === 'entry') {
            const log = buildLogFromSSE(raw, agentCount);
            queueRef.current.push(log);
            if (!isPlayingRef.current) playNextRef.current?.();
          } else if (type === 'waiting') {
            // isFinished: true → 토론 종료, false → 사용자 입력 대기
            if (raw.isFinished) {
              setDebateComplete(true);
            } else {
              queueAwaitUserRef.current = true;
              if (!isPlayingRef.current) setAwaitingUserTurn(true);
            }
          }
        }
      } catch (e) {
        if (e.name !== 'AbortError') setError(e?.message ?? 'SSE 연결 오류');
      }
    })();

    return () => ctrl.abort();
  }, [debateParams, agentCount, resetState]);

  // ── 사용자 입론 제출: POST /api/debates/{sessionId}/submit ──────────────────
  const submitOpening = useCallback(
    async (content) => {
      // 사용자 로그 즉시 표시
      const userLog = debateParams
        ? {
            id: `user-opening-${Date.now()}`,
            stage: 1,
            side: userStance,
            speaker: '나',
            type: '입론',
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
              text: content,
              isUser: true,
            };
          })();

      setVisibleLogs((prev) => [...prev, userLog]);
      setAwaitingUserTurn(false);
      setOpeningComplete(true);

      // Mock 모드: 이후 로그 재생
      if (!debateParams) {
        const postOpeningLogs = MOCK_SPEECH_LOGS.filter((l) => l.stage >= 2);
        timerRef.current = setTimeout(() => {
          startQueue(postOpeningLogs, { awaitUser: false, onComplete: () => setDebateComplete(true) });
        }, 700);
        return;
      }

      // SSE 모드: POST /api/debates/{sessionId}/submit → SSE 응답 수신
      if (!sessionId) { setError('세션 ID가 없습니다.'); return; }

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        for await (const { type, data } of readSSE(
          buildApiUrl(`/api/debates/${sessionId}/submit`),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
            body: JSON.stringify({ content }),
          },
          ctrl.signal,
        )) {
          const raw = JSON.parse(data);

          if (type === 'entry') {
            const log = buildLogFromSSE(raw, agentCount);
            queueRef.current.push(log);
            if (!isPlayingRef.current) playNextRef.current?.();
          } else if (type === 'waiting') {
            if (raw.isFinished) {
              setDebateComplete(true);
            } else {
              queueAwaitUserRef.current = true;
              if (!isPlayingRef.current) setAwaitingUserTurn(true);
            }
          }
        }
      } catch (e) {
        if (e.name !== 'AbortError') setError(e?.message ?? '제출 중 오류가 발생했습니다.');
      }
    },
    [debateParams, sessionId, userStance, agentCount, startQueue],
  );

  return {
    logs: visibleLogs,
    isTyping,
    awaitingUserTurn,
    openingComplete,
    debateComplete,
    openingSubmitted: openingComplete,
    loading: isTyping !== null,
    error,
    sessionId,
    submitOpening,
  };
}
