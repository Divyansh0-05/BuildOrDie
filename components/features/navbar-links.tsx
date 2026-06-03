"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavbarLinksProps {
  userId: string | null;
  isAdmin: boolean;
  isInvestor: boolean;
}

export function NavbarLinks({ userId, isAdmin, isInvestor }: NavbarLinksProps) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "HOME" },
    { href: "/leaderboard", label: "LEADERBOARD" },
    { href: "/tools", label: "TOOLS" },
    { href: "/passes", label: "PASSES" },
  ];

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    return cn(
      "px-2.5 py-1.5 border rounded transition-all select-none font-mono text-[10px] font-bold uppercase",
      isActive
        ? "border-brand-orange text-brand-orange bg-brand-orange/5 shadow-[0_0_8px_rgba(255,85,0,0.08)]"
        : "border-transparent text-text-muted hover:border-border hover:text-text-primary"
    );
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 select-none">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={getLinkClass(link.href)}>
          {link.label}
        </Link>
      ))}

      {isInvestor && (
        <Link
          href="/investor/feed"
          className={getLinkClass("/investor/feed")}
        >
          INVESTORS
        </Link>
      )}

      {isAdmin && (
        <Link
          href="/admin"
          className={getLinkClass("/admin")}
        >
          ADMIN
        </Link>
      )}

      {userId && (
        <>
          <div className="h-4 w-[1px] bg-border mx-1" />
          <Link
            href="/dashboard"
            className={getLinkClass("/dashboard")}
          >
            DASHBOARD
          </Link>
        </>
      )}
    </div>
  );
}
