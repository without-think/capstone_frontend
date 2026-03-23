import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ModeratorCard from './ModeratorCard';

const ChatArea = ({ messages }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4 hide-scrollbar">
      {messages.map(msg =>
        msg.type === 'moderator' ? (
          <ModeratorCard key={msg.id} proPoint={msg.proPoint} conPoint={msg.conPoint} />
        ) : (
          <MessageBubble key={msg.id} message={msg} />
        )
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatArea;
