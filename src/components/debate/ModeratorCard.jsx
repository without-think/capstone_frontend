const ModeratorCard = ({ proPoint, conPoint }) => (
  <div className="mx-auto w-full max-w-xl bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
    <p className="text-xs text-amber-600 font-semibold text-center mb-3">🗂 사회자 쟁점 정리</p>
    <div className="flex items-stretch gap-3">
      <div className="flex-1 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2.5 rounded-xl text-xs font-medium leading-snug">
        {proPoint}
      </div>
      <div className="flex items-center text-amber-400 font-bold text-sm shrink-0">vs</div>
      <div className="flex-1 bg-red-50 border border-red-100 text-red-700 px-3 py-2.5 rounded-xl text-xs font-medium leading-snug">
        {conPoint}
      </div>
    </div>
  </div>
);

export default ModeratorCard;
