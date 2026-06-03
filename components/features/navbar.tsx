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
    <nav className="border-b border-[#1C1C30] bg-[#080810] px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="font-black text-xl text-[#F0F0FF]">
          Build<span className="text-[#FF4D00]">OrDie</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-mono text-[#8888AA]">
          <Link href="/leaderboard" className="hover:text-[#F0F0FF] transition-colors">
            Leaderboard
          </Link>
          <Link href="/passes" className="hover:text-[#F0F0FF] transition-colors">
            Passes
          </Link>
          {isInvestor && (
            <Link href="/investor/feed" className="hover:text-[#F0F0FF] transition-colors text-[#00D680]">
              Investor Feed
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="hover:text-[#F0F0FF] transition-colors text-[#FF4D00]">
              Admin
            </Link>
          )}
          {userId ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hover:text-[#F0F0FF] transition-colors">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <Link
              href="/submit"
              className="bg-[#FF4D00] border border-[#FF4D00]/45 px-4 py-2 font-bold text-[#080810] text-xs uppercase tracking-wider transition-all hover:bg-[#FF4D00]/90"
            >
              Start the clock
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
