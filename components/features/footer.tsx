

export function Footer() {
  return (
    <footer className="border-t border-border bg-rock/50 py-12 px-6 select-none mt-20">
      <div className="mx-auto max-w-6xl">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <span className="font-gothic text-3xl tracking-wide bg-gradient-to-r from-brand-amber to-brand-orange bg-clip-text text-transparent">
              BuildOrDie
            </span>
          </div>
          <p className="text-[10.5px] text-text-muted tracking-[0.2em] font-bold uppercase">
            DECLARE · BUILD · SHIP · OR DIE
          </p>
        </div>
      </div>

      {/* Closing Line */}
      <div className="mx-auto max-w-6xl mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="font-mono text-[11px] text-text-muted uppercase tracking-wider text-center sm:text-left leading-relaxed">
          Built for builders who stop thinking and start shipping.
        </p>
      </div>
    </footer>
  );
}
