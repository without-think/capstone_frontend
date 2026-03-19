import React, { useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { TOPICS } from './data/topics';
import TopicGrid from './components/TopicGrid';
import SubTopicView from './components/SubTopicView';
import ParamsView from './components/ParamsView';
import FloatingActionBar from './components/FloatingActionBar';

const App = () => {
  const [activeTopic, setActiveTopic] = useState(null);
  const [selectedSubTopics, setSelectedSubTopics] = useState([]);
  const [showParams, setShowParams] = useState(false);
  const [userStance, setUserStance] = useState(null);
  const [userIntensity, setUserIntensity] = useState(3);
  const [agentCount, setAgentCount] = useState(1);
  const [aiStances, setAiStances] = useState({ pro: [5, 3, 1], con: [5, 3, 1] });

  const activeData = TOPICS.find(t => t.id === activeTopic);
  const activeProAiCount = userStance === 'pro' ? agentCount - 1 : agentCount;
  const activeConAiCount = userStance === 'con' ? agentCount - 1 : agentCount;

  const resetParams = () => {
    setShowParams(false);
    setUserStance(null);
    setUserIntensity(3);
    setAgentCount(1);
    setAiStances({ pro: [5, 3, 1], con: [5, 3, 1] });
  };

  const handleTopicClick = (id) => {
    setActiveTopic(id);
    setSelectedSubTopics([]);
    resetParams();
  };

  const handleClose = () => {
    setActiveTopic(null);
    setSelectedSubTopics([]);
    resetParams();
  };

  const toggleSubTopic = (sub) => {
    setSelectedSubTopics(prev =>
      prev.includes(sub) ? prev.filter(item => item !== sub) : [...prev, sub]
    );
  };

  const handleSliderChange = (side, index, value) => {
    let numVal = parseInt(value, 10);
    if (numVal < 1) numVal = 1;
    if (numVal > 5) numVal = 5;
    setAiStances(prev => {
      const newStances = [...prev[side]];
      newStances[index] = numVal;
      return { ...prev, [side]: newStances };
    });
  };

  const handleEnter = () => {
    const proAiSet = aiStances.pro.slice(0, activeProAiCount);
    const conAiSet = aiStances.con.slice(0, activeConAiCount);
    alert(`[ 토론방 생성 ]\n주제: ${selectedSubTopics.join(', ')}\n내 입장: ${userStance === 'pro' ? '찬성' : '반대'} (강도 +${userIntensity})\n설정: ${agentCount} vs ${agentCount}\n찬성 AI 성향: [${proAiSet}]\n반대 AI 성향: [${conAiSet}]`);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F5F5F4] text-gray-800 font-sans overflow-hidden">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* [1] 메인 화면 */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center py-16 px-4 transition-all duration-700 z-10
        ${activeTopic ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-stone-800 tracking-tight">
            어떤 주제에 대해 토론할까요?
          </h1>
          <p className="text-stone-500 text-lg">원하는 카테고리를 선택하여 세부 논제를 확인해보세요.</p>
        </div>
        <TopicGrid onTopicClick={handleTopicClick} />
      </div>

      {/* [2] 배경 원 */}
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] z-20
        ${activeTopic ? `${activeData?.color} w-[250vmax] h-[250vmax]` : 'bg-transparent w-0 h-0'}`}
      />

      {/* [3] 풀스크린 오버레이 */}
      <div className={`fixed inset-0 z-30 flex flex-col transition-all duration-700 delay-300 ${activeTopic ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute top-8 left-8 right-8 md:top-12 md:left-12 md:right-12 flex justify-between z-50">
          <button
            onClick={() => setShowParams(false)}
            className={`p-4 bg-white/10 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${showParams ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={handleClose}
            className="p-4 bg-white/10 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ml-auto"
          >
            <X size={28} />
          </button>
        </div>

        <div className="relative flex-1 flex justify-center w-full mt-24 md:mt-10 overflow-hidden">
          <SubTopicView
            activeData={activeData}
            selectedSubTopics={selectedSubTopics}
            onToggle={toggleSubTopic}
            visible={!showParams}
          />
          <ParamsView
            activeData={activeData}
            selectedSubTopics={selectedSubTopics}
            userStance={userStance}
            setUserStance={setUserStance}
            userIntensity={userIntensity}
            setUserIntensity={setUserIntensity}
            agentCount={agentCount}
            setAgentCount={setAgentCount}
            aiStances={aiStances}
            activeProAiCount={activeProAiCount}
            activeConAiCount={activeConAiCount}
            onSliderChange={handleSliderChange}
            visible={showParams}
          />
        </div>
      </div>

      {/* [4] 하단 플로팅 액션 바 */}
      <FloatingActionBar
        selectedSubTopics={selectedSubTopics}
        showParams={showParams}
        userStance={userStance}
        onNext={() => setShowParams(true)}
        onEnter={handleEnter}
      />
    </div>
  );
};

export default App;