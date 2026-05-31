import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/features/onboarding-form";
import { ensureLocalUser } from "@/lib/auth/local-user";

function hasCompletedOnboarding(username: string) {
  return !username.startsWith("pending_");
}

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureLocalUser(userId);

  if (user && hasCompletedOnboarding(user.username)) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-bg-primary px-6 py-12 text-text-primary">
      <section className="mx-auto max-w-2xl">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-orange">
            Onboarding
          </p>
          <h1 className="text-4xl font-black">Set your builder profile.</h1>
          <p className="text-text-secondary">
            Pick the name people will see when you declare, ship, or get kicked.
          </p>
        </div>
        <OnboardingForm
          initialDisplayName={user?.displayName ?? ""}
          initialBio={user?.bio ?? ""}
          initialXHandle={user?.xHandle ?? ""}
        />
      </section>
    </main>
  );
}
