export function renderInlineBold(line, isMine, key) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p key={key} className={`leading-relaxed tracking-tight ${isMine ? 'text-stone-100' : 'text-stone-700'}`}>
      {parts.map((part, j) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j} className={isMine ? 'font-extrabold text-white' : 'font-extrabold text-stone-900'}>{part.slice(2, -2)}</strong>
          : part
      )}
    </p>
  );
}

export function renderMarkdown(text, isMine) {
  const lines = text.split('\n');
  const elements = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      elements.push(
        <div key={key++} className={`font-bold text-[12px] mt-3 mb-0.5 pb-0.5 border-b ${
          isMine ? 'text-white/90 border-white/20' : 'text-stone-800 border-stone-200'
        }`}>
          {line.slice(3)}
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-1.5" />);
    } else {
      elements.push(renderInlineBold(line, isMine, key++));
    }
  }
  return elements;
}
