import React from "react";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#080810] text-[#F0F0FF] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-[#0E0E1C] border border-[#1C1C30] rounded" />
          <div className="h-4 w-40 bg-[#0E0E1C] border border-[#1C1C30] rounded" />
        </div>
        
        {/* Content Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border border-[#1C1C30] bg-[#0E0E1C] p-6 rounded-lg h-48 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-5 w-1/3 bg-[#080810] border border-[#1C1C30] rounded" />
                <div className="h-4 w-3/4 bg-[#080810] border border-[#1C1C30] rounded" />
                <div className="h-4 w-1/2 bg-[#080810] border border-[#1C1C30] rounded" />
              </div>
              <div className="h-8 w-full bg-[#080810] border border-[#1C1C30] rounded-md mt-4" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
