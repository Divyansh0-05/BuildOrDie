"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

type OnboardingFormProps = {
  initialDisplayName: string;
  initialBio: string;
  initialXHandle: string;
};

const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;

export function OnboardingForm({
  initialDisplayName,
  initialBio,
  initialXHandle,
}: OnboardingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [xHandle, setXHandle] = useState(initialXHandle);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanUsername = username.trim();
    const cleanBio = bio.trim();
    const cleanXHandle = xHandle.trim().replace(/^@+/, "");

    if (!usernamePattern.test(cleanUsername)) {
      setError("Username must be 3-20 chars: letters, numbers, underscores.");
      return;
    }

    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }

    if (cleanBio.length > 160) {
      setError("Bio must be 160 chars or less.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsername,
          displayName: displayName.trim(),
          bio: cleanBio || null,
          xHandle: cleanXHandle || null,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Could not save profile.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-border bg-surface p-6">
      <Field label="Username">
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="ship_fast"
          className="w-full border border-border bg-bg-primary px-4 py-3 text-text-primary outline-none transition focus:border-brand-orange"
          maxLength={20}
          required
        />
      </Field>

      <Field label="Display name">
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Ada Builder"
          className="w-full border border-border bg-bg-primary px-4 py-3 text-text-primary outline-none transition focus:border-brand-orange"
          required
        />
      </Field>

      <Field label="Bio">
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="What do you build?"
          className="min-h-28 w-full resize-none border border-border bg-bg-primary px-4 py-3 text-text-primary outline-none transition focus:border-brand-orange"
          maxLength={160}
        />
      </Field>

      <Field label="X handle">
        <input
          value={xHandle}
          onChange={(event) => setXHandle(event.target.value)}
          placeholder="@buildordie"
          className="w-full border border-border bg-bg-primary px-4 py-3 text-text-primary outline-none transition focus:border-brand-orange"
        />
      </Field>

      {error ? (
        <p className="border border-brand-amber bg-bg-primary px-4 py-3 text-sm text-brand-amber">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-orange px-5 py-3 font-bold text-bg-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-text-secondary">{label}</span>
      {children}
    </label>
  );
}
