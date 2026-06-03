"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectStatus } from "@prisma/client";

interface ProjectItem {
  id: string;
  title: string;
  status: ProjectStatus;
  voteCount: number;
  isBoosted: boolean;
  isFeatured: boolean;
  createdAt: string;
  user: {
    displayName: string;
    username: string;
  };
}

interface SlotItem {
  slotNumber: number;
  projectId: string | null;
  projectTitle: string | null;
  boostedFrom: string | null;
  boostedUntil: string | null;
  isActive: boolean;
  isFree: boolean;
}

export function AdminPanel({
  projects: initialProjects,
  slots,
}: {
  projects: ProjectItem[];
  slots: SlotItem[];
}) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleKick = async (projectId: string) => {
    if (!confirm("Are you sure you want to kick this project?")) return;
    setIsUpdating(projectId);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: ProjectStatus.KICKED }),
      });
      if (!res.ok) throw new Error("Failed to kick");
      const updated = await res.json();
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: updated.status } : p))
      );
      router.refresh();
    } catch (err) {
      alert("Error kicking project: " + err);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleToggleFeature = async (projectId: string, currentFeatured: boolean) => {
    setIsUpdating(projectId);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
      });
      if (!res.ok) throw new Error("Failed to toggle feature");
      const updated = await res.json();
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, isFeatured: updated.isFeatured } : p))
      );
      router.refresh();
    } catch (err) {
      alert("Error toggling feature: " + err);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Boost Slots Panel */}
      <section className="border border-[#1C1C30] bg-[#0E0E1C] p-6 rounded-lg">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#8888AA] mb-4">{"// admin.boost_slots_queue"}</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          {slots.map((slot) => (
            <div
              key={slot.slotNumber}
              className={`border p-4 flex flex-col justify-between h-32 rounded-md transition-all ${
                slot.isActive
                  ? "border-[#00D680]/30 bg-[#00D680]/5"
                  : slot.isFree
                  ? "border-dashed border-[#1C1C30]"
                  : "border-[#F59E0B]/30 bg-[#F59E0B]/5"
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-[#5C5C80]">SLOT {slot.slotNumber}</span>
                <div className="font-bold text-sm mt-1 truncate">
                  {slot.isFree ? "Available" : slot.projectTitle}
                </div>
              </div>
              <div className="text-[10px] font-mono text-[#8888AA] mt-2">
                {slot.isFree ? (
                  <span className="text-[#00D680]">FREE</span>
                ) : slot.isActive ? (
                  <span className="text-[#00D680]">
                    ACTIVE (until {new Date(slot.boostedUntil!).toLocaleDateString()})
                  </span>
                ) : (
                  <span className="text-[#F59E0B]">
                    QUEUED (starts {new Date(slot.boostedFrom!).toLocaleDateString()})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Table */}
      <section className="border border-[#1C1C30] bg-[#0E0E1C] p-6 rounded-lg overflow-x-auto">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#8888AA] mb-4">{"// admin.moderate_projects"}</h2>
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#1C1C30] text-[#5C5C80] text-xs font-mono">
              <th className="py-3 px-4">PROJECT</th>
              <th className="py-3 px-4">BUILDER</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4">VOTES</th>
              <th className="py-3 px-4">BOOSTED</th>
              <th className="py-3 px-4">CREATED</th>
              <th className="py-3 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr
                key={p.id}
                className="border-b border-[#1C1C30] text-sm hover:bg-[#080810]/50 transition-colors"
              >
                <td className="py-4 px-4 font-bold">{p.title}</td>
                <td className="py-4 px-4 text-[#8888AA]">
                  {p.user.displayName} (@{p.user.username})
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-0.5 text-xs font-mono border rounded ${
                      p.status === ProjectStatus.LAUNCHED
                        ? "border-[#00D680]/30 text-[#00D680] bg-[#00D680]/5"
                        : p.status === ProjectStatus.KICKED
                        ? "border-red-500/30 text-red-500 bg-red-500/5"
                        : p.status === ProjectStatus.WARNED
                        ? "border-[#F59E0B]/30 text-[#F59E0B] bg-[#F59E0B]/5"
                        : "border-[#FF4D00]/30 text-[#FF4D00] bg-[#FF4D00]/5"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono">{p.voteCount}</td>
                <td className="py-4 px-4">
                  {p.isBoosted ? (
                    <span className="text-[#00D680] font-mono text-xs">YES</span>
                  ) : (
                    <span className="text-[#5C5C80] font-mono text-xs">NO</span>
                  )}
                </td>
                <td className="py-4 px-4 text-[#8888AA] text-xs font-mono">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 text-right space-x-2">
                  <button
                    onClick={() => handleToggleFeature(p.id, p.isFeatured)}
                    disabled={isUpdating !== null}
                    className={`px-2.5 py-1 text-xs font-mono border rounded transition-all cursor-pointer ${
                      p.isFeatured
                        ? "border-[#00D680] text-[#00D680] hover:bg-[#00D680]/5"
                        : "border-[#1C1C30] text-[#5C5C80] hover:text-[#8888AA] hover:border-[#2A2A45]"
                    }`}
                  >
                    {p.isFeatured ? "Featured" : "Feature"}
                  </button>
                  {p.status !== ProjectStatus.KICKED && p.status !== ProjectStatus.LAUNCHED && (
                    <button
                      onClick={() => handleKick(p.id)}
                      disabled={isUpdating !== null}
                      className="px-2.5 py-1 text-xs font-mono border rounded border-red-500/40 text-red-500 hover:bg-red-500/5 transition-all cursor-pointer"
                    >
                      Kick
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
