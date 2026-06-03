"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePostHog } from "posthog-js/react";

interface VoteButtonProps {
  projectId: string;
  initialVotes: number;
  initialVoted: boolean;
  className?: string;
  variant?: "default" | "feed";
}

export function VoteButton({
  projectId,
  initialVotes,
  initialVoted,
  className,
  variant = "default",
}: VoteButtonProps) {
  const posthog = usePostHog();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const [voted, setVoted] = useState(initialVoted);
  const [voteCount, setVoteCount] = useState(initialVotes);

  // Synchronize state when server props update
  useEffect(() => {
    setVoted(initialVoted);
  }, [initialVoted]);

  useEffect(() => {
    setVoteCount(initialVotes);
  }, [initialVotes]);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      // Redirect to sign in if not logged in
      const currentUrl = typeof window !== "undefined" ? window.location.pathname : "";
      router.push(`/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (isLoading || isPending) return;

    setIsLoading(true);

    // Optimistic Update
    const newVoted = !voted;
    const newCount = newVoted ? voteCount + 1 : Math.max(0, voteCount - 1);

    setVoted(newVoted);
    setVoteCount(newCount);

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

      if (data.voted) {
        posthog.capture("vote_cast", { projectId });
      }

      // Trigger a server-side component refetch to refresh page cache
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error("Voting error:", err);
      // Rollback on error
      setVoted(!newVoted);
      setVoteCount(voted ? voteCount : Math.max(0, voteCount));
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = isLoading || isPending;

  if (variant === "feed") {
    return (
      <div className="flex flex-col items-center gap-1 select-none">
        <button
          onClick={handleVote}
          disabled={isButtonDisabled}
          className={cn(
            "w-7 h-6 border rounded-sm flex items-center justify-center font-mono text-xs transition-all active:scale-95 duration-100 cursor-pointer",
            voted
              ? "border-brand-orange text-brand-orange bg-brand-orange/10"
              : "border-border text-text-muted hover:border-brand-orange hover:text-brand-orange hover:bg-brand-orange/5",
            isButtonDisabled && "opacity-60 cursor-not-allowed"
          )}
        >
          ▲
        </button>
        <span className="font-mono text-[10px] text-text-secondary font-bold">
          {voteCount}
        </span>
      </div>
    );
  }

  // Large button (default)
  return (
    <button
      onClick={handleVote}
      disabled={isButtonDisabled}
      className={cn(
        "w-full flex items-center justify-center gap-1.5 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded border transition-all active:scale-95 duration-100 cursor-pointer",
        voted
          ? "bg-brand-orange/10 border-brand-orange text-brand-orange shadow-[0_0_12px_rgba(255,77,0,0.15)]"
          : "bg-transparent border-border text-text-muted hover:text-brand-orange hover:border-brand-orange hover:bg-brand-orange/5",
        isButtonDisabled && "opacity-70 cursor-not-allowed",
        className
      )}
    >
      <span>{voted ? "▲ voted" : "▲ upvote"}</span>
    </button>
  );
}
