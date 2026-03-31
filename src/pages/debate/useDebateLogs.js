import { useCallback, useEffect, useRef, useState } from 'react';
import { MOCK_SPEECH_LOGS, STAGE1_ORDER } from './mockData';
import { submitUserOpening } from '../../api/debatesApi';
import { buildApiUrl } from '../../api';

/**
 * opening phase SSE 응답을 UI 로그 형식으로 변환
 * - turn 값으로 STAGE1_ORDER에서 표시 이름(찬성 1, 반대 1 등)을 가져옴
 */
function transformOpeningLog(raw) {
  const orderEntry = STAGE1_ORDER[raw.turn];
  return {
    id: raw.turn,
    stage: 1,
    side: raw.stance.toLowerCase(),          // "PRO" → "pro"
    speaker: orderEntry?.label ?? raw.speakerId,
    type: '입론',
    turnNumber: raw.turn,
    phase: raw.phase,
    toolsUsed: [],
    text: raw.content,
    targetId: raw.targetId ?? null,
  };
}

function buildUserOpeningLog(content) {
  return {
    id: `user-opening-${Date.now()}`,
    stage: 1,
    side: 'con',
    speaker: '반대 2 (나)',
    type: '입론',
    turnNumber: null,
    phase: 'opening',
    toolsUsed: [],
    text: content,
    targetId: null,
  };
}

/**
 * 토론 로그를 가져오는 훅.
 * - sessionId가 없으면 Mock 데이터 반환
 * - sessionId가 있으면 SSE(text/event-stream)로 opening 단계 수신
 *
 * @param {string|null} sessionId - 백엔드 debate session ID
 */
export function useDebateLogs(sessionId) {
  const [logs, setLogs] = useState(MOCK_SPEECH_LOGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openingSubmitted, setOpeningSubmitted] = useState(false);
  const [openingComplete, setOpeningComplete] = useState(false);
  const esRef = useRef(null);

  const closeEventSource = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
  }, []);

  const runOpeningStream = useCallback(() => {
    if (!sessionId) return;

    closeEventSource();
    setLoading(true);
    setError(null);

    const es = new EventSource(buildApiUrl(`/api/debates/${sessionId}/opening/run`));
    esRef.current = es;

    es.onmessage = (event) => {
      let raw;
      try {
        raw = JSON.parse(event.data);
      } catch {
        return;
      }

      if (raw.type === 'done') {
        setLoading(false);
        closeEventSource();
        return;
      }

      setLogs((prev) => [...prev, transformOpeningLog(raw)]);

      if (raw.phase === 'chained_rebuttal') {
        setOpeningComplete(true);
        setLoading(false);
        closeEventSource();
      }
    };

    es.onerror = () => {
      setError('SSE 연결 오류');
      setLoading(false);
      closeEventSource();
    };
  }, [sessionId, closeEventSource]);

  const submitOpening = useCallback(async (content) => {
    if (!sessionId) {
      setError('세션이 없어 입론을 제출할 수 없습니다.');
      return null;
    }

    try {
      setError(null);
      const response = await submitUserOpening({ sessionId, content });
      setOpeningSubmitted(true);
      setLogs((prev) => [...prev, buildUserOpeningLog(content)]);

      if (response?.phase === 'chained_rebuttal') {
        setOpeningComplete(true);
        setLoading(false);
      } else {
        runOpeningStream();
      }

      return response;
    } catch (e) {
      setError(e?.message ?? '입론 제출 중 오류가 발생했습니다.');
      throw e;
    }
  }, [sessionId, runOpeningStream]);

  useEffect(() => {
    if (!sessionId) {
      closeEventSource();
      setLogs(MOCK_SPEECH_LOGS);
      setLoading(false);
      setError(null);
      setOpeningSubmitted(false);
      setOpeningComplete(false);
      return;
    }

    setLogs([]);
    setLoading(false);
    setError(null);
    setOpeningSubmitted(false);
    setOpeningComplete(false);

    return () => {
      closeEventSource();
    };
  }, [sessionId, closeEventSource]);

  return { logs, loading, error, openingSubmitted, openingComplete, submitOpening };
}
