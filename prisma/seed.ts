import { PrismaClient, ProjectStatus, Role, Plan } from "@prisma/client";

const prisma = new PrismaClient();

const now = new Date();
const hoursFromNow = (hours: number) =>
  new Date(now.getTime() + hours * 60 * 60 * 1000);
const hoursAgo = (hours: number) =>
  new Date(now.getTime() - hours * 60 * 60 * 1000);

async function main() {
  await prisma.vote.deleteMany();
  await prisma.buildUpdate.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const [ada, ben, cyra] = await Promise.all([
    prisma.user.create({
      data: {
        clerkId: "clerk_seed_ada",
        username: "ada_shipfast",
        email: "ada@example.com",
        displayName: "Ada Shipfast",
        avatarUrl: "https://unavatar.io/x/ada",
        xHandle: "ada",
        bio: "Building tiny products under pressure.",
        totalShipped: 2,
      },
    }),
    prisma.user.create({
      data: {
        clerkId: "clerk_seed_ben",
        username: "ben_founder",
        email: "ben@example.com",
        displayName: "Ben Founder",
        plan: Plan.FOUNDER,
        bio: "Founder pass holder. Clock enthusiast.",
        totalShipped: 1,
        totalKicked: 1,
      },
    }),
    prisma.user.create({
      data: {
        clerkId: "clerk_seed_cyra",
        username: "cyra_admin",
        email: "cyra@example.com",
        displayName: "Cyra Admin",
        xHandle: "cyra",
        role: Role.ADMIN,
        bio: "Keeping the launch floor clean.",
      },
    }),
  ]);

  const pulseboard = await prisma.project.create({
    data: {
      userId: ada.id,
      title: "Pulseboard",
      tagline: "A dead-simple public launch pulse for indie builders.",
      description:
        "Pulseboard lets builders publish a tiny public status board and prove they are still moving.",
      tags: ["SaaS", "Tools"],
      toolsUsed: ["Next.js", "Prisma", "Clerk"],
      status: ProjectStatus.BUILDING,
      ideaDeclaredAt: hoursAgo(12),
      deadlineAt: hoursFromNow(84),
      voteCount: 2,
    },
  });

  const clipforge = await prisma.project.create({
    data: {
      userId: ben.id,
      title: "ClipForge",
      tagline: "Turn rough launch notes into short product clips.",
      description:
        "ClipForge takes a plain feature note and turns it into a launch-ready short video script.",
      tags: ["AI", "Tools"],
      toolsUsed: ["OpenAI", "Remotion"],
      status: ProjectStatus.BUILDING,
      ideaDeclaredAt: hoursAgo(72),
      deadlineAt: hoursFromNow(24),
      voteCount: 1,
    },
  });

  const tinycrm = await prisma.project.create({
    data: {
      userId: ada.id,
      title: "TinyCRM",
      tagline: "A focused CRM for people who hate maintaining CRMs.",
      description:
        "TinyCRM tracks the next conversation that matters instead of becoming another database nobody updates.",
      liveUrl: "https://example.com/tinycrm",
      tags: ["SaaS"],
      toolsUsed: ["Next.js", "Supabase"],
      status: ProjectStatus.LAUNCHED,
      ideaDeclaredAt: hoursAgo(120),
      deadlineAt: hoursAgo(24),
      launchedAt: hoursAgo(30),
      voteCount: 42,
      isFeatured: true,
    },
  });

  const launchlens = await prisma.project.create({
    data: {
      userId: ben.id,
      title: "LaunchLens",
      tagline: "See what your launch page actually says in 30 seconds.",
      description:
        "LaunchLens critiques landing pages for clarity, proof, and conversion friction.",
      liveUrl: "https://example.com/launchlens",
      tags: ["AI", "SaaS"],
      toolsUsed: ["Next.js", "PostHog"],
      status: ProjectStatus.LAUNCHED,
      ideaDeclaredAt: hoursAgo(96),
      deadlineAt: hoursAgo(1),
      launchedAt: hoursAgo(2),
      voteCount: 18,
      isBoosted: true,
      boostedFrom: hoursAgo(12),
      boostedUntil: hoursFromNow(156),
    },
  });

  const dockit = await prisma.project.create({
    data: {
      userId: cyra.id,
      title: "DocKit",
      tagline: "Generate sharp docs from messy commit history.",
      description:
        "DocKit creates a first draft of product docs from commits, issues, and release notes.",
      tags: ["AI", "Tools"],
      toolsUsed: ["Prisma", "Resend"],
      status: ProjectStatus.WARNED,
      ideaDeclaredAt: hoursAgo(98),
      deadlineAt: hoursAgo(2),
      warningsSent: 1,
      voteCount: 7,
    },
  });

  const ghostlist = await prisma.project.create({
    data: {
      userId: ben.id,
      title: "Ghostlist",
      tagline: "A waitlist experiment that missed the clock.",
      description:
        "Ghostlist tried to turn anonymous visitor intent into warm leads, but did not ship in time.",
      tags: ["Other"],
      toolsUsed: ["Next.js"],
      status: ProjectStatus.KICKED,
      ideaDeclaredAt: hoursAgo(130),
      deadlineAt: hoursAgo(34),
      warningsSent: 2,
      voteCount: 0,
    },
  });

  await Promise.all([
    prisma.vote.create({
      data: {
        userId: ben.id,
        projectId: pulseboard.id,
      },
    }),
    prisma.vote.create({
      data: {
        userId: cyra.id,
        projectId: pulseboard.id,
      },
    }),
    prisma.vote.create({
      data: {
        userId: ada.id,
        projectId: clipforge.id,
      },
    }),
  ]);

  await Promise.all([
    prisma.buildUpdate.create({
      data: {
        projectId: pulseboard.id,
        content: "Idea declared - clock started",
        createdAt: pulseboard.ideaDeclaredAt,
      },
    }),
    prisma.buildUpdate.create({
      data: {
        projectId: clipforge.id,
        content: "Prototype flow is working. Cutting scope before the clock cuts me.",
        createdAt: hoursAgo(6),
      },
    }),
  ]);

  console.log("Seed complete");
  console.log("Users: 3");
  console.log("Projects: 6");
  console.log("Votes: 3");
  console.log("Build updates: 2");
  console.log(
    `Sample project ids: ${[
      pulseboard.id,
      clipforge.id,
      tinycrm.id,
      launchlens.id,
      dockit.id,
      ghostlist.id,
    ].join(", ")}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
