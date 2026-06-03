"use client";

import { useState } from "react";
import { ThumbsUp, Send } from "lucide-react";
import Link from "next/link";

interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  voteCount: number;
  launchedAt: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  user: {
    displayName: string;
    username: string;
  };
}

export function InvestorClient({ projects: initialProjects }: { projects: ProjectItem[] }) {
  const [projects] = useState(initialProjects);
  const [sentProjects, setSentProjects] = useState<Record<string, boolean>>({});
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

  const handleExpressInterest = async (projectId: string) => {
    if (loadingProjectId) return;
    setLoadingProjectId(projectId);

    try {
      const res = await fetch("/api/investors/express-interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || "Failed to express interest");
      }

      setSentProjects((prev) => ({ ...prev, [projectId]: true }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      alert("Error expressing interest: " + errorMessage);
    } finally {
      setLoadingProjectId(null);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="border border-[#1C1C30] bg-[#0E0E1C] p-10 text-center rounded-lg">
        <p className="text-sm text-[#8888AA]">No projects launched in the past 7 days.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {projects.map((p) => {
        const isSent = sentProjects[p.id];
        const isLoading = loadingProjectId === p.id;
        
        return (
          <div
            key={p.id}
            className="border border-[#1C1C30] bg-[#0E0E1C] p-6 rounded-lg flex flex-col justify-between hover:border-[#2A2A45] transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono text-[#00D680] border border-[#00D680]/30 px-2 py-0.5 rounded bg-[#00D680]/5">
                  LAUNCHED
                </span>
                <span className="text-[10px] font-mono text-[#5C5C80]">
                  {p.launchedAt ? new Date(p.launchedAt).toLocaleDateString() : ""}
                </span>
              </div>

              <h2 className="text-xl font-black text-[#F0F0FF] mb-1">
                <Link href={`/project/${p.id}`} className="hover:text-[#FF4D00] transition-colors">
                  {p.title}
                </Link>
              </h2>
              <p className="text-sm text-[#8888AA] mb-4 line-clamp-2">{p.tagline}</p>

              <div className="text-xs text-[#5C5C80] mb-6">
                By <span className="text-[#8888AA] font-bold">{p.user.displayName}</span> (@{p.user.username})
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#1C1C30]">
              <div className="flex items-center gap-1.5 font-mono text-xs text-[#8888AA]">
                <ThumbsUp className="w-4 h-4 text-[#FF4D00]" />
                <span>{p.voteCount} votes</span>
              </div>

              <button
                onClick={() => handleExpressInterest(p.id)}
                disabled={isSent || isLoading}
                className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded border transition-all cursor-pointer flex items-center gap-2 ${
                  isSent
                    ? "bg-[#00D680]/15 border-[#00D680] text-[#00D680] cursor-default"
                    : isLoading
                    ? "opacity-50 cursor-not-allowed border-[#1C1C30] text-[#5C5C80]"
                    : "bg-surface border-[#FF4D00] text-[#FF4D00] hover:bg-[#FF4D00]/5 active:scale-95 duration-100"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                {isSent ? "Interest Sent" : isLoading ? "Sending..." : "Express Interest"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
