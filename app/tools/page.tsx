"use client";

import React, { useState } from "react";
import { StoneCard } from "@/components/ui/primitives";

interface Tool {
  name: string;
  category: string;
  icon: string;
  description: string;
  usage: string;
  url: string;
}

const TOOLS_DATA: Tool[] = [
  // AI
  {
    name: "Claude by Anthropic",
    category: "AI",
    icon: "🧠",
    description: "Highly intelligent LLM with stellar coding abilities, perfect for writing clean code or debugging complex app architectures.",
    usage: "Used by 412 builders",
    url: "https://claude.ai",
  },
  {
    name: "ChatGPT by OpenAI",
    category: "AI",
    icon: "💬",
    description: "Versatile AI assistant for coding, copy generation, marketing brainstorming, and overall developer productivity support.",
    usage: "Used by 398 builders",
    url: "https://chatgpt.com",
  },
  {
    name: "Gemini",
    category: "AI",
    icon: "♊",
    description: "Google's advanced multimodal reasoning model, featuring massive context windows for full codebase ingestion.",
    usage: "Used by 154 builders",
    url: "https://gemini.google.com",
  },
  {
    name: "Perplexity",
    category: "AI",
    icon: "🔍",
    description: "AI-powered conversational search engine to research dependencies, check APIs, and troubleshoot syntax instantly.",
    usage: "Used by 210 builders",
    url: "https://perplexity.ai",
  },
  {
    name: "Grok by xAI",
    category: "AI",
    icon: "🐦",
    description: "Real-time AI assistant with deep integration into X platform data, great for trends and public marketing research.",
    usage: "Used by 89 builders",
    url: "https://x.ai",
  },

  // Coding
  {
    name: "Cursor",
    category: "CODING",
    icon: "💻",
    description: "An AI-first code editor fork of VS Code. Features inline edits, chats, and automated file-creation agents.",
    usage: "Used by 567 builders",
    url: "https://cursor.com",
  },
  {
    name: "Windsurf",
    category: "CODING",
    icon: "🏄",
    description: "The agentic IDE that collaborates alongside developers seamlessly, building complex features on autopilot.",
    usage: "Used by 180 builders",
    url: "https://codeium.com/windsurf",
  },
  {
    name: "GitHub Copilot",
    category: "CODING",
    icon: "🤖",
    description: "Industry-standard AI pair programmer providing autocompletions and chat inside popular IDEs.",
    usage: "Used by 344 builders",
    url: "https://github.com/features/copilot",
  },
  {
    name: "Replit",
    category: "CODING",
    icon: "🌀",
    description: "Cloud IDE with instant hosting, database storage, and AI agents to go from prompt to working web application.",
    usage: "Used by 225 builders",
    url: "https://replit.com",
  },

  // UI
  {
    name: "v0 by Vercel",
    category: "UI",
    icon: "🎨",
    description: "Generates beautiful, production-ready React + Tailwind CSS components from plain text prompts.",
    usage: "Used by 455 builders",
    url: "https://v0.dev",
  },
  {
    name: "Lovable",
    category: "UI",
    icon: "❤️",
    description: "Describe full-stack web applications in plain English and watch them compile into clean React frontends.",
    usage: "Used by 134 builders",
    url: "https://lovable.dev",
  },
  {
    name: "Bolt.new",
    category: "UI",
    icon: "⚡",
    description: "In-browser web containers that compile, install dependencies, run, and deploy full stack apps directly from chat.",
    usage: "Used by 198 builders",
    url: "https://bolt.new",
  },
  {
    name: "Figma",
    category: "UI",
    icon: "📐",
    description: "The leading collaborative interface design tool. Design layout and components before generating code.",
    usage: "Used by 287 builders",
    url: "https://figma.com",
  },
  {
    name: "Framer",
    category: "UI",
    icon: "🌐",
    description: "No-code design tool that exports directly to responsive website layouts, perfect for launching landing pages.",
    usage: "Used by 120 builders",
    url: "https://framer.com",
  },

  // Backend
  {
    name: "Supabase",
    category: "BACKEND",
    icon: "🗄️",
    description: "Open source Firebase alternative. Provides real-time Postgres DB, user auth, storage, and edge functions.",
    usage: "Used by 588 builders",
    url: "https://supabase.com",
  },
  {
    name: "Firebase",
    category: "BACKEND",
    icon: "🔥",
    description: "Google's backend platform providing Firestore database, cloud storage, auth, and analytics for app scale.",
    usage: "Used by 276 builders",
    url: "https://firebase.google.com",
  },
  {
    name: "Neon Postgres",
    category: "BACKEND",
    icon: "🐘",
    description: "Serverless Postgres database with branching capabilities, letting you create sandboxes for every branch.",
    usage: "Used by 198 builders",
    url: "https://neon.tech",
  },
  {
    name: "Railway",
    category: "BACKEND",
    icon: "🚂",
    description: "Deploy databases, cron jobs, background workers, and full stack APIs with zero config infrastructure.",
    usage: "Used by 165 builders",
    url: "https://railway.app",
  },

  // Deployment
  {
    name: "Vercel",
    category: "DEPLOYMENT",
    icon: "🚀",
    description: "The native host for Next.js. Deploys frontend, serverless endpoints, and assets globally on push.",
    usage: "Used by 710 builders",
    url: "https://vercel.com",
  },
  {
    name: "Netlify",
    category: "DEPLOYMENT",
    icon: "🔗",
    description: "Serverless platform to build, deploy, and scale static sites and modern server-rendered frameworks.",
    usage: "Used by 142 builders",
    url: "https://netlify.com",
  },
  {
    name: "Cloudflare Pages",
    category: "DEPLOYMENT",
    icon: "☁️",
    description: "Fast, secure deployment platform for static sites and edge workers, running on a massive global network.",
    usage: "Used by 221 builders",
    url: "https://pages.cloudflare.com",
  },

  // Auth
  {
    name: "Clerk",
    category: "AUTH",
    icon: "🔐",
    description: "Drop-in user authentication and management widgets supporting OAuth logins, user profile editing, and roles.",
    usage: "Used by 398 builders",
    url: "https://clerk.com",
  },
  {
    name: "Better Auth",
    category: "AUTH",
    icon: "🔑",
    description: "Comprehensive TypeScript-first authentication framework for modern web stacks with built-in multi-tenancy.",
    usage: "Used by 92 builders",
    url: "https://better-auth.com",
  },

  // Payments
  {
    name: "Dodo Payments",
    category: "PAYMENTS",
    icon: "💸",
    description: "Global Merchant of Record that handles checkout, subscription payments, and taxes with one line of code.",
    usage: "Used by 187 builders",
    url: "https://dodopayments.com",
  },
  {
    name: "Stripe",
    category: "PAYMENTS",
    icon: "💳",
    description: "Standard financial infrastructure for the internet. Accept payments, send payouts, and manage billing billing.",
    usage: "Used by 544 builders",
    url: "https://stripe.com",
  },
  {
    name: "Lemon Squeezy",
    category: "PAYMENTS",
    icon: "🍋",
    description: "All-in-one payment processing, subscription management, global tax handling, and invoice delivery.",
    usage: "Used by 230 builders",
    url: "https://lemonsqueezy.com",
  },

  // Email
  {
    name: "Resend",
    category: "EMAIL",
    icon: "📧",
    description: "Modern developer-friendly email sending platform built on AWS SES, featuring clean React Email templates.",
    usage: "Used by 312 builders",
    url: "https://resend.com",
  },
  {
    name: "Loops",
    category: "EMAIL",
    icon: "🔁",
    description: "Clean email sending tool designed specifically for SaaS startups. Build flows, digests, and campaigns easily.",
    usage: "Used by 154 builders",
    url: "https://loops.so",
  },

  // Analytics
  {
    name: "PostHog",
    category: "ANALYTICS",
    icon: "🦔",
    description: "All-in-one product analytics tool supporting session recordings, user paths, feature flags, and A/B tests.",
    usage: "Used by 287 builders",
    url: "https://posthog.com",
  },
  {
    name: "Plausible Analytics",
    category: "ANALYTICS",
    icon: "📊",
    description: "Privacy-focused, lightweight web analytics platform. Simple dashboard, 100% compliant with privacy regulations.",
    usage: "Used by 120 builders",
    url: "https://plausible.io",
  },

  // Automation
  {
    name: "Inngest",
    category: "AUTOMATION",
    icon: "⚙️",
    description: "Event-driven background job platform. Schedule cron jobs, handle serverless queues, and coordinate tasks.",
    usage: "Used by 176 builders",
    url: "https://inngest.com",
  },
  {
    name: "Trigger.dev",
    category: "AUTOMATION",
    icon: "🎯",
    description: "Framework to run long-running background tasks, webhooks, and cron jobs with full visibility inside codebases.",
    usage: "Used by 110 builders",
    url: "https://trigger.dev",
  },
];

const CATEGORIES = ["ALL", "AI", "CODING", "UI", "BACKEND", "DEPLOYMENT", "AUTH", "PAYMENTS", "EMAIL", "ANALYTICS", "AUTOMATION"];

export default function ToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = TOOLS_DATA.filter((tool) => {
    const matchesCategory =
      selectedCategory === "ALL" || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-bg-primary px-8 py-14 text-text-primary pb-24 select-none">
      <section className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-1.5">
          <h1 className="font-gothic text-5xl font-bold tracking-wide text-text-primary mb-1">
            The Builder&apos;s Forge
          </h1>
          <p className="font-mono text-xs text-text-muted uppercase tracking-wider font-bold">
            {"// CURATED TOOLS TO SHIP IN 4 DAYS — STACK DISCOVERY FOR INDIE BUILDERS"}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2.5 select-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`font-mono text-[11px] font-bold tracking-wider px-4 py-2 border rounded-sm transition-all uppercase cursor-pointer ${
                selectedCategory === cat
                  ? "border-brand-orange text-brand-orange bg-brand-orange/5"
                  : "border-border text-text-muted hover:border-text-secondary hover:text-text-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="max-w-lg">
          <input
            type="text"
            placeholder="SEARCH THE FORGE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full font-mono text-sm border border-border bg-surface px-5 py-3 text-text-primary placeholder-text-muted outline-none focus:border-text-muted transition-colors rounded-sm"
          />
        </div>

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="border border-dashed border-border p-12 text-center text-sm font-mono text-text-muted uppercase tracking-wider font-bold">
            No tools found in the forge.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <StoneCard
                key={tool.name}
                className="p-6.5 flex flex-col justify-between hover:border-text-muted transition-all duration-200"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2.5 select-none">
                    <span className="text-2xl leading-none">{tool.icon}</span>
                    <h3 className="font-mono text-sm font-bold text-text-primary">
                      {tool.name}
                    </h3>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4.5">
                    {tool.description}
                  </p>
                </div>

                <div className="space-y-3.5 pt-3.5 border-t border-border/40 mt-auto">
                  <div className="font-mono text-[10.5px] text-brand-orange font-bold uppercase tracking-wide">
                    {tool.usage}
                  </div>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 border border-border text-center text-text-muted hover:text-brand-orange hover:border-brand-orange hover:bg-brand-orange/5 font-mono text-xs font-bold uppercase tracking-wider rounded-sm transition-all"
                  >
                    USE THIS TOOL →
                  </a>
                </div>
              </StoneCard>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
