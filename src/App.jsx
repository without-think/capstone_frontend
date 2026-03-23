import { useEffect, useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { TOPICS } from './data/topics';
import { fetchTodayTopics } from './api/topicsApi';
import { createSession } from './api/sessionsApi';
import TopicGrid from './components/TopicGrid';
import BackgroundBubbles from './components/BackgroundBubbles';
import HomeLanding from './components/HomeLanding';
import TopHeader from './components/TopHeader';
import SubTopicView from './components/SubTopicView';
import ParamsView from './components/ParamsView';
import PreSurvey from './components/PreSurvey';
import PreQuiz from './components/PreQuiz';
import FloatingActionBar from './components/FloatingActionBar';

const App = () => {
  const getInitialRoute = () => (window.location.pathname === '/topics' ? '/topics' : '/');
  const [routePath, setRoutePath] = useState(getInitialRoute);
  const [activeTopic, setActiveTopic] = useState(null);
  const [selectedSubTopics, setSelectedSubTopics] = useState([]);
  const [stage, setStage] = useState(0); // 0: 세부주제, 1: 참여설정, 2: 사전설문, 3: 사전퀴즈, 4: 토론
  const [userStance, setUserStance] = useState(null);
  const [agentCount, setAgentCount] = useState(1);
  const [aiStances, setAiStances] = useState({ pro: [5, 3, 1], con: [5, 3, 1] });
  const [topics, setTopics] = useState(TOPICS); // 기본값: 하드코딩 데이터 (API 실패 시 fallback)
  const [sessionId, setSessionId] = useState(null);

  // 오늘의 주제 fetch
  useEffect(() => {
    fetchTodayTopics()
      .then(setTopics)
      .catch(() => {}); // 실패 시 하드코딩 TOPICS 유지
  }, []);

  const activeData = topics.find(t => t.id === activeTopic);
  const activeProAiCount = userStance === 'pro' ? agentCount - 1 : agentCount;
  const activeConAiCount = userStance === 'con' ? agentCount - 1 : agentCount;
  const isTopicSelectionRoute = routePath === '/topics';

  const preDebateBackground = userStance === 'pro'
    ? 'linear-gradient(to bottom right, rgba(147,197,253,0.38), rgba(219,234,254,0.22), rgba(245,245,244,0.08))'
    : userStance === 'con'
    ? 'linear-gradient(to bottom right, rgba(252,165,165,0.38), rgba(254,226,226,0.22), rgba(245,245,244,0.08))'
    : activeData
    ? `linear-gradient(to bottom right, ${activeData.accent}22, rgba(245,245,244,0.1), rgba(245,245,244,0.02))`
    : 'transparent';

  const resetParams = () => {
    setStage(0);
    setUserStance(null);
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
    setSelectedSubTopics([sub]);
    setStage(1);
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

  const handleStanceSelect = (stance) => {
    setUserStance(stance);
  };

  const handleEnter = () => {
    createSession({
      topic: selectedSubTopics[0],
      userStance,
      agentCount,
      aiStances,
    })
      .then((res) => setSessionId(res.id ?? res.sessionId ?? null))
      .catch(() => {}); // 실패 시 세션 없이 진행
    setStage(2); // 참여설정 → 사전설문
  };

  useEffect(() => {
    const handlePopState = () => {
      setRoutePath(getInitialRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRoutePath(path);
  };

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-[#F5F5F4] text-gray-800" style={{ fontFamily: 'var(--ui-font)' }}>
      <div className="pointer-events-none fixed inset-0 z-0">
        <BackgroundBubbles activeTopic={activeTopic} />
        <div
          className="absolute inset-x-0 top-0 h-[84px] md:h-[100px]"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.42), rgba(0,0,0,0.12), transparent)',
          }}
        />
        <div className="absolute inset-0 bg-[#F5F5F4]/0" />
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {!isTopicSelectionRoute && !activeTopic && (
        <HomeLanding onCreateDebate={() => navigate('/topics')} />
      )}

      {/* [1] 메인 화면 */}
      <div className={`absolute inset-0 px-4 transition-all duration-700 z-10 overflow-auto
        ${isTopicSelectionRoute && !activeTopic ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
      >
        <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col items-center pt-8 md:pt-0">
          <TopHeader />

          <div className="mt-20 text-center md:mt-[96px]">
            <h1 className="text-[38px] font-extrabold leading-tight tracking-[-0.03em] text-[#38332E] md:text-[48px] md:leading-[55px]">
              어떤 주제에 대해 토론할까요?
            </h1>
            <p className="mt-4 text-[16px] font-medium text-[#393634] md:text-[18px] md:leading-[21px]">
              원하는 카테고리를 선택하여 세부 논제를 확인해보세요.
            </p>
          </div>

          <div className="mt-6 w-full min-w-[1200px] xl:-mt-1">
            <TopicGrid onTopicClick={handleTopicClick} />
          </div>
        </div>
      </div>


      {/* [3] 풀스크린 오버레이 */}
      <div
        className={`fixed inset-0 z-30 flex flex-col transition-all duration-700 delay-300
        ${activeTopic ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={stage < 4 ? { background: preDebateBackground } : undefined}
      >
        {/* 토론 페이지가 아닐 때만 네비 버튼 표시 */}
        {stage < 4 && (
          <div className="absolute top-8 left-8 right-8 md:top-12 md:left-12 md:right-12 flex justify-between z-50">
            <button
              onClick={() => setStage(prev => Math.max(0, prev - 1))}
              className={`p-4 bg-white/70 hover:bg-white text-stone-600 rounded-full backdrop-blur-md border border-stone-200 shadow-sm transition-all duration-300 hover:scale-110 ${stage > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={handleClose}
              className="p-4 bg-white/70 hover:bg-white text-stone-600 rounded-full backdrop-blur-md border border-stone-200 shadow-sm transition-all duration-300 hover:scale-110 ml-auto"
            >
              <X size={28} />
            </button>
          </div>
        )}

        <div className={`relative flex-1 flex justify-center w-full ${stage === 1 ? 'overflow-visible' : 'overflow-hidden'} ${stage < 4 ? 'mt-24 md:mt-10' : ''}`}>
          <SubTopicView
            activeData={activeData}
            selectedSubTopics={selectedSubTopics}
            onToggle={toggleSubTopic}
            visible={stage === 0}
          />
          <ParamsView
            activeData={activeData}
            selectedSubTopics={selectedSubTopics}
            userStance={userStance}
            onStanceSelect={handleStanceSelect}
            agentCount={agentCount}
            setAgentCount={setAgentCount}
            aiStances={aiStances}
            activeProAiCount={activeProAiCount}
            activeConAiCount={activeConAiCount}
            onSliderChange={handleSliderChange}
            visible={stage === 1}
          />
          <PreSurvey
            topicId={activeTopic}
            userStance={userStance}
            visible={stage === 2}
            onComplete={() => setStage(3)}
          />
          <PreQuiz
            topicId={activeTopic}
            visible={stage === 3}
            onComplete={() => setStage(4)}
          />
        </div>
      </div>

      {/* [4] 하단 플로팅 액션 바 - 참여설정(stage 1)에서만 표시 */}
      {stage < 4 && <FloatingActionBar
        selectedSubTopics={selectedSubTopics}
        stage={stage}
        userStance={userStance}
        onEnter={handleEnter}
      />}
    </div>
  );
};

export default App;
