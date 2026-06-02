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
    <div className="space-y-3">
      {canLaunch ? (
        <button
          onClick={() => setLaunchOpen(true)}
          className="w-full bg-brand-orange px-4 py-3 font-mono font-black uppercase text-bg-primary"
        >
          LAUNCH
        </button>
      ) : null}
      <button
        onClick={() => setBoostOpen(true)}
        className="w-full border border-brand-orange px-4 py-3 font-mono font-bold uppercase text-brand-orange"
      >
        Feature this project
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
