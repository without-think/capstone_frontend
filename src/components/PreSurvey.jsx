import { useState } from 'react';
import { SURVEY_DATA } from '../data/surveyData';

const LIKERT_LABELS = ['전혀\n아니다', '아니다', '보통', '그렇다', '매우\n그렇다'];
const INTENSITY_LABELS = ['매우\n약하게', '약하게', '보통', '강하게', '매우\n강하게'];

const LikertRow = ({ question, value, onChange, stanceColor }) => {
  const isIntensity = question.type === 'intensity';
  const labels = isIntensity ? INTENSITY_LABELS : LIKERT_LABELS;

  return (
    <div className={`rounded-2xl p-5 transition-all duration-200 ${isIntensity ? 'bg-stone-100 border-2 border-stone-300' : 'bg-white border border-stone-100'} shadow-sm`}>
      {isIntensity && (
        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${stanceColor.badge}`}>
          주장 강도
        </span>
      )}
      <p className={`text-stone-800 font-medium mb-4 leading-snug ${isIntensity ? 'text-base font-bold' : 'text-sm'}`}>
        {question.text}
      </p>
      <div className="flex items-end justify-between gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => onChange(question.id, level)}
            className="flex flex-col items-center gap-2 flex-1 group"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200
              ${value === level
                ? `${isIntensity ? stanceColor.selected : 'bg-stone-800 text-white'} scale-110 shadow-md`
                : 'bg-stone-100 text-stone-400 group-hover:bg-stone-200 group-hover:text-stone-600'
              }`}
            >
              {level}
            </div>
            <span className="text-[10px] text-stone-400 text-center leading-tight whitespace-pre-line">
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

  const stanceColor = userStance === 'pro'
    ? { badge: 'bg-blue-100 text-blue-700', selected: 'bg-blue-500 text-white' }
    : { badge: 'bg-rose-100 text-rose-700', selected: 'bg-rose-500 text-white' };

  const handleChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    onComplete(answers);
  };

  return (
    <div className={`absolute inset-0 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      ${!visible ? 'opacity-0 translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}`}
    >
      {/* 헤더 */}
      <div className="shrink-0 bg-white/70 backdrop-blur-md border-b border-stone-200/70 px-8 py-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">사전 설문</p>
              <h2 className="text-stone-800 font-bold text-lg">토론 전 인식 조사</h2>
            </div>
            <span className="text-sm font-semibold text-stone-500">
              {answeredCount} / {totalCount}
            </span>
          </div>
          {/* 진행 바 */}
          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-700 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 문항 리스트 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-8 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {questions.map((q, idx) => (
            <div key={q.id}>
              {/* 강도 문항 위에 구분 레이블 */}
              {q.type !== 'intensity' && idx === 1 && (
                <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-3 mt-1">
                  인식 및 태도 문항
                </p>
              )}
              <div className="flex gap-3">
                {q.type !== 'intensity' && (
                  <span className="shrink-0 mt-5 text-xs text-stone-300 font-medium w-4 text-right">
                    {idx}
                  </span>
                )}
                <div className="flex-1">
                  <LikertRow
                    question={q}
                    value={answers[q.id]}
                    onChange={handleChange}
                    stanceColor={stanceColor}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 완료 버튼 */}
      <div className="shrink-0 bg-white/70 backdrop-blur-md border-t border-stone-200/70 px-8 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <p className={`text-sm font-medium transition-colors ${allAnswered ? 'text-stone-500' : 'text-stone-300'}`}>
            {allAnswered ? '모든 문항을 완료했습니다' : `${totalCount - answeredCount}개 문항이 남았습니다`}
          </p>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`px-10 py-3.5 rounded-full font-bold text-base transition-all duration-300
              ${allAnswered
                ? 'bg-stone-900 text-white hover:bg-black hover:scale-105 shadow-lg cursor-pointer'
                : 'bg-stone-100 text-stone-300 cursor-not-allowed'
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
