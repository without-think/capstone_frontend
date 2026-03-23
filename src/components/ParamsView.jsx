import { Check, SlidersHorizontal, ThumbsUp, ThumbsDown } from 'lucide-react';
import AiSliderItem from './AiSliderItem';

const ParamsView = ({
  activeData,
  selectedSubTopics,
  userStance,
  onStanceSelect,
  agentCount,
  setAgentCount,
  aiStances,
  activeProAiCount,
  activeConAiCount,
  onSliderChange,
  visible,
}) => {
  const proActive = userStance === 'pro';
  const conActive = userStance === 'con';

  const selectedSubTopic = activeData?.subTopics?.find(s => s.title === selectedSubTopics[0]);

  const activeCountBg = proActive
    ? 'bg-blue-500 text-white shadow-2xl scale-105'
    : conActive
    ? 'bg-rose-500 text-white shadow-2xl scale-105'
    : 'bg-stone-900 text-white shadow-2xl scale-105';

  const renderAiSliders = (side, count) => {
    return (
      <div className="flex justify-center gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <AiSliderItem
            key={`${side}-${i}`}
            side={side}
            index={i}
            val={aiStances[side][i]}
            onChange={onSliderChange}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`absolute w-full h-full px-4 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hide-scrollbar overflow-y-auto pb-80
      ${!visible ? 'opacity-0 translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}
    `}>
      {activeData && (
        <div className="w-full max-w-4xl flex flex-col items-center pt-8 md:pt-12">
          <div className="mb-8 text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-stone-100 text-stone-500 text-sm font-semibold mb-4">
              {selectedSubTopics[0]} {selectedSubTopics.length > 1 && `외 ${selectedSubTopics.length - 1}건`}
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-stone-800 tracking-tight">
              참여 설정
            </h2>
          </div>

          {/* 찬반 + 참여 규모 */}
          <div className="mb-10 w-full grid grid-cols-2 gap-12 items-start">
            {/* 나의 입장 */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium text-stone-500 mb-5 text-center">나의 입장</h3>
              <div className="flex gap-5">
                <button
                  onClick={() => onStanceSelect('pro')}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1.5 font-bold text-base transition-all duration-300 bg-white text-stone-600 border shadow-sm hover:shadow-md hover:scale-105
                    ${proActive ? 'border-blue-300 scale-105 shadow-md' : 'border-stone-200'}`}
                >
                  <ThumbsUp size={22} className={proActive ? 'text-blue-500' : 'text-stone-300'} />
                  찬성
                </button>
                <button
                  onClick={() => onStanceSelect('con')}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1.5 font-bold text-base transition-all duration-300 bg-white text-stone-600 border shadow-sm hover:shadow-md hover:scale-105
                    ${conActive ? 'border-rose-300 scale-105 shadow-md' : 'border-stone-200'}`}
                >
                  <ThumbsDown size={22} className={conActive ? 'text-rose-500' : 'text-stone-300'} />
                  반대
                </button>
              </div>
            </div>

            {/* 참여 규모 */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium text-stone-500 mb-5 text-center">참여 규모 (각 진영 동수)</h3>
              <div className="flex justify-center gap-5">
                {[1, 2, 3].map(num => (
                  <button
                    key={`agent-${num}`}
                    onClick={() => setAgentCount(num)}
                    className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
                      agentCount === num
                        ? activeCountBg
                        : 'bg-white text-stone-700 border border-stone-200 shadow-sm hover:shadow-md hover:scale-105'
                    }`}
                  >
                    <span className="text-xl font-bold">{num}v{num}</span>
                    <span className="text-xs font-medium opacity-60">총 {num * 2}명</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI 성향 세부 설정 */}
          <div className="mb-32 w-full rounded-[44px] bg-transparent p-2 md:p-4">
            <div className="mb-6 flex items-center justify-center gap-2">
              <SlidersHorizontal size={24} className="text-stone-700" />
              <h3 className="text-2xl font-bold text-stone-800">AI 에이전트 성향 정교화</h3>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8">
              <div>
                <div className="mb-2 text-center text-[28px] font-extrabold text-stone-900">
                  찬성 팀 (총 {agentCount}명)
                </div>
                {selectedSubTopic?.pro && (
                  <p className="mb-4 text-center text-sm text-blue-400 font-medium flex items-center justify-center gap-1.5">
                    <ThumbsUp size={13} className="shrink-0" />
                    {selectedSubTopic.pro}
                  </p>
                )}
                <div className="h-[360px] rounded-[44px] border border-white/80 bg-white/92 px-8 py-7 shadow-[0_16px_30px_rgba(0,0,0,0.14)]">
                  {activeProAiCount === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-stone-500">
                      <Check size={24} className="mb-2 text-stone-400" />
                      해당 진영은 유저가<br />단독 대표로 참여합니다
                    </div>
                  ) : (
                    renderAiSliders('pro', activeProAiCount)
                  )}
                </div>
              </div>
              <div>
                <div className="mb-2 text-center text-[28px] font-extrabold text-stone-900">
                  반대 팀 (총 {agentCount}명)
                </div>
                {selectedSubTopic?.con && (
                  <p className="mb-4 text-center text-sm text-rose-400 font-medium flex items-center justify-center gap-1.5">
                    <ThumbsDown size={13} className="shrink-0" />
                    {selectedSubTopic.con}
                  </p>
                )}
                <div className="h-[360px] rounded-[44px] border border-white/80 bg-white/92 px-8 py-7 shadow-[0_16px_30px_rgba(0,0,0,0.14)]">
                  {activeConAiCount === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-stone-500">
                      <Check size={24} className="mb-2 text-stone-400" />
                      해당 진영은 유저가<br />단독 대표로 참여합니다
                    </div>
                  ) : (
                    renderAiSliders('con', activeConAiCount)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParamsView;
