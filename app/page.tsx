import { Flame } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-primary px-6 py-10 text-text-primary">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="inline-flex w-fit items-center gap-2 border border-border-strong bg-surface px-3 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
          <Flame className="h-4 w-4" aria-hidden="true" />
          BuildOrDie
        </div>

        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-text-muted">
            Scaffold ready
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] text-text-primary sm:text-7xl">
            Build it. Launch it. 4 days.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-text-secondary">
            Prompt 1 has the foundation in place: Next.js App Router, Tailwind
            tokens, Clerk, Prisma, Inngest, Resend, PostHog, and the folder
            structure the product will grow into.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {["Declare", "Build", "Ship"].map((item) => (
            <div key={item} className="border border-border bg-surface p-5">
              <p className="font-mono text-2xl font-bold text-brand-orange">
                {item}
              </p>
              <p className="mt-2 text-sm text-text-muted">
                The full product surface starts in the next prompts.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
