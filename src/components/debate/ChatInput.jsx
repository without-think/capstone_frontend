import { useState } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSend, currentTurnData }) => {
  const [text, setText] = useState('');
  const isMyTurn = currentTurnData.type === 'USER';
  const isRoleReversed = currentTurnData.step === '역할반전';

  const borderColor = isRoleReversed ? 'border-red-400 ring-red-100' : 'border-blue-400 ring-blue-100';
  const btnColor = isRoleReversed
    ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
    : 'bg-blue-500 hover:bg-blue-600 shadow-blue-200';

  const handleSend = () => {
    if (!text.trim() || !isMyTurn) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 bg-white/70 backdrop-blur-md border-t border-stone-200/70 px-8 py-4">
      <div className="max-w-7xl mx-auto">
        {/* 턴 인디케이터 */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${isMyTurn ? 'bg-blue-500 animate-pulse' : 'bg-stone-300'}`} />
          <span className={`text-xs font-medium ${isMyTurn ? 'text-blue-600' : 'text-stone-400'}`}>
            {isMyTurn ? '내 차례입니다' : `${currentTurnData.speaker} 발언 중...`}
          </span>
        </div>

        <div className="flex gap-3 items-end">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isMyTurn}
            placeholder={isMyTurn ? '발언을 입력하세요 (Enter로 전송)' : '내 차례를 기다리는 중...'}
            rows={2}
            className={`flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none border-2 transition-all duration-200
              ${isMyTurn
                ? `${borderColor} ring-4 bg-white text-stone-800 placeholder-stone-300`
                : 'border-stone-200 bg-stone-50 text-stone-400 placeholder-stone-300 cursor-not-allowed'
              }`}
          />
          <button
            onClick={handleSend}
            disabled={!isMyTurn || !text.trim()}
            className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200
              ${isMyTurn && text.trim()
                ? `${btnColor} text-white shadow-lg hover:shadow-xl hover:scale-105`
                : 'bg-stone-100 text-stone-300 cursor-not-allowed'
              }`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
