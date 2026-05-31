import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-primary px-6 py-12">
      <div className="w-full max-w-md border border-border bg-surface p-6">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-orange">
            BuildOrDie
          </p>
          <h1 className="text-3xl font-black text-text-primary">
            Get back to building.
          </h1>
          <p className="text-sm text-text-secondary">
            Sign in with GitHub or Google. The clock is not impressed by
            passwords.
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full border border-border bg-bg-primary shadow-none",
            },
          }}
        />
      </div>
    </main>
  );
}
