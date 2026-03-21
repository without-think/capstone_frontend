const IssueCard = ({ issue, isActive }) => (
  <div className={`rounded-xl p-3.5 border transition-all ${
    isActive
      ? 'bg-blue-50 border-blue-200 shadow-sm'
      : 'bg-stone-50 border-stone-100 opacity-50'
  }`}>
    <div className="flex items-center gap-2 mb-1">
      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
      <p className={`text-sm font-semibold ${isActive ? 'text-blue-800' : 'text-stone-500'}`}>
        {issue.title}
      </p>
    </div>
    <p className={`text-xs leading-relaxed ${isActive ? 'text-blue-600' : 'text-stone-400'}`}>
      {issue.content}
    </p>
  </div>
);

export default IssueCard;
