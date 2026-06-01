import Link from "next/link";
import { AlertOctagon } from "lucide-react";

export function KickedBanner() {
  return (
    <div className="w-full bg-[#1e0a0a] border border-[#441a1a] p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#3a1010] rounded-full text-brand-orange border border-[#5c1a1a] animate-pulse">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-text-primary font-bold text-lg font-sans">
            You got kicked. The clock won.
          </h3>
          <p className="text-text-secondary text-sm">
            4 days wasn&apos;t enough. No excuses. Either build fast or get out of the way.
          </p>
        </div>
      </div>
      <Link
        href="/submit"
        className="w-full md:w-auto text-center px-5 py-2.5 bg-brand-orange text-text-primary font-mono font-bold text-xs uppercase tracking-[0.1em] hover:bg-brand-orange/90 transition-all active:scale-95 duration-150 shrink-0 border border-brand-orange/40 shadow-[0_0_15px_rgba(255,77,0,0.2)]"
      >
        Declare a new idea
      </Link>
    </div>
  );
}
