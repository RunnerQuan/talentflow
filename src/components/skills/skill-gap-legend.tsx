'use client';

const items = [
  { label: '候选人已有且岗位要求', className: 'bg-emerald-500' },
  { label: '候选人已有技能', className: 'bg-tf-accent' },
  { label: '岗位缺失技能', className: 'bg-red-500 border-2 border-dashed border-red-700' },
];

export function SkillGapLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-tf-secondary">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${item.className}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
