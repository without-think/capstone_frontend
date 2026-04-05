import { useState } from 'react';
import { DEFAULT_PREQUIZ } from '../data/surveyData';
import FixedStage from '../components/FixedStage';

const OPTION_LABELS = ['O', 'X'];

const SECTION_META = {
  background: {
    title: '사전 배경 문제',
    tone: 'text-stone-500',
  },
  pro: {
    title: '찬성 진영 관점',
    tone: 'text-blue-500',
  },
  con: {
    title: '반대 진영 관점',
    tone: 'text-rose-500',
  },
};

const PreQuiz = ({ visible, topicId: _topicId, activeData, selectedSubTopics = [], onComplete }) => {
  const questions = DEFAULT_PREQUIZ;
  const [answers, setAnswers] = useState({});
  const selectedSubTopic = activeData?.subTopics?.find((subTopic) => subTopic.title === selectedSubTopics[0]);
  const sectionedQuestions = [
    {
      key: 'background',
      title: SECTION_META.background.title,
      questions: questions.filter((question) => question.section === 'background'),
    },
    {
      key: 'pro',
      title: SECTION_META.pro.title,
      subtitle: `"${selectedSubTopic?.pro ?? '찬성'}"의 입장에서 선택해주세요`,
      questions: questions.filter((question) => question.section === 'pro'),
    },
    {
      key: 'con',
      title: SECTION_META.con.title,
      subtitle: `"${selectedSubTopic?.con ?? '반대'}"의 입장에서 선택해주세요`,
      questions: questions.filter((question) => question.section === 'con'),
    },
  ];
  const backgroundSection = sectionedQuestions.find((section) => section.key === 'background');
  const stanceSections = sectionedQuestions.filter((section) => section.key !== 'background');

  const answeredCount = Object.keys(answers).length;
  const canSubmit = answeredCount === questions.length;

  const handleSelect = (questionId, selected) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selected,
    }));
  };

  const handleComplete = () => {
    if (!canSubmit) return;

    const result = questions.map((question) => ({
      questionId: question.id,
      selected: answers[question.id],
      correct: answers[question.id] === question.answer,
    }));

    onComplete(result);
  };

  const getOptionStyle = (questionId, idx) => {
    const selected = answers[questionId];
    if (selected === undefined) {
      return 'bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:shadow-md';
    }
    if (selected === idx) {
      return idx === 0
        ? 'bg-blue-600 border-blue-600 text-white'
        : 'bg-rose-600 border-rose-600 text-white';
    }
    return 'bg-stone-50 border-stone-100 text-stone-300';
  };

  return (
    <div
      className={`absolute inset-0 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      ${!visible ? 'opacity-0 translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}`}
    >
      <div className="mx-auto flex min-h-screen w-full items-start justify-center">
        <FixedStage baseWidth={1320} baseHeight={820}>
          <div className="relative h-[820px] w-[1320px]">
            <div className="absolute inset-0 h-[820px] overflow-y-scroll hide-scrollbar px-[90px] pb-32 pt-6">
              <div className="mx-auto w-[1140px]">
              <div className="mb-5 text-center">
                <span className="mb-2 inline-block rounded-full bg-stone-100/90 px-4 py-1 text-sm font-semibold text-stone-500">
                  사전 퀴즈
                </span>
                <h2 className="text-[24px] font-extrabold tracking-tight text-stone-800">
                  주제 관련 지식 확인
                </h2>
                <p className="mt-1 text-[13px] font-medium text-stone-500">
                  아래 모든 문항에 O/X로 답해주세요
                </p>
              </div>

              <div className="mb-4 flex w-full items-center justify-between rounded-[32px] border border-white/80 bg-white/78 px-5 py-3 backdrop-blur-md shadow-[0_16px_32px_rgba(0,0,0,0.08)]">
                <p className="text-sm font-semibold tracking-[0.02em] text-stone-500">진행 현황</p>
                <span className="text-sm font-bold text-stone-600">
                  {answeredCount} / {questions.length}
                </span>
              </div>

              <div className="flex flex-col gap-5">
                {backgroundSection && (
                  <section
                    key={backgroundSection.key}
                    className="rounded-[32px] border border-white/80 bg-white/70 px-4 py-4 backdrop-blur-md shadow-[0_16px_32px_rgba(0,0,0,0.08)]"
                  >
                    <div className="mb-3 px-1">
                      <p className={`text-[13px] font-extrabold tracking-[0.14em] uppercase ${SECTION_META[backgroundSection.key].tone}`}>
                        {backgroundSection.title}
                      </p>
                    </div>

                    <div className="grid auto-rows-fr grid-cols-2 gap-3">
                      {backgroundSection.questions.map((question) => {
                        const questionNumber = questions.findIndex((item) => item.id === question.id) + 1;
                        return (
                          <div
                            key={question.id}
                            className="flex h-full min-h-[212px] flex-col rounded-[26px] border border-white/80 bg-white/94 px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                          >
                            <span className="mb-2 inline-block text-[11px] font-bold uppercase tracking-widest text-stone-400">
                              Q{questionNumber}
                            </span>
                            <p className="min-h-[72px] text-[16px] font-semibold leading-snug text-stone-800">
                              {question.text}
                            </p>

                            <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
                              {(question.options ?? OPTION_LABELS).map((opt, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSelect(question.id, idx)}
                                  className={`flex h-[54px] items-center justify-center rounded-[20px] border-2 px-4 text-center text-[15px] font-bold transition-all duration-200 ${getOptionStyle(question.id, idx)}`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                <div className="grid grid-cols-2 gap-5">
                  {stanceSections.map((section) => (
                    <section
                      key={section.key}
                      className="rounded-[32px] border border-white/80 bg-white/70 px-4 py-4 backdrop-blur-md shadow-[0_16px_32px_rgba(0,0,0,0.08)]"
                    >
                      <div className="mb-3 px-1">
                        <p className={`text-[13px] font-extrabold tracking-[0.14em] uppercase ${SECTION_META[section.key].tone}`}>
                          {section.title}
                        </p>
                        <p className="mt-1 text-[14px] font-semibold text-stone-600">
                          {section.subtitle}
                        </p>
                      </div>

                      <div className="grid auto-rows-fr grid-cols-1 gap-3">
                        {section.questions.map((question) => {
                          const questionNumber = questions.findIndex((item) => item.id === question.id) + 1;
                          return (
                            <div
                              key={question.id}
                              className="flex h-full min-h-[212px] flex-col rounded-[26px] border border-white/80 bg-white/94 px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                            >
                              <span className="mb-2 inline-block text-[11px] font-bold uppercase tracking-widest text-stone-400">
                                Q{questionNumber}
                              </span>
                              <p className="min-h-[72px] text-[16px] font-semibold leading-snug text-stone-800">
                                {question.text}
                              </p>

                              <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
                                {(question.options ?? OPTION_LABELS).map((opt, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleSelect(question.id, idx)}
                                    className={`flex h-[54px] items-center justify-center rounded-[20px] border-2 px-4 text-center text-[15px] font-bold transition-all duration-200 ${getOptionStyle(question.id, idx)}`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex w-full justify-end rounded-[32px] border border-white/80 bg-white/78 px-5 py-3 backdrop-blur-md shadow-[0_16px_32px_rgba(0,0,0,0.08)]">
                <button
                  onClick={handleComplete}
                  disabled={!canSubmit}
                  className={`rounded-full px-10 py-3.5 text-base font-bold transition-all duration-300 ${
                    canSubmit
                      ? 'cursor-pointer bg-stone-900 text-white shadow-lg hover:scale-105 hover:bg-black'
                      : 'cursor-not-allowed bg-stone-100 text-stone-300'
                  }`}
                >
                  퀴즈 완료 →
                </button>
              </div>
              </div>
            </div>
          </div>
        </FixedStage>
      </div>
    </div>
  );
};

export default PreQuiz;
