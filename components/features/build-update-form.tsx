"use client";

import { useState } from "react";
import { Send, AlertTriangle } from "lucide-react";

interface BuildUpdateFormProps {
  projectId: string;
  onUpdateSuccess?: (newUpdate: { id: string; content: string; createdAt: string }) => void;
}

export function BuildUpdateForm({ projectId, onUpdateSuccess }: BuildUpdateFormProps) {
  void projectId;
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxChars = 280;
  const charsRemaining = maxChars - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;
    if (content.length > maxChars) return;

    setIsSubmitting(true);
    setError(null);

    // NOTE: The endpoint `POST /api/projects/[id]/updates` does not exist in the current backend codebase.
    // As per instructions, we simulate the UI behavior and props interface without hitting a non-existent API.
    try {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockUpdate = {
        id: `mock-update-${Date.now()}`,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      setContent("");
      if (onUpdateSuccess) {
        onUpdateSuccess(mockUpdate);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-surface border border-border p-5 rounded-lg flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-text-muted font-semibold uppercase tracking-wider">
          {"// project.post_update"}
        </span>
        <div className="flex items-center gap-1.5 text-brand-amber font-mono text-[9px] font-bold uppercase tracking-wider bg-brand-amber/10 border border-brand-amber/20 px-2 py-0.5 rounded">
          <AlertTriangle className="w-2.5 h-2.5" />
          API Offline (Pending Backend Update)
        </div>
      </div>

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share progress on your project... (e.g., 'Finished auth, now styling the landing page.')"
          rows={3}
          maxLength={maxChars}
          disabled={isSubmitting}
          className="w-full bg-bg-primary border border-border focus:border-brand-orange/55 text-text-primary placeholder-text-dim rounded-lg p-3.5 text-sm outline-none resize-none transition-all focus:ring-1 focus:ring-brand-orange/30 disabled:opacity-50"
        />
        <div
          className={`absolute bottom-3 right-3.5 font-mono text-[10px] font-bold select-none ${
            charsRemaining < 20
              ? "text-brand-orange animate-pulse"
              : charsRemaining < 50
              ? "text-brand-amber"
              : "text-text-muted"
          }`}
        >
          {charsRemaining}
        </div>
      </div>

      {error && <div className="text-red-500 text-xs font-mono">{error}</div>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange disabled:bg-surface disabled:border-border disabled:text-text-dim text-text-primary border border-brand-orange/45 font-mono font-bold text-xs uppercase tracking-wider rounded transition-all active:scale-95 duration-100 hover:bg-brand-orange/95 cursor-pointer shadow-[0_0_12px_rgba(255,77,0,0.1)]"
        >
          <Send className="w-3.5 h-3.5" />
          Post Update
        </button>
      </div>
    </form>
  );
}
