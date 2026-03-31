import { useState, useEffect } from 'react';
import { MOCK_SPEECH_LOGS } from './mockData';

/**
 * 토론 로그를 가져오는 훅.
 * - sessionId가 없으면 Mock 데이터 반환
 * - sessionId가 있으면 백엔드 API에서 폴링
 *
 * @param {string|null} sessionId - 백엔드 debate session ID
 * @param {number} pollInterval - 폴링 주기(ms), 기본 3000
 */
export function useDebateLogs(sessionId, pollInterval = 3000) {
  const [logs, setLogs] = useState(MOCK_SPEECH_LOGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setLogs(MOCK_SPEECH_LOGS);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/debate/sessions/${sessionId}/messages`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setLogs(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLogs(MOCK_SPEECH_LOGS); // 오류 시 Mock으로 폴백
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, pollInterval);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId, pollInterval]);

  return { logs, loading, error };
}
