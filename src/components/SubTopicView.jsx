import React from 'react';
import { Check } from 'lucide-react';

const SubTopicView = ({ activeData, selectedSubTopics, onToggle, visible }) => {
  return (
    <div className={`absolute w-full px-4 flex flex-col items-center justify-center h-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      ${!visible ? 'opacity-0 -translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}
    `}>
      {activeData && (
        <div className="flex flex-col items-center transform -translate-y-16">
          <activeData.icon size={80} className="text-white mb-6 opacity-90" strokeWidth={1.5} />
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight text-center">
            {activeData.title}
          </h1>
          <p className="text-xl text-white/80 mb-16 text-center max-w-xl">
            원하는 세부 토론 논제를 자유롭게 선택해주세요.
          </p>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
            {activeData.subTopics.map((sub) => {
              const isSelected = selectedSubTopics.includes(sub);
              return (
                <button
                  key={sub}
                  onClick={() => onToggle(sub)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-full text-lg font-medium transition-all duration-300 ${isSelected ? 'bg-white text-stone-900 scale-105 shadow-xl ring-4 ring-white/50' : 'bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-sm hover:scale-105'}`}
                >
                  {isSelected
                    ? <Check size={20} className="text-emerald-600" />
                    : <div className="w-5 h-5 rounded-full border-2 border-white/40" />
                  }
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubTopicView;
