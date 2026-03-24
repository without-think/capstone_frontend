import { useState } from 'react';
import { SURVEY_DATA } from '../data/surveyData';

const LIKERT_LABELS = ['전혀\n아니다', '아니다', '보통', '그렇다', '매우\n그렇다'];
const INTENSITY_LABELS = ['매우\n약하게', '약하게', '보통', '강하게', '매우\n강하게'];

const LikertRow = ({ question, value, onChange, stanceColor }) => {
  const isIntensity = question.type === 'intensity';
  const labels = isIntensity ? INTENSITY_LABELS : LIKERT_LABELS;

  return (
    <div
      className={`rounded-[32px] p-4 transition-all duration-200 ${
        isIntensity
          ? 'border border-stone-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,245,244,0.92))]'
          : 'border border-white/80 bg-white/94'
      } shadow-[0_10px_24px_rgba(0,0,0,0.08)]`}
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <p className={`leading-snug text-stone-800 ${isIntensity ? 'text-[14px] font-bold' : 'text-[13px] font-medium'}`}>
          {question.text}
        </p>
        {isIntensity && (
          <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${stanceColor.badge}`}>
            주장 강도
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => onChange(question.id, level)}
            className="group flex flex-1 flex-col items-center gap-2"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${
                value === level
                  ? `${isIntensity ? stanceColor.selected : 'bg-stone-800 text-white'} scale-110 shadow-md`
                  : 'bg-stone-100 text-stone-400 group-hover:bg-stone-200 group-hover:text-stone-600'
              }`}
            >
              {level}
            </div>
            <span className="whitespace-pre-line text-center text-[10px] leading-tight text-stone-400">
              {labels[level - 1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const PreSurvey = ({ visible, topicId, userStance, onComplete }) => {
  const data = SURVEY_DATA[topicId];
  const [answers, setAnswers] = useState({});

  if (!data) return null;

  const questions = data.questions;
  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const allAnswered = answeredCount === totalCount;

  const stanceColor =
    userStance === 'pro'
      ? { badge: 'bg-blue-100 text-blue-700', selected: 'bg-blue-500 text-white' }
      : { badge: 'bg-rose-100 text-rose-700', selected: 'bg-rose-500 text-white' };

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    onComplete(answers);
  };

  return (
    <div
      className={`hide-scrollbar absolute inset-0 overflow-y-auto transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      ${!visible ? 'opacity-0 translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}`}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 pb-16 pt-4">
        <div className="mb-4 text-center">
          <span className="mb-2 inline-block rounded-full bg-stone-100/90 px-4 py-1 text-sm font-semibold text-stone-500">
            사전 설문
          </span>
          <h2 className="text-[24px] font-extrabold tracking-tight text-stone-800 md:text-[28px]">
            토론 전 인식 조사
          </h2>
          <p className="mt-1 text-[13px] font-medium text-stone-500 md:text-[15px]">
            현재 생각과 주장 강도를 먼저 확인합니다
          </p>
        </div>

        <div className="sticky top-0 z-10 mx-auto mb-3 w-full max-w-3xl rounded-[32px] border border-white/80 bg-white/78 px-5 py-3 backdrop-blur-md shadow-[0_16px_32px_rgba(0,0,0,0.08)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold tracking-[0.02em] text-stone-500">진행 현황</p>
            <span className="text-sm font-bold text-stone-600">
              {answeredCount} / {totalCount}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-stone-700 transition-all duration-300"
              style={{ width: `${(answeredCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-2 py-1">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {questions.map((q, idx) => (
              <div key={q.id}>
                {q.type !== 'intensity' && idx === 1 && (
                  <p className="mb-3 mt-1 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    인식 및 태도 문항
                  </p>
                )}
                <LikertRow
                  question={q}
                  value={answers[q.id]}
                  onChange={handleChange}
                  stanceColor={stanceColor}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-4 flex w-full max-w-3xl items-center justify-between rounded-[32px] border border-white/80 bg-white/78 px-5 py-3 backdrop-blur-md shadow-[0_16px_32px_rgba(0,0,0,0.08)]">
          <p className={`text-sm font-medium transition-colors ${allAnswered ? 'text-stone-500' : 'text-stone-300'}`}>
            {allAnswered ? '모든 문항을 완료했습니다' : `${totalCount - answeredCount}개 문항이 남았습니다`}
          </p>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`rounded-full px-10 py-3.5 text-base font-bold transition-all duration-300 ${
              allAnswered
                ? 'cursor-pointer bg-stone-900 text-white shadow-lg hover:scale-105 hover:bg-black'
                : 'cursor-not-allowed bg-stone-100 text-stone-300'
            }`}
          >
            퀴즈로 넘어가기 →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreSurvey;
