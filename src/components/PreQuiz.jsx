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
    <div className={`absolute inset-0 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      ${!visible ? 'opacity-0 translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}`}
    >
      {/* 헤더 */}
      <div className="shrink-0 bg-white/70 backdrop-blur-md border-b border-stone-200/70 px-8 py-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">사전 퀴즈</p>
              <h2 className="text-stone-800 font-bold text-lg">주제 관련 지식 확인</h2>
            </div>
            <span className="text-sm font-semibold text-stone-500">
              {currentIdx + 1} / {total}
            </span>
          </div>
          {/* 진행 바 */}
          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-700 rounded-full transition-all duration-500"
              style={{ width: `${((currentIdx + (canNext ? 1 : 0)) / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 문제 영역 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-8 py-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">

          {/* 문제 번호 + 질문 */}
          <div className="bg-white rounded-2xl px-7 py-6 shadow-sm border border-stone-100">
            <span className="inline-block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
              Q{currentIdx + 1}
            </span>
            <p className="text-stone-800 font-semibold text-lg leading-snug">{q.text}</p>
          </div>

          {/* 보기 */}
          <div className="flex flex-col gap-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all duration-200 ${getOptionStyle(idx)}`}
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

          {/* 확신도 — 보기 선택 후 등장 */}
          <div className={`transition-all duration-300 ${selected !== null ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="bg-white rounded-2xl px-7 py-5 shadow-sm border border-stone-100">
              <p className="text-stone-600 font-semibold text-sm mb-4">이 답에 얼마나 확신하십니까?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfidence(true)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 border-2
                    ${confidence === true
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                    }`}
                >
                  확신한다
                </button>
                <button
                  onClick={() => setConfidence(false)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 border-2
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

      {/* 하단 버튼 */}
      <div className="shrink-0 bg-white/70 backdrop-blur-md border-t border-stone-200/70 px-8 py-5">
        <div className="max-w-2xl mx-auto flex justify-end">
          <button
            onClick={handleNext}
            disabled={!canNext}
            className={`px-10 py-3.5 rounded-full font-bold text-base transition-all duration-300
              ${canNext
                ? 'bg-stone-900 text-white hover:bg-black hover:scale-105 shadow-lg cursor-pointer'
                : 'bg-stone-100 text-stone-300 cursor-not-allowed'
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
