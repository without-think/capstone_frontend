import { useState } from 'react';

export default function NotePanel() {
  const [note, setNote] = useState('상대가 규제 필요성을 강조하면, 나는 "규제 대상의 기준 설정"을 먼저 꺼낸다.');

  return (
    <section className="rounded-[32px] border border-white/80 bg-white/60 p-5 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-[14px] font-extrabold text-stone-800">메모장</h3>
        <span className="text-[11px] font-bold text-stone-400">Private</span>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="핵심 키워드나 전략을 기록하세요."
        className="w-full h-[170px] bg-white/80 rounded-[20px] p-4 text-[13px] font-medium leading-relaxed text-stone-600 placeholder:text-stone-300 resize-none focus:outline-none focus:ring-1 focus:ring-stone-200 hide-scrollbar shadow-inner"
      />
    </section>
  );
}
