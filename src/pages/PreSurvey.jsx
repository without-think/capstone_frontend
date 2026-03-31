import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { getSurveyLink } from '../config/surveyLinks';

const PreSurvey = ({ visible, topicId, onComplete }) => {
  const [hasOpenedForm, setHasOpenedForm] = useState(false);
  const surveyUrl = getSurveyLink(topicId);
  const hasSurveyUrl = Boolean(surveyUrl);

  useEffect(() => {
    setHasOpenedForm(false);
  }, [topicId]);

  const handleOpenForm = () => {
    if (!hasSurveyUrl) return;
    window.open(surveyUrl, '_blank', 'noopener,noreferrer');
    setHasOpenedForm(true);
  };

  return (
    <div
      className={`hide-scrollbar absolute inset-0 overflow-y-auto transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      ${!visible ? 'opacity-0 translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}`}
    >
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center px-6 pb-16 pt-4">
        <div className="mx-auto w-full max-w-3xl rounded-[40px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(245,245,244,0.94))] px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.12)] md:px-10 md:py-10">
          <div className="text-center">
            <span className="mb-3 inline-block rounded-full bg-stone-100/90 px-4 py-1 text-sm font-semibold text-stone-500">
              외부 설문
            </span>
            <h2 className="text-[24px] font-extrabold tracking-tight text-stone-800 md:text-[30px]">
              구글폼에서 사전 설문을 진행합니다
            </h2>
            <p className="mt-3 text-[14px] font-medium leading-6 text-stone-500 md:text-[15px]">
              설문은 새 탭에서 열립니다. 제출을 마친 뒤 이 화면으로 돌아와 다음 단계로 진행하세요.
            </p>
          </div>

          <div className="mt-7 rounded-[32px] border border-stone-200 bg-white/85 px-5 py-5 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
            <p className="text-sm font-semibold tracking-[0.02em] text-stone-500">권장 진행 방식</p>
            <div className="mt-4 grid gap-3 text-sm text-stone-700 md:grid-cols-3">
              <div className="rounded-[24px] bg-stone-50 px-4 py-4">
                <p className="font-bold text-stone-800">1. 설문 열기</p>
                <p className="mt-1 leading-6">아래 버튼으로 구글폼을 새 탭에서 엽니다.</p>
              </div>
              <div className="rounded-[24px] bg-stone-50 px-4 py-4">
                <p className="font-bold text-stone-800">2. 응답 제출</p>
                <p className="mt-1 leading-6">구글폼에서 답변을 완료하고 제출합니다.</p>
              </div>
              <div className="rounded-[24px] bg-stone-50 px-4 py-4">
                <p className="font-bold text-stone-800">3. 다시 돌아오기</p>
                <p className="mt-1 leading-6">현재 페이지로 돌아와 퀴즈 단계로 넘어갑니다.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[32px] border border-stone-200 bg-stone-50/90 px-5 py-4">
            <p className="text-sm font-semibold text-stone-600">설문 링크 상태</p>
            <p className={`mt-2 text-sm leading-6 ${hasSurveyUrl ? 'text-stone-500' : 'text-rose-500'}`}>
              {hasSurveyUrl
                ? '구글폼 링크가 연결되어 있습니다.'
                : '아직 구글폼 링크가 설정되지 않았습니다. VITE_GOOGLE_FORM_URL 또는 주제별 URL을 추가해야 합니다.'}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              onClick={handleOpenForm}
              disabled={!hasSurveyUrl}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold transition-all duration-300 ${
                hasSurveyUrl
                  ? 'bg-stone-900 text-white shadow-lg hover:scale-105 hover:bg-black'
                  : 'cursor-not-allowed bg-stone-200 text-stone-400'
              }`}
            >
              구글폼 열기
              <ExternalLink size={18} />
            </button>

            <button
              onClick={onComplete}
              disabled={!hasSurveyUrl || !hasOpenedForm}
              className={`rounded-full px-8 py-4 text-base font-bold transition-all duration-300 ${
                hasSurveyUrl && hasOpenedForm
                  ? 'border border-stone-300 bg-white text-stone-700 hover:scale-105 hover:border-stone-400'
                  : 'cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-300'
              }`}
            >
              설문 제출 후 퀴즈로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreSurvey;
