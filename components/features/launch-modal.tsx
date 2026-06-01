"use client";

import { useState } from "react";
import { X, Globe, GitBranch, Image as ImageIcon, CheckCircle, Share2 } from "lucide-react";

interface LaunchModalProps {
  projectId: string;
  projectTitle: string;
  projectTagline: string;
  isOpen: boolean;
  onClose: () => void;
  onLaunchSuccess: () => void;
}

export function LaunchModal({
  projectId,
  projectTitle,
  projectTagline,
  isOpen,
  onClose,
  onLaunchSuccess,
}: LaunchModalProps) {
  const [liveUrl, setLiveUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 2-step confirm states
  const [confirmShip, setConfirmShip] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);

  if (!isOpen) return null;

  const validateUrls = () => {
    if (!liveUrl.trim()) {
      setError("Live URL is required.");
      return false;
    }
    if (!liveUrl.startsWith("https://")) {
      setError("Live URL must be a valid https:// link.");
      return false;
    }
    if (repoUrl.trim() && !repoUrl.startsWith("https://")) {
      setError("GitHub/Repository URL must start with https:// if provided.");
      return false;
    }
    return true;
  };

  const handleLaunch = async () => {
    if (!confirmShip) {
      setConfirmShip(true);
      return;
    }

    if (!validateUrls()) {
      setConfirmShip(false);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/launch`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          liveUrl: liveUrl.trim(),
          repoUrl: repoUrl.trim() || undefined,
          screenshotUrl: screenshotUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Launch failed.");
      }

      setIsLaunched(true);
      onLaunchSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setConfirmShip(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tweetText = `Just shipped ${projectTitle} on @BuildOrDie in 4 days. ${projectTagline} Check it out: ${
    typeof window !== "undefined" ? window.location.origin : "https://buildordie.com"
  }/project/${projectId} #buildinpublic #BuildOrDie`;

  const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface border border-border rounded-lg overflow-hidden relative shadow-2xl">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!isLaunched ? (
          <div className="p-6">
            <h2 className="text-xl font-bold font-sans text-text-primary mb-1">
              Ship your product
            </h2>
            <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-6">
              {"// project.launch_flow"}
            </p>

            <div className="space-y-4">
              {/* Live URL */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-text-muted mb-1.5 tracking-wider">
                  Live URL *
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://mycoolproduct.com"
                    disabled={isSubmitting}
                    className="w-full bg-bg-primary border border-border focus:border-brand-orange/60 text-text-primary placeholder-text-dim rounded-md pl-10 pr-4 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-brand-orange/30 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Repo URL */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-text-muted mb-1.5 tracking-wider">
                  GitHub / Repository URL (Optional)
                </label>
                <div className="relative">
                  <GitBranch className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/myusername/myrepo"
                    disabled={isSubmitting}
                    className="w-full bg-bg-primary border border-border focus:border-brand-orange/60 text-text-primary placeholder-text-dim rounded-md pl-10 pr-4 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-brand-orange/30 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Screenshot URL */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-text-muted mb-1.5 tracking-wider">
                  Screenshot URL (Optional)
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    placeholder="https://supabase.co/storage/v1/object/public/..."
                    disabled={isSubmitting}
                    className="w-full bg-bg-primary border border-border focus:border-brand-orange/60 text-text-primary placeholder-text-dim rounded-md pl-10 pr-4 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-brand-orange/30 disabled:opacity-50"
                  />
                </div>
              </div>

              {error && <div className="text-red-500 text-xs font-mono mt-2">{error}</div>}

              {/* Action Button */}
              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={handleLaunch}
                  disabled={isSubmitting}
                  className={`w-full py-3 font-mono font-black text-xs uppercase tracking-widest rounded border transition-all active:scale-95 duration-100 cursor-pointer text-center ${
                    confirmShip
                      ? "bg-brand-orange border-brand-orange text-text-primary shadow-[0_0_20px_rgba(255,77,0,0.3)] animate-pulse"
                      : "bg-surface border-brand-orange text-brand-orange hover:bg-brand-orange/5"
                  }`}
                >
                  {isSubmitting
                    ? "SHIPPING..."
                    : confirmShip
                    ? "Confirm ship — this is permanent"
                    : "SHIP IT"}
                </button>

                {confirmShip && (
                  <button
                    onClick={() => setConfirmShip(false)}
                    disabled={isSubmitting}
                    className="w-full py-2 font-mono text-[10px] uppercase text-text-muted hover:text-text-secondary text-center"
                  >
                    Cancel / Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Success / Share state */
          <div className="p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 animate-bounce" />
            </div>

            <h2 className="text-xl font-bold font-sans text-text-primary mb-1">
              You shipped it!
            </h2>
            <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-6">
              {"// project.ship_successful"}
            </p>

            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              The 4-day clock has stopped. Your product is live. Now get the community behind you.
            </p>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-brand-orange text-text-primary border border-brand-orange/45 font-mono font-bold text-xs uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-all active:scale-95 duration-100 hover:bg-brand-orange/95 shadow-[0_0_15px_rgba(255,77,0,0.2)] mb-3"
            >
              <Share2 className="w-4 h-4" />
              Share on X (Twitter)
            </a>

            <button
              onClick={onClose}
              className="w-full py-2 bg-transparent text-text-muted hover:text-text-secondary font-mono text-[10px] uppercase tracking-wider text-center"
            >
              Back to project page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
