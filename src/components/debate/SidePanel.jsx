import IssueCard from './IssueCard';
import RebuttalTree from './RebuttalTree';

const SidePanel = ({ issues, rebuttals, currentSpeaker }) => (
  <div className="w-72 shrink-0 border-l border-stone-200/70 bg-white/60 backdrop-blur-md overflow-y-auto flex flex-col gap-5 px-4 py-5">
    {/* 현재 쟁점 */}
    <div>
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2.5">현재 쟁점</p>
      <IssueCard issue={issues[0]} isActive={true} />
    </div>

    {/* 이전 쟁점 */}
    {issues.length > 1 && (
      <div>
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2.5">이전 쟁점</p>
        <div className="flex flex-col gap-2">
          {issues.slice(1).map(issue => (
            <IssueCard key={issue.id} issue={issue} isActive={false} />
          ))}
        </div>
      </div>
    )}

    {/* 반박 구조도 */}
    <div>
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2.5">반박 구조</p>
      <RebuttalTree rebuttals={rebuttals} currentSpeaker={currentSpeaker} />
    </div>
  </div>
);

export default SidePanel;
