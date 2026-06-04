

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-rock/50 py-12 px-6 select-none mt-20">
      <div className="mx-auto max-w-[1400px] flex flex-col items-center text-center space-y-6">
        {/* Brand */}
        <div className="space-y-4 flex flex-col items-center">
          <div className="flex items-center gap-3 justify-center">
            <span className="text-2xl">🔥</span>
            <span className="font-gothic text-3xl tracking-wide bg-gradient-to-r from-brand-amber to-brand-orange bg-clip-text text-transparent">
              BuildOrDie
            </span>
          </div>
          <p className="text-[10.5px] text-text-muted tracking-[0.2em] font-bold uppercase text-center">
            DECLARE · BUILD · SHIP · OR DIE
          </p>
        </div>

        {/* Navigation links */}
        <div className="flex flex-wrap justify-center gap-6 font-mono text-xs text-text-muted uppercase select-none mt-2">
          <Link href="/" className="hover:text-text-primary transition-colors">
            Home
          </Link>
          <Link href="/leaderboard" className="hover:text-text-primary transition-colors">
            Leaderboard
          </Link>
          <Link href="/tools" className="hover:text-text-primary transition-colors">
            Tools
          </Link>
          <Link href="/passes" className="hover:text-text-primary transition-colors">
            Passes
          </Link>
          <Link href="/dashboard" className="hover:text-text-primary transition-colors">
            Dashboard
          </Link>
        </div>
      </div>

      {/* Closing Line */}
      <div className="mx-auto max-w-[1400px] mt-10 pt-6 border-t border-border/40 flex justify-center items-center">
        <p className="font-mono text-[11px] text-text-muted uppercase tracking-wider text-center leading-relaxed">
          Built for builders who stop thinking and start shipping.
        </p>
      </div>
    </footer>
  );
}
