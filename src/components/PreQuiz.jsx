import { useState } from 'react';
import { SURVEY_DATA } from '../data/surveyData';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const PreQuiz = ({ visible, topicId, onComplete }) => {
  const data = SURVEY_DATA[topicId];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);       // 선택한 보기 index
  const [confidence, setConfidence] = useState(null);   // true=확신, false=불확실
  const [answers, setAnswers] = useState([]);            // 누적 답변

  if (!data) return null;

  const questions = data.quiz;
  const total = questions.length;
  const q = questions[currentIdx];
  const isLast = currentIdx === total - 1;
  const canNext = selected !== null && confidence !== null;

  const handleSelect = (idx) => {
    if (selected !== null) return; // 이미 선택한 경우 변경 불가
    setSelected(idx);
  };

  const handleNext = () => {
    if (!canNext) return;
    const record = {
      questionId: q.id,
      selected,
      correct: selected === q.answer,
      confident: confidence,
    };
    const newAnswers = [...answers, record];

    if (isLast) {
      onComplete(newAnswers);
    } else {
      setAnswers(newAnswers);
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setConfidence(null);
    }
  };

  const getOptionStyle = (idx) => {
    if (selected === null) {
      return 'bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:shadow-md cursor-pointer';
    }
    if (idx === q.answer) {
      return 'bg-emerald-50 border-emerald-400 text-emerald-800';
    }
    if (idx === selected && selected !== q.answer) {
      return 'bg-rose-50 border-rose-400 text-rose-800';
    }
    return 'bg-stone-50 border-stone-100 text-stone-400';
  };

  return (
    <div className={`hide-scrollbar absolute inset-0 overflow-y-auto transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      ${!visible ? 'opacity-0 translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}`}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 pb-24 pt-6">
        <div className="mb-6 text-center">
          <span className="mb-3 inline-block rounded-full bg-stone-100/90 px-4 py-1 text-sm font-semibold text-stone-500">
            사전 퀴즈
          </span>
          <h2 className="text-[30px] font-extrabold tracking-tight text-stone-800 md:text-[36px]">
            주제 관련 지식 확인
          </h2>
          <p className="mt-2 text-[15px] font-medium text-stone-500 md:text-[17px]">
            토론 전에 핵심 사실 이해도를 간단히 점검합니다
          </p>
        </div>

        <div className="mx-auto mb-5 w-full max-w-3xl rounded-[28px] border border-white/80 bg-white/78 px-6 py-5 backdrop-blur-md shadow-[0_16px_32px_rgba(0,0,0,0.08)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold tracking-[0.02em] text-stone-500">진행 현황</p>
            <span className="text-sm font-bold text-stone-600">
              {currentIdx + 1} / {total}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-stone-700 transition-all duration-500"
              style={{ width: `${((currentIdx + (canNext ? 1 : 0)) / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-2 py-2">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">

          <div className="rounded-[26px] border border-white/80 bg-white/94 px-8 py-7 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-stone-400">
              Q{currentIdx + 1}
            </span>
            <p className="text-[19px] font-semibold leading-snug text-stone-800">{q.text}</p>
          </div>

          <div className="flex flex-col gap-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`flex items-center gap-4 rounded-[22px] border-2 px-6 py-4 text-left transition-all duration-200 ${getOptionStyle(idx)}`}
              >
                <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border
                  ${selected === null ? 'border-stone-200 text-stone-400' :
                    idx === q.answer ? 'bg-emerald-400 border-emerald-400 text-white' :
                    idx === selected ? 'bg-rose-400 border-rose-400 text-white' :
                    'border-stone-200 text-stone-300'
                  }`}
                >
                  {OPTION_LABELS[idx]}
                </span>
                <span className="font-medium">{opt}</span>
              </button>
            ))}
          </div>

          <div className={`transition-all duration-300 ${selected !== null ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="rounded-[26px] border border-white/80 bg-white/94 px-8 py-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
              <p className="mb-4 text-sm font-semibold text-stone-600">이 답에 얼마나 확신하십니까?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfidence(true)}
                  className={`flex-1 rounded-[18px] border-2 py-3 text-sm font-bold transition-all duration-200
                    ${confidence === true
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                    }`}
                >
                  확신한다
                </button>
                <button
                  onClick={() => setConfidence(false)}
                  className={`flex-1 rounded-[18px] border-2 py-3 text-sm font-bold transition-all duration-200
                    ${confidence === false
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                    }`}
                >
                  확실하지 않다
                </button>
              </div>
            </div>
          </div>

        </div>
        </div>

        <div className="mx-auto mt-6 flex w-full max-w-3xl justify-end rounded-[24px] border border-white/80 bg-white/78 px-6 py-5 backdrop-blur-md shadow-[0_16px_32px_rgba(0,0,0,0.08)]">
          <button
            onClick={handleNext}
            disabled={!canNext}
            className={`rounded-full px-10 py-3.5 text-base font-bold transition-all duration-300
              ${canNext
                ? 'cursor-pointer bg-stone-900 text-white shadow-lg hover:scale-105 hover:bg-black'
                : 'cursor-not-allowed bg-stone-100 text-stone-300'
              }`}
          >
            {isLast ? '퀴즈 완료 →' : '다음 문제 →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreQuiz;
