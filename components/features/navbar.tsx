import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

import { NavbarLinks } from "./navbar-links";

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
        <div className="flex items-center gap-2">
          <NavbarLinks userId={userId} isAdmin={isAdmin} isInvestor={isInvestor} />
          
          <div className="flex items-center gap-2 pl-1">
            {userId ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Link
                href="/submit"
                className="bg-brand-orange border border-brand-orange/45 px-3.5 py-2 font-mono font-bold text-[10px] text-white uppercase tracking-wider transition-all hover:bg-brand-amber rounded-[2px]"
              >
                START THE CLOCK →
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
