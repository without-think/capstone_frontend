import { apiFetch } from './index';

export const submitUserOpening = ({ sessionId, content }) => {
  return apiFetch(`/api/debates/${sessionId}/opening/user`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
};
