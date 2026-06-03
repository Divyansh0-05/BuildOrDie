import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function Navbar() {
  const { userId } = await auth();

  let isAdmin = false;
  let isInvestor = false;

  if (userId) {
    const localUser = await db.user.findFirst({
      where: { clerkId: userId },
      select: { role: true, investorAccessUntil: true },
    });

    if (localUser) {
      isAdmin = localUser.role === Role.ADMIN;
      isInvestor =
        localUser.role === Role.INVESTOR &&
        localUser.investorAccessUntil !== null &&
        localUser.investorAccessUntil > new Date();
    }
  }

  return (
    <nav className="border-b border-border bg-rock/90 sticky top-0 z-50 backdrop-blur-md select-none">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Mockup logo wrapper */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl leading-none">🔥</span>
          <div className="flex flex-col">
            <span className="font-gothic text-2xl tracking-wide bg-gradient-to-r from-brand-amber to-brand-orange bg-clip-text text-transparent leading-none">
              BuildOrDie
            </span>
            <span className="text-[7px] text-text-muted tracking-[0.15em] font-bold uppercase mt-0.5 leading-none">
              DECLARE · BUILD · SHIP · OR DIE
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-1 sm:gap-2 font-mono text-[10px] font-bold text-text-muted uppercase">
          <Link
            href="/"
            className="px-2.5 py-1.5 border border-transparent rounded hover:border-border hover:text-text-primary transition-all"
          >
            HOME
          </Link>
          <Link
            href="/leaderboard"
            className="px-2.5 py-1.5 border border-transparent rounded hover:border-border hover:text-text-primary transition-all"
          >
            LEADERBOARD
          </Link>
          <Link
            href="/tools"
            className="px-2.5 py-1.5 border border-transparent rounded hover:border-border hover:text-text-primary transition-all"
          >
            TOOLS
          </Link>
          <Link
            href="/passes"
            className="px-2.5 py-1.5 border border-transparent rounded hover:border-border hover:text-text-primary transition-all"
          >
            PASSES
          </Link>

          {isInvestor && (
            <Link
              href="/investor/feed"
              className="px-2.5 py-1.5 border border-transparent rounded text-brand-green hover:border-border transition-all"
            >
              INVESTORS
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="px-2.5 py-1.5 border border-transparent rounded text-brand-orange hover:border-border transition-all"
            >
              ADMIN
            </Link>
          )}

          <div className="h-4 w-[1px] bg-border mx-1" />

          {userId ? (
            <div className="flex items-center gap-3.5 pl-1.5">
              <Link
                href="/dashboard"
                className="px-2.5 py-1.5 border border-transparent rounded hover:border-border hover:text-text-primary transition-all"
              >
                DASHBOARD
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <Link
              href="/submit"
              className="bg-brand-orange border border-brand-orange/45 px-3.5 py-2 font-mono font-bold text-[10px] text-white uppercase tracking-wider transition-all hover:bg-brand-amber ml-1.5"
            >
              START THE CLOCK →
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
