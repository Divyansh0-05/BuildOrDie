import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-rock/50 py-12 px-6 select-none mt-20">
      <div className="mx-auto max-w-6xl grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="font-gothic text-2xl tracking-wide bg-gradient-to-r from-brand-amber to-brand-orange bg-clip-text text-transparent">
              BuildOrDie
            </span>
          </div>
          <p className="text-[8px] text-text-muted tracking-[0.18em] font-bold uppercase">
            DECLARE · BUILD · SHIP · OR DIE
          </p>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <div className="font-mono text-[9px] font-bold text-text-primary uppercase tracking-wider">
            {"// Navigation"}
          </div>
          <div className="flex flex-col gap-2 font-mono text-[10px] text-text-muted uppercase">
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

        {/* Legal */}
        <div className="space-y-3">
          <div className="font-mono text-[9px] font-bold text-text-primary uppercase tracking-wider">
            {"// Legal"}
          </div>
          <div className="flex flex-col gap-2 font-mono text-[10px] text-text-muted uppercase">
            <Link href="/privacy" className="hover:text-text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-text-primary transition-colors">
              Terms
            </Link>
            <a href="mailto:support@buildordie.com" className="hover:text-text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>

      {/* Closing Line */}
      <div className="mx-auto max-w-6xl mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="font-mono text-[9px] text-text-muted uppercase tracking-wider text-center sm:text-left leading-relaxed">
          Built for builders who stop thinking and start shipping.
        </p>
      </div>
    </footer>
  );
}
