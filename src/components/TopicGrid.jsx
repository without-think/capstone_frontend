import React from 'react';
import { TOPICS } from '../data/topics';

const TopicGrid = ({ onTopicClick }) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-6 w-full max-w-5xl">
      {TOPICS.map((topic) => {
        const Icon = topic.icon;
        return (
          <div
            key={topic.id}
            onClick={() => onTopicClick(topic.id)}
            className={`flex flex-col items-center justify-center rounded-full text-white shadow-lg cursor-pointer transition-transform duration-300 hover:scale-110 hover:shadow-2xl w-56 h-56 md:w-64 md:h-64 relative ${topic.color}`}
          >
            <Icon size={48} className="mb-4 opacity-90" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold tracking-tight mb-2">{topic.title}</h2>
            <p className="text-center px-8 text-sm text-white/80">{topic.desc}</p>
          </div>
        );
      })}
    </div>
  );
};

export default TopicGrid;
