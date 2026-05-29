import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Sparkles } from 'lucide-react';
import { getAssistantGuide } from '../../api/debatesApi';

const PHASE_LABEL = {
  opening: '입론',
  chained_rebuttal: '연쇄 논박',
  free_rebuttal: '자유 논박',
  role_reversal: '역할 반전',
  synthesis: '종합',
};

// waitingFor → phase 매핑
const WAITING_TO_PHASE = {
  user_opening: 'opening',
  user_rebuttal: 'chained_rebuttal',
  user_free_rebuttal: 'free_rebuttal',
  user_role_reversal: 'role_reversal',
  user_synthesis: 'synthesis',
};

function LinkItem({ title, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-2 rounded-xl bg-stone-50 px-3 py-2.5 text-[12px] font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-800 group"
    >
      <ExternalLink size={11} className="mt-0.5 shrink-0 text-stone-400 group-hover:text-stone-600" />
      <span className="line-clamp-2 leading-relaxed">{title}</span>
    </a>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-3 bg-stone-200/80 rounded-full w-full" />
      <div className="h-3 bg-stone-200/80 rounded-full w-5/6" />
      <div className="h-3 bg-stone-200/80 rounded-full w-4/5" />
      <div className="mt-3 h-3 bg-stone-200/80 rounded-full w-full" />
      <div className="h-3 bg-stone-200/80 rounded-full w-3/4" />
    </div>
  );
}

/**
 * 내 차례가 됐을 때 어시스턴트 "비비드"의 단계별 안내문을 표시하는 패널.
 *
 * @param {string|null} sessionId - 현재 토론 세션 ID (null이면 패널 숨김)
 * @param {string|null} waitingFor - useDebateLogs의 waitingFor 값
 * @param {string|null} opponentId - 자유논박 상대 agent_id
 */
export default function AssistantGuidePanel({ sessionId, waitingFor, opponentId }) {
  const [text, setText] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activePhase, setActivePhase] = useState(null);
  const fetchedRef = useRef(null); // 중복 fetch 방지

  const phase = WAITING_TO_PHASE[waitingFor] ?? null;
  const isVisible = !!(sessionId && phase);

  useEffect(() => {
    if (!isVisible) return;

    // 같은 phase+opponent 조합이면 재요청 안 함
    const key = `${sessionId}:${phase}:${opponentId ?? ''}`;
    if (fetchedRef.current === key) return;
    fetchedRef.current = key;

    setLoading(true);
    setText('');
    setLinks([]);
    setActivePhase(phase);
    setCollapsed(false);

    console.log(`[Assistant] 안내문 요청: sessionId=${sessionId} phase=${phase} opponentId=${opponentId ?? 'none'}`);
    getAssistantGuide(sessionId, phase, opponentId)
      .then((data) => {
        console.log(`[Assistant] 안내문 수신 완료: phase=${phase}`);
        setText(data.text ?? '');
        setLinks(Array.isArray(data.links) ? data.links : []);
      })
      .catch((e) => {
        console.error(`[Assistant] 안내문 요청 실패: phase=${phase}`, e);
        setText('안내문을 불러오지 못했어. 잠깐 뒤에 다시 시도해봐.');
      })
      .finally(() => setLoading(false));
  }, [isVisible, sessionId, phase, opponentId]);

  if (!isVisible) return null;

  return (
    <section className="rounded-[32px] border border-white/80 bg-white/60 p-5 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900">
            <Sparkles size={12} className="text-white" />
          </div>
          <div>
            <span className="text-[13px] font-extrabold text-stone-800">비비드</span>
            {activePhase && (
              <span className="ml-1.5 text-[11px] font-semibold text-stone-400">
                · {PHASE_LABEL[activePhase]}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-600"
        >
          {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>
      </div>

      {/* 본문 */}
      {!collapsed && (
        <div className="space-y-3">
          <div className="rounded-[20px] bg-white/80 px-4 py-3.5 shadow-inner min-h-[60px]">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <p className="text-[13px] font-medium leading-relaxed text-stone-700 whitespace-pre-wrap">
                {text}
              </p>
            )}
          </div>

          {!loading && links.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-stone-400 px-1">참고 자료</p>
              {links.map((link, i) => (
                <LinkItem key={i} title={link.title} url={link.url} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
