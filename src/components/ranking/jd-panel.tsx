'use client';

import { Textarea } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';

export function JDPanel({
  jdText,
  onChange,
}: {
  jdText: string;
  onChange: (value: string) => void;
}) {
  return (
    <GlassCard className="p-5" hoverable={false}>
      <Textarea
        label="岗位描述 (JD)"
        value={jdText}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[260px]"
        placeholder="粘贴岗位描述，系统将对候选人池进行批量排序..."
      />
    </GlassCard>
  );
}
