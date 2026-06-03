import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const projects = await db.project.findMany({
    take: 3,
    select: {
      id: true,
      title: true,
      userId: true,
      voteCount: true,
      user: { select: { clerkId: true, username: true } },
    },
  });
  console.log(JSON.stringify(projects, null, 2));

  const votes = await db.vote.findMany({
    take: 5,
    select: { userId: true, projectId: true },
  });
  console.log("Votes:", JSON.stringify(votes, null, 2));

  await db.$disconnect();
}
main();
