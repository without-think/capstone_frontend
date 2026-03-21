import { useState } from 'react';
import DebateHeader from './DebateHeader';
import ChatArea from './ChatArea';
import ChatInput from './ChatInput';
import SidePanel from './SidePanel';

// ─────────────────────────────────────────────
// 전체 토론 턴 순서 (총 33턴)
// ─────────────────────────────────────────────
const DEBATE_TURNS = [
  { step: '입론',    stageIdx: 0, turn: 1,  speaker: '찬성1', type: 'AI',   side: 'pro' },
  { step: '입론',    stageIdx: 0, turn: 2,  speaker: '반대1', type: 'AI',   side: 'con' },
  { step: '입론',    stageIdx: 0, turn: 3,  speaker: '찬성2', type: 'AI',   side: 'pro' },
  { step: '입론',    stageIdx: 0, turn: 4,  speaker: '반대2', type: 'USER', side: 'con' },

  { step: '연쇄논박', stageIdx: 1, turn: 5,  speaker: '반대1', type: 'AI',   side: 'con', desc: '↔ 찬성1 반박' },
  { step: '연쇄논박', stageIdx: 1, turn: 6,  speaker: '찬성1', type: 'AI',   side: 'pro', desc: '대답' },
  { step: '연쇄논박', stageIdx: 1, turn: 7,  speaker: '찬성1', type: 'AI',   side: 'pro', desc: '↔ 반대1 반박' },
  { step: '연쇄논박', stageIdx: 1, turn: 8,  speaker: '반대1', type: 'AI',   side: 'con', desc: '대답' },
  { step: '연쇄논박', stageIdx: 1, turn: 9,  speaker: '반대2', type: 'USER', side: 'con', desc: '↔ 찬성2 반박' },
  { step: '연쇄논박', stageIdx: 1, turn: 10, speaker: '찬성2', type: 'AI',   side: 'pro', desc: '대답' },
  { step: '연쇄논박', stageIdx: 1, turn: 11, speaker: '찬성2', type: 'AI',   side: 'pro', desc: '↔ 반대2 반박' },
  { step: '연쇄논박', stageIdx: 1, turn: 12, speaker: '반대2', type: 'USER', side: 'con', desc: '대답' },

  { step: '자유논박', stageIdx: 2, turn: 13, speaker: '찬성1', type: 'AI',   side: 'pro', cycle: 1 },
  { step: '자유논박', stageIdx: 2, turn: 14, speaker: '반대1', type: 'AI',   side: 'con', cycle: 1 },
  { step: '자유논박', stageIdx: 2, turn: 15, speaker: '찬성2', type: 'AI',   side: 'pro', cycle: 1 },
  { step: '자유논박', stageIdx: 2, turn: 16, speaker: '반대2', type: 'USER', side: 'con', cycle: 1 },
  { step: '자유논박', stageIdx: 2, turn: 17, speaker: '찬성1', type: 'AI',   side: 'pro', cycle: 2 },
  { step: '자유논박', stageIdx: 2, turn: 18, speaker: '반대1', type: 'AI',   side: 'con', cycle: 2 },
  { step: '자유논박', stageIdx: 2, turn: 19, speaker: '찬성2', type: 'AI',   side: 'pro', cycle: 2 },
  { step: '자유논박', stageIdx: 2, turn: 20, speaker: '반대2', type: 'USER', side: 'con', cycle: 2 },
  { step: '자유논박', stageIdx: 2, turn: 21, speaker: '찬성1', type: 'AI',   side: 'pro', cycle: 3 },
  { step: '자유논박', stageIdx: 2, turn: 22, speaker: '반대1', type: 'AI',   side: 'con', cycle: 3 },
  { step: '자유논박', stageIdx: 2, turn: 23, speaker: '찬성2', type: 'AI',   side: 'pro', cycle: 3 },
  { step: '자유논박', stageIdx: 2, turn: 24, speaker: '반대2', type: 'USER', side: 'con', cycle: 3 },
  { step: '자유논박', stageIdx: 2, turn: 25, speaker: '찬성1', type: 'AI',   side: 'pro', cycle: 4 },
  { step: '자유논박', stageIdx: 2, turn: 26, speaker: '반대1', type: 'AI',   side: 'con', cycle: 4 },
  { step: '자유논박', stageIdx: 2, turn: 27, speaker: '찬성2', type: 'AI',   side: 'pro', cycle: 4 },
  { step: '자유논박', stageIdx: 2, turn: 28, speaker: '반대2', type: 'USER', side: 'con', cycle: 4 },

  { step: '역할반전', stageIdx: 3, turn: 29, speaker: '반대1', type: 'AI',   side: 'pro', reversed: true },
  { step: '역할반전', stageIdx: 3, turn: 30, speaker: '찬성1', type: 'AI',   side: 'con', reversed: true },
  { step: '역할반전', stageIdx: 3, turn: 31, speaker: '반대2', type: 'USER', side: 'pro', reversed: true },
  { step: '역할반전', stageIdx: 3, turn: 32, speaker: '찬성2', type: 'AI',   side: 'con', reversed: true },

  { step: '종합',    stageIdx: 4, turn: 33, speaker: '사회자', type: 'AI',   side: 'neutral' },
];

const TOTAL = DEBATE_TURNS.length;

// ─────────────────────────────────────────────
// 초기 메시지: 입론 4턴 + 연쇄논박 1·2차 완료 상태
// ─────────────────────────────────────────────
const INITIAL_MESSAGES = [
  // 입론
  { id: 1,  type: 'message', speaker: '찬성1', side: 'pro', isUser: false,
    content: '저는 인공지능 기술의 발전이 인류에게 전반적으로 이익이 된다고 주장합니다. 특히 의료 분야에서 AI 진단 시스템은 희귀 질환 발견율을 40% 이상 향상시켰습니다. 이는 규제보다 적극적 활용이 필요함을 보여줍니다.' },
  { id: 2,  type: 'message', speaker: '반대1', side: 'con', isUser: false,
    content: 'AI 의료 사례만으로는 충분하지 않습니다. 알고리즘 편향 문제는 실제 현장에서 특정 집단에게 불공정한 진단을 초래합니다. 40% 향상이라는 수치의 출처와 적용 대상을 명확히 해주시기 바랍니다.' },
  { id: 3,  type: 'message', speaker: '찬성2', side: 'pro', isUser: false,
    content: '알고리즘 편향은 데이터 다양성 확보로 해결 가능합니다. DeepMind 안과 AI는 94개국 데이터로 훈련되어 편향 문제를 최소화했습니다. 반대2 측의 입론을 기대하겠습니다.' },
  { id: 4,  type: 'message', speaker: '반대2', side: 'con', isUser: true,
    content: 'AI가 가져오는 편익은 분명 존재하지만, 그 혜택이 사회 전체에 균등하게 분배되는지가 핵심입니다. WEF 2024 보고서에 따르면 AI 도입으로 향후 5년간 저숙련 일자리의 23%가 소멸될 것으로 예측됩니다. 기술 발전의 수혜가 소수 기업과 고학력자에게 집중된다면, 이는 사회적 불평등을 심화시키는 결과를 낳습니다.' },

  // 연쇄논박 1차: 반대1 → 찬성1 반박 / 찬성1 대답
  { id: 5,  type: 'message', speaker: '반대1', side: 'con', isUser: false,
    content: '@찬성1 의료 AI 사례를 근거로 드셨는데, 해당 시스템 도입 병원의 95% 이상이 선진국에 편중되어 있습니다. 의료 격차가 이미 심각한 개발도상국에는 오히려 접근성 불평등이 심화될 수 있지 않을까요?' },
  { id: 6,  type: 'message', speaker: '찬성1', side: 'pro', isUser: false,
    content: '좋은 지적입니다. 그러나 스마트폰 보급률이 96%에 달하는 현재, 저비용 AI 진단 앱은 이미 케냐, 인도 등지에서 활발히 배포되고 있습니다. 기술 격차는 시간이 지남에 따라 자연스럽게 해소됩니다.' },

  // 연쇄논박 2차: 찬성1 → 반대1 반박 / 반대1 대답
  { id: 7,  type: 'message', speaker: '찬성1', side: 'pro', isUser: false,
    content: '@반대1 일자리 소멸 우려를 제기하셨는데, AI는 동시에 새로운 직군을 창출합니다. McKinsey는 2030년까지 AI 관련 신규 일자리가 5,800만 개 생성될 것으로 전망합니다. 순감보다 순증이 예상됩니다.' },
  { id: 8,  type: 'message', speaker: '반대1', side: 'con', isUser: false,
    content: 'McKinsey 수치는 전 세계 평균치입니다. 문제는 소멸 직군과 창출 직군의 지역·기술 수준 불일치입니다. 공장 노동자가 AI 엔지니어로 전환하려면 평균 4년의 재교육이 필요하다는 연구가 있습니다. 이 공백을 누가 책임집니까?' },
];

// ─────────────────────────────────────────────
// 발언자별 AI 응답 풀
// ─────────────────────────────────────────────
const AI_POOL = {
  '찬성1': [
    '역사적으로 증기기관, 전기, 인터넷 도입 시에도 동일한 우려가 있었습니다. 결과적으로 생산성 향상과 삶의 질 개선으로 이어졌고, AI도 같은 궤적을 따를 것입니다.',
    '규제 일변도 접근은 혁신 생태계를 위축시킵니다. 유럽의 GDPR이 AI 스타트업 성장률을 23% 저하시켰다는 연구를 참고해 주십시오.',
    '@반대2 말씀하신 WEF 수치는 자동화 전반을 포함한 것입니다. AI 특정 영향만 분리하면 순 고용 창출이 예측됩니다. 추가 근거를 제시해 주실 수 있나요?',
  ],
  '찬성2': [
    'DeepMind의 AlphaFold는 2억 개 단백질 구조를 해독해 신약 개발 비용을 90% 절감했습니다. 이러한 과학적 도약은 인류 전체의 이익입니다.',
    '@반대2 말씀하신 불평등 심화는 AI 자체의 문제가 아니라 분배 정책의 문제입니다. 기술을 규제할 것이 아니라 세제·복지 설계를 개혁해야 합니다.',
    '자율주행 기술은 연간 교통사고 사망자 135만 명 중 상당수를 구할 수 있습니다. 안전 편익을 수치화하면 경제적 논의와 차원이 달라집니다.',
  ],
  '반대1': [
    '설령 AI가 새 일자리를 만들어도, 그 일자리는 고학력·고숙련 노동자에게 집중됩니다. 저숙련 노동자의 전환 경로가 불명확한 상황에서 낙관론은 무책임합니다.',
    'AI 알고리즘의 블랙박스 문제는 사법·의료 등 중요 의사결정에서 설명 불가능한 결과를 야기합니다. 투명성 없는 기술 확산은 민주주의 가치와 충돌합니다.',
    '@찬성1 생산성 향상의 과실이 주주와 경영진에게 집중되는 현실을 외면하고 있습니다. 기술 중립성은 환상입니다.',
  ],
  '사회자': [
    '지금까지의 논의를 정리합니다. 찬성 측은 AI의 의료·과학적 편익과 역사적 기술 도약 사례를 근거로 들었고, 반대 측은 불평등 심화와 전환 비용 문제를 집중 제기했습니다. 양측 모두 기술 자체보다 분배와 거버넌스가 핵심임을 인정하고 있습니다.',
  ],
};

const getAIResponse = (turnData) => {
  const pool = AI_POOL[turnData.speaker] ?? AI_POOL['찬성1'];
  const content = pool[Math.floor(Math.random() * pool.length)];
  return { speaker: turnData.speaker, side: turnData.side, isUser: false, content };
};

const MOCK_ISSUES = [
  { id: 1, title: '불평등 심화', content: 'AI 혜택이 고학력·선진국에 집중되며 구조적 격차가 확대될 우려' },
  { id: 2, title: '일자리 전환 비용', content: '소멸 직군과 창출 직군의 지역·기술 수준 불일치 문제' },
  { id: 3, title: '알고리즘 편향', content: 'AI 시스템의 블랙박스 문제와 의사결정 투명성 부재' },
];

const MOCK_REBUTTALS = [
  { from: '반대1', to: '찬성1', content: '의료 AI 편중 문제 — 개발도상국 접근성 불평등 제기' },
  { from: '찬성1', to: '반대1', content: '저비용 AI 앱 사례 — 기술 격차 자연 해소 반박' },
  { from: '찬성1', to: '반대1', content: 'McKinsey 신규 일자리 5,800만 개 — 순감 아닌 순증 주장' },
  { from: '반대1', to: '찬성1', content: '직군 전환 4년 소요 — 재교육 공백 책임 소재 반박' },
  { from: '반대2', to: '찬성2', content: 'WEF 저숙련 일자리 23% 소멸 — 기술 낙관론 반박' },
];

// ─────────────────────────────────────────────
// 연쇄논박 1·2차 완료 후 → 턴 9(반대2 첫 USER 연쇄논박)부터 시작
// ─────────────────────────────────────────────
const INIT_TURN_IDX = 8;

const DebatePage = ({ topic, userStance, visible }) => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [turnIdx, setTurnIdx] = useState(INIT_TURN_IDX);
  const [previewStance, setPreviewStance] = useState(userStance ?? 'con');

  const currentTurnData = DEBATE_TURNS[turnIdx] ?? DEBATE_TURNS[TOTAL - 1];
  const activeStance = previewStance;

  // 연속 AI 턴을 순차적으로 자동 진행
  const scheduleAI = (idx, delay = 1600) => {
    if (idx >= TOTAL) return;
    const turn = DEBATE_TURNS[idx];
    if (turn.type !== 'AI') {
      setTurnIdx(idx);
      return;
    }
    setTimeout(() => {
      const aiMsg = getAIResponse(turn);
      setMessages(prev => [...prev, { id: prev.length + 1, type: 'message', ...aiMsg }]);
      setTurnIdx(idx);
      scheduleAI(idx + 1, 1600);
    }, delay);
  };

  const handleSend = (text) => {
    const newMsg = {
      id: messages.length + 1,
      type: 'message',
      speaker: '반대2',
      side: currentTurnData.reversed ? 'pro' : 'con',
      isUser: true,
      content: text,
    };
    setMessages(prev => [...prev, newMsg]);

    const nextIdx = turnIdx + 1;
    if (nextIdx >= TOTAL) return;
    scheduleAI(nextIdx);
  };

  return (
    <div
      className={`absolute inset-0 flex flex-col transition-all duration-700
        ${!visible ? 'opacity-0 translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}`}
      style={{
        background: activeStance === 'pro'
          ? 'linear-gradient(to bottom right, rgba(147,197,253,0.55), rgba(219,234,254,0.35), rgba(245,245,244,0.15))'
          : 'linear-gradient(to bottom right, rgba(252,165,165,0.55), rgba(254,226,226,0.35), rgba(245,245,244,0.15))',
      }}
    >

      <DebateHeader
        topic={topic}
        currentTurnData={{ ...currentTurnData, total: TOTAL }}
        turns={DEBATE_TURNS}
        turnIdx={turnIdx}
      />

      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        <ChatArea messages={messages} />
        <SidePanel
          issues={MOCK_ISSUES}
          rebuttals={MOCK_REBUTTALS}
          currentSpeaker={currentTurnData.speaker}
        />
      </div>

      <ChatInput onSend={handleSend} currentTurnData={{ ...currentTurnData, total: TOTAL }} />

      {/* 개발용 스탠스 토글 */}
      <div className="absolute bottom-24 right-4 flex gap-2 z-50">
        <button
          onClick={() => setPreviewStance('pro')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
            ${activeStance === 'pro' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white/70 text-stone-400 border-stone-200 hover:border-blue-300'}`}
        >찬성 미리보기</button>
        <button
          onClick={() => setPreviewStance('con')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
            ${activeStance === 'con' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/70 text-stone-400 border-stone-200 hover:border-rose-300'}`}
        >반대 미리보기</button>
      </div>
    </div>
  );
};

export default DebatePage;
