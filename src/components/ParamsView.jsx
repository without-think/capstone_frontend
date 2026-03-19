import React from 'react';
import { ThumbsUp, ThumbsDown, SlidersHorizontal, Check } from 'lucide-react';
import AiSliderItem from './AiSliderItem';

const ParamsView = ({
  activeData,
  selectedSubTopics,
  userStance,
  setUserStance,
  userIntensity,
  setUserIntensity,
  agentCount,
  setAgentCount,
  aiStances,
  activeProAiCount,
  activeConAiCount,
  onSliderChange,
  visible,
}) => {
  const renderAiSliders = (side, count) => {
    if (count === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[120px] bg-white/5 rounded-2xl border border-white/10 text-white/50 text-sm p-4 text-center">
          <Check size={24} className="mb-2 opacity-50" />
          해당 진영은 유저가<br />단독 대표로 참여합니다
        </div>
      );
    }

    return Array.from({ length: count }).map((_, i) => (
      <AiSliderItem
        key={`${side}-${i}`}
        side={side}
        index={i}
        val={aiStances[side][i]}
        onChange={onSliderChange}
      />
    ));
  };

  return (
    <div className={`absolute w-full h-full px-4 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hide-scrollbar overflow-y-auto pb-40
      ${!visible ? 'opacity-0 translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}
    `}>
      {activeData && (
        <div className="w-full max-w-4xl flex flex-col items-center pt-8 md:pt-16">
          <div className="mb-10 text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-sm font-semibold mb-4 backdrop-blur-md">
              {selectedSubTopics[0]} {selectedSubTopics.length > 1 && `외 ${selectedSubTopics.length - 1}건`}
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              토론 환경 설정
            </h2>
          </div>

          {/* 입장 & 규모 선택 */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex flex-col">
              <h3 className="text-lg font-medium text-white/80 mb-4 text-center">나의 입장을 선택하세요</h3>
              <div className="flex justify-center gap-6 items-center">
                <button
                  onClick={() => setUserStance('pro')}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 ${userStance === 'pro' ? 'bg-white text-stone-900 scale-105 shadow-2xl ring-4 ring-white/50' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md'}`}
                >
                  <ThumbsUp size={28} className={userStance === 'pro' ? 'text-blue-600' : 'text-white/80'} />
                  <span className="text-lg font-bold">찬성</span>
                </button>
                <button
                  onClick={() => setUserStance('con')}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 ${userStance === 'con' ? 'bg-white text-stone-900 scale-105 shadow-2xl ring-4 ring-white/50' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md'}`}
                >
                  <ThumbsDown size={28} className={userStance === 'con' ? 'text-red-600' : 'text-white/80'} />
                  <span className="text-lg font-bold">반대</span>
                </button>
              </div>

              {userStance && (
                <div className="mt-4 bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm animate-in fade-in duration-500">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-white text-sm">내 주장 강도</span>
                    <span className={`text-sm font-bold px-2 py-1 rounded-md ${userStance === 'pro' ? 'bg-blue-500/20 text-blue-200' : 'bg-red-500/20 text-red-200'}`}>
                      +{userIntensity} (강도 {userIntensity})
                    </span>
                  </div>
                  <div className="relative pb-6">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={userIntensity}
                      onChange={(e) => setUserIntensity(parseInt(e.target.value, 10))}
                      className={`w-full cursor-pointer h-2 bg-white/20 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white ${userStance === 'pro' ? 'accent-blue-500' : 'accent-red-500'}`}
                    />
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[11px] text-white/50 font-medium px-1 pointer-events-none">
                      <span>+1</span>
                      <span>+3</span>
                      <span>+5</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <h3 className="text-lg font-medium text-white/80 mb-4 text-center">참여 규모 (각 진영 동수)</h3>
              <div className="flex justify-center gap-4 items-center flex-1">
                {[1, 2, 3].map(num => (
                  <button
                    key={`agent-${num}`}
                    onClick={() => setAgentCount(num)}
                    className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${agentCount === num ? 'bg-white text-stone-900 scale-105 shadow-2xl ring-4 ring-white/50' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md'}`}
                  >
                    <span className="text-lg font-bold">{num}v{num}</span>
                    <span className={`text-xs font-medium ${agentCount === num ? 'text-stone-500' : 'text-white/60'}`}>총 {num * 2}명</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI 성향 세부 설정 */}
          {userStance && (
            <div className="w-full bg-black/10 rounded-3xl p-6 md:p-8 border border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-center gap-2 mb-8">
                <SlidersHorizontal size={24} className="text-white" />
                <h3 className="text-2xl font-bold text-white">AI 에이전트 성향 정교화</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                <div>
                  <div className="text-blue-200 font-bold text-lg mb-4 pb-2 border-b border-white/10 text-center">
                    찬성 팀 (총 {agentCount}명)
                  </div>
                  {renderAiSliders('pro', activeProAiCount)}
                </div>
                <div>
                  <div className="text-red-200 font-bold text-lg mb-4 pb-2 border-b border-white/10 text-center">
                    반대 팀 (총 {agentCount}명)
                  </div>
                  {renderAiSliders('con', activeConAiCount)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParamsView;
