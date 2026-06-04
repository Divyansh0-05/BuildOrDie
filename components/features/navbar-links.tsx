"use client";

import React, { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "HOME" },
    { href: "/leaderboard", label: "LEADERBOARD" },
    { href: "/tools", label: "TOOLS" },
    { href: "/passes", label: "PASSES" },
  ];

  if (isInvestor) {
    links.push({ href: "/investor/feed", label: "INVESTORS" });
  }

  if (isAdmin) {
    links.push({ href: "/admin", label: "ADMIN" });
  }

  if (userId) {
    links.push({ href: "/dashboard", label: "DASHBOARD" });
  }

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    return cn(
      "px-3.5 py-2 border rounded transition-all select-none font-mono text-xs font-bold uppercase",
      isActive
        ? "border-brand-orange text-brand-orange bg-brand-orange/5 shadow-[0_0_8px_rgba(255,85,0,0.08)]"
        : "border-transparent text-text-muted hover:border-border hover:text-text-primary"
    );
  };

  return (
    <>
      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-1.5 sm:gap-2.5 select-none">
        {links.map((link) => {
          const isDashboard = link.label === "DASHBOARD";
          return (
            <React.Fragment key={link.href}>
              {isDashboard && <div className="h-5 w-[1px] bg-border mx-1.5" />}
              <Link href={link.href} className={getLinkClass(link.href)}>
                {link.label}
              </Link>
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Hamburger Button */}
      <div className="flex md:hidden items-center select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 border border-border rounded-[2px] text-text-secondary hover:text-text-primary hover:border-text-muted transition-all cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-rock/95 backdrop-blur-md border-b border-border flex flex-col p-6 gap-3.5 z-50 shadow-2xl">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "w-full px-4 py-3 border rounded transition-all select-none font-mono text-sm font-bold uppercase text-center",
                  pathname === link.href
                    ? "border-brand-orange text-brand-orange bg-brand-orange/5 shadow-[0_0_8px_rgba(255,85,0,0.08)]"
                    : "border-transparent text-text-secondary hover:border-border hover:text-text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
