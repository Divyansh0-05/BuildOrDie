"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Play, Flame } from "lucide-react";
import { ProjectCard } from "./project-card";
import { ProjectStatus } from "@prisma/client";

const AVAILABLE_TAGS = [
  "AI",
  "SaaS",
  "Tools",
  "Developer Tool",
  "Design",
  "Mobile App",
  "Analytics",
  "Social",
  "Database",
  "Web3",
];

const AVAILABLE_TOOLS = [
  "Next.js",
  "Tailwind CSS",
  "Clerk",
  "Prisma",
  "Supabase",
  "Inngest",
  "Resend",
  "Dodo Payments",
  "Cursor",
  "v0 by Vercel",
  "Framer",
  "Lovable",
  "PostHog",
  "unavatar.io",
];

export function IdeaForm({ user }: { user: { username: string; displayName: string; plan: "FREE" | "FOUNDER" } }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Derived Values
  const deadlineDate = new Date(Date.now() + 96 * 60 * 60 * 1000);
  const formattedDeadline = deadlineDate.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!title.trim()) {
        setError("Title is required.");
        return;
      }
      if (!tagline.trim()) {
        setError("Tagline is required.");
        return;
      }
      if (tagline.length > 140) {
        setError("Tagline cannot exceed 140 characters.");
        return;
      }
      if (!description.trim()) {
        setError("Description is required.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedTags.length === 0) {
        setError("Please select at least 1 tag.");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          tags: selectedTags,
          toolsUsed: selectedTools,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create project.");
      }

      router.push(`/project/${data.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  // Mock project object for ProjectCard preview
  const mockProject = {
    id: "preview-id",
    title: title || "My Cool Project",
    tagline: tagline || "A sentence describing what this project accomplishes in 140 characters.",
    status: ProjectStatus.BUILDING,
    logoUrl: null,
    tags: selectedTags.length > 0 ? selectedTags : ["Tag"],
    toolsUsed: selectedTools.length > 0 ? selectedTools : ["Tool"],
    voteCount: 0,
    deadlineAt: deadlineDate.toISOString(),
    isBoosted: false,
    user: {
      username: user.username,
      displayName: user.displayName,
      plan: user.plan,
    },
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-surface border border-border rounded-lg p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
      {/* Step Indicators */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold font-sans text-text-primary">Declare your idea</h2>
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider mt-0.5">
            {"// clock.starts.immediately"}
          </p>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs font-semibold text-text-muted select-none">
          <span className={step >= 1 ? "text-brand-orange" : ""}>1</span>
          <span>/</span>
          <span className={step >= 2 ? "text-brand-orange" : ""}>2</span>
          <span>/</span>
          <span className={step >= 3 ? "text-brand-orange" : ""}>3</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-border h-1 rounded-full overflow-hidden select-none">
        <div
          className="bg-brand-orange h-full rounded-full transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {error && <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-500 rounded text-xs font-mono">{error}</div>}

      {/* Step 1: Definition */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-text-muted mb-1.5 tracking-wider">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., BuildOrDie"
              className="w-full bg-bg-primary border border-border focus:border-brand-orange/60 text-text-primary placeholder-text-dim rounded-md px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-brand-orange/30"
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-text-muted tracking-wider">
                Tagline *
              </label>
              <span className={`text-[10px] font-mono ${tagline.length > 140 ? "text-brand-orange font-bold" : "text-text-muted"}`}>
                {tagline.length}/140
              </span>
            </div>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g., A 4-day accountability launchpad for building in public"
              maxLength={140}
              className="w-full bg-bg-primary border border-border focus:border-brand-orange/60 text-text-primary placeholder-text-dim rounded-md px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-brand-orange/30"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-text-muted mb-1.5 tracking-wider">
              Description / What will you build? *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what features your app will have, what it aims to solve, and what your goals are for the next 96 hours."
              rows={5}
              className="w-full bg-bg-primary border border-border focus:border-brand-orange/60 text-text-primary placeholder-text-dim rounded-md px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-brand-orange/30 resize-none"
            />
          </div>
        </div>
      )}

      {/* Step 2: Tags & Tools */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-text-muted mb-2 tracking-wider">
              Select Tags (At least 1)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-orange/15 border-brand-orange text-brand-orange"
                        : "bg-bg-primary border-border text-text-muted hover:text-text-secondary hover:border-border-strong"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-text-muted mb-2 tracking-wider">
              Tools Planned / Tech Stack
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TOOLS.map((tool) => {
                const isSelected = selectedTools.includes(tool);
                return (
                  <button
                    key={tool}
                    onClick={() => toggleTool(tool)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-orange/15 border-brand-orange text-brand-orange"
                        : "bg-bg-primary border-border text-text-muted hover:text-text-secondary hover:border-border-strong"
                    }`}
                  >
                    {tool}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preview Card & Confirm */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="p-4 bg-brand-orange/5 border border-brand-orange/10 text-brand-orange rounded-md flex gap-3 text-xs leading-relaxed">
            <Flame className="w-5 h-5 shrink-0 animate-pulse text-brand-orange" />
            <div>
              <span className="font-bold uppercase tracking-wider">Irreversible Action:</span> Once you submit this form, your 4-day clock starts ticking immediately. You cannot pause or delete it.
            </div>
          </div>

          {/* Project Card Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-semibold uppercase text-text-muted tracking-wider">
              Homepage Card Preview
            </label>
            <div className="max-w-sm mx-auto w-full pointer-events-none">
              <ProjectCard project={mockProject} />
            </div>
          </div>

          {/* Deadline warning */}
          <div className="border border-border p-4 rounded-md bg-bg-primary/50 text-center space-y-1">
            <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              Target Deadline
            </div>
            <div className="text-sm font-bold text-text-primary font-mono tracking-wide">
              {formattedDeadline}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Buttons */}
      <div className="flex justify-between pt-4 border-t border-border mt-2">
        {step > 1 ? (
          <button
            onClick={handleBack}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-border text-text-secondary hover:text-text-primary hover:border-border-strong font-mono font-bold text-xs uppercase tracking-wider rounded transition-all active:scale-95 duration-100 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-orange text-text-primary border border-brand-orange/45 font-mono font-bold text-xs uppercase tracking-wider rounded transition-all active:scale-95 duration-100 hover:bg-brand-orange/95 cursor-pointer shadow-[0_0_12px_rgba(255,77,0,0.1)]"
          >
            Next
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-orange text-text-primary border border-brand-orange/45 font-mono font-black text-xs uppercase tracking-widest rounded transition-all active:scale-95 duration-100 hover:bg-brand-orange/95 cursor-pointer shadow-[0_0_20px_rgba(255,77,0,0.2)]"
          >
            {isSubmitting ? (
              "CREATING..."
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Start the clock
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
