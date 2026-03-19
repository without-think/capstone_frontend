import React from 'react';
import { Bot } from 'lucide-react';

const AiSliderItem = ({ side, index, val, onChange }) => {
  const isPro = side === 'pro';
  const intensity = Math.abs(val);

  return (
    <div className="bg-white/10 p-5 rounded-2xl mb-4 border border-white/20 backdrop-blur-sm transition-all hover:bg-white/15">
      <div className="flex justify-between items-end mb-4">
        <span className="font-semibold text-white flex items-center gap-2">
          <Bot size={18} /> {isPro ? '찬성' : '반대'} AI {index + 1}
        </span>
        <span className={`text-sm font-bold px-2 py-1 rounded-md ${isPro ? 'bg-blue-500/20 text-blue-200' : 'bg-red-500/20 text-red-200'}`}>
          +{val} (강도 {val})
        </span>
      </div>

      <div className="relative pt-2 pb-6">
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={val}
          onChange={(e) => onChange(side, index, e.target.value)}
          className={`w-full relative z-10 cursor-pointer h-2 bg-white/20 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white ${isPro ? 'accent-blue-500' : 'accent-red-500'}`}
        />
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[11px] text-white/50 font-medium px-1 pointer-events-none">
          <span>+1</span>
          <span>+3</span>
          <span>+5</span>
        </div>
      </div>
    </div>
  );
};

export default AiSliderItem;
