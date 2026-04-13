// 토론 API는 SSE 스트리밍 방식으로 useDebateLogs 훅 내부에서 직접 처리합니다.
// POST /api/debates          → 토론 생성 + AI 입론 스트리밍
// POST /api/debates/:id/submit → 사용자 입력 제출 + 이후 AI 응답 스트리밍
// GET  /api/debates/:id/state  → 상태 조회 (필요 시 사용)

import { apiFetch } from './index';

export const getDebateState = (sessionId) =>
  apiFetch(`/api/debates/${sessionId}/state`);
