import { useState } from 'react';
import { SendHorizonal, Mic, Plus, X } from 'lucide-react';
import { MAX_ARGUMENT_TABS } from './mockData';

export default function InputComposer({
  isMyTurn,
  isProSide,
  currentStage,
  onSubmitOpening,
  openingLoading,
  openingError,
  openingSubmitted,
  openingComplete,
}) {
  const [composerTab, setComposerTab] = useState('greeting');
  const [composerGreeting, setComposerGreeting] = useState('');
  const [composerPosition, setComposerPosition] = useState('');
  const [composerConclusion, setComposerConclusion] = useState('');
  const [composerArguments, setComposerArguments] = useState(['']);

  const composerTabs = [
    { id: 'greeting', label: '인사말' },
    { id: 'position', label: '입장 표명' },
    ...composerArguments.map((_, index) => ({ id: `argument-${index}`, label: `논거 ${index + 1}` })),
    { id: 'conclusion', label: '결론' },
  ];

  const getPlaceholder = (tabId) => {
    if (tabId === 'greeting') return '안녕하세요. 반대 에이전트 2로서 오늘 토론의 핵심 입장을 간단히 여세요.';
    if (tabId === 'position') {
      if (currentStage === 1) return '이번 토론에서 내가 방어할 핵심 입장을 한두 문장으로 정리하세요.';
      if (currentStage === 2) return '지금 라운드에서 어떤 반박 포인트를 밀고 갈지 먼저 선언하세요.';
      if (currentStage === 3) return '자유 논박에서 이어갈 중심 명제를 적으세요.';
      if (currentStage === 4) return '역할 반전 기준으로 찬성 측 핵심 입장을 선언하세요.';
      return '현재 단계의 핵심 입장을 적으세요.';
    }
    if (tabId.startsWith('argument-')) {
      const n = Number(tabId.split('-')[1]) + 1;
      if (currentStage === 1) return `논거 ${n}: 원인, 메커니즘, 결과 순서로 구체적인 근거를 작성하세요.`;
      if (currentStage === 2) return `논거 ${n}: 상대 발언의 허점과 그 이유를 구체적으로 적으세요.`;
      if (currentStage === 3) return `논거 ${n}: 새 근거 또는 재반박 포인트를 보강하세요.`;
      if (currentStage === 4) return `논거 ${n}: 찬성 측 논리를 설득력 있게 보강하세요.`;
      return `논거 ${n} 내용을 작성하세요.`;
    }
    return '발언을 마무리하는 결론이나 한 줄 정리를 적으세요.';
  };

  const getValue = (tabId) => {
    if (tabId === 'greeting') return composerGreeting;
    if (tabId === 'position') return composerPosition;
    if (tabId === 'conclusion') return composerConclusion;
    if (tabId.startsWith('argument-')) return composerArguments[Number(tabId.split('-')[1])] ?? '';
    return '';
  };

  const setValue = (tabId, value) => {
    if (tabId === 'greeting') { setComposerGreeting(value); return; }
    if (tabId === 'position') { setComposerPosition(value); return; }
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
      setComposerTab(indexToRemove > 0 ? `argument-${indexToRemove - 1}` : 'greeting');
      return;
    }
    if (composerTab.startsWith('argument-')) {
      const current = Number(composerTab.split('-')[1]);
      if (current > indexToRemove) setComposerTab(`argument-${current - 1}`);
    }
  };

  const buildOpeningContent = () => {
    const sections = [
      ['인사말', composerGreeting],
      ['입장 표명', composerPosition],
      ...composerArguments.map((value, index) => [`논거 ${index + 1}`, value]),
      ['결론', composerConclusion],
    ]
      .map(([title, text]) => [title, (text ?? '').trim()])
      .filter(([, text]) => text.length > 0);

    return sections.map(([title, text]) => `## ${title}\n${text}`).join('\n\n');
  };

  const clearComposer = () => {
    setComposerGreeting('');
    setComposerPosition('');
    setComposerConclusion('');
    setComposerArguments(['']);
    setComposerTab('greeting');
  };

  const handleSend = async () => {
    if (currentStage !== 1 || !onSubmitOpening || openingLoading || openingSubmitted) return;

    const content = buildOpeningContent();
    if (!content) return;

    try {
      await onSubmitOpening(content);
      clearComposer();
    } catch {
      // 실패 메시지는 상위 훅(error state)에서 노출
    }
  };

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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3 px-4 pt-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className={`shrink-0 text-[12px] font-bold flex items-center gap-1.5 ${isProSide ? 'text-blue-700' : 'text-rose-700'}`}>
              <Mic size={14} className="animate-subtle-pulse" /> 발언 작성 중
            </div>
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
          </div>
          {(currentStage === 4 || currentStage === 5) && (
            <div className="mt-1 text-[11px] font-medium text-stone-400">
              {currentStage === 4 ? '역할 반전: 반대측이었던 내가 찬성 입장으로 발언' : '종합: 판정단 분석 진행 중'}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 pl-2 pr-1 pb-1">
        <div className="flex-1 rounded-[22px] bg-white/75 shadow-inner">
          <div className="flex items-center justify-between gap-2 px-4 pt-3">
            <span className="text-[12px] font-bold text-stone-600">
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
        </div>
        <button className={`mt-auto flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full text-white transition-all shadow-md hover:scale-105 ${
          (openingLoading || openingSubmitted || currentStage !== 1)
            ? 'bg-stone-300 cursor-not-allowed'
            : isProSide ? 'bg-blue-500 hover:bg-blue-600' : 'bg-rose-500 hover:bg-rose-600'
        }`}
          onClick={handleSend}
          disabled={openingLoading || openingSubmitted || currentStage !== 1}
          title={currentStage !== 1 ? '입론 단계에서만 제출할 수 있습니다.' : undefined}
        >
          <SendHorizonal size={16} className="ml-0.5" />
        </button>
      </div>

      <div className="px-4 pb-2 text-[11px] font-medium text-stone-400">
        {openingError
          ? `오류: ${openingError}`
          : openingComplete
            ? '입론 완료'
            : openingLoading
              ? 'AI 입론 생성 중'
              : openingSubmitted
                ? '입론 제출 완료'
              : `논거 ${composerArguments.length}/${MAX_ARGUMENT_TABS}`}
      </div>
    </div>
  );
}
