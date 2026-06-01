"use client";

import Link from "next/link";
import { useState } from "react";

interface Builder {
  username: string;
  displayName: string;
  xHandle?: string | null;
}

interface AvatarStackProps {
  builders: Builder[];
  totalCount?: number;
}

function InitialsAvatar({ displayName, size = 34 }: { displayName: string; size?: number }) {
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  // Simple deterministically generated color based on display name
  const colors = [
    "bg-red-950 text-red-400 border-red-800",
    "bg-orange-950 text-orange-400 border-orange-850",
    "bg-amber-950 text-amber-400 border-amber-800",
    "bg-emerald-950 text-emerald-400 border-emerald-800",
    "bg-blue-950 text-blue-400 border-blue-800",
    "bg-indigo-950 text-indigo-400 border-indigo-800",
    "bg-violet-950 text-violet-400 border-violet-800",
    "bg-fuchsia-950 text-fuchsia-400 border-fuchsia-800",
  ];

  let sum = 0;
  for (let i = 0; i < displayName.length; i++) {
    sum += displayName.charCodeAt(i);
  }
  const colorClass = colors[sum % colors.length];

  return (
    <div
      className={`rounded-full flex items-center justify-center font-mono font-bold tracking-tighter text-xs shrink-0 select-none border-2 border-bg-primary ${colorClass}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {initials}
    </div>
  );
}

export function AvatarStack({ builders, totalCount }: AvatarStackProps) {
  const maxAvatars = 6;
  const visibleBuilders = builders.slice(0, maxAvatars);
  const remainingCount = totalCount !== undefined ? totalCount - visibleBuilders.length : builders.length - visibleBuilders.length;

  return (
    <div className="flex items-center">
      <div className="flex items-center -space-x-2.5">
        {visibleBuilders.map((builder, index) => (
          <AvatarItem key={builder.username} builder={builder} index={index} />
        ))}

        {remainingCount > 0 && (
          <div
            className="w-[34px] h-[34px] rounded-full border-2 border-bg-primary bg-surface text-text-muted flex items-center justify-center font-mono font-semibold text-[10px] tracking-tight shrink-0 select-none z-10"
            style={{ marginLeft: "-10px" }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
}

function AvatarItem({ builder, index }: { builder: Builder; index: number }) {
  const [imgFailed, setImgFailed] = useState(false);

  const content =
    builder.xHandle && !imgFailed ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://unavatar.io/x/${builder.xHandle}`}
        alt={builder.displayName}
        className="w-[34px] h-[34px] rounded-full border-2 border-bg-primary object-cover shrink-0 select-none"
        onError={() => setImgFailed(true)}
      />
    ) : (
      <InitialsAvatar displayName={builder.displayName} />
    );

  return (
    <Link
      href={`/profile/${builder.username}`}
      className="transition-transform duration-200 hover:-translate-y-1 hover:z-30 relative cursor-pointer"
      style={{ zIndex: 10 + index }}
    >
      {content}
    </Link>
  );
}
