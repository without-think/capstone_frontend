const SIDE_CONFIG = {
  pro:  { bg: 'bg-blue-50',  border: 'border-blue-100',  text: 'text-blue-900',  badge: 'bg-blue-100 text-blue-600',  avatar: 'bg-blue-100 text-blue-600',  label: '찬성' },
  con:  { bg: 'bg-red-50',   border: 'border-red-100',   text: 'text-red-900',   badge: 'bg-red-100 text-red-600',   avatar: 'bg-red-100 text-red-600',   label: '반대' },
  user: { bg: 'bg-white',    border: 'border-stone-200', text: 'text-stone-800', badge: 'bg-stone-100 text-stone-500', avatar: 'bg-stone-200 text-stone-600', label: '반대(나)' },
};

const MessageBubble = ({ message }) => {
  const { speaker, side, isUser, content } = message;
  const cfg = isUser ? SIDE_CONFIG.user : (SIDE_CONFIG[side] ?? SIDE_CONFIG.con);

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 아바타 */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${cfg.avatar}`}>
        {isUser ? '나' : speaker.slice(-1)}
      </div>

      <div className={`max-w-[62%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* 이름 + 역할 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-stone-600">{speaker}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cfg.badge}`}>{cfg.label}</span>
        </div>
        {/* 말풍선 */}
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed border shadow-sm
          ${cfg.bg} ${cfg.border} ${cfg.text}
          ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
          {content}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
