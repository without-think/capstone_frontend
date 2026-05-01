import { useState } from 'react';
import { SendHorizonal, Mic, Plus, X } from 'lucide-react';
import { MAX_ARGUMENT_TABS } from './mockData';


export default function InputComposer({
  isMyTurn,
  isProSide,
  isFinalize,
  currentStage,
  stage3CanAttack = true,
  onSubmitOpening,
  openingLoading,
  openingError,
  openingSubmitted,
  openingComplete,
  onSubmitTurn,
  stage3Opponent,
}) {
  const [composerTab, setComposerTab] = useState('intro');
  const [composerIntro, setComposerIntro] = useState('');
  const [composerConclusion, setComposerConclusion] = useState('');
  const [composerArguments, setComposerArguments] = useState(['']);

  // stage 3 전용 상태
  const [stage3Answer, setStage3Answer] = useState('');
  const [stage3Attack, setStage3Attack] = useState('');

  const isOpeningStage = currentStage === 1;
  const isFreeDebateStage = currentStage === 3;

  // ── Stage 1 composer helpers ──────────────────────────────────────────────
  const composerTabs = [
    { id: 'intro', label: '자기소개/입장표명' },
    ...composerArguments.map((_, index) => ({ id: `argument-${index}`, label: `논거 ${index + 1}` })),
    { id: 'conclusion', label: '결론' },
  ];

  const getPlaceholder = (tabId) => {
    const currentTab = composerTabs.find((tab) => tab.id === tabId);
    const placeholderLabel = tabId === 'intro' ? '자기소개와 입장 표명' : currentTab?.label ?? '내용';
    return `${placeholderLabel}에 대해 작성해주세요.`;
  };

  const getValue = (tabId) => {
    if (tabId === 'intro') return composerIntro;
    if (tabId === 'conclusion') return composerConclusion;
    if (tabId.startsWith('argument-')) return composerArguments[Number(tabId.split('-')[1])] ?? '';
    return '';
  };

  const setValue = (tabId, value) => {
    if (tabId === 'intro') { setComposerIntro(value); return; }
    if (tabId === 'conclusion') { setComposerConclusion(value); return; }
    if (tabId.startsWith('argument-')) {
      const index = Number(tabId.split('-')[1]);
      setComposerArguments((prev) => prev.map((item, i) => i === index ? value : item));
    }
  };

  const handleAddArgument = () => {
    if (composerArguments.length >= MAX_ARGUMENT_TABS) return;
    setComposerArguments((prev) => [...prev, '']);
    setComposerTab(`argument-${composerArguments.length}`);
  };

  const handleRemoveArgument = (indexToRemove) => {
    if (composerArguments.length === 1) return;
    setComposerArguments((prev) => prev.filter((_, i) => i !== indexToRemove));
    if (composerTab === `argument-${indexToRemove}`) {
      setComposerTab(indexToRemove > 0 ? `argument-${indexToRemove - 1}` : 'intro');
      return;
    }
    if (composerTab.startsWith('argument-')) {
      const current = Number(composerTab.split('-')[1]);
      if (current > indexToRemove) setComposerTab(`argument-${current - 1}`);
    }
  };

  const buildOpeningContent = () => {
    const sections = [
      ['자기소개와 입장 표명', composerIntro],
      ...composerArguments.map((value, index) => [`논거 ${index + 1}`, value]),
      ['결론', composerConclusion],
    ]
      .map(([title, text]) => [title, (text ?? '').trim()])
      .filter(([, text]) => text.length > 0);
    return sections.map(([title, text]) => `## ${title}\n${text}`).join('\n\n');
  };

  const clearComposer = () => {
    setComposerIntro('');
    setComposerConclusion('');
    setComposerArguments(['']);
    setComposerTab('intro');
  };

  // ── Stage 1 전송 ──────────────────────────────────────────────────────────
  const handleSendOpening = async () => {
    if (!onSubmitOpening || openingLoading || openingSubmitted) return;
    const content = buildOpeningContent();
    if (!content) return;
    try {
      await onSubmitOpening(content);
      clearComposer();
    } catch { /* error state는 상위에서 관리 */ }
  };

  // ── Stage 3 전송 ──────────────────────────────────────────────────────────
  const handleSendStage3 = () => {
    if (!onSubmitTurn) return;
    const answer = stage3Answer.trim();
    const attack = stage3Attack.trim();
    if (!answer && !attack) return;

    if (!stage3CanAttack) {
      if (!answer) return;
      onSubmitTurn(answer);
      setStage3Answer('');
      setStage3Attack('');
      return;
    }

    if (answer && attack) {
      // 답변 먼저 제출, 공격은 자동으로 이어서 제출 (말풍선 2개)
      onSubmitTurn(answer, attack);
    } else {
      onSubmitTurn(answer || attack);
    }
    setStage3Answer('');
    setStage3Attack('');
  };

  // ── Stage 2/4/5 전송 ─────────────────────────────────────────────────────
  const handleSendTurn = () => {
    if (!onSubmitTurn) return;
    const content = composerIntro.trim();
    if (!content) return;
    onSubmitTurn(content);
    setComposerIntro('');
  };

  // ── 대기 중 화면 ──────────────────────────────────────────────────────────
  if (!isMyTurn) {
    return (
      <div className="flex items-center justify-center h-[56px] text-[13px] font-bold text-stone-400 gap-2">
        <span className="flex gap-1.5">
          <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
        상대방 발언 대기 중
      </div>
    );
  }

  // ── Stage 3: 자유 논박 동시 입력 UI ──────────────────────────────────────
  if (isFreeDebateStage) {
    return (
      <div className="flex flex-col gap-2">
        {/* 헤더 */}
        <div className="flex items-center gap-1.5 px-4 pt-2 text-[12px] font-bold ${isProSide ? 'text-blue-700' : 'text-rose-700'}">
          <Mic size={14} className={`animate-subtle-pulse ${isProSide ? 'text-blue-700' : 'text-rose-700'}`} />
          <span className={isProSide ? 'text-blue-700' : 'text-rose-700'}>자유 논박 중</span>
          {stage3Opponent && (
            <span className="ml-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-500">
              vs {stage3Opponent.label}
            </span>
          )}
        </div>

        {/* 답변 + 공격 동시 입력 */}
        <div className="flex items-start gap-2 pl-2 pr-1 pb-1">
          <div className="flex-1 rounded-[22px] bg-white/75 shadow-inner divide-y divide-stone-100">
            {/* 답변 입력 */}
            <div>
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-stone-100 text-stone-600">답변</span>
                <span className="text-[11px] font-medium text-stone-400">상대 주장에 직접 반박하거나 내 입장을 명확히 합니다.</span>
              </div>
              <textarea
                value={stage3Answer}
                onChange={(e) => setStage3Answer(e.target.value)}
                placeholder="상대 주장에 대한 답변을 입력하세요."
                className="w-full min-h-[64px] max-h-[100px] resize-none bg-transparent px-4 py-2 text-[14px] font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none hide-scrollbar"
              />
            </div>
            {/* 공격 입력 — 활성화된 턴에만 표시 */}
            {stage3CanAttack && (
              <div>
                <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                  <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-stone-100 text-stone-600">공격</span>
                  <span className="text-[11px] font-medium text-stone-400">
                    상대 논리의 허점을 지적해 입장 자체를 약화시킵니다.
                  </span>
                </div>
                <textarea
                  value={stage3Attack}
                  onChange={(e) => setStage3Attack(e.target.value)}
                  placeholder="상대 입장의 허점을 공략하세요."
                  className="w-full min-h-[64px] max-h-[100px] resize-none bg-transparent px-4 py-2 text-[14px] font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none hide-scrollbar"
                />
              </div>
            )}
          </div>
          <button
            className={`mt-auto flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full text-white transition-all shadow-md hover:scale-105 ${
              isProSide ? 'bg-blue-500 hover:bg-blue-600' : 'bg-rose-500 hover:bg-rose-600'
            }`}
            onClick={handleSendStage3}
          >
            <SendHorizonal size={16} className="ml-0.5" />
          </button>
        </div>
      </div>
    );
  }

  // ── Stage 1 / 기타 단계 ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3 px-4 pt-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className={`shrink-0 flex items-center gap-1.5 text-[12px] font-bold ${isProSide ? 'text-blue-700' : 'text-rose-700'}`}>
              <Mic size={14} className="animate-subtle-pulse" />
              {isOpeningStage ? '입론 작성 중' : '발언 작성 중'}
            </div>
            {isOpeningStage && (
              <div className="min-w-0 flex-1 overflow-x-auto hide-scrollbar">
                <div className="flex items-center gap-1">
                  {composerTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setComposerTab(tab.id)}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                        composerTab === tab.id
                          ? isProSide ? 'bg-blue-500 text-white shadow-sm' : 'bg-rose-500 text-white shadow-sm'
                          : 'bg-white/75 text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <button
                    onClick={handleAddArgument}
                    disabled={composerArguments.length >= MAX_ARGUMENT_TABS}
                    className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                      composerArguments.length >= MAX_ARGUMENT_TABS
                        ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                        : 'bg-white/75 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    <Plus size={11} />
                    논거 추가
                  </button>
                </div>
              </div>
            )}
          </div>
          {(currentStage === 4 || currentStage === 5) && (
            <div className="mt-1 text-[11px] font-medium text-stone-400">
              {currentStage === 4 ? '역할 반전: 반대측이었던 내가 찬성 입장으로 발언' : isFinalize ? '' : '종합: 판정단 분석 진행 중'}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 pl-2 pr-1 pb-1">
        <div className="flex-1 rounded-[22px] bg-white/75 shadow-inner">
          {isOpeningStage ? (
            <>
              <div className="flex items-center justify-between gap-2 px-4 pt-3">
                <span className="text-[15px] font-extrabold text-stone-700">
                  {composerTabs.find((tab) => tab.id === composerTab)?.label}
                </span>
                {composerTab.startsWith('argument-') && composerArguments.length > 1 && (
                  <button
                    onClick={() => handleRemoveArgument(Number(composerTab.split('-')[1]))}
                    className="shrink-0 flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                  >
                    <X size={11} />
                    삭제
                  </button>
                )}
              </div>
              <textarea
                value={getValue(composerTab)}
                onChange={(e) => setValue(composerTab, e.target.value)}
                placeholder={getPlaceholder(composerTab)}
                className="w-full max-h-[100px] min-h-[68px] resize-none bg-transparent px-4 py-3 text-[14px] font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none hide-scrollbar"
              />
            </>
          ) : (
            <>
              {isFinalize && (
                <div className={`mx-3 mt-3 mb-1 rounded-2xl px-4 py-2.5 flex items-center gap-2 ${
                  isProSide
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-rose-50 border border-rose-200'
                }`}>
                  <span className="text-lg">✦</span>
                  <div>
                    <p className={`text-[13px] font-extrabold ${isProSide ? 'text-blue-700' : 'text-rose-700'}`}>
                      최종 의견을 입력해주세요
                    </p>
                    <p className="text-[11px] font-medium text-stone-500 mt-0.5">
                      이 토론에서 도달한 우리의 최적해를 제시합니다.
                    </p>
                  </div>
                </div>
              )}
              <textarea
                value={composerIntro}
                onChange={(e) => setComposerIntro(e.target.value)}
                placeholder={isFinalize ? '우리의 최적해를 입력하세요.' : isProSide ? '발언을 입력해주세요.' : '반박을 입력해주세요.'}
                className="w-full min-h-[96px] resize-none bg-transparent px-4 py-3 text-[14px] font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none hide-scrollbar"
              />
            </>
          )}
        </div>

        <button
          className={`mt-auto flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full text-white transition-all shadow-md hover:scale-105 ${
            (currentStage === 1 && (openingLoading || openingSubmitted))
              ? 'bg-stone-300 cursor-not-allowed'
              : isProSide ? 'bg-blue-500 hover:bg-blue-600' : 'bg-rose-500 hover:bg-rose-600'
          }`}
          onClick={currentStage === 1 ? handleSendOpening : handleSendTurn}
          disabled={currentStage ===   1 && (openingLoading || openingSubmitted)}
        >
          <SendHorizonal size={16} className="ml-0.5" />
        </button>
      </div>

      <div className="px-4 pb-2 text-[11px] font-medium text-stone-400">
        {isOpeningStage
          ? (openingError
            ? `오류: ${openingError}`
            : openingComplete
              ? '입론 완료'
              : openingLoading
                ? 'AI 입론 생성 중'
                : openingSubmitted
                  ? '입론 제출 완료'
                  : `논거 ${composerArguments.length}/${MAX_ARGUMENT_TABS}`)
          : null}
      </div>
    </div>
  );
}
