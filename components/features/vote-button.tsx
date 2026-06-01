"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  projectId: string;
  initialVotes: number;
  initialVoted: boolean;
  className?: string;
}

export function VoteButton({
  projectId,
  initialVotes,
  initialVoted,
  className,
}: VoteButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [voted, setVoted] = useState(initialVoted);
  const [voteCount, setVoteCount] = useState(initialVotes);

  const handleVote = async () => {
    if (!isSignedIn) {
      // Redirect to sign in if not logged in
      const currentUrl = typeof window !== "undefined" ? window.location.pathname : "";
      router.push(`/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (isPending) return;

    // Optimistic Update
    const newVoted = !voted;
    const newCount = newVoted ? voteCount + 1 : Math.max(0, voteCount - 1);

    setVoted(newVoted);
    setVoteCount(newCount);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/votes/${projectId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to vote");
        }

        const data = (await res.json()) as { voted: boolean; voteCount: number };
        // Sync with exact server count and state
        setVoted(data.voted);
        setVoteCount(data.voteCount);
      } catch (err) {
        console.error("Voting error:", err);
        // Rollback on error
        setVoted(!newVoted);
        setVoteCount(voted ? voteCount : Math.max(0, voteCount));
      }
    });
  };

  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider rounded border transition-all active:scale-95 duration-100",
        voted
          ? "bg-brand-orange/10 border-brand-orange text-brand-orange shadow-[0_0_12px_rgba(255,77,0,0.15)]"
          : "bg-surface border-border text-text-muted hover:text-text-primary hover:border-border-strong",
        isPending && "opacity-70 cursor-not-allowed",
        className
      )}
    >
      <ChevronUp
        className={cn(
          "w-4 h-4 transition-transform duration-200",
          voted ? "text-brand-orange fill-brand-orange scale-110" : "text-text-muted",
          !isPending && "group-hover:-translate-y-0.5"
        )}
      />
      <span>{voteCount}</span>
    </button>
  );
}
