import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const STAGES = [
  {
    badge: '1단계',
    title: '입론',
    summary: '각 참가자가 자신의 입장을 처음으로 밝히는 단계입니다.',
    points: [
      'AI 에이전트들이 먼저 입론한 후, 사용자가 마지막으로 입론합니다.',
      '자기소개와 입장 표명, 논거, 결론 탭으로 구성된 입력창에 작성합니다.',
      '핵심은 내 주장의 큰 방향을 선명하게 세우는 것입니다.',
    ],
  },
  {
    badge: '2단계',
    title: '연쇄 논박',
    summary: '상대방의 주장을 직접 반박하는 단계입니다.',
    points: [
      'AI 에이전트들이 서로 주고받은 후, 사용자 차례가 돌아옵니다.',
      '상대 주장 요약 → 허점 지적 → 반박 순서로 가면 안정적입니다.',
      '수치, 사례, 인과관계의 약한 부분을 찌르는 단계입니다.',
    ],
  },
  {
    badge: '3단계',
    title: '자유 논박',
    summary: '상대 에이전트 1명과 집중적으로 논쟁하는 단계입니다.',
    points: [
      '사용자는 두 번 답변하면서 동시에 공격을 진행합니다.',
      '반복보다 새로운 근거와 새로운 각도를 넣는 게 중요합니다.',
      '2:2, 3:3 포맷에서는 상대할 에이전트를 직접 선택합니다.',
    ],
  },
  {
    badge: '4단계',
    title: '역할 반전',
    summary: '서로의 입장을 바꿔 상대편 논리를 옹호합니다.',
    points: [
      '내가 공격하던 논리를 가장 설득력 있게 다시 말해보는 단계입니다.',
      '상대 논리의 강점을 이해할수록 마지막 종합이 좋아집니다.',
    ],
  },
  {
    badge: '5단계',
    title: '종합 회의',
    summary: '토론을 통해 최적의 합의안을 도출하는 단계입니다.',
    points: [
      'AI가 먼저 의견을 내고, 사용자는 두 번에 걸쳐 최종 입장을 정리합니다.',
      '마지막에는 사용자가 "우리의 최적해"를 확정합니다.',
      '누가 이겼는지보다 어떤 결론이 가장 현실적인지 정리하는 단계입니다.',
    ],
  },
];

const FORMATS = [
  { label: '1:1', desc: 'AI 1명 vs 사용자' },
  { label: '2:2', desc: 'AI 3명 vs 사용자' },
  { label: '3:3', desc: 'AI 5명 vs 사용자' },
];

export default function ServiceIntroPage({ onBack }) {
  const [activeStep, setActiveStep] = useState(0);
  const step = STAGES[activeStep];

  return (
    <div className="min-h-screen bg-[#F5F5F4] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-[14px] font-bold text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft size={16} />
            돌아가기
          </button>
        )}

        <div className="mb-10">
          <span className="inline-flex rounded-full bg-stone-900 px-4 py-1.5 text-[12px] font-extrabold tracking-[0.18em] text-white">
            서비스 소개
          </span>
          <h1 className="mt-4 text-[36px] font-black tracking-tight text-stone-900">
            토론은 이렇게 진행돼요
          </h1>
          <p className="mt-3 text-[16px] font-medium text-stone-500">
            AI 에이전트들과 함께 5단계로 구성된 구조화된 토론을 경험해보세요.
          </p>
        </div>

        {/* 단계 선택 탭 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {STAGES.map((s, i) => (
            <button
              key={s.badge}
              onClick={() => setActiveStep(i)}
              className={`rounded-full px-4 py-2 text-[13px] font-bold transition-all ${
                activeStep === i
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-white text-stone-500 ring-1 ring-stone-200 hover:ring-stone-400'
              }`}
            >
              {s.badge} {s.title}
            </button>
          ))}
        </div>

        {/* 단계 상세 */}
        <div className="rounded-[32px] border border-stone-100 bg-white px-8 py-8 shadow-md">
          <div className="mb-2 text-[12px] font-extrabold tracking-[0.15em] text-stone-400 uppercase">
            {activeStep + 1} / {STAGES.length}
          </div>
          <h2 className="text-[30px] font-black tracking-tight text-stone-900">
            {step.badge} {step.title}
          </h2>
          <p className="mt-3 text-[16px] font-medium leading-relaxed text-stone-500">
            {step.summary}
          </p>
          <div className="mt-6 space-y-3">
            {step.points.map((point) => (
              <div
                key={point}
                className="rounded-[18px] border border-stone-100 bg-stone-50 px-5 py-4 text-[15px] font-semibold leading-relaxed text-stone-700"
              >
                {point}
              </div>
            ))}
          </div>

          {/* 이전 / 다음 */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setActiveStep((p) => Math.max(0, p - 1))}
              disabled={activeStep === 0}
              className={`rounded-full px-5 py-2.5 text-[14px] font-bold transition-all ${
                activeStep === 0
                  ? 'cursor-not-allowed bg-stone-100 text-stone-300'
                  : 'bg-white text-stone-600 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50'
              }`}
            >
              이전
            </button>
            <button
              onClick={() => setActiveStep((p) => Math.min(STAGES.length - 1, p + 1))}
              disabled={activeStep === STAGES.length - 1}
              className={`rounded-full px-6 py-2.5 text-[14px] font-bold transition-all ${
                activeStep === STAGES.length - 1
                  ? 'cursor-not-allowed bg-stone-200 text-stone-400'
                  : 'bg-stone-900 text-white shadow-lg hover:scale-105 hover:bg-black'
              }`}
            >
              다음
            </button>
          </div>
        </div>

        {/* 포맷 소개 */}
        <div className="mt-6 rounded-[24px] bg-white px-8 py-6 shadow-sm ring-1 ring-stone-100">
          <h3 className="mb-4 text-[18px] font-extrabold text-stone-800">토론 포맷</h3>
          <div className="grid grid-cols-3 gap-3">
            {FORMATS.map(({ label, desc }) => (
              <div key={label} className="rounded-2xl bg-stone-50 px-4 py-4 text-center">
                <div className="text-[22px] font-black text-stone-900">{label}</div>
                <div className="mt-1 text-[12px] font-medium text-stone-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
