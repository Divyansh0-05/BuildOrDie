"use client";

import { useState } from "react";
import { BoostSlotModal } from "@/components/features/boost-slot-modal";
import { LaunchModal } from "@/components/features/launch-modal";

export function ProjectActions({
  projectId,
  title,
  tagline,
  canLaunch,
}: {
  projectId: string;
  title: string;
  tagline: string;
  canLaunch: boolean;
}) {
  const [launchOpen, setLaunchOpen] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false);

  return (
    <div className="space-y-2.5 select-none w-full">
      {canLaunch ? (
        <button
          onClick={() => setLaunchOpen(true)}
          className="w-full bg-brand-orange hover:bg-brand-amber text-white px-4 py-2.5 font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          🚀 LAUNCH THIS PROJECT
        </button>
      ) : null}
      <button
        onClick={() => setBoostOpen(true)}
        className="w-full border border-brand-orange text-brand-orange hover:bg-brand-orange/5 px-4 py-2.5 font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
      >
        🔥 FEATURE THIS PROJECT
      </button>
      <LaunchModal
        projectId={projectId}
        projectTitle={title}
        projectTagline={tagline}
        isOpen={launchOpen}
        onClose={() => setLaunchOpen(false)}
        onLaunchSuccess={() => window.location.reload()}
      />
      <BoostSlotModal projectId={projectId} isOpen={boostOpen} onClose={() => setBoostOpen(false)} />
    </div>
  );

}
