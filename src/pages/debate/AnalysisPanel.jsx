import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { ANALYSIS_BY_STAGE, ANALYSIS_LAYER_CONFIG } from './mockData';

const RADAR_CENTER = { x: 110, y: 102 };
const RADAR_RADIUS = 70;
const RADAR_ANGLES = [-90, 30, 150];
const RADAR_LEVELS = [0.25, 0.5, 0.75, 1];
const INDEX_CHART = {
  width: 260,
  height: 170,
  margin: { top: 16, right: 14, bottom: 28, left: 28 },
};

function toCompositeIndex(payload) {
  const conflictIntensityFinal = payload?.evidenceClash ?? 0;
  const polarization = payload?.positionGap ?? 0;
  const g1PlusG2 = payload?.counterStrike ?? 0;
  return (0.5 * conflictIntensityFinal + 0.4 * polarization + 0.1 * g1PlusG2) * 100;
}

function polarToCartesian(angle, radius) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: RADAR_CENTER.x + Math.cos(rad) * radius,
    y: RADAR_CENTER.y + Math.sin(rad) * radius,
  };
}

export default function AnalysisPanel({ showLiveAnalysis, analysis }) {
  const [showMetricGuide, setShowMetricGuide] = useState(false);
  const [activeTab, setActiveTab] = useState('radar');

  const radarAxes = ANALYSIS_LAYER_CONFIG.map((layer, index) => ({
    ...layer,
    angle: RADAR_ANGLES[index],
    value: analysis?.[layer.key] ?? 0,
  }));

  const trendSeries = Object.entries(ANALYSIS_BY_STAGE)
    .map(([stage, payload]) => ({
      stage: Number(stage),
      value: toCompositeIndex(payload),
    }))
    .sort((a, b) => a.stage - b.stage);

  const { width, height, margin } = INDEX_CHART;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const yLevels = [0, 25, 50, 75, 100];
  const linePoints = trendSeries.map((item, idx) => {
    const x = margin.left + (trendSeries.length <= 1 ? 0 : (plotWidth * idx) / (trendSeries.length - 1));
    const y = margin.top + plotHeight - (plotHeight * item.value) / 100;
    return { ...item, x, y };
  });
  const linePath = linePoints
    .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const radarPath = radarAxes
    .map((axis, index) => {
      const point = polarToCartesian(axis.angle, RADAR_RADIUS * axis.value);
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    })
    .join(' ') + ' Z';

  return (
    <section className="relative rounded-[32px] border border-white/80 bg-white/60 p-5 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-[14px] font-extrabold text-stone-800">실시간 대립 분석기</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-stone-100/80 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                activeTab === 'radar' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              레이더 차트
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('index')}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                activeTab === 'index' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              종합 대립 지수
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowMetricGuide((prev) => !prev)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-700"
            aria-label={activeTab === 'radar' ? '지표 설명 보기' : '계산식 보기'}
            title={activeTab === 'radar' ? '지표 설명' : '계산식'}
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </div>

      {showMetricGuide && (
        <div className="absolute right-5 top-12 z-20 w-[280px] rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-[0_14px_32px_rgba(0,0,0,0.12)] backdrop-blur-sm">
          {activeTab === 'radar' ? (
            <>
              <p className="text-[12px] font-extrabold text-stone-700">지표 설명</p>
              <div className="mt-2 space-y-2 text-[12px] leading-relaxed text-stone-600">
                <p><span className="font-bold text-stone-800">충돌 강도:</span> 두 입장이 계속 영향을 주고받는다고 가정하고, 이를 반복 시뮬레이션해 수렴한 최종 충돌 강도입니다.</p>
                <p><span className="font-bold text-stone-800">입장 거리:</span> 양측 입장이 서로 얼마나 반대 방향에 있는지를 나타냅니다.</p>
                <p><span className="font-bold text-stone-800">공격성:</span> 상대 입장을 얼마나 강하게 밀어붙이고 압박하는 발화의 강도입니다.</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-[12px] font-extrabold text-stone-700">종합 대립 지수 계산식</p>
              <p className="mt-2 text-[12px] font-semibold leading-relaxed text-stone-800">
                충돌 강도 × 0.5 + 입장 거리 × 0.4 + 공격성 × 0.1
              </p>
              <p className="mt-3 text-[11px] font-medium leading-relaxed text-stone-500">
                세 지표를 가중합해 종합 대립 지수를 계산합니다.
              </p>
            </>
          )}
        </div>
      )}

      {showLiveAnalysis ? (
        <div className="h-[220px] bg-white/80 rounded-[20px] p-6 shadow-inner flex items-center justify-center">
          {activeTab === 'radar' ? (
            <svg viewBox="0 0 220 180" className="h-full w-full">
              {/* 그리드 레벨 */}
              {RADAR_LEVELS.map((level) => {
                const points = radarAxes
                  .map((axis) => {
                    const p = polarToCartesian(axis.angle, RADAR_RADIUS * level);
                    return `${p.x},${p.y}`;
                  })
                  .join(' ');
                return (
                  <polygon key={level} points={points} fill="none" stroke="#e7e5e4" strokeWidth="1" />
                );
              })}
              {/* 축 선 */}
              {radarAxes.map((axis) => {
                const point = polarToCartesian(axis.angle, RADAR_RADIUS);
                return (
                  <line
                    key={axis.key}
                    x1={RADAR_CENTER.x} y1={RADAR_CENTER.y}
                    x2={point.x} y2={point.y}
                    stroke="#d6d3d1" strokeWidth="1"
                  />
                );
              })}
              {/* 데이터 폴리곤 */}
              <path d={radarPath} fill="rgba(28,25,23,0.08)" stroke="#1c1917" strokeWidth="2.5" />
              {/* 라벨 + 점 */}
              {radarAxes.map((axis) => {
                const dot = polarToCartesian(axis.angle, RADAR_RADIUS * axis.value);
                const label = polarToCartesian(axis.angle, RADAR_RADIUS + 22);
                return (
                  <g key={axis.key}>
                    <circle cx={dot.x} cy={dot.y} r="3.5" fill="#1c1917" />
                    <text x={label.x} y={label.y} textAnchor="middle" fontSize="11" fontWeight="700" fill="#57534e">
                      {axis.label}
                    </text>
                    <text x={label.x} y={label.y + 14} textAnchor="middle" fontSize="11" fontWeight="800" fill="#1c1917">
                      {Math.round(axis.value * 100)}%
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="w-full">
              <svg viewBox={`0 0 ${width} ${height}`} className="h-[170px] w-full">
                {yLevels.map((level) => {
                  const y = margin.top + plotHeight - (plotHeight * level) / 100;
                  return (
                    <g key={level}>
                      <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#e7e5e4" strokeWidth="1" />
                      <text x={margin.left - 8} y={y + 3} textAnchor="end" fontSize="10" fontWeight="700" fill="#a8a29e">{level}</text>
                    </g>
                  );
                })}
                {linePath && <path d={linePath} fill="none" stroke="#1c1917" strokeWidth="2.2" />}
                {linePoints.map((point) => (
                  <g key={point.stage}>
                    <circle cx={point.x} cy={point.y} r="3.2" fill="#1c1917" />
                    <text x={point.x} y={height - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#57534e">{point.stage}</text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>
      ) : (
        <div className="h-[220px] bg-white/80 rounded-[20px] shadow-inner flex items-center justify-center px-6 text-center">
          <p className="text-[13px] font-bold text-stone-400 leading-relaxed">
            논박 시간에 활성화됩니다
          </p>
        </div>
      )}
    </section>
  );
}
