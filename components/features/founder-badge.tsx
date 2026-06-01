import { Zap } from "lucide-react";

export function FounderBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono select-none">
      <Zap className="w-3 h-3 fill-brand-orange text-brand-orange" />
      FOUNDER
    </span>
  );
}
