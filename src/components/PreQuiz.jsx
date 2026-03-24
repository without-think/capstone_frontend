import { useState } from 'react';
import { SURVEY_DATA } from '../data/surveyData';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const PreQuiz = ({ visible, topicId, onComplete }) => {
  const data = SURVEY_DATA[topicId];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [answers, setAnswers] = useState([]);

  if (!data) return null;

  const questions = data.quiz;
  const total = questions.length;
  const q = questions[currentIdx];
  const isLast = currentIdx === total - 1;
  const hasPrevious = currentIdx > 0;
  const canNext = selected !== null && confidence !== null;

  const handleSelect = (idx) => {
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
      return;
    }

    setAnswers(newAnswers);
    setCurrentIdx((i) => i + 1);
    setSelected(null);
    setConfidence(null);
  };

  const handlePrev = () => {
    if (!hasPrevious) return;

    const previousRecord = answers[answers.length - 1];
    if (!previousRecord) {
      setCurrentIdx((i) => Math.max(0, i - 1));
      setSelected(null);
      setConfidence(null);
      return;
    }

    setAnswers((prev) => prev.slice(0, -1));
    setCurrentIdx((i) => i - 1);
    setSelected(previousRecord.selected);
    setConfidence(previousRecord.confident);
  };

  const getOptionStyle = (idx) => {
    if (selected === null) {
      return 'bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:shadow-md cursor-pointer';
    }
    if (idx === selected) {
      return 'bg-stone-800 border-stone-800 text-white';
    }
    return 'bg-stone-50 border-stone-100 text-stone-400';
  };

  return (
    <div
      className={`hide-scrollbar absolute inset-0 overflow-y-auto transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      ${!visible ? 'opacity-0 translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}`}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 pb-16 pt-4">
        <div className="mb-4 text-center">
          <span className="mb-2 inline-block rounded-full bg-stone-100/90 px-4 py-1 text-sm font-semibold text-stone-500">
            사전 퀴즈
          </span>
          <h2 className="text-[24px] font-extrabold tracking-tight text-stone-800 md:text-[28px]">
            주제 관련 지식 확인
          </h2>
          <p className="mt-1 text-[13px] font-medium text-stone-500 md:text-[15px]">
            토론 전에 핵심 사실 이해도를 간단히 점검합니다
          </p>
        </div>

        <div className="mx-auto mb-3 w-full max-w-3xl rounded-[32px] border border-white/80 bg-white/78 px-5 py-3 backdrop-blur-md shadow-[0_16px_32px_rgba(0,0,0,0.08)]">
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
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            <div className="rounded-[32px] border border-white/80 bg-white/94 px-6 py-5 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
              <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-stone-400">
                Q{currentIdx + 1}
              </span>
              <p className="text-[19px] font-semibold leading-snug text-stone-800">{q.text}</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`flex items-center justify-center gap-2 rounded-full border-2 px-4 py-3 text-center transition-all duration-200 ${getOptionStyle(idx)}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                      selected === null
                        ? 'border-stone-200 text-stone-400'
                        : idx === selected
                        ? 'border-stone-800 bg-stone-800 text-white'
                        : 'border-stone-200 text-stone-300'
                    }`}
                  >
                    {OPTION_LABELS[idx]}
                  </span>
                  <span className="min-w-0 text-sm font-medium leading-tight">{opt}</span>
                </button>
              ))}
            </div>

            <div
              className={`transition-all duration-300 ${
                selected !== null ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <div className="rounded-[32px] border border-white/80 bg-white/94 px-6 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
                <p className="mb-3 text-sm font-semibold text-stone-600">이 답에 얼마나 확신하십니까?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfidence(true)}
                    className={`flex-1 rounded-full border-2 py-3 text-sm font-bold transition-all duration-200 ${
                      confidence === true
                        ? 'border-stone-800 bg-stone-800 text-white'
                        : 'border-stone-200 bg-white text-stone-500 hover:border-stone-400'
                    }`}
                  >
                    확신한다
                  </button>
                  <button
                    onClick={() => setConfidence(false)}
                    className={`flex-1 rounded-full border-2 py-3 text-sm font-bold transition-all duration-200 ${
                      confidence === false
                        ? 'border-stone-800 bg-stone-800 text-white'
                        : 'border-stone-200 bg-white text-stone-500 hover:border-stone-400'
                    }`}
                  >
                    확실하지 않다
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-4 flex w-full max-w-3xl items-center justify-between rounded-[32px] border border-white/80 bg-white/78 px-5 py-3 backdrop-blur-md shadow-[0_16px_32px_rgba(0,0,0,0.08)]">
          <button
            onClick={handlePrev}
            disabled={!hasPrevious}
            className={`rounded-full px-7 py-3 text-sm font-bold transition-all duration-300 ${
              hasPrevious
                ? 'cursor-pointer border border-stone-300 bg-white text-stone-600 hover:scale-105 hover:border-stone-400'
                : 'cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-300'
            }`}
          >
            ← 이전 문제
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext}
            className={`rounded-full px-10 py-3.5 text-base font-bold transition-all duration-300 ${
              canNext
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
