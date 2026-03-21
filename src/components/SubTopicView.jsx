import React from 'react';
import { Check } from 'lucide-react';

const SubTopicView = ({ activeData, selectedSubTopics, onToggle, visible }) => {
  return (
    <div className={`absolute w-full px-4 flex flex-col items-center justify-center h-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      ${!visible ? 'opacity-0 -translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}
    `}>
      {activeData && (
        <div className="flex flex-col items-center transform -translate-y-16 w-full">
          <activeData.icon
            size={72}
            strokeWidth={1.5}
            className="mb-6"
            style={{ color: activeData.accent }}
          />
          <h1 className="text-5xl md:text-6xl font-extrabold text-stone-800 mb-4 tracking-tight text-center">
            {activeData.title}
          </h1>
          <p className="text-xl text-stone-400 mb-16 text-center max-w-xl">
            원하는 세부 토론 논제를 자유롭게 선택해주세요.
          </p>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
            {activeData.subTopics.map((sub) => {
              const isSelected = selectedSubTopics.includes(sub);
              return (
                <button
                  key={sub}
                  onClick={() => onToggle(sub)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-full text-lg font-medium transition-all duration-300 ${
                    isSelected
                      ? 'bg-stone-900 text-white scale-105 shadow-xl'
                      : 'bg-white text-stone-600 border border-stone-200 shadow-sm hover:border-stone-300 hover:shadow-md hover:scale-105'
                  }`}
                >
                  {isSelected
                    ? <Check size={20} className="text-emerald-400" />
                    : <div className="w-5 h-5 rounded-full border-2 border-stone-300" />
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
