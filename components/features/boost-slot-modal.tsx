"use client";

import { useState, useEffect } from "react";
import { X, Check, Megaphone, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface BoostSlot {
  slotNumber: number;
  projectId: string | null;
  projectTitle: string | null;
  boostedFrom: string | null;
  boostedUntil: string | null;
  isActive: boolean;
  isFree: boolean;
}

interface BoostSlotModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BoostSlotModal({ projectId, isOpen, onClose }: BoostSlotModalProps) {
  const [slots, setSlots] = useState<BoostSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSlots = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/boost-slots");
        if (!res.ok) {
          throw new Error("Failed to fetch slots state.");
        }
        const data = await res.json();
        setSlots(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not load boost slot status.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [isOpen]);

  if (!isOpen) return null;

  // Check if all slots are occupied
  const allOccupied = slots.length > 0 && slots.every((s) => !s.isFree);

  // Compute next opening date (earliest boostedUntil date)
  let nextOpeningDate: Date | null = null;
  if (allOccupied) {
    const endDates = slots
      .map((s) => (s.boostedUntil ? new Date(s.boostedUntil) : null))
      .filter(Boolean) as Date[];
    if (endDates.length > 0) {
      nextOpeningDate = new Date(Math.min(...endDates.map((d) => d.getTime())));
    }
  }

  const handleBuyBoost = async (productType: "starter" | "spotlight") => {
    setIsCreatingCheckout(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/create-boost-slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          productType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Failed to initiate payment checkout.");
      }

      const data = (await res.json()) as { checkoutUrl: string };
      // Redirect to Dodo checkout page
      window.location.href = data.checkoutUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout generation failed.");
      setIsCreatingCheckout(false);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-surface border border-border rounded-lg overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-border">
          <button
            onClick={onClose}
            disabled={isCreatingCheckout}
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h2 className="text-xl font-bold font-sans text-text-primary mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-orange animate-pulse" />
            Spotlight Boost Queue
          </h2>
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider">
            {"// monetize.featured_strip"}
          </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted font-mono text-xs">
              <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
              RETRIEVING SLOT TIMELINES...
            </div>
          ) : error && !slots.length ? (
            <div className="p-4 bg-red-950/20 border border-red-900/30 text-red-500 rounded text-sm font-mono flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Timeline Slot Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slots.map((slot) => (
                  <div
                    key={slot.slotNumber}
                    className={`border p-4 rounded-lg flex flex-col justify-between h-[110px] transition-all ${
                      slot.isFree
                        ? "border-dashed border-border-strong bg-bg-primary/20 hover:border-brand-orange/30"
                        : slot.isActive
                        ? "border-brand-green/30 bg-brand-green/5"
                        : "border-brand-amber/30 bg-brand-amber/5"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-text-muted uppercase font-semibold">
                          Slot #{slot.slotNumber}
                        </span>
                        {slot.isFree ? (
                          <span className="text-[9px] font-mono font-bold text-text-muted">FREE</span>
                        ) : slot.isActive ? (
                          <span className="text-[9px] font-mono font-bold text-brand-green">ACTIVE</span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-brand-amber">QUEUED</span>
                        )}
                      </div>
                      
                      <h4 className="text-sm font-bold text-text-primary line-clamp-1">
                        {slot.isFree ? "Available now" : slot.projectTitle}
                      </h4>
                    </div>

                    {!slot.isFree && slot.boostedUntil && (
                      <div className="font-mono text-[9px] text-text-muted">
                        {slot.isActive ? "Expires: " : "Starts: "}
                        <span className="text-text-secondary">
                          {formatDate(slot.isActive ? slot.boostedUntil : slot.boostedFrom!)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Status Message */}
              {allOccupied ? (
                <div className="p-4 bg-brand-amber/10 border border-brand-amber/30 text-brand-amber rounded-lg flex gap-3 text-xs leading-relaxed">
                  <Megaphone className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold">All 4 slots occupied.</span> Next opening is scheduled for{" "}
                    <span className="font-bold underline">{nextOpeningDate ? formatDate(nextOpeningDate.toISOString()) : "soon"}</span>.
                    You can pay now to secure your queue spot. Your ad will go live automatically at that time.
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-lg flex gap-3 text-xs leading-relaxed">
                  <Check className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold">Ad slots are open!</span> Buy a boost now, and your project will be featured immediately on the homepage featured section.
                  </div>
                </div>
              )}

              {/* Purchase Options */}
              <div className="space-y-4 pt-4 border-t border-border/60">
                <h3 className="text-xs font-mono font-semibold uppercase text-text-muted tracking-wider">
                  Select boost package
                </h3>

                {error && <div className="text-red-500 text-xs font-mono">{error}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Starter Boost */}
                  <button
                    onClick={() => handleBuyBoost("starter")}
                    disabled={isCreatingCheckout}
                    className="p-5 border border-border hover:border-brand-orange bg-surface hover:bg-bg-primary/30 rounded-lg flex flex-col justify-between gap-3 text-left transition-all active:scale-[0.98] duration-100 disabled:opacity-50"
                  >
                    <div>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-base font-bold text-text-primary">Starter Boost</span>
                        <span className="text-lg font-black text-brand-orange">$19</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Feathers your project in the paid featured strip for exactly 3 days.
                      </p>
                    </div>
                    <span className="font-mono text-[9px] font-bold text-brand-orange uppercase tracking-widest mt-2 block">
                      Get 3 days →
                    </span>
                  </button>

                  {/* Full Spotlight */}
                  <button
                    onClick={() => handleBuyBoost("spotlight")}
                    disabled={isCreatingCheckout}
                    className="p-5 border border-border hover:border-brand-orange bg-surface hover:bg-bg-primary/30 rounded-lg flex flex-col justify-between gap-3 text-left transition-all active:scale-[0.98] duration-100 disabled:opacity-50"
                  >
                    <div>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-base font-bold text-text-primary">Full Spotlight</span>
                        <span className="text-lg font-black text-brand-orange">$39</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Features your project in the paid featured strip for a full 7 days.
                      </p>
                    </div>
                    <span className="font-mono text-[9px] font-bold text-brand-orange uppercase tracking-widest mt-2 block">
                      Get 7 days →
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Loading overlay for checkout redirect */}
        {isCreatingCheckout && (
          <div className="absolute inset-0 bg-bg-primary/80 flex flex-col items-center justify-center gap-3 text-text-primary font-mono text-xs z-50">
            <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
            GENERATING SECURE CHECKOUT...
          </div>
        )}
      </div>
    </div>
  );
}
