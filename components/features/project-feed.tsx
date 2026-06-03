"use client";

import React, { useState, useTransition, useMemo } from "react";
import { ProjectStatus } from "@prisma/client";
import { FeedRow } from "@/components/ui/feed-row";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  status: ProjectStatus;
  logoUrl?: string | null;
  tags: string[];
  toolsUsed: string[];
  voteCount: number;
  deadlineAt: string;
  isBoosted: boolean;
  user: {
    username: string;
    displayName: string;
    plan: "FREE" | "FOUNDER";
  };
}

interface ProjectFeedProps {
  initialProjects: Project[];
  votedProjectIds: Set<string>;
  initialFilter?: string;
  initialSearch?: string;
}

const FILTERS = ["All", "Building Now", "Just Launched", "Need Co-builder", "AI", "SaaS", "Tools", "Other"];

export function ProjectFeed({
  initialProjects,
  votedProjectIds,
  initialFilter = "All",
  initialSearch = "",
}: ProjectFeedProps) {
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    updateUrl(newFilter, search);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    startTransition(() => {
      updateUrl(filter, val);
    });
  };

  const updateUrl = (currentFilter: string, currentSearch: string) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (currentFilter && currentFilter !== "All") {
        url.searchParams.set("filter", currentFilter);
      } else {
        url.searchParams.delete("filter");
      }
      if (currentSearch.trim()) {
        url.searchParams.set("search", currentSearch.trim());
      } else {
        url.searchParams.delete("search");
      }
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  };

  // Memoized client-side filtering and sorting
  const filteredProjects = useMemo(() => {
    return initialProjects
      .filter((project) => {
        // 1. Tag/Status filter matching
        if (filter !== "All") {
          if (filter === "Building Now") {
            if (project.status !== ProjectStatus.BUILDING && project.status !== ProjectStatus.WARNED) {
              return false;
            }
          } else if (filter === "Just Launched") {
            if (project.status !== ProjectStatus.LAUNCHED) {
              return false;
            }
          } else {
            // General tag name match (case-insensitive)
            const tagFound = project.tags.some(
              (tag) => tag.toLowerCase() === filter.toLowerCase()
            );
            if (!tagFound) return false;
          }
        }

        // 2. Search query matching (case-insensitive on title, tagline, description)
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesTitle = project.title.toLowerCase().includes(q);
          const matchesTagline = project.tagline.toLowerCase().includes(q);
          const matchesDesc = project.description.toLowerCase().includes(q);
          if (!matchesTitle && !matchesTagline && !matchesDesc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by vote count descending, then by creation date / deadline
        if (b.voteCount !== a.voteCount) {
          return b.voteCount - a.voteCount;
        }
        return new Date(b.deadlineAt).getTime() - new Date(a.deadlineAt).getTime();
      });
  }, [initialProjects, filter, search]);

  return (
    <div className="space-y-6 select-none">
      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 select-none">
        {FILTERS.map((item) => (
          <button
            key={item}
            onClick={() => handleFilterChange(item)}
            className={cn(
              "font-mono text-[9px] font-bold tracking-wider px-3 py-1.5 border rounded-sm transition-all uppercase cursor-pointer",
              filter === item
                ? "border-brand-orange text-brand-orange bg-brand-orange/5"
                : "border-border text-text-muted hover:border-text-secondary hover:text-text-secondary"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Search Input Box */}
      <div className="flex max-w-xl gap-2 relative">
        <input
          value={search}
          onChange={handleSearchChange}
          placeholder="SEARCH THE ROCK FACE..."
          className="flex-1 font-mono text-xs border border-border bg-surface px-4 py-3 text-text-primary placeholder-text-muted outline-none focus:border-text-muted transition-colors rounded-sm"
        />
        {isPending && (
          <div className="absolute right-3 top-3.5 flex items-center justify-center">
            <span className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Feed list */}
      {filteredProjects.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center text-xs font-mono text-text-muted uppercase tracking-wider">
          No projects found on the rock face.
        </div>
      ) : (
        <div className="border border-border bg-surface/15 rounded-md px-4 py-2 divide-y divide-border">
          {filteredProjects.map((project, index) => (
            <FeedRow
              key={project.id}
              rank={index + 1}
              project={project}
              hasVoted={votedProjectIds.has(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
