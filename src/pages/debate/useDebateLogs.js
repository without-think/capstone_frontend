import { useState, useEffect } from 'react';
import { MOCK_SPEECH_LOGS, STAGE1_ORDER } from './mockData';

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

  useEffect(() => {
    if (!sessionId) {
      setLogs(MOCK_SPEECH_LOGS);
      setError(null);
      return;
    }

    setLoading(true);
    setLogs([]);

    const es = new EventSource(`/api/debates/${sessionId}/opening`);

    es.onmessage = (event) => {
      const raw = JSON.parse(event.data);
      if (raw.type === 'done') {
        setLoading(false);
        es.close();
        return;
      }
      setLogs((prev) => [...prev, transformOpeningLog(raw)]);
    };

    es.onerror = () => {
      setError('SSE 연결 오류');
      setLogs(MOCK_SPEECH_LOGS);
      setLoading(false);
      es.close();
    };

    return () => {
      es.close();
    };
  }, [sessionId]);

  return { logs, loading, error };
}
