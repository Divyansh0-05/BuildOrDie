import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { IdeaForm } from "@/components/features/idea-form";
import { ensureLocalUser } from "@/lib/auth/local-user";

function hasCompletedOnboarding(username: string) {
  return !username.startsWith("pending_");
}

export default async function SubmitPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureLocalUser(userId);

  if (!user) {
    redirect("/onboarding");
  }

  if (!hasCompletedOnboarding(user.username)) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-bg-primary px-6 py-12 text-text-primary">
      <section className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-3 text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-brand-orange">
            Declare publicly
          </p>
          <h1 className="text-4xl font-bold font-gothic tracking-wide">Start the 4-day clock.</h1>
          <p className="text-text-secondary">
            Submit once. The deadline is set by the server. No takebacks.
          </p>
        </div>
        <IdeaForm
          user={{
            username: user.username,
            displayName: user.displayName,
            plan: user.plan,
          }}
        />
      </section>
    </main>
  );
}
