import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const R = 28;

const NODES = {
  '찬성1': { x: 68,  y: 44,  fill: '#eff6ff', stroke: '#3b82f6', color: '#1d4ed8' },
  '찬성2': { x: 158, y: 44,  fill: '#eff6ff', stroke: '#3b82f6', color: '#1d4ed8' },
  '반대1': { x: 68,  y: 152, fill: '#fff1f2', stroke: '#f43f5e', color: '#be123c' },
  '반대2': { x: 158, y: 152, fill: '#fff1f2', stroke: '#f43f5e', color: '#be123c' },
};

const getArrowPoints = (fromKey, toKey) => {
  const f = NODES[fromKey];
  const t = NODES[toKey];
  if (!f || !t) return null;
  const dx = t.x - f.x, dy = t.y - f.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const sx = f.x + ux * (R + 3), sy = f.y + uy * (R + 3);
  const ex = t.x - ux * (R + 9), ey = t.y - uy * (R + 9);
  const a = Math.atan2(ey - sy, ex - sx);
  return {
    sx, sy, ex, ey,
    ah1: { x: ex - 9 * Math.cos(a - 0.45), y: ey - 9 * Math.sin(a - 0.45) },
    ah2: { x: ex - 9 * Math.cos(a + 0.45), y: ey - 9 * Math.sin(a + 0.45) },
  };
};

const NodeEl = ({ name, node, isActive }) => {
  const [line1, line2] = name.length === 3 ? [name.slice(0, 2), name.slice(2)] : [name, ''];
  return (
    <g>
      <circle
        cx={node.x} cy={node.y} r={R}
        fill={node.fill}
        stroke={node.stroke}
        strokeWidth={isActive ? 2.5 : 1.5}
        opacity={isActive ? 1 : 0.5}
      />
      {isActive && (
        <circle cx={node.x} cy={node.y} r={R + 5} fill="none" stroke={node.stroke} strokeWidth="1" opacity="0.3" />
      )}
      <text x={node.x} y={node.y + (line2 ? -5 : 5)} textAnchor="middle"
        fill={node.color} fontSize="10" fontWeight="700"
        opacity={isActive ? 1 : 0.4}
        style={{ fontFamily: 'system-ui' }}>
        {line1}
      </text>
      {line2 && (
        <text x={node.x} y={node.y + 9} textAnchor="middle"
          fill={node.color} fontSize="10" fontWeight="700"
          opacity={isActive ? 1 : 0.4}
          style={{ fontFamily: 'system-ui' }}>
          {line2}{name === '반대2' ? '(나)' : ''}
        </text>
      )}
    </g>
  );
};

const RebuttalTree = ({ rebuttals, currentSpeaker }) => {
  const [open, setOpen] = useState(false);

  const activeRebuttals = rebuttals.filter(r => r.from === currentSpeaker);
  const activeTargets = new Set(activeRebuttals.map(r => r.to));

  return (
    <div className="rounded-xl border border-stone-200 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 hover:bg-stone-100 transition-colors"
      >
        <span className="text-sm font-semibold text-stone-600">반박 구조도</span>
        <ChevronDown size={16} className={`text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="bg-white px-3 pb-4 pt-2">
          <svg viewBox="0 0 226 205" className="w-full">
            <text x="113" y="14" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="600" style={{ fontFamily: 'system-ui' }}>── 찬성 ──</text>
            <text x="113" y="198" textAnchor="middle" fill="#f43f5e" fontSize="9" fontWeight="600" style={{ fontFamily: 'system-ui' }}>── 반대 ──</text>

            {rebuttals.map((r, i) => {
              const pts = getArrowPoints(r.from, r.to);
              if (!pts) return null;
              const { sx, sy, ex, ey, ah1, ah2 } = pts;
              const isActive = r.from === currentSpeaker;
              const fromNode = NODES[r.from];
              const arrowColor = isActive ? (fromNode?.stroke ?? '#94a3b8') : '#d1d5db';

              return (
                <g key={i} style={{ transition: 'all 0.3s' }}>
                  <line
                    x1={sx} y1={sy} x2={ex} y2={ey}
                    stroke={arrowColor}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeLinecap="round"
                    opacity={isActive ? 1 : 0.35}
                  />
                  <polygon
                    points={`${ex},${ey} ${ah1.x},${ah1.y} ${ah2.x},${ah2.y}`}
                    fill={arrowColor}
                    opacity={isActive ? 1 : 0.35}
                  />
                </g>
              );
            })}

            {Object.entries(NODES).map(([name, node]) => {
              const isActive = name === currentSpeaker || activeTargets.has(name);
              return <NodeEl key={name} name={name} node={node} isActive={isActive} />;
            })}
          </svg>

          <div className="mt-1 flex flex-col gap-1.5 px-1 border-t border-stone-100 pt-3">
            {rebuttals.map((r, i) => {
              const isActive = r.from === currentSpeaker;
              return (
                <div key={i} className={`flex items-start gap-1.5 text-[10px] leading-snug transition-all ${isActive ? 'text-stone-700' : 'text-stone-400'}`}>
                  <span className="shrink-0 font-bold mt-px">→</span>
                  <span>
                    <span className={`font-semibold ${isActive ? 'text-stone-800' : ''}`}>{r.from}</span>
                    <span className="mx-0.5 opacity-40">|</span>
                    {r.content}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RebuttalTree;
